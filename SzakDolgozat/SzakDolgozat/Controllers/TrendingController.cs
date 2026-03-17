using DataBase.Dtos.PostDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services.Services;

namespace SzakDolgozat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TrendingController : ControllerBase
    {
        private readonly ITrendingServise _trendingServise;
        public TrendingController(ITrendingServise trendingServise)
        {
            _trendingServise = trendingServise;
        }

        [HttpGet]
        public async Task<ActionResult> GetTrending([FromQuery] TrendingPeriod period)
        {
            var result = await _trendingServise.GetTrendingPostAsync(period);
            return Ok(result);
        }
    }
}
