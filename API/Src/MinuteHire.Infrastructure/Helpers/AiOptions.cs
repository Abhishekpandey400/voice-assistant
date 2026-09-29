namespace MinuteHire.Infrastructure.Helpers;

public enum LlmProviderKind
{
    OpenAiCompatible,
    Gemini
}

public sealed class AiOptions
{
    public const string Section = "Ai";

    public List<LlmProviderOptions> Providers { get; set; } = [];
    public TranscriptionOptions Transcription { get; set; } = new();
    public double Temperature { get; set; } = 0.6;
    public int MaxOutputTokens { get; set; } = 500;
    public int TimeoutSeconds { get; set; } = 30;
}

public sealed class LlmProviderOptions
{
    public string Name { get; set; } = string.Empty;
    public LlmProviderKind Kind { get; set; }
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;

    public bool IsConfigured => !string.IsNullOrWhiteSpace(ApiKey) && !string.IsNullOrWhiteSpace(Model);

    public Uri Endpoint(string relativePath) => new(new Uri(BaseUrl.TrimEnd('/') + "/"), relativePath);
}

public sealed class TranscriptionOptions
{
    public string Provider { get; set; } = "groq";
    public string Model { get; set; } = "whisper-large-v3-turbo";
    public string? Language { get; set; } = "en";
    public long MaxFileBytes { get; set; } = 10 * 1024 * 1024;
}
