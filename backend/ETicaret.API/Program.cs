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
builder.Services.AddSwaggerGen();

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
    ExpireMinutes = int.Parse(Environment.GetEnvironmentVariable("JWT_EXPIRE_MINUTES") ?? "30")
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
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Database Migration
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
