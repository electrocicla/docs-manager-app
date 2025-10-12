# 🚀 SR-PREVENCION - Guía de Deployment

## Scripts de Deployment Disponibles

### `pnpm run deploy`
Script principal que ejecuta el deployment completo de la aplicación (Worker + Pages).

**Proceso automatizado:**
1. ✅ Validación TypeScript (typecheck)
2. ✅ Validación ESLint (lint)
3. 🔨 Build de Worker y Frontend
4. 🚀 Deploy del Worker a Cloudflare Workers
5. 🌐 Deploy del Frontend a Cloudflare Pages
6. 🔍 Verificación de health checks
7. 📊 Resumen completo del deployment

**Ejemplo de salida:**
```bash
============================================================
   🚀 SR-PREVENCION DEPLOYMENT
============================================================

→ 1/6 Validando código (TypeScript)...
✓ TypeCheck completado sin errores

→ 2/6 Ejecutando linter...
✓ Lint completado sin errores

→ 3/6 Construyendo aplicación...
✓ Build completado exitosamente

→ 4/6 Desplegando Worker a Cloudflare...
✓ Worker desplegado: https://sr-prevencion.electrocicla.workers.dev

→ 5/6 Desplegando Frontend a Cloudflare Pages...
✓ Pages desplegado: https://sr-prevencion.pages.dev

→ 6/6 Verificando servicios...
✓ Worker respondiendo correctamente

============================================================
   ✓ DEPLOYMENT COMPLETADO
============================================================

Worker (Backend):
  URL:     https://sr-prevencion.electrocicla.workers.dev
  Version: 7ccf587a-1331-4bbf-b773-f27f817a6060
  Size:    125.60 KiB
  Startup: 1 ms
  Health:  https://sr-prevencion.electrocicla.workers.dev/health

Pages (Frontend):
  URL:     https://sr-prevencion.pages.dev
  Latest:  https://f7a76ce2.sr-prevencion.pages.dev

Quick Links:
  App:      https://sr-prevencion.pages.dev
  Registro: https://sr-prevencion.pages.dev/registro
  Login:    https://sr-prevencion.pages.dev/login

Tiempo total: 45.21s
```

### Otros Scripts de Deployment

#### `pnpm run deploy:worker`
Deploy solo del Worker (backend).
```bash
pnpm run deploy:worker
```

#### `pnpm run deploy:pages`
Deploy solo del Frontend (Pages).
```bash
pnpm run deploy:pages
```

#### `pnpm run deploy:production`
Deploy a ambiente de producción (usa env: production en wrangler.toml).
```bash
pnpm run deploy:production
```

## 📋 Pre-requisitos para Deployment

### 1. Autenticación con Cloudflare

Asegúrate de estar autenticado con Wrangler:
```bash
npx wrangler login
```

### 2. Recursos Cloudflare Creados

Verifica que existan los siguientes recursos:

- **D1 Database:** `sr-prevencion-db`
- **R2 Bucket:** `sr-prevencion-files`
- **Pages Project:** `sr-prevencion`

### 3. Variables de Entorno

Configura en el dashboard de Cloudflare:
- Secrets para producción
- Variables de ambiente si es necesario

## 🔧 Configuración del Proyecto

### wrangler.toml

El archivo `wrangler.toml` contiene la configuración principal:

```toml
name = "sr-prevencion"
main = "worker/dist/index.js"
compatibility_date = "2024-01-01"
workers_dev = true

[build]
command = "pnpm --filter worker build"
watch_dirs = ["worker/src"]

[[d1_databases]]
binding = "DB"
database_name = "sr-prevencion-db"
database_id = "a78331db-16a4-4f5c-8133-0e1127069a66"

[[r2_buckets]]
binding = "FILESTORE"
bucket_name = "sr-prevencion-files"

[vars]
ENVIRONMENT = "development"

[migrations]
migrations_dir = "infra/d1/migrations"
```

## 🔄 Flujo de Trabajo de Desarrollo

### Desarrollo Local
```bash
# Instalar dependencias
pnpm install

# Setup inicial (migrar base de datos local)
pnpm run dev:setup

# Iniciar servidores de desarrollo
pnpm run dev

# O iniciar individualmente:
pnpm run dev:web      # Frontend en http://localhost:3000
pnpm run dev:worker   # Worker en http://localhost:8787
```

