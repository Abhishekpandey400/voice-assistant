using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Interfaces;
using MinuteHire.Infrastructure.Helpers;
using MinuteHire.Application.Common;

namespace MinuteHire.Infrastructure.Adapters;

internal sealed class FallbackLlmClient(
    IOptions<AiOptions> options,
    IEnumerable<IChatProvider> chatProviders,
    ProviderCooldowns cooldowns,
    ILogger<FallbackLlmClient> logger) : ILlmClient
{
    private readonly IReadOnlyDictionary<LlmProviderKind, IChatProvider> _providers = chatProviders.ToDictionary(p => p.Kind);

    public async Task<LlmReply> CompleteAsync(string systemPrompt, IReadOnlyList<ChatTurn> turns, CancellationToken ct)
    {
        var configured = options.Value.Providers.Where(p => p.IsConfigured).ToList();

        if (configured.Count == 0)
            throw new AiUnavailableException("No AI provider is configured on the server.");

        foreach (var provider in configured.Where(p => !cooldowns.IsCooling(p.Name)))
        {
            try
            {
                var content = (await _providers[provider.Kind].CompleteAsync(provider, systemPrompt, turns, ct)).Trim();

                if (content.Length > 0)
                {
                    cooldowns.Clear(provider.Name);
                    return new LlmReply(content, provider.Name, provider.Model);
                }

                logger.LogWarning("AI provider {Provider} returned an empty reply", provider.Name);
            }
            catch (ProviderException ex)
            {
                if (ex.IsTransient)
                    cooldowns.Cool(provider.Name, ex.RetryAfter ?? TimeSpan.FromSeconds(30));

                logger.LogWarning("AI provider {Provider} failed: {Error}", provider.Name, ex.Message);
            }
        }

        throw new AiUnavailableException("The AI assistant is temporarily unavailable. Please try again in a moment.");
    }
}
