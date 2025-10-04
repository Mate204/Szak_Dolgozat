using AutoMapper;
using DataBase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Services.Mapper;


namespace SzakDolgozat
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<SimpliShareDbContext>(options =>
            {
                // A konnexiós stringet a konfigurációs fájlból (.json) érdemes betölteni!
                options.UseSqlServer(builder.Configuration.GetConnectionString("Server=localhost\\SQLEXPRESS;Database=SimpliShare;TrustServerCertificate=True;Trusted_Connection=True "));
            });

            // Add services to the container.
            //builder.Services.AddAutoMapper(typeof(Services.Mapper.Mapping).Assembly); Nem tudom miért, de ez nem jó
            builder.Services.AddAutoMapper(cfg => cfg.AddProfile<Services.Mapper.Mapping>());

            builder.Services.AddControllers();
            // Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
            builder.Services.AddOpenApi();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
