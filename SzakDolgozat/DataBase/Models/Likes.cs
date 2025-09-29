using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class Likes
    {
        
        public int UserId { get; set; }
        public Users User { get; set; }
        public int PostId { get; set; }
        public Posts Post { get; set; }
    }
}
