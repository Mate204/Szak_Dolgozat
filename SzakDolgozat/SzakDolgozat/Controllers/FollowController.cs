using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Services.Services;

namespace SzakDolgozat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FollowController : ControllerBase
    {
        private readonly IFollowServise _followServise;
        private readonly IMapper _mapper;
        public FollowController(IFollowServise followServise, IMapper mapper)
        {
            _followServise = followServise;
            _mapper = mapper;
        }

        [HttpPost("Follow")]
        public async Task<IActionResult> FollowUser(int followerId, int followedId) 
        {
            var followResult = await _followServise.FollowUser(followerId, followedId);
            if (!followResult.IsSuccess) 
            {
                return BadRequest(followResult.Message);
            }
            return Ok(followResult);

        }

        [HttpDelete("UnFollow")]
        public async Task<IActionResult> UnFollowUser(int followerId, int followedId)
        {
            var followResult = await _followServise.UnfollowUser(followerId, followedId);
            if (!followResult.IsSuccess)
            {
                return BadRequest(followResult.Message);
            }
            return Ok(followResult);
        }

        [HttpGet("IsFollowing")]
        public async Task<IActionResult> IsFollowing(int followerId, int followedId) 
        {
            var followResult = await _followServise.IsFollowingAsync(followerId, followedId);
            if (!followResult.IsSuccess)
            {
                return BadRequest(followResult.Message);
            }
            
            return Ok(followResult);

        }

        [HttpGet("GetAllFollower")]
        public async Task<IActionResult> GetFollowers(int userId) 
        {
            var followResult = await _followServise.GetFollowersAsync(userId);
            return Ok(followResult);
        }

        [HttpGet("GetAllFollowing")]
        public async Task<IActionResult> GetFollowing(int userId) 
        {
            var followResult = await _followServise.GetFollowingAsync(userId);
            return Ok(followResult);
        }

        [HttpGet("FollowerCount")]
        public async Task<IActionResult> GetFollowersCount(int userId)
        {
            var followResult = await _followServise.GetFollowersCountAsync(userId);
            if (!followResult.IsSuccess)
            {
                return BadRequest(followResult.Message);
            }
            return Ok(followResult);
        }

        [HttpGet("FollowingCount")]
        public async Task<IActionResult> GetFollowingCount(int userId)
        {
            var followResult = await _followServise.GetFollowingCountAsync(userId);
            if (!followResult.IsSuccess)
            {
                return BadRequest(followResult.Message);
            }
            return Ok(followResult);
        }

    }
}
