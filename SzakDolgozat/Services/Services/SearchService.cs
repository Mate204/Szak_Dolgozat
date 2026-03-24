using AutoMapper;
using DataBase.Dtos.PostDto;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Services.Repositoris;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface ISearchService
    {
        Task<IEnumerable<PostGetDto>> ComplexTextSearchAsync(string query, int currentUserId = 0);
        Task<IEnumerable<PostGetDto>> SearchByImageAsync(IFormFile imageFile);
    }
    public class SearchService : ISearchService
    {

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public readonly HttpClient _httpClient;
        private const string LocalAiUrl = "http://127.0.0.1:8000/analyze";
        public SearchService(IUnitOfWork unitOfWork, IMapper mapper, HttpClient httpClient)
        {
            _httpClient = httpClient;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task<IEnumerable<PostGetDto>> ComplexTextSearchAsync(string query, int currentUserId = 0)
        {
            var words = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            var postsQuery =  _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .Include(p => p.User)
                .Include(p => p.Images)
                .Include(p => p.Comments)
                .Include(p => p.Likes)
            .AsQueryable(); 

            foreach (var word in words)
            {
                
                postsQuery = postsQuery.Where(p =>
                    p.Title.ToLower().Contains(word) ||
                    p.TextContent.ToLower().Contains(word) ||
                    p.PostTags.Any(pt => pt.Tag.Name.Contains(word)));
            }

            var results = await postsQuery.ToListAsync();
            var dtos = _mapper.Map<List<PostGetDto>>(results);

            if (currentUserId > 0)
            {
                for (int i = 0; i < results.Count; i++)
                {
                    dtos[i].IsLikedByUser = results[i].Likes.Any(l => l.UserId == currentUserId);
                }
            }

            return dtos;
        }

        public async Task<IEnumerable<PostGetDto>> SearchByImageAsync(IFormFile imageFile)
        {
            
            
            using var content = new MultipartFormDataContent();
            using var fileStream = imageFile.OpenReadStream();
            var fileContent = new StreamContent(fileStream);
            content.Add(fileContent, "file", imageFile.FileName);

            
            var response = await _httpClient.PostAsync(LocalAiUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                return new List<PostGetDto>();
            }

            
            var aiTags = await response.Content.ReadFromJsonAsync<List<string>>();
            if (aiTags == null || !aiTags.Any()) return new List<PostGetDto>();

            
            var postsQuery = _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
                .Include(p => p.User)
                .Include(p => p.Images)
                .Include(p => p.Likes)
                .Include(p => p.Comments)
                .AsQueryable();

            
            var results = await postsQuery
                .Where(p => p.PostTags.Any(pt => aiTags.Contains(pt.Tag.Name.ToLower())))
                .ToListAsync();

            // 5. Opcionális: Sorrendezés (Az legyen elől, aminek több közös címkéje van)
            var sortedResults = results
                .OrderByDescending(p => p.PostTags.Count(pt => aiTags.Contains(pt.Tag.Name.ToLower())))
                .ToList();

            return _mapper.Map<List<PostGetDto>>(sortedResults);
        }
    }
}
