using Services.Services;
using Microsoft.AspNetCore.Mvc;
using DataBase.Dtos;
using DataBase.Dtos.UserDto;
using AutoMapper;


namespace SzakDolgozat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserServise _userServise;
        private readonly IMapper _mapper;
        public UsersController(IUserServise userServise, IMapper mapper)
        {
            _userServise = userServise;
            _mapper = mapper;

        }
        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] UserCreateDto userCreateDto)
        {
            var createdUser = await _userServise.RegisterAsync(userCreateDto);
            if (!createdUser.IsSuccess)
            {
                return BadRequest(createdUser.Message);
            }

            return CreatedAtAction(nameof(PrivateGetUserById), new { id = createdUser.Data.Id }, createdUser);
        }

        [HttpPost("Login")]
        public async Task<ActionResult> Login([FromBody] UserLoginDto userLoginDto)
        {
            var loginResult = await _userServise.LoginAsync(userLoginDto);
            if (!loginResult.IsSuccess)
            {
                return Unauthorized(loginResult.Message);
            }
            return Ok(loginResult.Data);
        }

        [HttpGet("private/{id}")]
        public async Task<ActionResult> PrivateGetUserById(int id)
        {
            var user = await _userServise.PrivateGetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }
        [HttpGet("public/{id}")]
        public async Task<ActionResult> PublicGetUserById(int id)
        {
            var user = await _userServise.PublicGetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }
            return Ok(user);
        }

        [HttpGet("GetAllUser")]
        public async Task<ActionResult<IEnumerable<UserPublicGetDto>>> GetAllUsers()
        {
            var users = await _userServise.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("Update/{userId}")]
        public async Task<ActionResult> UpdateUser([FromRoute] int userId ,[FromBody] UserUpdateDto userUpdateDto)
        {
            var updateResult = await _userServise.UpdateUserAsync(userId, userUpdateDto);
            if (!updateResult.IsSuccess)
            {
                return BadRequest(updateResult.Message);
            }
            return Ok(updateResult.Message);
        }

        [HttpPut("ChangePassword")]
        public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            var changePasswordResult = await _userServise.ChangePasswordAsync(changePasswordDto);
            if (!changePasswordResult.IsSuccess)
            {
                return BadRequest(changePasswordResult.Message);
            }
            return Ok(changePasswordResult.Message);

        }
        [HttpDelete("Delete/{id}")]
        public async Task<ActionResult> DeleteUser(int id)
        {
            var deleteResult = await _userServise.DeleteUserAsync(id);
            if (!deleteResult.IsSuccess)
            {
                return BadRequest(deleteResult.Message);
            }
            return Ok(deleteResult.Message);
        }
    }
}
