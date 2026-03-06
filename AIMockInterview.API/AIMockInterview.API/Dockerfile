# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj và restore (Dựa trên tên project trong ảnh của bạn)
COPY AIMockInterview.API.csproj ./
RUN dotnet restore

# Copy toàn bộ và build
COPY . ./
RUN dotnet publish -c Release -o out

# Run Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Cấu hình cổng cho Render
ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "AIMockInterview.API.dll"]