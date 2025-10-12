# SR-PREVENCION Architecture

## Overview

SR-PREVENCION is a full-stack application built on Cloudflare's edge computing platform, designed to connect Chilean businesses with risk prevention professionals for document review, certification, and safety protocol consultation.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation

### Backend
- **Cloudflare Workers** for serverless API
- **Hono** web framework for routing
- **D1** (SQLite) for relational data
- **R2** for object storage
- **Jose** for JWT handling

### Infrastructure
- **Cloudflare Access** for Zero Trust auth (professionals/admin)
- **Cloudflare CDN** for static asset delivery
- **GitHub Actions** for CI/CD (planned)

## Architecture Diagram

```
┌─────────────────┐
│   Web Browser   │
│  (React SPA)    │
└────────┬────────┘
         │
         │ HTTPS
         ↓
┌─────────────────────────────┐
│  Cloudflare Edge Network    │
│  - CDN (static assets)      │
│  - DDoS protection          │
│  - SSL/TLS termination      │
└────────┬────────────────────┘
         │
         ↓
┌─────────────────────────────┐
│   Cloudflare Workers        │
│   - API endpoints (/api/*)  │
│   - JWT validation          │
│   - Business logic          │
│   - Request routing         │
└────┬─────────────┬──────────┘
     │             │
     ↓             ↓
┌─────────┐   ┌───────────┐
│  D1 DB  │   │  R2 Bucket│
│ (SQLite)│   │  (Files)  │
└─────────┘   └───────────┘
```

## Data Model

### Users
- Stores user accounts (clients, professionals, admins)
- Roles: `user`, `professional`, `admin`
- Password hashed (SHA-256 for now, migrate to bcrypt)

### Jobs
- Represents a service request from a client
- Linked to user (client) and professional
- Status workflow: POR_REVISAR → REVISION_EN_PROGRESO → COTIZACION → TRABAJO_EN_PROGRESO → FINALIZADO

### Files
- Metadata for documents stored in R2
- Links to jobs
- Versioning support for updated documents

### Quotes
- Price proposals from professionals
- Linked to jobs and professionals
- Status: PENDING, ACCEPTED, REJECTED

### Signatures
- Records of professional signatures on documents
- Metadata includes timestamp, IP, signature method

### Audit Logs
- Complete audit trail of all actions
- Who, what, when, where tracking

## Authentication & Authorization

### Client Authentication
1. User signs up with email/password
2. Password hashed and stored in D1
3. JWT token issued with user ID, email, and role
4. Token validated on each request
5. Token expires after 7 days

### Professional/Admin Authentication
1. Cloudflare Access protects professional/admin routes
2. User authenticates via Cloudflare identity provider
3. `Cf-Access-Jwt-Assertion` header validated
4. User mapped to database record by email
5. Role checked (professional or admin)

### Authorization Matrix

| Resource | User | Professional | Admin |
|----------|------|--------------|-------|
| Create job | ✅ | ❌ | ✅ |
| View own jobs | ✅ | - | - |
| View all jobs | ❌ | ✅ | ✅ |
| Create quote | ❌ | ✅ | ✅ |
| Accept quote | ✅ (own) | ❌ | ✅ |
| Upload file | ✅ | ✅ | ✅ |
| Download file | ✅ (own) | ✅ | ✅ |
| Finish job | ❌ | ✅ (assigned) | ✅ |

## File Upload Flow

```
1. Client selects file in UI
2. Frontend validates file (size, type)
3. POST /api/files/upload (multipart/form-data)
4. Worker validates JWT
5. Worker validates file (size < 200MB, allowed MIME type)
6. Worker generates unique R2 key
7. Worker streams file to R2 bucket
8. Worker creates metadata record in D1
9. Worker returns file ID to client
10. Client can link file to job
```

## Job Workflow

```
1. USER: Create job with files
   ↓
2. SYSTEM: Job status = POR_REVISAR
   ↓
3. PROFESSIONAL: Reviews job, creates quote
   ↓
4. SYSTEM: Job status = COTIZACION
   ↓
5. USER: Accepts quote
   ↓
6. SYSTEM: Job status = TRABAJO_EN_PROGRESO
   ↓
7. PROFESSIONAL: Completes work, uploads final document
   ↓
8. PROFESSIONAL: Marks job as finished
   ↓
9. SYSTEM: Job status = FINALIZADO
   ↓
10. USER: Downloads final document
```

## Payment Flow (Manual)

Current implementation uses manual bank transfer:

1. Professional creates quote
2. User accepts quote
3. System displays payment instructions:
   - Bank account details
   - Transfer amount
   - Reference number (job ID)
4. User makes bank transfer
5. User notifies admin of payment
6. Admin verifies payment and marks as paid
7. Professional is notified to start work

**Future:** Integrate with Khipu, Flow, or Stripe for automated payments

