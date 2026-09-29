using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using MinuteHire.Application.Interfaces;
using MinuteHire.Application.Services;
using MinuteHire.Domain.Authorization;
using MinuteHire.Infrastructure.Adapters;
using MinuteHire.Infrastructure.Helpers;
using MinuteHire.Infrastructure.Persistence;

namespace MinuteHire.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(ConnectionStringHelper.Normalize(configuration.GetConnectionString("Default"))));
        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddHealthChecks().AddDbContextCheck<AppDbContext>("database");

        services.Configure<SeedOptions>(configuration.GetSection(SeedOptions.Section));
        services.AddHttpContextAccessor();

        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<IActivityLogger, ActivityLogger>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IActivityLogService, ActivityLogService>();
        services.AddScoped<IUserService, UserService>();

        return services
            .AddJwtAuthentication(configuration)
            .AddAi(configuration);
    }

    private static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.Section))
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<ITokenService, JwtTokenService>();
        services.AddSingleton<IPasswordService, PasswordService>();

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtOptions>>((bearer, jwt) =>
            {
                bearer.MapInboundClaims = false;
                bearer.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidIssuer = jwt.Value.Issuer,
                    ValidAudience = jwt.Value.Audience,
                    IssuerSigningKey = jwt.Value.SigningKey,
                    NameClaimType = JwtRegisteredClaimNames.Name,
                    RoleClaimType = AppClaims.Role,
                    ClockSkew = TimeSpan.FromSeconds(30)
                };
                bearer.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                        var subject = context.Principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

                        if (!Guid.TryParse(subject, out var userId) ||
                            !await db.Users.AnyAsync(u => u.Id == userId && u.IsActive, context.HttpContext.RequestAborted))
                            context.Fail("The account no longer exists or has been deactivated.");
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            foreach (var permission in Permissions.All)
                options.AddPolicy(permission, policy => policy.RequireAuthenticatedUser().RequireClaim(AppClaims.Permission, permission));
        });

        return services;
    }

    private static IServiceCollection AddAi(this IServiceCollection services, IConfiguration configuration)
    {
        var section = configuration.GetSection(AiOptions.Section);
        services.Configure<AiOptions>(section);

        services.AddHttpClient(ProviderHttp.ClientName, client =>
            client.Timeout = TimeSpan.FromSeconds(section.GetValue(nameof(AiOptions.TimeoutSeconds), 30)));

        services.AddSingleton<ProviderCooldowns>();
        services.AddSingleton<IChatProvider, OpenAiCompatibleChatProvider>();
        services.AddSingleton<IChatProvider, GeminiChatProvider>();
        services.AddSingleton<ILlmClient, FallbackLlmClient>();
        services.AddSingleton<ISpeechToText, WhisperSpeechToText>();

        return services;
    }
}
