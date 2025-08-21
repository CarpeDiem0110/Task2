using ETicaret.Domain.Entities;

namespace ETicaret.Application.Interfaces;

public interface IProductRepository
{
    Task<List<Product>> GetAllAsync();
    Task<List<Product>> GetProductsAsync(string? category, decimal? minPrice, decimal? maxPrice);
    Task<Product?> GetByIdAsync(Guid id);
    Task<Product> AddAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task DeleteAsync(Guid id);
}
