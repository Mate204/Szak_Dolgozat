using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface ISemanticService
    {
        Task<float[]> GetVectorAsync(string text);
    }
    public class SemanticService : ISemanticService
    {
        private readonly string _openAiKey = "";
        public Task<float[]> GetVectorAsync(string text)
        {
            throw new NotImplementedException();
        }
    }
}
