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
        Task<IEnumerable<PostGetDto>> ComplexTextSearchAsync(string query);
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
        public async Task<IEnumerable<PostGetDto>> ComplexTextSearchAsync(string query)
        {
            var words = query.ToLower().Split(' ', StringSplitOptions.RemoveEmptyEntries);

            var postsQuery =  _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags)
                .ThenInclude(pt => pt.Tag)
            .AsQueryable(); 

            foreach (var word in words)
            {
                
                postsQuery = postsQuery.Where(p =>
                    p.Title.ToLower().Contains(word) ||
                    p.TextContent.ToLower().Contains(word) ||
                    p.PostTags.Any(pt => pt.Tag.Name.Contains(word)));
            }

            var results = await postsQuery.ToListAsync();
            return _mapper.Map<List<PostGetDto>>(results);
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
                return new List<PostGetDto>(); // Vagy dobhatsz hibát is
            }

            
            var aiTags = await response.Content.ReadFromJsonAsync<List<string>>();
            if (aiTags == null || !aiTags.Any()) return new List<PostGetDto>();

            // 4. Keresés az adatbázisban a kapott címkék alapján
            // Olyan posztokat keresünk, amik legalább EGY címkében egyeznek
            var postsQuery = _unitOfWork.PostsRepository.GetQueryable()
                .Include(p => p.PostTags).ThenInclude(pt => pt.Tag)
                .AsQueryable();

            // Relevancia szerinti szűrés: Azokat a posztokat gyűjtjük ki, 
            // amik tartalmazzák valamelyik AI által talált címkét
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
