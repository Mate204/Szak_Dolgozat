using AutoMapper;
using Azure.Storage.Blobs;
using DataBase.Models;
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
        private readonly string _uploadPath;


        public FileServise(IConfiguration configuration)
        {
            //_configuration = configuration;
            //_connectionString = configuration.GetConnectionString("AzureStorage");
            //_blobServiceClient = new BlobServiceClient(_connectionString);
            var baseDir = Directory.GetCurrentDirectory();

            _uploadPath = Path.Combine(baseDir, "wwwroot", "uploads");

            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }
        public async Task<ServiceResult<List<string>>> SaveImagesAsync(IEnumerable<IFormFile> files, string foldername)
        {
            var savedFilePaths = new List<string>();
            try
            {
                foreach (var file in files)
                {
                    if (file.Length > 0)
                    {
                        // Egyedi filenév generálása
                        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                        var fullPath = Path.Combine(_uploadPath, fileName);

                        using (var stream = new FileStream(fullPath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // A DB-be az elérési utat mentjük (webes formátum)
                        savedFilePaths.Add($"/uploads/{fileName}");
                    }
                    //var containerClient = _blobServiceClient.GetBlobContainerClient(foldername);
                    //await containerClient.CreateIfNotExistsAsync(Azure.Storage.Blobs.Models.PublicAccessType.Blob);
                    //foreach (var file in files)
                    //{
                    //    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                    //    var blobClient = containerClient.GetBlobClient(uniqueFileName);
                    //    using (var stream = file.OpenReadStream())
                    //    {
                    //        await blobClient.UploadAsync(stream, true);
                    //    }
                    //    savedFilePaths.Add(blobClient.Uri.ToString());
                    //}
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
