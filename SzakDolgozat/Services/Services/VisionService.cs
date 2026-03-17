using DataBase.Dtos.ImageDto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IVisionServise
    {
        Task<List<string>> GetTagsAsync(byte[] imageBytes);
    }
    public class VisionService : IVisionServise
    {
        private readonly HttpClient _httpClient;
        private const string LocalAiUrl = "http://127.0.0.1:8000/analyze";
        public VisionService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<List<string>> GetTagsAsync(byte[] imageBytes)
        {
            try
            {
                using var content = new MultipartFormDataContent();
                var fileContent = new ByteArrayContent(imageBytes);

                content.Add(fileContent, "file", "image.jpg");
                var response = await _httpClient.PostAsync(LocalAiUrl, content);

                if (response.IsSuccessStatusCode)
                {
                    var tags = await response.Content.ReadFromJsonAsync<List<string>>();
                    return tags ?? new List<string>();
                }
                

            }
            catch (Exception ex)
            {

                Console.WriteLine(ex.Message);
            }

            return new List<string>();
        }
    }
}
