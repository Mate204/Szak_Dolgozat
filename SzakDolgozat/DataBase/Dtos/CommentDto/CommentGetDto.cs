using DataBase.Dtos.UserDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.CommentDto
{
    public class CommentGetDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public UserPublicGetDto? User { get; set; } = null;
        public string TextContent { get; set; } = string.Empty;
        public DateTime UploadDate { get; set; }
        public int PostId { get; set; }
    }
}
