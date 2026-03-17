using AutoMapper;
using DataBase.Dtos.PostDto;
using Services.Repositoris;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public enum TrendingPeriod 
    {
        Daily,      //last 24 hours
        Weekly,     //last 7 days
        Monthly     //last 30 days
    }
    public interface ITrendingServise
    {
        public Task<IEnumerable<PostGetDto>> GetTrendingPostAsync(TrendingPeriod trendingPeriod, int count = 10);
    }
    public class TrendingServise : ITrendingServise
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public TrendingServise(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _mapper = mapper;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<PostGetDto>> GetTrendingPostAsync(TrendingPeriod period, int count = 10)
        {
            DateTime startDate = period switch
            {
                TrendingPeriod.Daily => DateTime.UtcNow.AddDays(-1),
                TrendingPeriod.Weekly => DateTime.UtcNow.AddDays(-7),
                TrendingPeriod.Monthly => DateTime.UtcNow.AddMonths(-1),
                _ => DateTime.UtcNow.AddDays(-7),
            };

            var posts = await _unitOfWork.PostsRepository.GetAsync(
                predicate: p => p.UploadDate >= startDate && !p.Deleted,
                includeProperties: new string[] {"User","Images","Likes","Comments"}
            );

            var trendingPosts = posts
                .OrderByDescending(p => (p.Likes.Count * 1) + (p.Comments.Count * 2))
                .Take(count);

            return _mapper.Map<IEnumerable<PostGetDto>>(trendingPosts);
        }
    }
}
