using AutoMapper;
using DataBase.Dtos.UserDto;
using DataBase.Models;
using Microsoft.AspNetCore.Mvc;
using Services.Repositoris;
using Services.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IUserServise
    {
        Task<UserPrivateGetDto> PrivateGetUserByIdAsync(int userId);
        Task<UserPublicGetDto> PublicGetUserByIdAsync(int userId);
        Task<IEnumerable<UserPublicGetDto>> GetAllUsersAsync();
        Task<ServiceResult<UserPrivateGetDto>> UpdateUserAsync(int userId, UserUpdateDto userUpdate);
        Task<ServiceResult<UserPrivateGetDto>> DeleteUserAsync(int userId);
        Task<ServiceResult<UserPrivateGetDto>> LoginAsync(UserLoginDto userLogin);
        Task<ServiceResult<UserPrivateGetDto>> RegisterAsync(UserCreateDto userRegister);
        Task<ServiceResult<UserPrivateGetDto>> ChangePasswordAsync(ChangePasswordDto changePasswordDto);


    }
    public class UserServise : IUserServise
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ITokenServise _tokenServise;

        public UserServise(IUnitOfWork unitOfWork, IMapper mapper, ITokenServise tokenServise)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
            _tokenServise = tokenServise;
        }


        public async Task<ServiceResult<UserPrivateGetDto>> DeleteUserAsync(int userId)
        {
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { userId });
            if (userId <= 0 )
            {
                return ServiceResult<UserPrivateGetDto>.Failure("Invalid user ID.");
            }
            if (user == null || user.Deleted)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("User not found.");
            }
            try
            {
                user.Deleted = true;
                await _unitOfWork.UsersRepository.UpdateAsync(user);
                await _unitOfWork.SaveAsync();
                return ServiceResult<UserPrivateGetDto>.Success(null, "User deleted successfully.");
            }
            catch (Exception ex)
            {

                return ServiceResult<UserPrivateGetDto>.Failure($"{ex.Message}");
            }
            
        }

        public async Task<IEnumerable<UserPublicGetDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.UsersRepository.GetAllAsync(new string[] { "Posts", "Followers", "Following" });
            if (users == null)
            {
                return  Enumerable.Empty<UserPublicGetDto>();
            }
            
            return _mapper.Map<IEnumerable<UserPublicGetDto>>(users);
            
        }

        public async Task<ServiceResult<UserPrivateGetDto>> LoginAsync(UserLoginDto userLogin)
        {
            if (userLogin == null)
                return ServiceResult<UserPrivateGetDto>.Failure("User login data is null.");
            if (string.IsNullOrEmpty(userLogin.Email))
                return ServiceResult<UserPrivateGetDto>.Failure("Emailis required.");
            if (string.IsNullOrEmpty(userLogin.Password))
                return ServiceResult<UserPrivateGetDto>.Failure("Password is required.");
            
            var user = (await _unitOfWork.UsersRepository.GetAsync(u => u.Email == userLogin.Email)).FirstOrDefault();
            if (user == null || user.Deleted)
                return ServiceResult<UserPrivateGetDto>.Failure("User not found.");

            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(userLogin.Password, user.Password);
            if (!isPasswordValid)
                return ServiceResult<UserPrivateGetDto>.Failure("Invalid password.");

            try
            {
                string token = _tokenServise.GenerateToken(user);
                var userDto = _mapper.Map<UserPrivateGetDto>(user);
                userDto.Token = token;

                return ServiceResult<UserPrivateGetDto>.Success(userDto, "Login successfull");
            }
            catch (Exception ex)
            {

                return ServiceResult<UserPrivateGetDto>.Failure($"{ex.Message}");
            }
            

        }

        public async Task<UserPrivateGetDto> PrivateGetUserByIdAsync(int userId)
        {
            if (userId <= 0)
            {
                return await Task.FromResult<UserPrivateGetDto>(null);
            }
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { userId }, new string[] { "Posts", "Followers", "Following", "Comments", "Likes" });

            return _mapper.Map<UserPrivateGetDto>(user);
        }

        public async Task<UserPublicGetDto> PublicGetUserByIdAsync(int userId)
        {
            if (userId <= 0)
            {
                return await Task.FromResult<UserPublicGetDto>(null);
            }
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { userId }, new string[] { "Posts", "Followers", "Following", "Comments", "Likes" });

            return _mapper.Map<UserPublicGetDto>(user);
        }

        public async Task<ServiceResult<UserPrivateGetDto>> RegisterAsync(UserCreateDto userRegister)
        {
            if (userRegister == null)
                return  ServiceResult<UserPrivateGetDto>.Failure("User registration data is null.");
            if (string.IsNullOrEmpty(userRegister.Email))
                return ServiceResult<UserPrivateGetDto>.Failure("Email is required.");
            if (string.IsNullOrEmpty(userRegister.Password))
                return ServiceResult<UserPrivateGetDto>.Failure("Password is required.");
            var existingEmail = (await _unitOfWork.UsersRepository.GetAsync(u => u.Email == userRegister.Email)).FirstOrDefault();
            if (existingEmail != null)
                return ServiceResult<UserPrivateGetDto>.Failure("Email is already in use.");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(userRegister.Password);
            
            var newUser = new Users 
            { 
                FirstName = userRegister.FirstName,
                LastName = userRegister.LastName,
                Email = userRegister.Email,
                Password = hashedPassword,
                PhoneNumber = userRegister.PhoneNumber,
                Role = Role.User,
                CreatedAt = DateTime.UtcNow,
                
            };

            try
            {
                await _unitOfWork.UsersRepository.InsertAsync(newUser);
                await _unitOfWork.SaveAsync();

                return ServiceResult<UserPrivateGetDto>.Success(_mapper.Map<UserPrivateGetDto>(newUser), "SuccessFull Operation");
            }
            catch (Exception ex)
            {
                return ServiceResult<UserPrivateGetDto>.Failure($"{ex.Message}");
            }

            

        }

        public async Task<ServiceResult<UserPrivateGetDto>> UpdateUserAsync(int userId, UserUpdateDto userUpdate)
        {
            bool changed = false;
            if (userId <= 0)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("Invalid user ID.");
            }
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { userId });
            if (user == null || user.Deleted)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("User not found.");
            }

            if (!string.IsNullOrEmpty(userUpdate.FirstName) && user.FirstName != userUpdate.FirstName)
            {
                user.FirstName = userUpdate.FirstName;
                changed = true;
            }
            if (!string.IsNullOrEmpty(userUpdate.LastName) && user.LastName != userUpdate.LastName)
            {
                user.LastName = userUpdate.LastName;
                changed = true;
            }
            if (!string.IsNullOrEmpty(userUpdate.PhoneNumber) && user.PhoneNumber != userUpdate.PhoneNumber)
            {
                user.PhoneNumber = userUpdate.PhoneNumber;
                changed = true;
            }
            if (!string.IsNullOrEmpty(userUpdate.Email) && user.Email != userUpdate.Email)
            {
                var existingEmail = ( await _unitOfWork.UsersRepository.GetAsync(u => u.Email == userUpdate.Email)).FirstOrDefault();
                if (existingEmail != null && existingEmail.Id != userId)
                    return ServiceResult<UserPrivateGetDto>.Failure("Email is already in use by another user.");
                user.Email = userUpdate.Email;
                changed = true;
            }
            
            if (!changed)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("No changes detected.");
            }

            try
            {
                await _unitOfWork.UsersRepository.UpdateAsync(user);
                await _unitOfWork.SaveAsync();

                return ServiceResult<UserPrivateGetDto>.Success(_mapper.Map<UserPrivateGetDto>(user), "Successfull Update");
            }
            catch (Exception ex)
            {
                return ServiceResult<UserPrivateGetDto>.Failure($"{ex.Message}");
            }


            

            
        }
        public async Task<ServiceResult<UserPrivateGetDto>> ChangePasswordAsync(ChangePasswordDto changePasswordDto)
        {
            if (changePasswordDto.UserId <= 0)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("Invalid user ID.");
            }
            if (string.IsNullOrEmpty(changePasswordDto.OldPassword) || string.IsNullOrEmpty(changePasswordDto.NewPassword))
            {
                return ServiceResult<UserPrivateGetDto>.Failure("Old and new passwords are required.");
            }

            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { changePasswordDto.UserId });
            if (user == null || user.Deleted)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("User not found.");
            }

            bool isOldPasswordValid = BCrypt.Net.BCrypt.Verify(changePasswordDto.OldPassword, user.Password);
            if (!isOldPasswordValid)
            {
                return ServiceResult<UserPrivateGetDto>.Failure("Old password is incorrect.");
            }

            user.Password = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);

            try
            {
                await _unitOfWork.UsersRepository.UpdateAsync(user);
                await _unitOfWork.SaveAsync();
                return ServiceResult<UserPrivateGetDto>.Success(_mapper.Map<UserPrivateGetDto>(user), "Password changed successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<UserPrivateGetDto>.Failure($"{ex.Message}");
            }
            

        }
    }
}
