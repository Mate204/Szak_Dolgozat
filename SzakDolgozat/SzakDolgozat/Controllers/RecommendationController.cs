using DataBase.Dtos.PostDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Services;
using System.Security.Claims;

namespace SzakDolgozat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class RecommendationController : ControllerBase
    {
        private readonly IRecommendationService _recommendationService;

        public RecommendationController(IRecommendationService recommendation)
        {
            _recommendationService = recommendation;
        }

        [HttpGet("discover")]
        public async Task<ActionResult<List<PostGetDto>>> GetDiscoverFeed([FromQuery] int count = 20)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized("Felhasználó nem azonosítható.");
            }

            int userId = int.Parse(userIdClaim.Value);


            var result = await _recommendationService.GetDiscoverFeedAsync(userId, count);

            return Ok(result);
        }
    }
}
