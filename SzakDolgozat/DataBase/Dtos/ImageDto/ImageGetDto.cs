using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.ImageDto
{
    public class ImageGetDto
    {
        
        public string ImageUrl { get; set; }
        public int OrderIndex { get; set; }
        public string? Description { get; set; }
    }
}
