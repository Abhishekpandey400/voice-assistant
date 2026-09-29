FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

ARG BUILD_CONFIGURATION=Release

WORKDIR /src

COPY API/MinuteHire.sln ./API/
COPY API/Src/MinuteHire.Api/MinuteHire.Api.csproj ./API/Src/MinuteHire.Api/
COPY API/Src/MinuteHire.Application/MinuteHire.Application.csproj ./API/Src/MinuteHire.Application/
COPY API/Src/MinuteHire.Domain/MinuteHire.Domain.csproj ./API/Src/MinuteHire.Domain/
COPY API/Src/MinuteHire.Infrastructure/MinuteHire.Infrastructure.csproj ./API/Src/MinuteHire.Infrastructure/

RUN dotnet restore "./API/Src/MinuteHire.Api/MinuteHire.Api.csproj"

COPY API/. ./API/

RUN dotnet publish "./API/Src/MinuteHire.Api/MinuteHire.Api.csproj" \
    -c "$BUILD_CONFIGURATION" \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

COPY --from=build /app/publish .

USER $APP_UID

ENTRYPOINT ["dotnet", "MinuteHire.Api.dll"]
