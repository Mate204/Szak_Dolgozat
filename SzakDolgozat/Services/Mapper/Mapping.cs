using AutoMapper;
using DataBase.Dtos;
using DataBase.Dtos.CommentDto;
using DataBase.Dtos.FollowDto;
using DataBase.Dtos.ImageDto;
using DataBase.Dtos.LikeDto;
using DataBase.Dtos.PostDto;
using DataBase.Dtos.UserDto;
using DataBase.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Mapper
{
    public class Mapping : Profile
    {
        public Mapping()
        {
            
            CreateMap<UserCreateDto, Users>()
                // A jelszó hashelését ne a mapperrel csináld, hanem külön a service rétegben!
                .ForMember(dest => dest.Password, opt => opt.Ignore())
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Role.User)); // Alapértelmezett szerepkör

            // Users -> UserPublicGetDto (Publikus adat)
            CreateMap<Users, UserPublicGetDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));
            CreateMap<Users, UserPrivateGetDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}"));

            // --- IMAGES (Képek) ---

            // Images -> ImageGetDto
            CreateMap<Images, ImageGetDto>();
            

            // --- POSTS (Posztok) ---

            // Posts -> PostGetDto
            CreateMap<Posts, PostGetDto>()
                
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.Images))
                
                .ForMember(dest => dest.LikeCount, opt => opt.MapFrom(src => src.Likes.Count))
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom(src => src.Comments.Count))
                .ForMember(dest => dest.IsLikedByUser, opt => opt.Ignore());


            // --- COMMENTS (Kommentek) ---

            // CommentCreateDto -> Comments (Létrehozáskor)
            CreateMap<CommentCreateDto, Comments>()
                // A UserId-t az autentikált felhasználótól kapja meg, ezért Ignore
                .ForMember(dest => dest.UserId, opt => opt.Ignore());

            // Comments -> CommentGetDto
            CreateMap<Comments, CommentGetDto>()
                .ForMember(dest => dest.User, opt => opt.MapFrom(src => src.User))
                .ForMember(dest => dest.TextContent, opt => opt.MapFrom(src => src.TextContent));

            // --- LIKES ---

            // Likes -> LikeGetDto
            CreateMap<Likes, LikeGetDto>();

            
           

        }
    }
}
