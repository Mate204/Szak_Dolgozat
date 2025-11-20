using AutoMapper;
using Azure.Storage.Blobs;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Services.Repositoris;
using Services.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IFileServise
    {
        Task<ServiceResult<List<string>>> SaveImagesAsync(IEnumerable<IFormFile> files, string foldername);
        
    }
    public class FileServise : IFileServise
    {
        private readonly string _connectionString;
        private readonly BlobServiceClient _blobServiceClient;
        private readonly IConfiguration _configuration;
        

        public FileServise(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = configuration.GetConnectionString("AzureStorage");
            _blobServiceClient = new BlobServiceClient(_connectionString);
        }
        public async Task<ServiceResult<List<string>>> SaveImagesAsync(IEnumerable<IFormFile> files, string foldername)
        {
            var savedFilePaths = new List<string>();
            try
            {
                var containerClient = _blobServiceClient.GetBlobContainerClient(foldername);
                await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);
                foreach (var file in files)
                {
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    var blobClient = containerClient.GetBlobClient(uniqueFileName);
                    using (var stream = file.OpenReadStream())
                    {
                        await blobClient.UploadAsync(stream, true);
                    }
                    savedFilePaths.Add(blobClient.Uri.ToString());
                }
                return ServiceResult<List<string>>.Success(savedFilePaths, "Files uploaded successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<string>>.Failure($"Error uploading files to Azure Blob Storage: {ex.Message}");
            }
        }

    }
    
}
