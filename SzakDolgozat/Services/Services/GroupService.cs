using AutoMapper;
using DataBase.Dtos.GroupDto;
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
    public interface IGroupService
    {
        Task<ServiceResult<GetGroupDto>> CreateGroupAsync(CreateGroupDto dto, int creatorId);
        Task<ServiceResult<GetGroupDto>> JoinGroupAsync(int groupId, int userId);
        Task<ServiceResult <GetGroupDto>> ApproveMemberAsync(int groupId, int targetUserId, int adminId);
        Task<bool> IsUserAllowedToPostAsync(int groupId, int userId, List<string> postTags);
        Task<IEnumerable<GetGroupDto>> GetUserGroupsAsync(int userId);
        Task<ServiceResult<GetGroupDto>> GetAllGroupAsync();
        Task<ServiceResult<IEnumerable<GetGroupMemberDto>>> GetGroupMembersAsync(int groupId);
    }
    public class GroupService : IGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        public GroupService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }


        public async Task<ServiceResult<GetGroupDto>> ApproveMemberAsync(int groupId, int targetUserId, int adminId)
        {
           
            var group = await _unitOfWork.GroupRepository.GetByIdAsync(new object[] { groupId });
            if (group == null) return ServiceResult<GetGroupDto>.Failure("Csoport nem található.");

            if (group.CreatorId != adminId)
                return ServiceResult<GetGroupDto>.Failure("Nincs jogosultságod tagok jóváhagyásához.");

            
            var membership = _unitOfWork.GroupMemberRepository.GetQueryable()
                .FirstOrDefault(m => m.GroupId == groupId && m.UserId == targetUserId);

            if (membership == null) return ServiceResult<GetGroupDto>.Failure("A jelentkezés nem található.");

            if (membership.IsApproved) return ServiceResult<GetGroupDto>.Success(_mapper.Map<GetGroupDto>(group),"A felhasználó már jóvá van hagyva.");

            
            membership.IsApproved = true;
            await _unitOfWork.GroupMemberRepository.UpdateAsync(membership);
            await _unitOfWork.SaveAsync();

            return ServiceResult<GetGroupDto>.Success(_mapper.Map<GetGroupDto>(group),"Successful");
        }

        public async Task<ServiceResult<GetGroupDto>> CreateGroupAsync(CreateGroupDto dto, int creatorId)
        {
            var group = new Group
            {
                Name = dto.Name,
                Description = dto.Description,
                IsPrivate = dto.IsPrivate,
                CreatorId = creatorId,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.GroupRepository.InsertAsync(group);
            await _unitOfWork.SaveAsync();

            
            foreach (var tagId in dto.AllowedTagIds)
            {
                var allowedTag = new GroupAllowedTag
                {
                    GroupId = group.Id,
                    TagId = tagId
                };
                
                await _unitOfWork.GroupAllowedTagRepository.InsertAsync(allowedTag);
            }

            
            var membership = new GroupMember
            {
                GroupId = group.Id,
                UserId = creatorId,
                IsApproved = true
            };
            await _unitOfWork.GroupMemberRepository.InsertAsync(membership);

            await _unitOfWork.SaveAsync();
            return ServiceResult<GetGroupDto>.Success(_mapper.Map<GetGroupDto>(group),"Success");
        }

        public Task<ServiceResult<GetGroupDto>> GetAllGroupAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<ServiceResult<IEnumerable<GetGroupMemberDto>>> GetGroupMembersAsync(int groupId)
        {
            var group = await _unitOfWork.GroupRepository.GetByIdAsync(new object[] { groupId });
            if (group == null) return ServiceResult<IEnumerable<GetGroupMemberDto>>.Failure("Csoport nem található.");

            var members = await _unitOfWork.GroupMemberRepository.GetQueryable()
                .Include(gm => gm.User)
                .Where(gm => gm.GroupId == groupId)
                .ToListAsync();

            var memberDtos = members.Select(m => new GetGroupMemberDto
            {
                UserId = m.UserId,
                UserName = m.User.FirstName + " " + m.User.LastName,
               
                IsApproved = m.IsApproved,
                JoinedAt = m.JoinedAt,
                
            }).ToList();

            return ServiceResult<IEnumerable<GetGroupMemberDto>>.Success(memberDtos,"SuccessFul");
        }

        public async Task<IEnumerable<GetGroupDto>> GetUserGroupsAsync(int userId)
        {
            var groups = await _unitOfWork.GroupMemberRepository.GetQueryable()
                .Include(gm => gm.Group)
                    .ThenInclude(g => g.Creator)
                .Include(gm => gm.Group)
                    .ThenInclude(g => g.AllowedTags)
                        .ThenInclude(at => at.Tag)
                .Where(gm => gm.UserId == userId && gm.IsApproved)
                .Select(gm => gm.Group)
                .ToListAsync();

            return _mapper.Map<List<GetGroupDto>>(groups);
        }

        public async Task<bool> IsUserAllowedToPostAsync(int groupId, int userId, List<string> postTags)
        {
           
            var member = _unitOfWork.GroupMemberRepository.GetQueryable()
                .FirstOrDefault(m => m.GroupId == groupId && m.UserId == userId && m.IsApproved);

            if (member == null) return false;

            
            var allowedTags = await _unitOfWork.GroupAllowedTagRepository.GetQueryable()
                .Where(at => at.GroupId == groupId)
                .Select(at => at.Tag.Name.ToLower())
                .ToListAsync();

            
            return postTags.Any(pt => allowedTags.Contains(pt.ToLower()));
        }

        public async Task<ServiceResult<GetGroupDto>> JoinGroupAsync(int groupId, int userId)
        {
            var group = await _unitOfWork.GroupRepository.GetByIdAsync(new object[] { groupId });
            if (group == null) return ServiceResult<GetGroupDto>.Failure("Csoport nem található.");

            
            var existing = _unitOfWork.GroupMemberRepository.GetQueryable()
                .FirstOrDefault(m => m.GroupId == groupId && m.UserId == userId);
            if (existing != null) return ServiceResult<GetGroupDto>.Failure("Már tagja vagy a csoportnak.");

            var membership = new GroupMember
            {
                GroupId = groupId,
                UserId = userId,
            };
            if (group.IsPrivate) { 
                membership.IsApproved = false;
            }
            else
            {
                membership.IsApproved = true;
            }

            await _unitOfWork.GroupMemberRepository.InsertAsync(membership);
            await _unitOfWork.SaveAsync();

            return ServiceResult<GetGroupDto>.Success(_mapper.Map<GetGroupDto>(group), "Successful");
        }
    }
}
