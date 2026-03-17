using System.Linq.Expressions;
using DataBase;
using Microsoft.EntityFrameworkCore;

namespace Services.Repositories;

public interface IRepository<T> where T : class
{
    Task<IEnumerable<T>> GetAsync(Expression<Func<T, bool>> predicate, string[]? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, int? skip = null, int? take = null);
    Task<T?> GetByIdAsync(object[] keyValues, string[]? includeReferences = null, string[]? includeCollections = null);
    Task<IEnumerable<T>> GetAllAsync(string[]? includeProperties = null);
    Task InsertAsync(T entity);
    Task DeleteAsync(params object[] keyValues);
    Task UpdateAsync(T entity);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    IQueryable<T> GetQueryable();
}

public class Repository<T> : IRepository<T> where T : class
{
    private readonly SimpliShareDbContext _context;
    private readonly DbSet<T> _dbSet;

    public Repository( SimpliShareDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
        _dbSet = _context.Set<T>();
    }

    public async Task<IEnumerable<T>> GetAsync(Expression<Func<T, bool>> predicate, string[]? includeProperties = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, int? skip = null,int ? take = null)
    {
        IQueryable<T> query = _dbSet;
        query = query.Where(predicate);

        if (includeProperties != null)
        {
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
        }
        if (orderBy != null)
        {
            query = orderBy(query);
        }

        // LAPOZÁS (Pagination) LOGIKA
        if (skip.HasValue)
        {
            query = query.Skip(skip.Value);
        }

        if (take.HasValue)
        {
            query = query.Take(take.Value);
        }

        return await query.ToListAsync();
    }

    public async Task<T?> GetByIdAsync(object[] keyValues, string[]? includeReferences = null, string[]? includeCollections = null)
    {
        T? entity = await _dbSet.FindAsync(keyValues);
        if (entity == null)
        {
            return null;
        }

        //List<Task> tasks = new List<Task>();

        if (includeReferences != null)
        {
            foreach (var includeReference in includeReferences)
            {
                await _context
                    .Entry(entity)
                    .Reference(includeReference)
                    .LoadAsync();
            }
        }

        if (includeCollections != null)
        {
            foreach (var includeCollection in includeCollections)
            {
                await _context
                    .Entry(entity)
                    .Collection(includeCollection)
                    .LoadAsync();
            }
        }

        //await Task.WhenAll(tasks);
        return entity;
    }

    public async Task<IEnumerable<T>> GetAllAsync(string[]? includeProperties = null)
    {
        IQueryable<T> query = _dbSet;
        if (includeProperties != null)
        {
            foreach (var includeProperty in includeProperties)
            {
                query = query.Include(includeProperty);
            }
        }

        return await query.ToListAsync();
    }

    public async Task InsertAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public async Task DeleteAsync(params object[] keyValues)
    {
        T? entity = await _dbSet.FindAsync(keyValues);
        if (entity != null)
        {
            _dbSet.Remove(entity);
        }
        else
        {
            throw new KeyNotFoundException($"Entity of type {typeof(T).Name} with the provided key values was not found.");
        }
    }

    public async Task UpdateAsync(T entity)
    {
        await Task.Run(() => _dbSet.Update(entity));
        await Task.CompletedTask;
    }

    public async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        if (predicate == null)
        {
            return await _dbSet.CountAsync();
        }
        return await _dbSet.CountAsync(predicate);
    }

    public  IQueryable<T> GetQueryable()
    {
        return _dbSet.AsQueryable();
    }
}