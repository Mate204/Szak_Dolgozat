using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataBase.Models;

namespace DataBase.Models
{
    public class Tags
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public ICollection<PostTags> PostsTags { get; set; } = new List<PostTags>();
        public ICollection<GroupAllowedTag> GroupAllowedTags { get; set; }
    }
}
