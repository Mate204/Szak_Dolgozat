using AutoMapper;
using DataBase.Dtos.PostDto;
using Microsoft.AspNetCore.Mvc;
using Services.Services;

namespace SzakDolgozat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly IMapper _mapper;

        public SearchController(ISearchService searchService, IMapper mapper)
        {
            _searchService = searchService;
            _mapper = mapper;
        }

        [HttpGet("text")]
        public async Task<ActionResult> SearchByText([FromQuery] string query)
        {
            var results = await _searchService.ComplexTextSearchAsync(query);
            return Ok(results);
        }

        [HttpPost("image")]
        public async Task<ActionResult<List<PostGetDto>>> SearchByImage(IFormFile imageFile)
        {

            var results = await _searchService.SearchByImageAsync(imageFile);
            return Ok(results);

        }
    }
}
