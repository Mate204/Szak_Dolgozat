using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.GroupDto
{
    public class GetGroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string? ImagePath { get; set; }
        public bool IsPrivate { get; set; }
        public DateTime CreatedAt { get; set; }

        
        public int CreatorId { get; set; }
        public string CreatorName { get; set; }

        
        public List<string> AllowedTagNames { get; set; } = new List<string>();

        public int MemberCount { get; set; }
    }
}
