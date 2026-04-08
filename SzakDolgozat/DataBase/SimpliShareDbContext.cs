using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 
using DataBase.Models;

namespace DataBase
{
    public class SimpliShareDbContext : DbContext
    {
        public DbSet<Users> Users { get; set; }
        public DbSet<Posts> Posts { get; set; }
        public DbSet<Comments> Comments { get; set; }
        public DbSet<Likes> Likes { get; set; }
        public DbSet<Images> Images { get; set; }
        public DbSet<Follows> Follows { get; set; }
        public DbSet<ImageEmbedding> ImageEmbedding { get; set; }
        public DbSet<RecommendationData> RecommendationData { get; set; }
        public DbSet<PostTags> PostTags { get; set; }
        public DbSet<Tags> Tags { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<GroupAllowedTag> GroupAllowedTags { get; set; }
        public SimpliShareDbContext(DbContextOptions<SimpliShareDbContext> options) : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer("Server=localhost\\SQLEXPRESS;Database=SimpliShare;TrustServerCertificate=True;Trusted_Connection=True ");
        }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Users>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Password).IsRequired().HasMaxLength(100);
                entity.Ignore(e => e.Name);
                entity.Property(e => e.Role).IsRequired();
                entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(30);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.CreatedAt).IsRequired();
            });

            modelBuilder.Entity<Posts>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
                entity.Property(e => e.TextContent).HasMaxLength(1000);
                entity.Property(e => e.ContentType).IsRequired();
                entity.Property(e => e.UploadDate).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Posts)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Group)
                       .WithMany(g => g.Posts)
                       .HasForeignKey(e => e.GroupId)
                       .OnDelete(DeleteBehavior.SetNull);

            });

            modelBuilder.Entity<Comments>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.TextContent).IsRequired().HasMaxLength(500);
                entity.Property(e => e.UploadDate).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany(u => u.Comments)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Post)
                      .WithMany(p => p.Comments)
                      .HasForeignKey(e => e.PostId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Likes>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.UserId,
                    e.PostId
                });

                entity.HasOne(e => e.User)
                      .WithMany(u => u.Likes)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Post)
                      .WithMany(p => p.Likes)
                      .HasForeignKey(e => e.PostId)
                      .OnDelete(DeleteBehavior.Restrict);

            });

            modelBuilder.Entity<Images>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.ImageUrl).IsRequired().HasMaxLength(255);
                entity.HasOne(e => e.Post)
                      .WithMany(p => p.Images)
                      .HasForeignKey(e => e.PostId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Follows>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.FollowerId,
                    e.FollowedId
                });
                entity.HasOne(e => e.Follower)
                      .WithMany(u => u.Following)
                      .HasForeignKey(e => e.FollowerId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Followed)
                      .WithMany(u => u.Followers)
                      .HasForeignKey(e => e.FollowedId)
                      .OnDelete(DeleteBehavior.Restrict);

            });

            modelBuilder.Entity<ImageEmbedding>(entity =>
            {
                entity.HasKey(e => e.ImageId);
                entity.Property(e => e.VectorData).IsRequired();
                entity.HasOne(e => e.Image)
                      .WithOne(i => i.ImageEmbedding)
                      .HasForeignKey<ImageEmbedding>(e => e.ImageId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<RecommendationData>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.UserId,
                    e.ContentTag,
                    e.InteractionType
                });
                entity.Property(e => e.ContentTag).HasMaxLength(50);
                entity.Property(e => e.InteractionType).IsRequired();
                entity.Property(e => e.Score).IsRequired();
                entity.HasOne(e => e.User)
                      .WithMany(u => u.RecommendationDatas)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<PostTags>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.PostId,
                    e.TagId
                });
                entity.HasOne(e => e.Post)
                        .WithMany(p => p.PostTags)
                        .HasForeignKey(e => e.PostId)
                        .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.Tag)
                      .WithMany(t => t.PostsTags)
                      .HasForeignKey(e => e.TagId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Tags>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired();
                entity.HasIndex(e => e.Name).IsUnique();
            });

            modelBuilder.Entity<GroupMember>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.UserId,
                    e.GroupId
                });
                entity.HasOne(e => e.User)
                      .WithMany(u => u.GroupMember)
                      .HasForeignKey(e => e.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(gm => gm.Group)
                       .WithMany(g => g.Members)
                       .HasForeignKey(gm => gm.GroupId)
                       .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<GroupAllowedTag>(entity =>
            {
                entity.HasKey(e => new
                {
                    e.GroupId,
                    e.TagId
                });
                entity.HasOne(gat => gat.Group)
                        .WithMany(g => g.AllowedTags)
                        .HasForeignKey(gat => gat.GroupId);
                entity.HasOne(gat => gat.Tag)
                        .WithMany()
                        .HasForeignKey(gat => gat.TagId);

            });

            modelBuilder.Entity<Group>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.ImagePath).HasMaxLength(255);
                entity.Property(e => e.IsPrivate).IsRequired();
                entity.HasOne(g => g.Creator)
                        .WithMany()
                        .HasForeignKey(g => g.CreatorId)
                        .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
