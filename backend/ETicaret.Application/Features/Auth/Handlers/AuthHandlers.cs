using ETicaret.Application.DTOs.Auth;
using ETicaret.Application.Features.Auth.Commands;
using ETicaret.Application.Interfaces;
using ETicaret.Domain.Entities;
using ETicaret.Domain.Enums;
using MediatR;

namespace ETicaret.Application.Features.Auth.Handlers;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public RegisterCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // Email kontrolü
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
            throw new Exception("Bu email adresi zaten kullanımda.");

        // Şifre hashleme (basit örnek - production'da daha güvenli olmalı)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // Yeni kullanıcı oluştur
        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PasswordHash = passwordHash,
            Role = UserRole.Customer
        };

        var savedUser = await _userRepository.AddAsync(user);

        // JWT token oluştur
        var token = _jwtService.GenerateToken(savedUser.Id, savedUser.Email, savedUser.Role.ToString());

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = savedUser.Id,
                FirstName = savedUser.FirstName,
                LastName = savedUser.LastName,
                Email = savedUser.Email,
                Role = savedUser.Role.ToString()
            }
        };
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtService _jwtService;

    public LoginCommandHandler(IUserRepository userRepository, IJwtService jwtService)
    {
        _userRepository = userRepository;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // Kullanıcı kontrolü
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
            throw new Exception("Email veya şifre hatalı.");

        // Şifre kontrolü
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new Exception("Email veya şifre hatalı.");

        // JWT token oluştur
        var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());

        return new AuthResponseDto
        {
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role.ToString()
            }
        };
    }
}
