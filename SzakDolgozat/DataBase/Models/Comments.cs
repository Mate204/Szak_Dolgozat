using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class Comments
    {
        public int Id { get; set; }
        public int PostId { get; set; }
        public Posts Post { get; set; }
        public int UserId { get; set; }
        public Users User { get; set; }
        public string TextContent { get; set; }
        public DateTime UploadDate { get; set; }
        public bool Deleted { get; set; } = false;

        }
}
