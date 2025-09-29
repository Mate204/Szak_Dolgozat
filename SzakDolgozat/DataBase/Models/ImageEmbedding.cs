using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class ImageEmbedding
    {
        public int ImageId { get; set; }
        public Byte[] VectorData { get; set; }
        public Images Image { get; set; }
    }
}
