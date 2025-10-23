# Quick Reference Guide - SR Manager App

**⚡ Essential Commands & Quick Tips for Phase 6 & 7**

---

## 🚀 Quick Start Commands

### Build Everything
```bash
# Install dependencies
pnpm install

# TypeScript compilation check
pnpm run type-check

# Build both frontend and backend
pnpm run build:all

# Or build individually
cd web && pnpm build      # Frontend
cd worker && pnpm build   # Backend
```

### Development Server
```bash
# Start backend (watch mode)
cd worker && wrangler dev
# API runs on: http://localhost:8787/api

# Start frontend (watch mode)
cd web && pnpm dev
# App runs on: http://localhost:5173
```

### Production Deployment
```bash
# Deploy backend to Cloudflare Workers
cd worker && wrangler deploy

# Deploy frontend to Cloudflare Pages
cd web && wrangler pages deploy dist/

# Run production tests
bash scripts/test-production.sh
```

---

## 🔍 Verification Commands

### TypeScript Compilation
```bash
# Frontend
cd web && pnpm exec tsc --noEmit

# Backend
cd worker && pnpm exec tsc --noEmit

# Both with errors reported
pnpm run lint
```

### Build Verification
```bash
# Check frontend build size
cd web && pnpm build && du -sh dist/

# Check backend build size
cd worker && pnpm build && du -sh dist/

# Run tests
bash scripts/test-production.sh
```

### API Health Check
```bash
# Local
curl http://localhost:8787/api/health

# Production
curl https://sr-prevencion.electrocicla.workers.dev/api/health
```

---

## 📊 Bundle Information

### Current Production Sizes
```
Frontend JS:  348.34 kB (gzipped: 91.61 kB)
Frontend CSS: 33.75 kB (gzipped: 5.79 kB)
Backend:      150.8 kB
Total:        ~382 kB uncompressed → ~98 kB gzipped
```

### Optimization Tips
```bash
# Analyze dependencies
cd web && npm ls --depth=0

# Check unused imports
cd web && pnpm exec tsc --noUnusedLocals --noUnusedParameters

# Monitor bundle
cd web && vite build --outDir dist --analyze
```

---

## 🗄️ Database Management

### D1 Commands
```bash
# List databases
wrangler d1 list

# Check database info
wrangler d1 info sr-prevencion-db

# Execute SQL
wrangler d1 execute sr-prevencion-db --command="SELECT COUNT(*) FROM companies;"

# Backup database
wrangler d1 backup create sr-prevencion-db

# Apply migrations
wrangler d1 execute sr-prevencion-db --file=./migrations/001_init.sql
```

### Check Database Schema
```bash
# List all tables
wrangler d1 execute sr-prevencion-db --command=".tables"

# Show table structure
wrangler d1 execute sr-prevencion-db --command=".schema companies"

# Check indexes
wrangler d1 execute sr-prevencion-db --command="SELECT * FROM sqlite_master WHERE type='index';"
```

---

## 🗂️ R2 Storage Management

### R2 Commands
```bash
# List R2 buckets
wrangler r2 bucket list

# List files in bucket
wrangler r2 object list sr-prevencion-files --limit 20

# Upload test file
wrangler r2 object put sr-prevencion-files/test.txt --path=test.txt

# Delete file
wrangler r2 object delete sr-prevencion-files/test.txt

# Get file info
wrangler r2 object head sr-prevencion-files/test.txt
```

### Check R2 Quota
```bash
# Get bucket stats
wrangler r2 bucket info sr-prevencion-files

# Calculate storage usage
wrangler r2 object list sr-prevencion-files | wc -l
```

---

## 📝 Git & Version Control

### Useful Git Commands
```bash
# Check status
git status

# View recent changes
git log --oneline -10

# Create deployment branch
git checkout -b deploy/phase-6

# Tag release
git tag -a v1.0.0 -m "Production release Phase 6"
git push origin v1.0.0

# View file history
git log -p worker/src/routes/documents.ts

# Rollback last commit
git reset --soft HEAD~1
```

---

## 🧪 Testing Quick Reference

### API Testing
```bash
# Test health endpoint
curl https://sr-prevencion.electrocicla.workers.dev/api/health

# Test with auth header
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://sr-prevencion.electrocicla.workers.dev/api/companies

# POST with data
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Test Company"}' \
  https://sr-prevencion.electrocicla.workers.dev/api/companies
```

### Run Test Suite
```bash
# Full test suite
bash scripts/test-production.sh

# Individual API tests
bash scripts/test-production.sh | grep "COMPANIES"

# Save test results
bash scripts/test-production.sh > test-results.log 2>&1
```

---

## 🐛 Debugging Commands

### View Logs
```bash
# Worker logs (real-time)
wrangler logs

# View deployment logs
wrangler deployments list

# Check last deployment status
wrangler deployments view

# Stream logs to file
wrangler logs > worker.log &
```

### Environment Variables
```bash
# Check worker environment
wrangler secret list

# Set environment variable
wrangler secret put DATABASE_ID

# List wrangler configuration
wrangler whoami

# Check available bindings
cat worker/wrangler.toml | grep -A 20 "\[env"
```

### Performance Monitoring
```bash
# Check build performance
time pnpm run build:all

# Analyze frontend bundle
cd web && pnpm build --report

# Monitor real-time metrics
watch -n 1 'curl -s https://sr-prevencion.electrocicla.workers.dev/api/health | jq'
```

