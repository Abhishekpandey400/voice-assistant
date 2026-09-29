using System.ComponentModel.DataAnnotations;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace MinuteHire.Infrastructure.Helpers;

public sealed class JwtOptions
{
    public const string Section = "Jwt";

    [Required]
    public string Issuer { get; set; } = string.Empty;

    [Required]
    public string Audience { get; set; } = string.Empty;

    [Required, MinLength(32)]
    public string Key { get; set; } = string.Empty;

    [Range(5, 1440)]
    public int ExpiryMinutes { get; set; } = 480;

    public SymmetricSecurityKey SigningKey => new(Encoding.UTF8.GetBytes(Key));
}

public static class AppClaims
{
    public const string Role = "role";
    public const string Permission = "permission";
}
