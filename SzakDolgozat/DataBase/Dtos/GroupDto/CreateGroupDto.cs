using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.GroupDto
{
    public class CreateGroupDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public bool IsPrivate { get; set; }
        public List<int> AllowedTagIds { get; set; } = new List<int>();
    }
}
