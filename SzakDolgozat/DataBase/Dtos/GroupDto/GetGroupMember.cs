using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.GroupDto
{
    public class GetGroupMemberDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; }

        public bool IsApproved { get; set; }
        public DateTime JoinedAt { get; set; }
    }
}
