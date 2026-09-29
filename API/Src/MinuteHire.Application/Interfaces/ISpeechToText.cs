using MinuteHire.Application.Dtos.Ai;

namespace MinuteHire.Application.Interfaces;

public interface ISpeechToText
{
    Task<string> TranscribeAsync(AudioInput audio, CancellationToken ct);
}
