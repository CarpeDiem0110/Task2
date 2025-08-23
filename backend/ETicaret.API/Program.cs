using DotNetEnv;
using ETicaret.Application.Interfaces;
using ETicaret.Infrastructure.Data;
using ETicaret.Infrastructure.Repositories;
using ETicaret.Infrastructure.Services;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using StackExchange.Redis;
using System.Reflection;
using System.Text;

// Load environment variables
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(envPath))
{
    // EF Tools working directory farklı olabilir, parent directory'yi kontrol et
    envPath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory())?.FullName ?? "", ".env");
}
Env.Load(envPath);

var builder = WebApplication.CreateBuilder(args);

// Serilog Configuration
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/eticaret-.txt", rollingInterval: RollingInterval.Day)
    .MinimumLevel.Information()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger Configuration with JWT
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "ETicaret API", 
        Version = "v1" 
    });
    
    // JWT Authentication için Swagger konfigürasyonu
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database Configuration
var connectionString = $"Host={Environment.GetEnvironmentVariable("DB_HOST")};Database={Environment.GetEnvironmentVariable("DB_NAME")};Username={Environment.GetEnvironmentVariable("DB_USERNAME")};Password={Environment.GetEnvironmentVariable("DB_PASSWORD")};Port={Environment.GetEnvironmentVariable("DB_PORT")}";

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(connectionString);
    
    // Development'ta SQL query'leri logla
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.LogTo(Console.WriteLine, LogLevel.Information);
    }
});

// Redis Configuration 
var redisConnectionString = $"{Environment.GetEnvironmentVariable("REDIS_HOST")}:{Environment.GetEnvironmentVariable("REDIS_PORT")},abortConnect=false";
try
{
    var redis = ConnectionMultiplexer.Connect(redisConnectionString);
    builder.Services.AddSingleton<IConnectionMultiplexer>(redis);
    builder.Services.AddScoped<ICacheService, RedisCacheService>();
    Console.WriteLine("✅ Redis bağlantısı başarılı!");
}
catch (Exception ex)
{
    Console.WriteLine($"⚠️ Redis bağlanamadı, InMemory cache kullanılıyor: {ex.Message}");
    builder.Services.AddMemoryCache();
    builder.Services.AddScoped<ICacheService, InMemoryCacheService>();
}

// JWT Configuration
var jwtSettings = new
{
    SecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")!,
    Issuer = Environment.GetEnvironmentVariable("JWT_ISSUER")!,
    Audience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")!,
    ExpireMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES") ?? "480") // 8 saat
};

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey))
        };
    });

builder.Services.AddAuthorization();

// MediatR Configuration
builder.Services.AddMediatR(typeof(ETicaret.Application.Features.Auth.Commands.LoginCommand).Assembly);

// FluentValidation Configuration
builder.Services.AddScoped(typeof(IPipelineBehavior<,>), typeof(ETicaret.Application.Behaviors.ValidationBehavior<,>));
var applicationAssembly = typeof(ETicaret.Application.Features.Auth.Commands.LoginCommand).Assembly;
builder.Services.AddValidatorsFromAssembly(applicationAssembly);

// Repository & Service Registration
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<ICacheService, RedisCacheService>();
builder.Services.AddScoped<IJwtService>(provider => 
    new JwtService(jwtSettings.SecretKey, jwtSettings.Issuer, jwtSettings.Audience, jwtSettings.ExpireMinutes));

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Global Exception Handler (we'll create this next)
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseHttpsRedirection();

// Static files middleware for serving uploaded images
app.UseStaticFiles();

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database Migration and Seed Data
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    
    // Seed initial data if database is empty
    await SeedInitialData(dbContext);
}

app.Run();