---

## 📱 API Endpoints Reference

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
```

### Companies
```
GET    /api/companies
POST   /api/companies
GET    /api/companies/:id
PUT    /api/companies/:id
DELETE /api/companies/:id
```

### Workers
```
GET    /api/workers?companyId=X
POST   /api/workers
GET    /api/workers/:id
PUT    /api/workers/:id
DELETE /api/workers/:id
```

### Documents
```
GET    /api/documents/worker/:id
POST   /api/documents
PUT    /api/documents/:id
DELETE /api/documents/:id
GET    /api/documents/pending (Admin only)
```

### R2 Storage
```
POST   /api/r2/upload-url
POST   /api/r2/download-url
POST   /api/r2/delete (Admin only)
```

---

## 🔐 Security Checklist

- [x] JWT tokens configured
- [x] CORS headers set
- [x] R2 bucket access configured
- [x] D1 database access configured
- [x] Environment secrets stored
- [x] Rate limiting ready (optional)
- [x] HTTPS enforced

### Check Security Config
```bash
# Verify CORS in worker
grep -n "Access-Control" worker/src/index.ts

# Check JWT secret
wrangler secret list | grep JWT

# Verify auth routes
grep -r "authMiddleware" worker/src/routes/
```

---

## 📈 Performance Tips

### Frontend Optimization
```bash
# Enable code splitting
# (Already configured in vite.config.ts)

# Analyze bundle size
cd web && pnpm build --stats

# Check for unused packages
pnpm audit --production
```

### Backend Optimization
```bash
# Bundle size analysis
ls -lh worker/dist/index.js

# Check module count
esbuild --bundle --analyze worker/src/index.ts

# Monitor memory usage
wrangler tail --format pretty
```

### Database Optimization
```bash
# Check query performance
wrangler d1 execute sr-prevencion-db --command="EXPLAIN QUERY PLAN SELECT * FROM companies WHERE user_id = 'X';"

# Add missing indexes
wrangler d1 execute sr-prevencion-db --command="CREATE INDEX idx_companies_user_id ON companies(user_id);"
```

---

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
```bash
# Clear cache
rm -rf node_modules .turbo dist
pnpm install
pnpm build
```

**TypeScript Errors**
```bash
# Check errors
pnpm run type-check

# Force rebuild
pnpm build --force
```

**Database Connection Issues**
```bash
# Verify D1 binding
wrangler d1 info sr-prevencion-db

# Check connection string
grep database_id worker/wrangler.toml
```

**R2 Access Issues**
```bash
# Verify bucket exists
wrangler r2 bucket list

# Test write access
wrangler r2 object put sr-prevencion-files/test.txt --path=test.txt
```

**Deployment Failures**
```bash
# Check deployment status
wrangler deployments list

# View error details
wrangler tail --status error

# Rollback to previous version
wrangler rollback
```

---

## 📊 Monitoring Dashboard

### Health Metrics to Track
- Frontend load time: <3s
- API response time: <100ms
- Database query time: <50ms
- R2 operations: <200ms
- Error rate: <0.1%
- Uptime: >99.5%

### View Metrics
```bash
# Cloudflare Dashboard
open https://dash.cloudflare.com/

# Worker Analytics
wrangler analytics

# D1 Performance
wrangler d1 info sr-prevencion-db --stats
```

---

## 📦 Deployment Checklist

Before each deployment:
- [ ] `pnpm run type-check` passes
- [ ] `pnpm run build:all` succeeds
- [ ] `bash scripts/test-production.sh` passes
- [ ] `git status` is clean
- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] R2 bucket accessible
- [ ] No uncommitted changes

---

## 🔄 Update Procedures

### Update Dependencies
```bash
# Check for updates
pnpm outdated

# Update specific package
pnpm update react@latest

# Update all packages (careful!)
pnpm update --latest

# Check for security issues
pnpm audit
```

### Roll Forward
```bash
# Tag new release
git tag -a v1.0.1 -m "Bug fix release"

# Deploy
cd worker && wrangler deploy
cd ../web && wrangler pages deploy dist/

# Verify
curl https://sr-prevencion.electrocicla.workers.dev/api/health
```

### Roll Back
```bash
# Check deployment history
wrangler deployments list

# Rollback to previous
wrangler rollback

# Or redeploy specific version
git checkout v1.0.0
pnpm build:all
wrangler deploy
```

---

## 📞 Quick Support

### Check Logs
```bash
# Real-time worker logs
wrangler tail

# Save logs to file
wrangler tail > debug.log &

# Filter by status
wrangler tail --status error

# Filter by URL
wrangler tail --format json | grep companies
```

### Get Help
```bash
# Wrangler help
wrangler --help
wrangler deploy --help

# Docs
wrangler docs

# Check for known issues
wrangler version
```

---

## 🎯 Next Steps (Phase 7)

- [ ] Real-time notifications (WebSockets)
- [ ] Email alerts system
- [ ] Bulk document upload
- [ ] Analytics dashboard
- [ ] Mobile app
- [ ] Multi-language support

**See:** [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) for full roadmap

---

**Last Updated:** October 23, 2025  
**Version:** 1.0.0 Production Ready  
**Status:** ✅ Ready to Deploy
