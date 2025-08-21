using ETicaret.Application.DTOs.Product;
using MediatR;

namespace ETicaret.Application.Features.Products.Queries;

public class GetAllProductsQuery : IRequest<List<ProductDto>>
{
}

public class GetProductsQuery : IRequest<List<ProductDto>>
{
    public string? Category { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? SortBy { get; set; } = "name"; // name, price, date
    public bool SortDescending { get; set; } = false;
}

public class GetProductByIdQuery : IRequest<ProductDto?>
{
    public Guid Id { get; set; }
}
