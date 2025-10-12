# PowerShell Deployment Script for SR-PREVENCION
# This script builds and deploys the application to Cloudflare

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Check if wrangler is installed
try {
    wrangler --version | Out-Null
} catch {
    Write-Host "❌ Wrangler CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   pnpm add -g wrangler" -ForegroundColor Yellow
    exit 1
}

# Check if we're logged in to Cloudflare
Write-Host "📝 Checking Cloudflare authentication..." -ForegroundColor Cyan
try {
    wrangler whoami | Out-Null
} catch {
    Write-Host "❌ Not logged in to Cloudflare. Please run:" -ForegroundColor Red
    Write-Host "   wrangler login" -ForegroundColor Yellow
    exit 1
}

# Get environment (default to production)
$ENV = if ($args[0]) { $args[0] } else { "production" }
Write-Host "🌍 Deploying to environment: $ENV" -ForegroundColor Cyan

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install --frozen-lockfile

# Run tests
Write-Host "🧪 Running tests..." -ForegroundColor Cyan
try {
    pnpm test
} catch {
    Write-Host "❌ Tests failed. Deployment aborted." -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "🔍 Running linter..." -ForegroundColor Cyan
try {
    pnpm lint
} catch {
    Write-Host "⚠️  Linting warnings detected. Continuing..." -ForegroundColor Yellow
}

# Build frontend
Write-Host "🏗️  Building frontend..." -ForegroundColor Cyan
pnpm --filter web build

# Build worker
Write-Host "🏗️  Building worker..." -ForegroundColor Cyan
pnpm --filter worker build

# Run database migrations (if needed)
Write-Host "📊 Running database migrations..." -ForegroundColor Cyan
try {
    if ($ENV -eq "production") {
        wrangler d1 migrations apply sr_d1_db --env production
    } else {
        wrangler d1 migrations apply sr_d1_db
    }
} catch {
    Write-Host "⚠️  Migration failed or already applied. Continuing..." -ForegroundColor Yellow
}

# Deploy worker
Write-Host "🚀 Deploying worker to Cloudflare..." -ForegroundColor Cyan
if ($ENV -eq "production") {
    wrangler deploy --env production
} else {
    wrangler deploy
}

Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Test the deployed application" -ForegroundColor White
Write-Host "  2. Monitor logs: wrangler tail --env $ENV" -ForegroundColor White
Write-Host "  3. Check analytics in Cloudflare dashboard" -ForegroundColor White
