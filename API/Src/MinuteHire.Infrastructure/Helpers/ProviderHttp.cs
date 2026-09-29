using System.Collections.Concurrent;
using System.Text.Json.Nodes;

namespace MinuteHire.Infrastructure.Helpers;

internal sealed class ProviderException(string provider, string message, bool isTransient, TimeSpan? retryAfter = null)
    : Exception($"{provider}: {message}")
{
    public bool IsTransient { get; } = isTransient;
    public TimeSpan? RetryAfter { get; } = retryAfter;
}

internal static class ProviderHttp
{
    public const string ClientName = "ai-providers";

    private static readonly TimeSpan DefaultCooldown = TimeSpan.FromSeconds(60);

    public static async Task<JsonNode> SendAsync(HttpClient client, HttpRequestMessage request, string provider, CancellationToken ct)
    {
        HttpResponseMessage response;

        try
        {
            response = await client.SendAsync(request, ct);
        }
        catch (OperationCanceledException) when (!ct.IsCancellationRequested)
        {
            throw new ProviderException(provider, "Request timed out.", isTransient: true);
        }
        catch (HttpRequestException ex)
        {
            throw new ProviderException(provider, ex.Message, isTransient: true);
        }

        using (response)
        {
            var body = await response.Content.ReadAsStringAsync(ct);
            var status = (int)response.StatusCode;

            if (!response.IsSuccessStatusCode)
                throw new ProviderException(provider, $"HTTP {status}: {body[..Math.Min(300, body.Length)]}",
                    isTransient: status is 408 or 429 or >= 500, RetryAfterOf(response));

            return JsonNode.Parse(body) ?? throw new ProviderException(provider, "Empty response body.", isTransient: false);
        }
    }

    private static TimeSpan RetryAfterOf(HttpResponseMessage response)
    {
        var header = response.Headers.RetryAfter;
        var delay = header?.Delta ?? (header?.Date - DateTimeOffset.UtcNow) ?? DefaultCooldown;
        return TimeSpan.FromSeconds(Math.Clamp(delay.TotalSeconds, 5, 300));
    }
}

internal sealed class ProviderCooldowns
{
    private readonly ConcurrentDictionary<string, DateTimeOffset> _until = new();

    public bool IsCooling(string provider) =>
        _until.TryGetValue(provider, out var until) && until > DateTimeOffset.UtcNow;

    public void Cool(string provider, TimeSpan duration) => _until[provider] = DateTimeOffset.UtcNow + duration;

    public void Clear(string provider) => _until.TryRemove(provider, out _);
}
