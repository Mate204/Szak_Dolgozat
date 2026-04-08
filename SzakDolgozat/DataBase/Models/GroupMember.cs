using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class GroupMember
    {
        public int UserId { get; set; }
        public Users User { get; set; }
        public int GroupId { get; set; }
        public Group Group { get; set; }
        public bool IsApproved { get; set; } 
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public bool Member { get; set; } = true;
    }
}
