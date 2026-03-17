using Services.Repositories;
using System;
using DataBase;
using DataBase.Models;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Repositoris
{
    public interface IUnitOfWork : IDisposable
    {
        IRepository<Users> UsersRepository { get; }
        IRepository<Posts> PostsRepository { get; }
        IRepository<Comments> CommentsRepository { get; }
        IRepository<Likes> LikesRepository { get; }
        IRepository<Images> ImagesRepository { get; }
        IRepository<Follows> FollowsRepository { get; }
        IRepository<ImageEmbedding> ImageEmbeddingRepository { get; }
        IRepository<RecommendationData> RecommendationDataRepository { get; }
        IRepository<Tags> TagsRepository { get; }
        IRepository<PostTags> PostTagsRepository {  get; }
        Task<int> SaveAsync();
    }
    public class UnitOfWork : IUnitOfWork
    {
        private readonly SimpliShareDbContext _context;
        public IRepository<Users> UsersRepository { get; }
        public IRepository<Posts> PostsRepository { get; }
        public IRepository<Comments> CommentsRepository { get; }
        public IRepository<Likes> LikesRepository { get; }
        public IRepository<Images> ImagesRepository { get; }
        public IRepository<Follows> FollowsRepository { get; }
        public IRepository<ImageEmbedding> ImageEmbeddingRepository { get; }
        public IRepository<RecommendationData> RecommendationDataRepository { get; }
        public IRepository<Tags> TagsRepository { get; }
        public IRepository<PostTags> PostTagsRepository { get; }
        public UnitOfWork(SimpliShareDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            UsersRepository = new Repository<Users>(context);
            PostsRepository = new Repository<Posts>(context);
            CommentsRepository = new Repository<Comments>(context);
            LikesRepository = new Repository<Likes>(context);
            ImagesRepository = new Repository<Images>(context);
            FollowsRepository = new Repository<Follows>(context);
            ImageEmbeddingRepository = new Repository<ImageEmbedding>(context);
            RecommendationDataRepository = new Repository<RecommendationData>(context);
            TagsRepository = new Repository<Tags>(context);
            PostsRepository = new Repository<Posts>(context);
        }
        public async Task<int> SaveAsync()
        {
            return await _context.SaveChangesAsync();
        }
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
