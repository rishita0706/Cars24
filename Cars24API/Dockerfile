# ---------- BUILD STAGE ----------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy csproj and restore as distinct layers
COPY *.csproj ./
RUN dotnet restore

# Copy everything and build
COPY . ./
RUN dotnet publish -c Release -o out

# ---------- RUNTIME STAGE ----------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy the published output
COPY --from=build /app/out ./

# Expose port (Render uses 10000 by default, but 5000 internally)
ENV ASPNETCORE_URLS=http://+:5132
EXPOSE 5132

ENTRYPOINT ["dotnet", "Cars24API.dll"]