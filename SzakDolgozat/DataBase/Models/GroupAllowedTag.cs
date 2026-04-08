using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public class GroupAllowedTag
    {
        public int GroupId { get; set; }
        public Group Group { get; set; }
        public int TagId { get; set; }
        public Tags Tag { get; set; }
    }
}
