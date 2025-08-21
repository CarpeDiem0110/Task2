using ETicaret.Application.Features.Auth.Commands;
using FluentValidation;

namespace ETicaret.Application.Features.Auth.Validators;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad alanı zorunludur.")
            .Length(2, 50).WithMessage("Ad 2-50 karakter arasında olmalıdır.")
            .Matches("^[a-zA-ZçÇğĞıİöÖşŞüÜ\\s]+$").WithMessage("Ad sadece harf içerebilir.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad alanı zorunludur.")
            .Length(2, 50).WithMessage("Soyad 2-50 karakter arasında olmalıdır.")
            .Matches("^[a-zA-ZçÇğĞıİöÖşŞüÜ\\s]+$").WithMessage("Soyad sadece harf içerebilir.");

        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("E-posta alanı zorunludur.")
            .EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz.")
            .MaximumLength(100).WithMessage("E-posta adresi 100 karakterden uzun olamaz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre alanı zorunludur.")
            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.")
            .MaximumLength(100).WithMessage("Şifre 100 karakterden uzun olamaz.")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")
            .WithMessage("Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
    }
}
