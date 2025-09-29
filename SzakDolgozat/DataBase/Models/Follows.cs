using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class Follows
    {
        public int FollowerId { get; set; }
        public Users Follower { get; set; }
        public int FollowedId { get; set; }
        public Users Followed { get; set; }

        
    }
}
