using System;
using DataBase.Dtos.UserDto;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.FollowDto
{
    public class FollowerGetDto
    {
        public UserPublicGetDto User { get; set; } // The user who is followed
        public bool IsFollowedByMe { get; set; }
    }
}
