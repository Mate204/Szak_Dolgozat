using DataBase.Dtos.GroupDto;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using DataBase.Dtos;
using Services.Services;
using System.Security.Claims;

namespace SzakDolgozat.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        [HttpPost]
        public async Task<ActionResult<GetGroupDto>> CreateGroup([FromBody] CreateGroupDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _groupService.CreateGroupAsync(dto, userId);

            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result.Data);
        }

        [HttpPost("{groupId}/join")]
        public async Task<IActionResult> JoinGroup(int groupId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _groupService.JoinGroupAsync(groupId, userId);

            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok();
        }

        [HttpGet("{groupId}/members")]
        public async Task<ActionResult<List<GetGroupMemberDto>>> GetMembers(int groupId)
        {
            var result = await _groupService.GetGroupMembersAsync(groupId);

            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok(result.Data);
        }

        [HttpPut("{groupId}/approve/{targetUserId}")]
        public async Task<IActionResult> ApproveMember(int groupId, int targetUserId)
        {
            var adminId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var result = await _groupService.ApproveMemberAsync(groupId, targetUserId, adminId);

            if (!result.IsSuccess) return BadRequest(result.Message);
            return Ok();
        }

        [HttpGet("my-groups")]
        public async Task<ActionResult<List<GetGroupDto>>> GetMyGroups()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
            var groups = await _groupService.GetUserGroupsAsync(userId);
            return Ok(groups);
        }
    }
}