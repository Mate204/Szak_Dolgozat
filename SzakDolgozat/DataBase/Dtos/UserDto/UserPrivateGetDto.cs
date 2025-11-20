using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.UserDto
{
    public class UserPrivateGetDto
    {
        public int Id { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public string Name  => $"{FirstName} {LastName}";
        public string? PhoneNumber { get; set; }
        public required string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public required string Password { get; set; }
        public string? Token { get; set; }
    }
}
