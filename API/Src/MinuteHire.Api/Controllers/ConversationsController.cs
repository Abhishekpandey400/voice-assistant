using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MinuteHire.Api.Extensions;
using MinuteHire.Application.Common;
using MinuteHire.Application.Dtos.Ai;
using MinuteHire.Application.Dtos.Conversations;
using MinuteHire.Application.Interfaces;
using MinuteHire.Domain.Authorization;
using Swashbuckle.AspNetCore.Annotations;

namespace MinuteHire.Api.Controllers;

public sealed class VoiceMessageRequest
{
    [Required]
    public IFormFile Audio { get; init; } = null!;
}

[ApiController]
[Route("api/conversations")]
[Produces("application/json")]
[Authorize(Policy = Permissions.AssistantUse)]
public sealed class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversations;

    public ConversationsController(IConversationService conversations)
    {
        _conversations = conversations;
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Start a conversation", Description = "Creates a new AI conversation for the signed-in Student or Teacher.")]
    [ProducesResponseType<ConversationDto>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Start([FromBody] StartConversationRequest request, CancellationToken ct)
    {
        var result = await _conversations.StartAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpGet]
    [SwaggerOperation(Summary = "List my conversations", Description = "Returns the 50 most recent conversations of the signed-in user.")]
    [ProducesResponseType<IReadOnlyList<ConversationDto>>(StatusCodes.Status200OK)]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var result = await _conversations.ListMineAsync(ct);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "Get my conversation transcript", Description = "Returns all messages of a conversation owned by the signed-in user.")]
    [ProducesResponseType<ConversationDetailDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _conversations.GetAsync(id, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/messages")]
    [EnableRateLimiting(ApiServiceExtensions.AssistantRateLimit)]
    [SwaggerOperation(Summary = "Send a text message", Description = "Sends typed text to the AI assistant and returns its reply.")]
    [ProducesResponseType<InteractionResultDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SendText(Guid id, [FromBody] SendMessageRequest request, CancellationToken ct)
    {
        var result = await _conversations.SendTextAsync(id, request.Text, ct);
        return Ok(result);
    }

    [HttpPost("{id:guid}/voice")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(Limits.MaxAudioBytes)]
    [EnableRateLimiting(ApiServiceExtensions.AssistantRateLimit)]
    [SwaggerOperation(Summary = "Send a voice message", Description = "Uploads recorded speech (webm, ogg, mp3, wav or m4a). The server transcribes it with Whisper, sends the transcript to the LLM and returns both.")]
    [ProducesResponseType<InteractionResultDto>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status503ServiceUnavailable)]
    public async Task<IActionResult> SendVoice(Guid id, [FromForm] VoiceMessageRequest request, CancellationToken ct)
    {
        if (request.Audio.Length == 0)
            throw new BadRequestException("The audio recording is empty.");

        if (!request.Audio.ContentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase) &&
            !request.Audio.ContentType.StartsWith("video/webm", StringComparison.OrdinalIgnoreCase))
            throw new BadRequestException("Only audio recordings are accepted.");

        await using var stream = request.Audio.OpenReadStream();
        var result = await _conversations.SendVoiceAsync(id, new AudioInput(stream, request.Audio.FileName, request.Audio.ContentType), ct);
        return Ok(result);
    }
}
