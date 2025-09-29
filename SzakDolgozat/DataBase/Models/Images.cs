using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class Images
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Posts Post { get; set; }
        public string ImageUrl { get; set; }
        public int OrderIndex { get; set; }
        public string? Description { get; set; }
        public bool Deleted { get; set; } = false;

        public ImageEmbedding? ImageEmbedding { get; set; }
    }
}
