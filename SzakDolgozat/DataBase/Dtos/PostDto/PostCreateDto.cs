using DataBase.Dtos.ImageDto;
using DataBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.PostDto
{
    public class PostCreateDto
    {
        public string Title { get; set; }
        public string? Content { get; set; }
        public int UserId { get; set; }
        public ICollection<ImageGetDto>? Images { get; set; } = new List<ImageGetDto>();
        public ContentType ContentType { get; set; }

    }
}
