using AutoMapper;
using DataBase.Dtos.FollowDto;
using DataBase.Dtos.UserDto;
using DataBase.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Repositoris;
using Services.Result;
using System;
using System.Collections.Generic;
using System.Formats.Asn1;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IFollowServise
    {
        public Task<ServiceResult<FollowerGetDto>> FollowUser(int followerId, int followedId); // Create a follow relationship
        public Task<ServiceResult<FollowerGetDto>> UnfollowUser(int followerId, int followedId); // Remove a follow relationship
        public Task<ServiceResult<FollowerGetDto>> IsFollowingAsync(int followerId, int followedId); // Check if a user is following another user
        public Task<IEnumerable<UserPublicGetDto>>GetFollowersAsync(int userId); // Get a list of followers for a user
        public Task<IEnumerable<UserPublicGetDto>> GetFollowingAsync(int userId); // Get a list of users that a user is following
        public Task<ServiceResult<int>> GetFollowersCountAsync(int userId); // Get the count of followers for a user
        public Task<ServiceResult<int>> GetFollowingCountAsync(int userId); // Get the count of users that a user is following

    }
    public class FollowServise : IFollowServise
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IRecommendationService _recommendationService;
        public FollowServise(IUnitOfWork unitOfWork, IMapper mapper, IRecommendationService recommendationService)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
        }

        public async Task<ServiceResult<FollowerGetDto>> FollowUser(int followerId, int followedId)
        {
            if (followerId == followedId)
            {
                return ServiceResult<FollowerGetDto>.Failure("You cannot follow yourself");
            }
            if (followedId <= 0)
            {
                return ServiceResult<FollowerGetDto>.Failure("Invalid Id.");
            }

            var followed = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { followedId });
            if (followed == null || followed.Deleted)
            {
                return ServiceResult<FollowerGetDto>.Failure("User to be followed not found.");
            }

            var existingFollow = await _unitOfWork.FollowsRepository.GetAsync(
                f => f.FollowerId == followerId && f.FollowedId == followedId);
            if (existingFollow.Any())
            {
                return ServiceResult<FollowerGetDto>.Failure("You are already following this user.");
            }
                var newFollow = new Follows
            {
                FollowerId = followerId,
                FollowedId = followedId,
                
            };
            try
            {
                await _unitOfWork.FollowsRepository.InsertAsync(newFollow);
                await _recommendationService.UpdateUserPreferenceAsync(followerId, followedId, InteractionType.Follow);
                await _unitOfWork.SaveAsync();
                var followDto = _mapper.Map<FollowerGetDto>(newFollow);
                return ServiceResult<FollowerGetDto>.Success(followDto, "Following was succesfull.");
            }
            catch (Exception ex)
            {
                return ServiceResult<FollowerGetDto>.Failure(ex.Message);
            }
            
            
        }

        public async Task<IEnumerable<UserPublicGetDto>> GetFollowersAsync(int userId)
        {
            if (userId <= 0)
            {
                return Enumerable.Empty<UserPublicGetDto>();
            }

            
            var followers = await _unitOfWork.FollowsRepository.GetAsync(f => f.FollowedId == userId, new string[] { "Follower" });
            return _mapper.Map<IEnumerable<UserPublicGetDto>>(followers.Select(f => f.Follower));
            
        }

        public async Task<ServiceResult<int>> GetFollowersCountAsync(int userId)
        {
            if (userId <= 0)
            {
                return ServiceResult<int>.Failure("Invalid Id.");
            }
            var count = await _unitOfWork.FollowsRepository.CountAsync(f => f.FollowedId == userId);


            return  ServiceResult<int>.Success(count,"Succesfull count" );
            
        }

        public async Task<IEnumerable<UserPublicGetDto>> GetFollowingAsync(int userId)
        {
            if (userId <= 0)
            {
                return Enumerable.Empty<UserPublicGetDto>();
            }
            var following = await _unitOfWork.FollowsRepository.GetAsync(f => f.FollowerId == userId, new string[] { "Followed" });
            return _mapper.Map<IEnumerable<UserPublicGetDto>>(following.Select(f => f.Followed));
            
        }

        public async Task<ServiceResult< int>> GetFollowingCountAsync(int userId)
        {
            if (userId <= 0)
            {
                return ServiceResult<int>.Failure("Invalid Id.");
            }
            
            var count =  await _unitOfWork.FollowsRepository.CountAsync(f => f.FollowerId == userId);
            return ServiceResult<int>.Success(count, "Succesfull count");
            
        }

        public async Task<ServiceResult<FollowerGetDto>> IsFollowingAsync(int followerId, int followedId)
        {
            if (followerId <= 0 || followedId <= 0)
            {
                return ServiceResult<FollowerGetDto>.Failure("Invalid Id.");
            }

            var follow = await _unitOfWork.FollowsRepository.GetAsync(
                f => f.FollowerId == followerId && f.FollowedId == followedId);
            var followDto = new FollowerGetDto();


            if (follow.Any())
            {
                var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { follow.FirstOrDefault().FollowedId });
                followDto.User = _mapper.Map<UserPublicGetDto>(user);
                followDto.IsFollowedByMe = true;

                return ServiceResult<FollowerGetDto>.Success(followDto, "The user is following the other user"); // true a válasz
            }
            else
            {
                return ServiceResult<FollowerGetDto>.Success(followDto, "The user is not following the other user"); // false a válasz
            }
        }

        public async Task<ServiceResult<FollowerGetDto>> UnfollowUser(int followerId, int followedId)
        {
            if (followedId <= 0)
            {
                return ServiceResult<FollowerGetDto>.Failure("Invalid Id.");
            }

            var follow = (await _unitOfWork.FollowsRepository.GetAsync(f => f.FollowerId == followerId && f.FollowedId == followedId)).FirstOrDefault();
            if (follow == null)
            {   
                return ServiceResult<FollowerGetDto>.Failure("Follow relationship not found.");
            }
            try
            {
                await _unitOfWork.FollowsRepository.DeleteAsync(followerId, followedId);
                await _recommendationService.UpdateUserPreferenceAsync(followerId, followedId, InteractionType.Follow, true);
                await _unitOfWork.SaveAsync();
                var followDto = _mapper.Map<FollowerGetDto>(follow);
                return ServiceResult<FollowerGetDto>.Success(followDto,"Unfollow was succesfull.");
            }
            catch (Exception ex)
            {
                return ServiceResult<FollowerGetDto>.Failure($"{ex.Message}");
            }
            
            
        }
    }
}
