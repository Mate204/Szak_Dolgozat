using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class Group
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string? ImagePath { get; set; } // Csoport ikon
        public bool IsPrivate { get; set; }
        public int CreatorId { get; set; }
        public Users Creator { get; set; }
        public bool Deleted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<GroupMember> Members { get; set; }
        public ICollection<GroupAllowedTag> AllowedTags { get; set; }
        public ICollection<Posts> Posts { get; set; }
    }
}
