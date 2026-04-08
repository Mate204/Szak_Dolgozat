using DataBase.Models;
using DataBase.Dtos.ImageDto;
using DataBase.Dtos.UserDto;
using DataBase.Dtos.CommentDto;
using DataBase.Dtos.LikeDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.PostDto
{
    public class PostGetDto
    {
        public int Id { get; set; }
        public UserPublicGetDto User { get; set; }
        public string Title { get; set; }
        public string? TextContent { get; set; }
        public int? GroupId { get; set; }
        public ContentType ContentType { get; set; }
        public DateTime UploadDate { get; set; }
        public ICollection<ImageGetDto>? Images { get; set; }
        public ICollection<CommentGetDto>? Comments { get; set; }

        public int LikeCount { get; set; }
        public int CommentCount { get; set; }
        public bool IsLikedByUser { get; set; }

    }
}
