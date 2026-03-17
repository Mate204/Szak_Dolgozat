using AutoMapper;
using DataBase.Dtos;
using DataBase.Dtos.CommentDto;
using DataBase.Dtos.ImageDto;
using DataBase.Dtos.LikeDto;
using DataBase.Dtos.PostDto;
using DataBase.Models;
using Services.Repositoris;
using Services.Result;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Services
{
    public interface IPostServise
    {
        public Task<ServiceResult<PostGetDto>> CreatePostAsync(PostCreateDto postCreateDto);
        public Task<ServiceResult<PostGetDto>> GetPostByIdAsync(int postId);
        public Task<IEnumerable<PostGetDto>> GetPostByUserIdAsync(int userId);
        public Task<ServiceResult<PostGetDto>> UpdatePostAsync(int postId, PostUpdateDto postUpdateDto);
        public Task<ServiceResult<PostGetDto>> DeletePostAsync(int postId);
        public Task<ServiceResult<PostGetDto>> LikePostAsync(LikeDtos likeCreate);
        public Task<ServiceResult<PostGetDto>> UnlikePostAsync(LikeDtos likeDto);
        public Task<IEnumerable<PostGetDto>> GetFeedAsync(int userId, int pageNumber, int pageSize);
        public Task<ServiceResult<CommentCreateDto>> AddCommentAsync(int postId,CommentCreateDto commentCreate);
        public Task<ServiceResult<CommentGetDto>> GetCommentAsync(int commentId);
        public Task<ServiceResult<CommentGetDto>> DeleteCommentAsync(int commentId);

    }
    public class PostServise : IPostServise
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IVisionServise _visionServise;
        private readonly IRecommendationService _recommendationService;

        public PostServise(IUnitOfWork unitOfWork, IMapper mapper, IVisionServise visionServise, IRecommendationService recommendationService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _visionServise = visionServise;
            _recommendationService = recommendationService;
        }

        public async Task<ServiceResult<CommentCreateDto>> AddCommentAsync(int postId, CommentCreateDto commentCreate)
        {
            var post = await _unitOfWork.PostsRepository.GetByIdAsync(new object[] { postId });
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { commentCreate.UserId });
            if (post is null || post.Deleted)
            {
                return ServiceResult<CommentCreateDto>.Failure("Post not found");
            }
            if (user is null || user.Deleted)
            {
                return ServiceResult<CommentCreateDto>.Failure("User not found");
            }
            if (string.IsNullOrEmpty(commentCreate.TextContent))
            {
                return ServiceResult<CommentCreateDto>.Failure("Comment content cannot be empty");
            }

            var comment = new Comments
            {
                PostId = commentCreate.PostId,
                UserId = commentCreate.UserId,
                TextContent = commentCreate.TextContent,
                UploadDate = DateTime.UtcNow,
                Deleted = false
            };
            try
            {
                await _unitOfWork.CommentsRepository.InsertAsync(comment);
                await _unitOfWork.SaveAsync();
                await _recommendationService.UpdateUserPreferenceAsync(commentCreate.UserId, postId, InteractionType.Comment);
                return ServiceResult<CommentCreateDto>.Success(commentCreate, "Comment added successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<CommentCreateDto>.Failure($"Error adding comment: {ex.Message}");
            }

            
        }

        public async Task<ServiceResult<PostGetDto>> CreatePostAsync(PostCreateDto postCreateDto)
        {
            var user = await _unitOfWork.UsersRepository.GetByIdAsync(new object[] { postCreateDto.UserId });
            if (user == null)
            {
                return ServiceResult<PostGetDto>.Failure("User not found");
            }
            if (string.IsNullOrEmpty(postCreateDto.Title))
            {
                return ServiceResult<PostGetDto>.Failure("Post title cannot be empty");
            }
            if (postCreateDto.ContentType == DataBase.Models.ContentType.Image && (postCreateDto.Images == null || !postCreateDto.Images.Any()))
            {
                return ServiceResult<PostGetDto>.Failure("Image posts must have at least one image");
            }
            if (postCreateDto.ContentType == DataBase.Models.ContentType.Text && string.IsNullOrEmpty(postCreateDto.Content))
            {
                return ServiceResult<PostGetDto>.Failure("Text posts must have content");
            }
            if (postCreateDto.ContentType == DataBase.Models.ContentType.ImageGallery && (postCreateDto.Images == null || postCreateDto.Images.Count < 2))
            {
                return ServiceResult<PostGetDto>.Failure("Image gallery posts must have at least two images");
            }

            var newPost = new Posts
            {
                Title = postCreateDto.Title,
                TextContent = postCreateDto.Content ?? string.Empty,
                UserId = postCreateDto.UserId,
                ContentType = postCreateDto.ContentType,
                UploadDate = DateTime.UtcNow,
                Images = new List<Images>(),
                PostTags = new List<PostTags>(),
                //Images = _mapper.Map<IEnumerable<Images>>(postCreateDto.Images) ?? new List<Images>(),
                Deleted = false
            };

            if (postCreateDto.Images != null && postCreateDto.Images.Any())
            {
                foreach (var imageDto in postCreateDto.Images)
                {
                    var image = new Images
                    {
                        ImageUrl = imageDto.ImageUrl,
                        OrderIndex = imageDto.OrderIndex,
                        Description = imageDto.Description,
                        Deleted = false
                    };
                    newPost.Images.Add(image);
                }
            }



            try
            {
                if (postCreateDto.Tags != null && postCreateDto.Tags.Any())
                {
                    foreach (var tag in postCreateDto.Tags)
                    {
                        var existingTag =( await _unitOfWork.TagsRepository.GetAsync(t => t.Name == tag)).FirstOrDefault();

                        if (existingTag == null)
                        {
                            existingTag = new Tags { Name = tag };
                                
                            await _unitOfWork.TagsRepository.InsertAsync(existingTag);
                            await _unitOfWork.SaveAsync();
                        }
                        
                        newPost.PostTags.Add(new PostTags { TagId = existingTag.Id, Post = newPost });

                    }
                }


                await _unitOfWork.PostsRepository.InsertAsync(newPost);
                await _unitOfWork.SaveAsync();
                return ServiceResult<PostGetDto>.Success(_mapper.Map<PostGetDto>(newPost), "Post created successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<PostGetDto>.Failure($"Error creating post: {ex.Message}");
            }

        }

        public async Task<ServiceResult<CommentGetDto>> DeleteCommentAsync(int commentId)
        {
            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(new object[] { commentId });
            if (comment == null || comment.Deleted) {
                return ServiceResult<CommentGetDto>.Failure("Comment not found");
            }
            comment.Deleted = true;
            try
            {
                await _unitOfWork.CommentsRepository.UpdateAsync(comment);
                await _unitOfWork.SaveAsync();
                var commentGetDto = _mapper.Map<CommentGetDto>(comment);
                return ServiceResult<CommentGetDto>.Success(commentGetDto, "Comment deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<CommentGetDto>.Failure($"Error deleting comment: {ex.Message}");
            }
            
        }

        public async Task<ServiceResult<PostGetDto>> DeletePostAsync(int postId)
        {
            var post = await _unitOfWork.PostsRepository.GetByIdAsync(new object[] { postId });
            if (post == null || post.Deleted)
            {
                return ServiceResult<PostGetDto>.Failure("Post not found");
            }
            post.Deleted = true;
            try
            {
                await _unitOfWork.PostsRepository.UpdateAsync(post);
                await _unitOfWork.SaveAsync();
                var postGetDto = _mapper.Map<PostGetDto>(post);
                return ServiceResult<PostGetDto>.Success(postGetDto, "Post deleted successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<PostGetDto>.Failure($"Error deleting post: {ex.Message}");
            }
            
        }

        public async Task<IEnumerable<PostGetDto>> GetFeedAsync(int userId, int pageNumber, int pageSize)
        {
            
            var followedUserIds = await GetFollowedUserIdsAsync(userId);


            var feedUserIds = followedUserIds.ToList();
            feedUserIds.Add(userId); // Include own posts

            int itemsToSkip = (pageNumber - 1) * pageSize;

            // Get posts from followed users first
            var followedPosts = await _unitOfWork.PostsRepository.GetAsync(
                predicate: p => feedUserIds.Contains(p.UserId) && !p.Deleted,
                orderBy: q => q.OrderByDescending(p => p.UploadDate),
                includeProperties: new string[] { "User", "Images", "Likes", "Comments" }
            );

            // Get posts from other users
            var otherPosts = await _unitOfWork.PostsRepository.GetAsync(
                predicate: p => !feedUserIds.Contains(p.UserId) && !p.Deleted,
                orderBy: q => q.OrderByDescending(p => p.UploadDate),
                includeProperties: new string[] { "User", "Images", "Likes", "Comments" }
            );

            // Combine: followed posts first, then others
            var allPosts = followedPosts.Concat(otherPosts)
                .Skip(itemsToSkip)
                .Take(pageSize)
                .ToList();

            if (!allPosts.Any())
            {
                return Enumerable.Empty<PostGetDto>();
            }

            var postGetDtos = _mapper.Map<IEnumerable<PostGetDto>>(allPosts);
            return postGetDtos;
        }

        private async Task<IEnumerable<int>> GetFollowedUserIdsAsync(int userId)
        {
            
            var follows = await _unitOfWork.FollowsRepository.GetAsync(f => f.FollowerId == userId);

            
            return follows.Select(f => f.FollowedId).Distinct().ToList();

        }

        public async Task<ServiceResult<PostGetDto>> GetPostByIdAsync(int postId)
        {
            var post = await _unitOfWork.PostsRepository.GetByIdAsync(new object[] { postId }, includeReferences: new string[] { "User" }, includeCollections: new string[] { "Images", "Likes", "Comments" });
            if (post == null || post.Deleted)
            {
                return ServiceResult<PostGetDto>.Failure("Post not found");
            }
            var postGetDto = _mapper.Map<PostGetDto>(post);
            return ServiceResult<PostGetDto>.Success(postGetDto, "Post retrieved successfully");
            
        }

        public async Task<IEnumerable<PostGetDto>> GetPostByUserIdAsync(int userId)
        {
            var posts = await _unitOfWork.PostsRepository.GetAsync(p => p.UserId == userId && !p.Deleted, includeProperties: new string[] { "User", "Images", "Likes", "Comments" });
            if (posts == null || !posts.Any())
            {
                return Enumerable.Empty<PostGetDto>();
            }
            var postGetDtos = _mapper.Map<IEnumerable<PostGetDto>>(posts);
            return postGetDtos;
            
        }

        public async Task<ServiceResult<PostGetDto>> LikePostAsync(LikeDtos likeCreateDto)
        {
            var existingLike = await _unitOfWork.LikesRepository.GetAsync(l => l.PostId == likeCreateDto.PostId && l.UserId == likeCreateDto.UserId);
            if (existingLike != null && existingLike.Any())
            {
                return ServiceResult<PostGetDto>.Failure("Post already liked by this user");
            }
            var post = await _unitOfWork.PostsRepository.GetByIdAsync(new object[] { likeCreateDto.PostId });
            if (post == null)
            {
                return ServiceResult<PostGetDto>.Failure("Post not found");
            }
            var newlike = new Likes
            {
                PostId = likeCreateDto.PostId,
                UserId = likeCreateDto.UserId,
                
            };
            try
            {
                await _unitOfWork.LikesRepository.InsertAsync(newlike);
                await _unitOfWork.SaveAsync();
                var postGetDto = _mapper.Map<PostGetDto>(post);
                await _recommendationService.UpdateUserPreferenceAsync(likeCreateDto.UserId, likeCreateDto.PostId, InteractionType.Like);
                return ServiceResult<PostGetDto>.Success(postGetDto, "Post liked successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<PostGetDto>.Failure($"Error liking post: {ex.Message}");
            }
            
        }

        public async Task<ServiceResult<PostGetDto>> UnlikePostAsync(LikeDtos likeDto)
        {
            try 
            {
                await _unitOfWork.LikesRepository.DeleteAsync(likeDto.UserId,likeDto.PostId);
                await _unitOfWork.SaveAsync();
                await _recommendationService.UpdateUserPreferenceAsync(likeDto.UserId, likeDto.PostId, InteractionType.Like, isRemoval: true);
                return ServiceResult<PostGetDto>.Success(null, "Post unliked successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<PostGetDto>.Failure($"Error unliking post: {ex.Message}");
            }
            
        }

        public async Task<ServiceResult<PostGetDto>> UpdatePostAsync(int postId, PostUpdateDto postUpdateDto)
        {
            var post = await _unitOfWork.PostsRepository.GetByIdAsync(new object[] { postId });
            if (post == null || post.Deleted)
            {
                return ServiceResult<PostGetDto>.Failure("Post not found");
            }
            if (!string.IsNullOrEmpty(postUpdateDto.Title))
            {
                post.Title = postUpdateDto.Title;
            }
            if (!string.IsNullOrEmpty(postUpdateDto.TextContent))
            {
                post.TextContent = postUpdateDto.TextContent;
            }
            try
            {
                await _unitOfWork.PostsRepository.UpdateAsync(post);
                await _unitOfWork.SaveAsync();
                var postGetDto = _mapper.Map<PostGetDto>(post);
                return ServiceResult<PostGetDto>.Success(postGetDto, "Post updated successfully");
            }
            catch (Exception ex)
            {
                return ServiceResult<PostGetDto>.Failure($"Error updating post: {ex.Message}");
            }
            
        }

        public async Task<ServiceResult<CommentGetDto>> GetCommentAsync(int commentId)
        {
            var comment = await _unitOfWork.CommentsRepository.GetByIdAsync(new object[] { commentId }, includeReferences: new string[] {"User","Post"});
            if (comment == null || comment.Deleted)
            {
                return ServiceResult<CommentGetDto>.Failure("Comment not found");
            }
            var commentDto = _mapper.Map<CommentGetDto>(comment);
            return ServiceResult<CommentGetDto>.Success(commentDto, "Comment retrieved succesfully");
        }
    }
}
