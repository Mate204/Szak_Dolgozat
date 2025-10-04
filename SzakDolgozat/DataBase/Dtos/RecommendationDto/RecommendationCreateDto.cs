using DataBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Dtos.RecommendationDto
{
    public class RecommendationCreateDto
    {
        public string ContentTag { get; set; }
        public int? PostId { get; set; }
        public int? FollowedId { get; set; }
        public InteractionType InteractionType { get; set; }
        public float Score { get; set; }
    }
}
