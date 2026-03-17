using Microsoft.AspNetCore.Mvc;
using Services.Services;
using DataBase.Dtos;
using AutoMapper;
using DataBase.Dtos.PostDto;
using DataBase.Dtos.LikeDto;
using DataBase.Dtos.CommentDto;
using Services.Result;
using DataBase.Dtos.ImageDto;
using Microsoft.AspNetCore.Authorization;

namespace SzakDolgozat.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PostController : ControllerBase
    {
        private readonly IPostServise _postServise;
        private readonly IMapper _mapper;
        private readonly IFileServise _fileServise;
        private readonly IVisionServise _visionServise;
        public PostController(IPostServise postServise, IMapper mapper, IFileServise fileServise, IVisionServise visionServise)
        {
            _postServise = postServise;
            _mapper = mapper;
            _fileServise = fileServise;
            _visionServise = visionServise;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePost([FromForm] PostCreateDto postCreateDto, IFormFile[] images)
        {
            ServiceResult<List<string>>? savedImagePaths = null;
            List<string> allDetectedTags = new List<string>();
            if (images != null && images.Length > 0)
            {
                savedImagePaths = await _fileServise.SaveImagesAsync(images, "post-images");
                if (!savedImagePaths.IsSuccess)
                {
                    return BadRequest(savedImagePaths.Message);
                }

                foreach (var image in images) 
                {
                    using var ms = new MemoryStream();
                    await image.CopyToAsync(ms);
                    byte[] imageBytes = ms.ToArray();

                    var tags = await _visionServise.GetTagsAsync(imageBytes);
                    allDetectedTags.AddRange(tags);

                }
                postCreateDto.Tags = allDetectedTags.Distinct().ToList();

                postCreateDto.Images = savedImagePaths.Data.Select((path, index) => new ImageGetDto 
                {
                    ImageUrl = path,
                    OrderIndex = index + 1

                }).ToList();


            }

            var createdPost = await _postServise.CreatePostAsync(postCreateDto);

            if(!createdPost.IsSuccess)
            {
                return BadRequest(createdPost.Message);
            }

            return CreatedAtAction(nameof(GetPostById), new { postid = createdPost.Data.Id }, createdPost.Data);


        }

        [HttpGet("{postid:int}")]
        public async Task<IActionResult> GetPostById(int postid)
        {
            var post = await _postServise.GetPostByIdAsync(postid);
            if (post == null)
            {
                return NotFound();
            }
            return Ok(post);
        }

        [HttpGet("user/{userid:int}")]
        public async Task<IActionResult> GetPostsByUserId(int userid)
        {
            var posts = await _postServise.GetPostByUserIdAsync(userid);
            return Ok(posts);
        }
        [HttpPut("{postid:int}")]
        public async Task<IActionResult> UpdatePost(int postid, [FromBody] PostUpdateDto postUpdateDto)
        {
            var updateResult = await _postServise.UpdatePostAsync(postid, postUpdateDto);
            if (!updateResult.IsSuccess)
            {
                return BadRequest(updateResult.Message);
            }
            return Ok(updateResult.Data);
        }
        [HttpDelete("{postid:int}")]
        public async Task<IActionResult> DeletePost(int postid)
        {
            var deleteResult = await _postServise.DeletePostAsync(postid);
            if (!deleteResult.IsSuccess)
            {
                return BadRequest(deleteResult.Message);
            }
            return NoContent();
        }




        [HttpGet("feed")]
        public async Task<IActionResult> GetFeed([FromQuery] int userid, [FromQuery] int pageNumber, [FromQuery] int pageSize = 10)
        {
            
            var feedPosts = await _postServise.GetFeedAsync(userid, pageNumber, pageSize);
            return Ok(feedPosts);
        }

        [HttpPost("like")]
        public async Task<IActionResult> LikePost([FromBody] LikeDtos likeCreateDto)
        {
            var likeResult = await _postServise.LikePostAsync(likeCreateDto);
            if (!likeResult.IsSuccess)
            {
                return BadRequest(likeResult.Message);
            }
            return Ok(likeResult.Message);
        }

        [HttpDelete("unlike")]
        public async Task<IActionResult> UnlikePost([FromBody] LikeDtos likeDto)
        {
            var unlikeResult = await _postServise.UnlikePostAsync(likeDto);
            if (!unlikeResult.IsSuccess)
            {
                return BadRequest(unlikeResult.Message);
            }
            return Ok(unlikeResult.Message);
        }

        [HttpPost("{postid:int}/comment")]
        public async Task<IActionResult> AddComment(int postid, [FromBody] CommentCreateDto commentCreateDto)
        {
            var commentResult = await _postServise.AddCommentAsync(postid, commentCreateDto);
            if (!commentResult.IsSuccess)
            {
                return BadRequest(commentResult.Message);
            }
            return Ok(commentResult.Data);


        }

        [HttpDelete("comment/{commentid:int}")]
        public async Task<IActionResult> DeleteComment(int commentid)
        {
            var deleteCommentResult = await _postServise.DeleteCommentAsync(commentid);
            if (!deleteCommentResult.IsSuccess)
            {
                return BadRequest(deleteCommentResult.Message);
            }
            return NoContent();
        }


        [HttpGet("comment/{commentid:int}")]
        public async Task<IActionResult> GetComment(int postid) 
        {
            var comment = await _postServise.GetCommentAsync(postid);
            if (!comment.IsSuccess) 
            {
                return BadRequest(comment.Message);
            }
            return Ok(comment);
        }
    }
}
