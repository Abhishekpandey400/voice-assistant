using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;
using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Interfaces;
using MinuteHire.Infrastructure.Helpers;

namespace MinuteHire.Infrastructure.Adapters;

internal interface IChatProvider
{
    LlmProviderKind Kind { get; }
    Task<string> CompleteAsync(LlmProviderOptions provider, string systemPrompt, IReadOnlyList<ChatTurn> turns, CancellationToken ct);
}

internal sealed class OpenAiCompatibleChatProvider(IHttpClientFactory httpClientFactory, IOptions<AiOptions> options) : IChatProvider
{
    public LlmProviderKind Kind => LlmProviderKind.OpenAiCompatible;

    public async Task<string> CompleteAsync(LlmProviderOptions provider, string systemPrompt, IReadOnlyList<ChatTurn> turns, CancellationToken ct)
    {
        var messages = new[] { new { role = "system", content = systemPrompt } }
            .Concat(turns.Select(t => new { role = t.IsUser ? "user" : "assistant", content = t.Content }));

        using var request = new HttpRequestMessage(HttpMethod.Post, provider.Endpoint("chat/completions"))
        {
            Content = JsonContent.Create(new
            {
                model = provider.Model,
                messages,
                temperature = options.Value.Temperature,
                max_tokens = options.Value.MaxOutputTokens
            })
        };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", provider.ApiKey);

        var json = await ProviderHttp.SendAsync(httpClientFactory.CreateClient(ProviderHttp.ClientName), request, provider.Name, ct);

        return json["choices"]?[0]?["message"]?["content"]?.GetValue<string>() ?? string.Empty;
    }
}

internal sealed class GeminiChatProvider(IHttpClientFactory httpClientFactory, IOptions<AiOptions> options) : IChatProvider
{
    public LlmProviderKind Kind => LlmProviderKind.Gemini;

    public async Task<string> CompleteAsync(LlmProviderOptions provider, string systemPrompt, IReadOnlyList<ChatTurn> turns, CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, provider.Endpoint($"v1beta/models/{provider.Model}:generateContent"))
        {
            Content = JsonContent.Create(new
            {
                system_instruction = new { parts = new[] { new { text = systemPrompt } } },
                contents = turns.Select(t => new { role = t.IsUser ? "user" : "model", parts = new[] { new { text = t.Content } } }),
                generationConfig = new
                {
                    temperature = options.Value.Temperature,
                    maxOutputTokens = options.Value.MaxOutputTokens,
                    thinkingConfig = new { thinkingBudget = 0 }
                }
            })
        };
        request.Headers.Add("x-goog-api-key", provider.ApiKey);

        var json = await ProviderHttp.SendAsync(httpClientFactory.CreateClient(ProviderHttp.ClientName), request, provider.Name, ct);

        var parts = json["candidates"]?[0]?["content"]?["parts"]?.AsArray() ?? new JsonArray();
        return string.Concat(parts.Select(p => p?["text"]?.GetValue<string>()));
    }
}
