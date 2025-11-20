using AutoMapper;
using Services.Services;
using DataBase;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Services.Mapper;
using Services.Repositoris;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;



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
                options.UseSqlServer("Server=localhost\\SQLEXPRESS;Database=SimpliShare;TrustServerCertificate=True;Trusted_Connection=True ");
            });

            // Add services to the container.
            builder.Services.AddAutoMapper(typeof(Services.Mapper.Mapping).Assembly);
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
            builder.Services.AddScoped<IFollowServise, FollowServise>();
            builder.Services.AddScoped<IUserServise, UserServise>();
            builder.Services.AddScoped<IFileServise, FileServise>();
            builder.Services.AddScoped<IPostServise, PostServise>();
            builder.Services.AddScoped<ITokenServise, TokenServise>();

            builder.Services.AddControllers();
            
            builder.Services.AddSwaggerGen(c =>
            {
                
                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "SimpliShare API", Version = "v1" });

                c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    In = ParameterLocation.Header,
                    Description = "Please enter JWT with Bearer into field",
                    Name = "Authorization",
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] { }
                    }
                });
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt key is missing")))
                };
            });

            builder.Services.AddAuthorization();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    // EZ A KRITIKUS SOR! Az /swagger/v1/swagger.json a generált dokumentum útja
                    // A "v1" névnek meg kell egyeznie az 1. lépésben beállított névvel!
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "SimpliShare API v1");

                    // Ez biztosítja, hogy a https://localhost:7114/ címen azonnal a Swagger UI nyíljon meg
                    //c.RoutePrefix = string.Empty;
                });
            }

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseStaticFiles();

            app.MapControllers();

            app.Run();
        }
    }
}
