namespace MinuteHire.Application.Dtos.Ai;

public sealed record ChatTurn(bool IsUser, string Content);

public sealed record LlmReply(string Content, string Provider, string Model);

public sealed record AudioInput(Stream Content, string FileName, string ContentType);