### Validación de Código
```bash
# TypeScript
pnpm run typecheck

# Linting
pnpm run lint

# Ambos
pnpm run typecheck && pnpm run lint
```

### Build
```bash
# Build completo
pnpm run build

# Build individual
pnpm run build:web
pnpm run build:worker
```

### Deploy
```bash
# Deploy completo (recomendado)
pnpm run deploy

# Deploy individual
pnpm run deploy:worker
pnpm run deploy:pages
```

## 📊 Gestión de Base de Datos

### Migraciones Locales
```bash
pnpm run db:migrate:local
```

### Migraciones Remotas (Producción)
```bash
pnpm run db:migrate:remote
```

### Crear Nueva Migración
1. Crear archivo SQL en `infra/d1/migrations/`
2. Nombrar con timestamp: `YYYY-MM-DD-descripcion.sql`
3. Ejecutar migración:
   ```bash
   pnpm run db:migrate:remote
   ```

## 🔐 Seguridad

### Secrets Management

No incluir secrets en el código. Usar:

```bash
# Agregar secret al Worker
npx wrangler secret put SECRET_NAME

# Listar secrets
npx wrangler secret list
```

### Variables de Entorno

- **Desarrollo:** Definidas en `wrangler.toml` bajo `[vars]`
- **Producción:** Configurar en Cloudflare Dashboard

## 🐛 Troubleshooting

### Error: "Not authenticated"
```bash
npx wrangler login
```

### Error: "Database not found"
Verificar `database_id` en `wrangler.toml`:
```bash
npx wrangler d1 list
```

### Error: "R2 bucket not found"
Crear bucket:
```bash
pnpm run r2:create
```

### Error en Build
Limpiar y reinstalar:
```bash
rm -rf node_modules web/node_modules worker/node_modules
rm -rf web/dist worker/dist
pnpm install
pnpm run build
```

### Verificar Deployment

```bash
# Health check del Worker
curl https://sr-prevencion.electrocicla.workers.dev/health

# Verificar frontend
curl https://sr-prevencion.pages.dev
```

## 📝 Logs y Monitoreo

### Ver logs del Worker
```bash
npx wrangler tail
```

### Ver logs en producción
Dashboard de Cloudflare → Workers → sr-prevencion → Logs

## 🔗 Enlaces Útiles

- **Frontend:** https://sr-prevencion.pages.dev
- **Backend API:** https://sr-prevencion.electrocicla.workers.dev
- **Health Check:** https://sr-prevencion.electrocicla.workers.dev/health
- **Dashboard Cloudflare:** https://dash.cloudflare.com
- **Documentación Wrangler:** https://developers.cloudflare.com/workers/wrangler/

## 📦 Estructura del Proyecto

```
sr-manager-app/
├── scripts/
│   └── deploy.mjs          # Script de deployment automatizado
├── web/                    # Frontend (React + Vite)
│   ├── src/
│   └── dist/              # Build output
├── worker/                 # Backend (Hono + Cloudflare Workers)
│   ├── src/
│   └── dist/              # Build output
├── infra/
│   └── d1/
│       └── migrations/    # Migraciones SQL
├── wrangler.toml          # Configuración Cloudflare
└── package.json           # Scripts y dependencias
```

## 🎯 Best Practices

1. **Siempre validar antes de deploy:**
   ```bash
   pnpm run typecheck && pnpm run lint
   ```

2. **Usar el script de deploy completo:**
   ```bash
   pnpm run deploy
   ```

3. **Verificar health check después del deploy:**
   ```bash
   curl https://sr-prevencion.electrocicla.workers.dev/health
   ```

4. **Revisar logs después del deploy:**
   ```bash
   npx wrangler tail
   ```

5. **Hacer commit antes del deploy:**
   ```bash
   git add .
   git commit -m "feat: descripción del cambio"
   git push
   pnpm run deploy
   ```

## 🚨 Rollback

En caso de necesitar revertir un deployment:

```bash
# Ver versiones anteriores
npx wrangler deployments list

# Hacer rollback a versión específica
npx wrangler rollback [VERSION_ID]
```

---

**Última actualización:** Octubre 2025
