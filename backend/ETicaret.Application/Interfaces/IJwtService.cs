namespace ETicaret.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(Guid userId, string email, string role);
    Guid? ValidateToken(string token);
}
