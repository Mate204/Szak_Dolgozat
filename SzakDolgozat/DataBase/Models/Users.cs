using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public enum Role
    {
        Admin,
        User,
        Staff
    }
    public class Users
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Name  => $"{FirstName} {LastName}";
        public Role Role { get; set; }
        public string Password { get; set; }
        public string? PhoneNumber { get; set; }
        public string Email { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool Deleted { get; set; } = false;

        public ICollection<Posts> Posts { get; set; } = new List<Posts>();
        public ICollection<Follows> Following { get; set; } = new List<Follows>();
        public ICollection<Follows> Followers { get; set; } = new List<Follows>();
        public ICollection<Comments> Comments { get; set; } = new List<Comments>();
        public ICollection<Likes> Likes { get; set; } = new List<Likes>();
        public ICollection<RecommendationData> RecommendationDatas { get; set; } = new List<RecommendationData>();
        public ICollection<GroupMember> GroupMember { get; set; }

    }
}
