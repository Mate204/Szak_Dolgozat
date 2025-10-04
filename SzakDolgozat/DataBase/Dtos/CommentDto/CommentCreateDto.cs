using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.CommentDto
{
    public class CommentCreateDto
    {
        public int UserId { get; set; }
        public int PostId { get; set; }
        public string TextContent { get; set; }
    }
}
