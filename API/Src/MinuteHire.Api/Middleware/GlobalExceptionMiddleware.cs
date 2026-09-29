using Microsoft.AspNetCore.Mvc;
using MinuteHire.Application.Common;

namespace MinuteHire.Api.Middleware;

public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IProblemDetailsService _problemDetails;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public GlobalExceptionMiddleware(RequestDelegate next, IProblemDetailsService problemDetails, ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _problemDetails = problemDetails;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex) when (!context.Response.HasStarted)
        {
            await WriteProblemAsync(context, ex);
        }
    }

    private async Task WriteProblemAsync(HttpContext context, Exception ex)
    {
        var (status, title, detail) = ex switch
        {
            AppException app => (app.StatusCode, app.Title, app.Message),
            BadHttpRequestException bad => (bad.StatusCode, "Invalid request", bad.Message),
            OperationCanceledException when context.RequestAborted.IsCancellationRequested =>
                (StatusCodes.Status499ClientClosedRequest, "Request cancelled", "The client closed the request."),
            _ => (StatusCodes.Status500InternalServerError, "Unexpected error", "Something went wrong on our side. Please try again later.")
        };

        if (status >= StatusCodes.Status500InternalServerError && ex is not AppException)
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

        context.Response.Clear();
        context.Response.StatusCode = status;

        await _problemDetails.WriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            Exception = ex,
            ProblemDetails = new ProblemDetails { Status = status, Title = title, Detail = detail }
        });
    }
}
