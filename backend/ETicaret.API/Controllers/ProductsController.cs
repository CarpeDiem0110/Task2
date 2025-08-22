using ETicaret.Application.Features.Products.Commands;
using ETicaret.Application.Features.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Linq;

namespace ETicaret.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts([FromQuery] GetProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllProducts()
    {
        var result = await _mediator.Send(new GetAllProductsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProductById(Guid id)
    {
        var result = await _mediator.Send(new GetProductByIdQuery { Id = id });
        
        if (result == null)
            return NotFound();
            
        return Ok(result);
    }

    [HttpPost]
    [Authorize] // Geçici olarak sadece authenticate olmuş kullanıcılar
    public async Task<IActionResult> CreateProduct([FromForm] CreateProductCommand command, IFormFile? imageFile)
    {
        try
        {
            // Resim yükleme işlemi
            if (imageFile != null && imageFile.Length > 0)
            {
                // Dosya uzantısı kontrolü
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Sadece JPG, JPEG, PNG, WebP ve GIF dosyaları yükleyebilirsiniz." });
                }

                // Dosya boyutu kontrolü (5MB limit)
                if (imageFile.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Dosya boyutu 5MB'dan küçük olmalıdır." });
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                
                // Klasör yoksa oluştur
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Dosyayı kaydet
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                // URL'i command'a set et
                var baseUrl = Environment.GetEnvironmentVariable("API_BASE_URL") ;
                command.ImageUrl = $"{baseUrl}/images/{fileName}";
            }

            var result = await _mediator.Send(command);
            return CreatedAtAction(nameof(GetProductById), new { id = result.Id }, result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize] // Geçici olarak sadece authenticate olmuş kullanıcılar
    public async Task<IActionResult> UpdateProduct(Guid id, [FromForm] UpdateProductCommand command, IFormFile? imageFile)
    {
        try
        {
            command.Id = id;

            // Resim yükleme işlemi (eğer yeni resim gönderildiyse)
            if (imageFile != null && imageFile.Length > 0)
            {
                // Dosya uzantısı kontrolü
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
                var fileExtension = Path.GetExtension(imageFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    return BadRequest(new { message = "Sadece JPG, JPEG, PNG, WebP ve GIF dosyaları yükleyebilirsiniz." });
                }

                // Dosya boyutu kontrolü (5MB limit)
                if (imageFile.Length > 5 * 1024 * 1024)
                {
                    return BadRequest(new { message = "Dosya boyutu 5MB'dan küçük olmalıdır." });
                }

                // Benzersiz dosya adı oluştur
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
                
                // Klasör yoksa oluştur
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var filePath = Path.Combine(uploadsFolder, fileName);

                // Dosyayı kaydet
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await imageFile.CopyToAsync(fileStream);
                }

                // Eski resmi sil (eğer varsa)
                if (!string.IsNullOrEmpty(command.ImageUrl) && command.ImageUrl.Contains("/images/"))
                {
                    var urlParts = command.ImageUrl.Split("/images/");
                    if (urlParts.Length > 1)
                    {
                        var oldFileName = urlParts[1];
                        var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
                        if (System.IO.File.Exists(oldFilePath))
                        {
                            System.IO.File.Delete(oldFilePath);
                        }
                    }
                }

                // URL'i command'a set et
                var baseUrl = Environment.GetEnvironmentVariable("API_BASE_URL") ?? "http://localhost:5074";
                command.ImageUrl = $"{baseUrl}/images/{fileName}";
            }

            var result = await _mediator.Send(command);
            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        try
        {
            await _mediator.Send(new DeleteProductCommand { Id = id });
            return NoContent();
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
