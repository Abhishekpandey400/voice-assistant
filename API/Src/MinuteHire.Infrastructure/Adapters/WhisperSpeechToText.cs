using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Interfaces;
using MinuteHire.Infrastructure.Helpers;
using MinuteHire.Application.Common;

namespace MinuteHire.Infrastructure.Adapters;

internal sealed class WhisperSpeechToText(
    IHttpClientFactory httpClientFactory,
    IOptions<AiOptions> options,
    ILogger<WhisperSpeechToText> logger) : ISpeechToText
{
    public async Task<string> TranscribeAsync(AudioInput audio, CancellationToken ct)
    {
        var settings = options.Value.Transcription;
        var provider = options.Value.Providers.FirstOrDefault(p =>
                p.Kind == LlmProviderKind.OpenAiCompatible &&
                p.Name.Equals(settings.Provider, StringComparison.OrdinalIgnoreCase) &&
                !string.IsNullOrWhiteSpace(p.ApiKey))
            ?? throw new AiUnavailableException("Speech recognition is not configured on the server.");

        using var file = new StreamContent(audio.Content);
        file.Headers.ContentType = MediaTypeHeaderValue.TryParse(audio.ContentType, out var type)
            ? type
            : new MediaTypeHeaderValue("audio/webm");

        using var form = new MultipartFormDataContent
        {
            { file, "file", string.IsNullOrWhiteSpace(audio.FileName) ? "speech.webm" : audio.FileName },
            { new StringContent(settings.Model), "model" },
            { new StringContent("json"), "response_format" }
        };

        if (!string.IsNullOrWhiteSpace(settings.Language))
            form.Add(new StringContent(settings.Language), "language");

        using var request = new HttpRequestMessage(HttpMethod.Post, provider.Endpoint("audio/transcriptions")) { Content = form };
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", provider.ApiKey);

        try
        {
            var json = await ProviderHttp.SendAsync(httpClientFactory.CreateClient(ProviderHttp.ClientName), request, provider.Name, ct);
            return json["text"]?.GetValue<string>()?.Trim() ?? string.Empty;
        }
        catch (ProviderException ex)
        {
            logger.LogWarning("Speech transcription failed: {Error}", ex.Message);
            throw new AiUnavailableException("Speech recognition is temporarily unavailable. Please try again or type your message.");
        }
    }
}
