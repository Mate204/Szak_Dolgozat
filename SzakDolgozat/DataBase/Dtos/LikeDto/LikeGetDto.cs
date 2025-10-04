using DataBase.Dtos.UserDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.LikeDto
{
    public class LikeGetDto
    {
        public UserPublicGetDto User { get; set; } // The user who liked the post
    }
}
