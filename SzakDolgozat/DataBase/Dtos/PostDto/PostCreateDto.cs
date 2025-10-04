using DataBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.PostDto
{
    public class PostCreateDto
    {
        string Title { get; set; }
        string? Content { get; set; }
        ICollection<Images>? Images { get; set; }
        ContentType ContentType { get; set; }

    }
}
