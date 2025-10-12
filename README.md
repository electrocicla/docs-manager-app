# SR-PREVENCION

Full-stack application for managing risk prevention documentation and professional services in Chile.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Lucide React
- **Backend**: Cloudflare Workers (TypeScript)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Auth**: Cloudflare Access (professionals/admin) + Custom JWT (clients)

## Project Structure

```
sr-manager-app/
├── web/                    # React frontend
├── worker/                 # Cloudflare Worker API
├── infra/                  # Infrastructure (D1 migrations, R2 setup)
├── scripts/                # Build and deployment scripts
├── docs/                   # API specs and architecture
└── wrangler.toml          # Cloudflare configuration
```

## Prerequisites

- Node.js (v18+ recommended)
- pnpm (v8+)
- Wrangler CLI
- Cloudflare account with Workers, D1, and R2 enabled

## Installation

```bash
# Install dependencies
pnpm install

# Set up local development
pnpm run dev:setup
```

## Local Development

```bash
# Start frontend dev server
pnpm --filter web dev

# Start worker dev server (in another terminal)
pnpm --filter worker dev

# Run both concurrently
pnpm run dev
```

## Database Setup

```bash
# Create D1 database
wrangler d1 create sr_d1_db

# Run migrations
wrangler d1 migrations apply sr_d1_db --local
wrangler d1 migrations apply sr_d1_db --remote
```

## R2 Storage Setup

```bash
# Create R2 bucket
wrangler r2 bucket create sr-preven-files
```

## Testing

```bash
# Run all tests
pnpm test

# Run worker tests
pnpm --filter worker test

# Run frontend tests
pnpm --filter web test
```

## Deployment

```bash
# Deploy to production
pnpm run deploy

# Deploy worker only
pnpm --filter worker deploy

# Deploy with specific environment
wrangler deploy --env production
```

## Environment Variables

Create `.dev.vars` in the root for local development:

```env
JWT_SECRET=your-secret-key
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

## Authentication

- **Clients**: JWT-based authentication with email/password or magic link
- **Professionals/Admin**: Cloudflare Access with Zero Trust validation

## Features

### MVP (Sprint 1)
- ✅ User registration and authentication
- ✅ Document upload (PDF, DOCX, XLSX, images)
- ✅ Job creation and management
- ✅ Professional quotations
- ✅ Quote acceptance workflow
- ✅ Final document delivery with signature
- ✅ Admin dashboard

### Future Enhancements
- Integration with Chilean electronic signature providers
- Automated payment processing
- Advanced notification system
- Document versioning and audit trails

## API Documentation

See [docs/api-spec.md](./docs/api-spec.md) for detailed API documentation.

## Security

- JWT validation on all endpoints
- File size limits (200MB max)
- MIME type validation
- Filename sanitization
- Rate limiting at edge
- Cloudflare Access for professional/admin routes

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - All rights reserved
