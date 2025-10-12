#!/bin/bash
# Deployment script for SR-PREVENCION
# This script builds and deploys the application to Cloudflare

set -e

echo "🚀 Starting deployment process..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   pnpm add -g wrangler"
    exit 1
fi

# Check if we're logged in to Cloudflare
echo "📝 Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not logged in to Cloudflare. Please run:"
    echo "   wrangler login"
    exit 1
fi

# Get environment (default to production)
ENV="${1:-production}"
echo "🌍 Deploying to environment: $ENV"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Run tests
echo "🧪 Running tests..."
pnpm test || {
    echo "❌ Tests failed. Deployment aborted."
    exit 1
}

# Run linting
echo "🔍 Running linter..."
pnpm lint || {
    echo "⚠️  Linting warnings detected. Continuing..."
}

# Build frontend
echo "🏗️  Building frontend..."
pnpm --filter web build

# Build worker
echo "🏗️  Building worker..."
pnpm --filter worker build

# Run database migrations (if needed)
echo "📊 Running database migrations..."
wrangler d1 migrations apply sr_d1_db --env $ENV || {
    echo "⚠️  Migration failed or already applied. Continuing..."
}

# Deploy worker
echo "🚀 Deploying worker to Cloudflare..."
if [ "$ENV" = "production" ]; then
    wrangler deploy --env production
else
    wrangler deploy
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Test the deployed application"
echo "  2. Monitor logs: wrangler tail --env $ENV"
echo "  3. Check analytics in Cloudflare dashboard"
