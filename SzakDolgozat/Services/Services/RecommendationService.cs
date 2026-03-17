using AutoMapper;
using DataBase.Dtos.PostDto;
using DataBase.Models;
using Microsoft.EntityFrameworkCore;
using Services.Repositoris;
using Services.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IRecommendationService
    {
        Task UpdateUserPreferenceAsync(int userId, int postId, InteractionType type, bool isRemoval = false);
        Task<IEnumerable<PostGetDto>> GetDiscoverFeedAsync(int userId, int count = 20);

    }
    public class RecommendationService : IRecommendationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public RecommendationService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<IEnumerable<PostGetDto>> GetDiscoverFeedAsync(int userId, int count = 20)
        {
            var userPref = await _unitOfWork.RecommendationDataRepository.GetQueryable()
                .Where(r => r.UserId == userId)
                .ToDictionaryAsync(r => r.ContentTag.ToLower(), r => r.Score);

            var postsQuery = _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .Include(p => p.Images)
                .Include(p => p.Comments)
                .Where(p => p.UserId != userId);
            
            var posts = await postsQuery.ToListAsync();

            var scoredPosts = posts.Select(post =>
            {
                float tagScore = post.PostTags
                .Where(pt => userPref.ContainsKey(pt.Tag.Name.ToLower()))
                .Sum(pt => userPref[pt.Tag.Name.ToLower()]);

                float popularityScore = (post.Likes.Count * 5.0f) + (post.Comments.Count * 8.0f);

                var daysOld = (DateTime.UtcNow - post.UploadDate).TotalDays;
                float timeDecay = (float)(1.0 / (1.0 + (daysOld / 30.0))); 

                float totalScore = ((tagScore * 0.4f) + (popularityScore * 0.6f)) * timeDecay;

                return new { Post = post, Score = totalScore };
            })
            .OrderByDescending(x => x.Score)
            .Take(count)
            .Select(x => x.Post)
            .ToList();

            return _mapper.Map<List<PostGetDto>>(scoredPosts);

        }

        public async Task UpdateUserPreferenceAsync(int userId, int targetId, InteractionType type, bool isRemoval)
        {
            List<string> tagsToProcess = new List<string>();

            if (type == InteractionType.Follow)
            {
                tagsToProcess = await _unitOfWork.PostsRepository.GetQueryable()
                    .Include(p => p.PostTags)
                    .ThenInclude(pt => pt.Tag)
                    .Where(p => p.UserId == targetId)
                    .SelectMany(p => p.PostTags.Select(pt => pt.Tag.Name.ToLower()))
                    .Distinct()
                    .ToListAsync();
            }
            else
            {
                var post = _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .FirstOrDefault(p => p.Id == targetId);

                if (post != null || post.PostTags != null)
                {
                    tagsToProcess = post.PostTags.Select(pt => pt.Tag.Name.ToLower()).ToList();
                }
                
            }

            if(!tagsToProcess.Any()) return;



            float scoreAdjustment = type switch
            {
                InteractionType.Like => 5.0f,
                InteractionType.Comment => 8.0f,
                InteractionType.View => 1.0f,
                InteractionType.Follow => 10.0f,
                _ => 0.0f
            };

            if (isRemoval) scoreAdjustment *= -1;

            foreach (var tagName in tagsToProcess)
            {
                var preference = _unitOfWork.RecommendationDataRepository.GetQueryable()
                    .FirstOrDefault(r => r.UserId == userId && r.ContentTag == tagName);
                if(preference == null && !isRemoval)
                {
                    var newPreference = new RecommendationData
                    {
                        UserId = userId,
                        ContentTag = tagName,
                        InteractionType = type,
                        Score = Math.Max(0, scoreAdjustment)
                    };
                    await _unitOfWork.RecommendationDataRepository.InsertAsync(newPreference);
                }
                else if (preference != null )
                {
                    preference.Score += scoreAdjustment;
                    if (preference.Score < 0) preference.Score = 0;

                    preference.InteractionType = type;


                    await _unitOfWork.RecommendationDataRepository.InsertAsync(preference);
                }
               

            }
            await _unitOfWork.SaveAsync();


        }
    }
}