// Seed Data Method
static async Task SeedInitialData(ApplicationDbContext context)
{
    // Check if data already exists
    if (context.Products.Any() && context.Users.Any())
    {
        return; // Database has been seeded
    }

    // Seed Admin User was given
    if (!context.Users.Any())
    {
        var adminUser = new ETicaret.Domain.Entities.User
        {
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@shopmax.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"), // Admin123!
            Role = ETicaret.Domain.Enums.UserRole.Admin,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await context.Users.AddAsync(adminUser);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ Admin user created! Email: admin@shopmax.com, Password: Admin123!");
    }

    // Seed Products was given 
    if (!context.Products.Any())
    {
        var sampleProducts = new[]
    {
        new ETicaret.Domain.Entities.Product
        {
            Name = "iPhone 15 Pro Max",
            Description = "Apple'ın en gelişmiş iPhone modeli. A17 Pro çip, titanium tasarım ve gelişmiş kamera sistemi.",
            Price = 54999.99m,
            Stock = 25,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Samsung Galaxy S24 Ultra",
            Description = "Samsung'un flagship telefonu. S Pen desteği, 200MP kamera ve güçlü performans.",
            Price = 47999.99m,
            Stock = 30,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "MacBook Pro M3",
            Description = "Apple M3 çipli MacBook Pro. Profesyonel iş yükleri için optimize edilmiş performans.",
            Price = 89999.99m,
            Stock = 15,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Dell XPS 13",
            Description = "Kompakt ve güçlü ultrabook. İntel Core i7 işlemci ve 16GB RAM ile yüksek performans.",
            Price = 45999.99m,
            Stock = 20,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Nike Air Max 270",
            Description = "Rahat ve şık spor ayakkabı. Günlük kulanım için mükemmel konfor ve stil.",
            Price = 3499.99m,
            Stock = 50,
            Category = "Spor",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Adidas Ultraboost 22",
            Description = "Koşu için optimize edilmiş ayakkabı. Boost teknolojisi ile üstün enerji geri dönüşümü.",
            Price = 4299.99m,
            Stock = 35,
            Category = "Spor",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Levi's 501 Original Jeans",
            Description = "Klasik straight fit jean. %100 pamuklu kumaş ve dayanıklı yapısı ile zamansız stil.",
            Price = 899.99m,
            Stock = 40,
            Category = "Giyim",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "H&M Basic T-Shirt",
            Description = "Yumuşak pamuklu basic tişört. Günlük kulanım için ideal konfor ve kalite.",
            Price = 199.99m,
            Stock = 60,
            Category = "Giyim",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "IKEA HEMNES Kitaplık",
            Description = "Açık bej renkte çam masif ahşap kitaplık. 5 raftan oluşan şık depolama çözümü.",
            Price = 2999.99m,
            Stock = 10,
            Category = "Ev & Bahçe",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Philips Hue Akıllı Ampul Seti",
            Description = "WiFi'lı RGB LED ampul seti. Mobil uygulama ile renk ve parlaklık kontrolü.",
            Price = 1299.99m,
            Stock = 25,
            Category = "Ev & Bahçe",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Sapiens - Yuval Noah Harari",
            Description = "İnsanlık tarihinin en kapsamlı analizlerinden biri. Dünya çapında bestseller kitap.",
            Price = 89.99m,
            Stock = 100,
            Category = "Kitap",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Atomic Habits - James Clear",
            Description = "Alışkanlıkların gücü üzerine praktik rehber. Kişisel gelişim kategorisinin en iyisi.",
            Price = 79.99m,
            Stock = 80,
            Category = "Kitap",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "LEGO Architecture Tokyo",
            Description = "Tokyo şehrinin LEGO versiyonu. Tokyo Kulesi, Tokyo Skytree ve daha fazlası içerir.",
            Price = 1199.99m,
            Stock = 15,
            Category = "Oyuncak",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1558060370-d644479cb6e3?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Razer DeathAdder V3 Gaming Mouse",
            Description = "Profesyonel oyuncular için tasarlanmış gaming mouse. 30.000 DPI sensör teknolojisi.",
            Price = 2299.99m,
            Stock = 22,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Sony WH-1000XM5 Kulaklık",
            Description = "Endüstri lideri gürültü engelleme teknolojisi. 30 saatlik batarya ömrü ve premium ses kalitesi.",
            Price = 12999.99m,
            Stock = 18,
            Category = "Elektrik",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        },
        new ETicaret.Domain.Entities.Product
        {
            Name = "Patagonia Houdini Jacket",
            Description = "Ultra hafif rüzgar geçirmez ceket. Outdoor aktiviteler için mükemmel koruma.",
            Price = 3999.99m,
            Stock = 12,
            Category = "Giyim",
            IsActive = true,
            ImageUrl = "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=500&h=500&fit=crop",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        }
    };

    await context.Products.AddRangeAsync(sampleProducts);
    await context.SaveChangesAsync();
    
    Console.WriteLine("✅ Sample products have been seeded to database!");
    }
}
