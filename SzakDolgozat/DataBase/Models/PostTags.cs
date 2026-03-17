using Azure;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DataBase.Models;

namespace DataBase.Models
{
    public class PostTags
    {
        public int PostId { get; set; }
        public Posts Post { get; set; }

        public int TagId { get; set; }
        public Tags Tag { get; set; }
    }
}
