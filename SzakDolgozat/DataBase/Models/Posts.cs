using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public enum ContentType
    {
        Text,
        Image,
        ImageGallery

    }
    public class Posts
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public Users User { get; set; }
        public string Title { get; set; }
        public string TextContent { get; set; }
        public ContentType ContentType { get; set; } 
        public DateTime UploadDate { get; set; }
        public bool Deleted { get; set; } = false;

        public ICollection<Comments> Comments { get; set; } = new List<Comments>();
        public ICollection<Likes> Likes { get; set; } = new List<Likes>();
        public ICollection<Images> Images { get; set; } = new List<Images>();
    }
}
