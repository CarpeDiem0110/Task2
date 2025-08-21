using ETicaret.Application.DTOs.Product;
using ETicaret.Application.Features.Products.Commands;
using ETicaret.Application.Features.Products.Queries;
using ETicaret.Application.Interfaces;
using ETicaret.Domain.Entities;
using MediatR;

namespace ETicaret.Application.Features.Products.Handlers;

// Command Handlers
public class CreateProductHandler : IRequestHandler<CreateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public CreateProductHandler(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task<ProductDto> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            Category = request.Category,
            ImageUrl = request.ImageUrl
        };

        var savedProduct = await _productRepository.AddAsync(product);

        // Cache invalidation
        await _cacheService.RemoveByPatternAsync("products_*");

        return new ProductDto
        {
            Id = savedProduct.Id,
            Name = savedProduct.Name,
            Description = savedProduct.Description,
            Price = savedProduct.Price,
            Stock = savedProduct.Stock,
            Category = savedProduct.Category,
            ImageUrl = savedProduct.ImageUrl,
            IsActive = savedProduct.IsActive,
            CreatedAt = savedProduct.CreatedAt
        };
    }
}

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, ProductDto>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public UpdateProductHandler(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task<ProductDto> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id);
        if (product == null)
            throw new Exception("Ürün bulunamadı.");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.Stock = request.Stock;
        product.Category = request.Category;
        product.ImageUrl = request.ImageUrl;
        product.IsActive = request.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        var updatedProduct = await _productRepository.UpdateAsync(product);

        // Cache invalidation
        await _cacheService.RemoveByPatternAsync("products_*");

        return new ProductDto
        {
            Id = updatedProduct.Id,
            Name = updatedProduct.Name,
            Description = updatedProduct.Description,
            Price = updatedProduct.Price,
            Stock = updatedProduct.Stock,
            Category = updatedProduct.Category,
            ImageUrl = updatedProduct.ImageUrl,
            IsActive = updatedProduct.IsActive,
            CreatedAt = updatedProduct.CreatedAt
        };
    }
}

public class DeleteProductHandler : IRequestHandler<DeleteProductCommand, bool>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public DeleteProductHandler(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task<bool> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        await _productRepository.DeleteAsync(request.Id);
        
        // Cache invalidation
        await _cacheService.RemoveByPatternAsync("products_*");
        
        return true;
    }
}

// Query Handlers
public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, List<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public GetAllProductsHandler(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task<List<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        const string cacheKey = "products_all";
        
        // Cache kontrolü
        var cachedProducts = await _cacheService.GetAsync<List<ProductDto>>(cacheKey);
        if (cachedProducts != null)
            return cachedProducts;

        // Veritabanından al
        var products = await _productRepository.GetAllAsync();
        
        var productDtos = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt
        }).ToList();

        // Cache'e kaydet (10 dakika)
        await _cacheService.SetAsync(cacheKey, productDtos, TimeSpan.FromMinutes(10));

        return productDtos;
    }
}

public class GetProductsHandler : IRequestHandler<GetProductsQuery, List<ProductDto>>
{
    private readonly IProductRepository _productRepository;
    private readonly ICacheService _cacheService;

    public GetProductsHandler(IProductRepository productRepository, ICacheService cacheService)
    {
        _productRepository = productRepository;
        _cacheService = cacheService;
    }

    public async Task<List<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"products_{request.Category}_{request.MinPrice}_{request.MaxPrice}_{request.SortBy}_{request.SortDescending}";
        
        // Cache kontrolü
        var cachedProducts = await _cacheService.GetAsync<List<ProductDto>>(cacheKey);
        if (cachedProducts != null)
            return cachedProducts;

        // Veritabanından al
        var products = await _productRepository.GetProductsAsync(request.Category, request.MinPrice, request.MaxPrice);
        
        var productDtos = products.Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            Stock = p.Stock,
            Category = p.Category,
            ImageUrl = p.ImageUrl,
            IsActive = p.IsActive,
            CreatedAt = p.CreatedAt
        }).ToList();

        // Sıralama
        productDtos = request.SortBy?.ToLower() switch
        {
            "price" => request.SortDescending 
                ? productDtos.OrderByDescending(p => p.Price).ToList()
                : productDtos.OrderBy(p => p.Price).ToList(),
            "date" => request.SortDescending 
                ? productDtos.OrderByDescending(p => p.CreatedAt).ToList()
                : productDtos.OrderBy(p => p.CreatedAt).ToList(),
            _ => request.SortDescending 
                ? productDtos.OrderByDescending(p => p.Name).ToList()
                : productDtos.OrderBy(p => p.Name).ToList()
        };

        // Cache'e kaydet (10 dakika)
        await _cacheService.SetAsync(cacheKey, productDtos, TimeSpan.FromMinutes(10));

        return productDtos;
    }
}

public class GetProductByIdHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IProductRepository _productRepository;

    public GetProductByIdHandler(IProductRepository productRepository)
    {
        _productRepository = productRepository;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.Id);
        
        if (product == null)
            return null;

        return new ProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Stock = product.Stock,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive,
            CreatedAt = product.CreatedAt
        };
    }
}
