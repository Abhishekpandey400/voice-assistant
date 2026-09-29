using MinuteHire.Application.Dtos.Auth;
using MinuteHire.Domain.Entities;

namespace MinuteHire.Application.Interfaces;

public interface ITokenService
{
    AccessToken Create(User user, IReadOnlyCollection<string> permissions);
}
