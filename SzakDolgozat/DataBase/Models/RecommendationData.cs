using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataBase.Models
{
    public enum InteractionType
    {
        View,
        Like,
        Comment,
        Follow
    }
    public class RecommendationData
    {
        public int UserId { get; set; }
        public Users User { get; set; }
        public string ContentTag { get; set; }
        public InteractionType InteractionType { get; set; }
        public float Score { get; set; }
    }
}
