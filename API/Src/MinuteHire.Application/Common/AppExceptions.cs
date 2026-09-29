namespace MinuteHire.Application.Common;

public abstract class AppException(string message, int statusCode, string title) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string Title { get; } = title;
}

public sealed class BadRequestException(string message) : AppException(message, 400, "Invalid request");

public sealed class UnauthorizedException(string message) : AppException(message, 401, "Authentication failed");

public sealed class ForbiddenException(string message) : AppException(message, 403, "Access denied");

public sealed class NotFoundException(string message) : AppException(message, 404, "Resource not found");

public sealed class ConflictException(string message) : AppException(message, 409, "Conflict");

public sealed class AiUnavailableException(string message) : AppException(message, 503, "AI service unavailable");
