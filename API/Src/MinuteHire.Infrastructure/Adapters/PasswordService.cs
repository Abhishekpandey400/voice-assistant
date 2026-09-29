using Microsoft.AspNetCore.Identity;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Infrastructure.Adapters;

internal sealed class PasswordService : IPasswordService
{
    private static readonly User HashContext = new();
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(string password) => _hasher.HashPassword(HashContext, password);

    public bool Verify(string passwordHash, string password) =>
        _hasher.VerifyHashedPassword(HashContext, passwordHash, password) != PasswordVerificationResult.Failed;
}