## File Storage Strategy

### R2 Key Structure
```
{userId}/{timestamp}-{sanitized-filename}
```

Example: `user-123/1704902400000-safety-protocol.pdf`

### Benefits
- Organized by user
- Prevents filename collisions (timestamp)
- Easy to identify upload time
- Simple to implement user quotas

### Metadata
Stored in D1 `files` table:
- Original filename
- MIME type
- Size
- Upload timestamp
- Version number
- Status
- R2 key reference

## Security Considerations

### Input Validation
- All user inputs sanitized
- SQL injection prevented (parameterized queries)
- File names sanitized to prevent path traversal
- MIME types validated against allowlist

### Authentication
- JWT tokens signed with secret key
- Tokens expire after 7 days
- Cloudflare Access for professional/admin routes
- Rate limiting at edge

### File Security
- R2 objects are private by default
- Access only via Worker with auth check
- File size limits enforced (200MB)
- Virus scanning placeholder (future integration)

### Audit Trail
- All actions logged to `audit_logs`
- Includes user, action, resource, timestamp, IP, user agent
- Immutable log records

## Scalability

### Database (D1)
- SQLite-based, replicated globally
- Suitable for up to ~100k records
- If scaling beyond, migrate to:
  - Cloudflare Durable Objects
  - External PostgreSQL (Neon, Supabase)

### File Storage (R2)
- Unlimited storage
- No egress fees
- Scales automatically

### Compute (Workers)
- Runs at Cloudflare edge (300+ locations)
- Auto-scales with traffic
- CPU time limit: 50ms (standard), 30s (unbound)
- Memory limit: 128MB

### Caching
- Static assets cached at CDN edge
- API responses can be cached with headers
- D1 has built-in query caching

## Monitoring & Observability

### Logs
- Worker logs via Wrangler tail
- Cloudflare dashboard analytics
- Future: Integrate with Sentry, Datadog, or LogFlare

### Metrics
- Request count, latency, errors (Cloudflare Analytics)
- Database query performance (D1 analytics)
- R2 storage usage and bandwidth

### Alerts
- Cloudflare alerts for:
  - High error rates
  - Unusual traffic patterns
  - Origin health issues

## Deployment

### Environments
- **Development:** Local with Miniflare/Wrangler
- **Production:** Cloudflare Workers global network

### CI/CD Pipeline
```
1. Push to GitHub
2. GitHub Actions triggered
3. Run tests (unit + integration)
4. Run linting
5. Build frontend (Vite)
6. Build worker (esbuild)
7. Deploy to Cloudflare (wrangler deploy)
8. Run smoke tests
9. Notify team (Slack)
```

### Rollback Strategy
- Cloudflare supports instant rollback
- Keep previous 10 deployments
- Monitor error rates post-deploy

## Future Enhancements

### Phase 2
- Magic link authentication (passwordless)
- Email notifications (SendGrid/Postmark)
- In-app notifications
- Document versioning UI
- Advanced search and filters

### Phase 3
- Electronic signature integration (DocuSign, Chilean providers)
- Automated payment processing (Khipu, Flow)
- Professional certification verification
- Client payment history
- Invoice generation

### Phase 4
- Mobile app (React Native)
- Real-time chat between clients and professionals
- Video consultation scheduling
- Analytics dashboard
- API for third-party integrations

## Legal & Compliance (Chile)

### Electronic Signatures
Chile's Ley 19.799 regulates electronic signatures. For legal validity:
- **Simple signature:** OK for internal documents
- **Advanced signature:** Requires certificate from Chilean CA
- **Qualified signature:** Maximum legal validity

**Recommendation:** Integrate with Chilean electronic signature provider:
- eSign Chile
- Firma Digital Chile
- Adobe Sign (with Chilean certificates)

### Data Protection
- GDPR-style privacy laws in Chile
- User consent for data processing
- Right to data deletion
- Data breach notification requirements

### Tax & Invoicing
- Electronic invoicing required (SII)
- Integrate with Chilean invoicing systems
- VAT (IVA) handling

## Development Guidelines

### Code Style
- TypeScript strict mode
- ESLint + Prettier
- Functional programming preferred
- Comprehensive error handling

### Testing
- Unit tests for all business logic
- Integration tests for API endpoints
- E2E tests for critical paths
- >80% code coverage target

### Documentation
- Inline comments for complex logic
- JSDoc for public functions
- API spec kept up to date
- Architecture docs updated with changes

## Support & Maintenance

### Backup Strategy
- D1 supports point-in-time recovery
- R2 versioning enabled
- Regular exports to S3 (compliance)

### Disaster Recovery
- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 15 minutes
- Automated failover via Cloudflare

### Monitoring Schedule
- Daily: Check error rates, latency
- Weekly: Review audit logs, user feedback
- Monthly: Capacity planning, cost optimization
