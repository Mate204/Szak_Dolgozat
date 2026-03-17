using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DataBase.Dtos.ImageDto
{
    public class VisionResultDto
    {
        [JsonPropertyName("tags")]
        public List<ImageTagDto> Tags { get; set; }

        [JsonPropertyName("requestId")]
        public string RequestId { get; set; }
    }
    public class ImageTagDto
    {
        [JsonPropertyName("name")]
        public string Name { get; set; } 

        [JsonPropertyName("confidence")]
        public double Confidence { get; set; }
    }
}
