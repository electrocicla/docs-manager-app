# SR Manager 🛡️

**Comprehensive role-based document management system for safety and prevention companies**

**Plataforma integral para la gestión de documentación de prevención de riesgos laborales en Chile**

Platform for occupational risk management and documentation in Chile. Companies can manage workers, upload documents, and admins can review and approve with role-based workflows. Built with React 18, TypeScript, Cloudflare Workers, D1, and R2.

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://sr-prevencion.electrocicla.workers.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.2-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-61dafb)](https://reactjs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-f38020)](https://workers.cloudflare.com/)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](./EXECUTIVE_SUMMARY.md)

## 🌐 Production Environment

- **Frontend:** https://sr-prevencion.electrocicla.workers.dev/
- **API Backend:** https://sr-prevencion.electrocicla.workers.dev/api
- **Health Check:** https://sr-prevencion.electrocicla.workers.dev/api/health
- **Status:** ✅ LIVE

## ✨ Características Principales

### 🎨 Dashboard Profesional
- Diseño moderno con fuente **Inter** (Google Fonts)
- Sistema de estadísticas visuales con 4 métricas clave
- Información educativa sobre prevención de riesgos
- Proceso explicado en 5 pasos claros
- 6 servicios principales destacados
- Componentes UI reutilizables (InfoCard, ProcessSteps, StatCard)

### 🔒 Autenticación y Seguridad
- Sistema de registro con validación avanzada de contraseñas
- Requisitos: mínimo 8 caracteres, mayúsculas, minúsculas, números, caracteres especiales
- Indicador visual de fortaleza de contraseña en tiempo real
- Confirmación de contraseña con feedback instantáneo
- JWT tokens con Jose library
- Bcrypt para hash de contraseñas

### 📋 Servicios de Prevención de Riesgos
- **RIOHS** - Reglamento Interno (Código del Trabajo Art. 153)
- **Planes de Emergencia** - DS 594 y Ley 16.744
- **Vigilancia Epidemiológica** - Ruido, sílice, químicos, ergonómicos
- **Matriz IPER** - Identificación de Peligros y Evaluación de Riesgos
- **Protocolos MINSAL** - TMERT, PREXOR, PLANESI, manejo de cargas
- **Asesoría SEREMI** - Fiscalizaciones y sumarios

### 🚀 Deployment Automatizado
- Un solo comando: `pnpm run deploy`
- Validación automática (TypeScript + ESLint)
- Build de Worker y Frontend
- Deploy a Workers y Pages
- Verificación de health checks
- Resumen detallado con URLs

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript 5.3**
- **Vite** - Build tool ultra-rápido
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Iconos modernos
- **React Router** - Navegación SPA
- **Inter Font** - Tipografía profesional de Google Fonts

### Backend
- **Cloudflare Workers** - Edge computing serverless
- **Hono** - Framework web ultra-ligero para Workers
- **TypeScript** - Type safety
- **Jose** - JWT tokens
- **Bcrypt** - Password hashing

### Base de Datos y Storage
- **Cloudflare D1** - SQLite distribuido globalmente
- **Cloudflare R2** - Object storage (compatible S3)
- 7 tablas: users, jobs, files, quotes, signatures, audit_logs

### DevOps
- **Wrangler 4.42.2** - CLI de Cloudflare
- **pnpm** - Package manager rápido
- **ESLint** - Code quality
- **Git** - Version control

## 📁 Estructura del Proyecto

```
sr-manager-app/
├── web/                           # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── ui/               # Componentes reutilizables
│   │   │       ├── InfoCard.tsx
│   │   │       ├── ProcessSteps.tsx
│   │   │       ├── StatCard.tsx
│   │   │       ├── PasswordStrength.tsx
│   │   │       └── ...
│   │   ├── pages/
│   │   │   ├── Dashboard/
│   │   │   │   └── DashboardUsuario.tsx
│   │   │   └── Auth/
│   │   │       ├── Login.tsx
│   │   │       └── Registro.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   ├── api/                  # HTTP client
│   │   └── config.ts             # Environment config
│   ├── index.html                # Inter font from Google
│   └── tailwind.config.js        # Inter configured
├── worker/                        # Cloudflare Worker API
│   └── src/
│       ├── index.ts              # Hono app entry
│       ├── routes/               # API routes
│       └── lib/                  # JWT, DB helpers
├── infra/
│   └── d1/
│       └── migrations/           # 7 SQL migrations
├── scripts/
│   └── deploy.mjs                # Automated deployment
├── DEPLOYMENT.md                 # Deployment guide
├── wrangler.toml                 # Cloudflare config
└── package.json                  # Workspace scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ (recomendado v20+)
- **pnpm** v8+
- **Wrangler CLI** v4+
- Cuenta de Cloudflare con Workers, D1 y R2 habilitados

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/electrocicla/docs-manager-app.git
cd docs-manager-app

# Instalar dependencias
pnpm install

# Configurar Python environment (si es necesario)
pnpm run configure:python
```

## 💻 Desarrollo Local

### Iniciar Ambos Servidores

```bash
# Frontend + Worker concurrentemente
pnpm run dev
```

### Iniciar Individualmente

```bash
# Solo frontend (http://localhost:3000)
pnpm run dev:web

# Solo worker (http://localhost:8787)
pnpm run dev:worker
```

## 🗄️ Configuración de Base de Datos

### Crear Base de Datos D1

```bash
# Crear base de datos
wrangler d1 create sr-prevencion-db

# Copiar el database_id al wrangler.toml
```

### Ejecutar Migraciones

```bash
# Migraciones locales
pnpm run db:migrate:local

# Migraciones remotas (producción)
pnpm run db:migrate:remote
```

### Estructura de Tablas

- `users` - Usuarios del sistema (clientes, profesionales, admin)
- `jobs` - Solicitudes de trabajo/documentos
- `files` - Metadatos de archivos (apuntan a R2)
- `quotes` - Cotizaciones de profesionales
- `signatures` - Registros de firmas digitales
- `audit_logs` - Registro de auditoría
- Seed data con usuario admin

## 📦 Configuración de Storage R2

```bash
# Crear bucket
pnpm run r2:create

# O manualmente
wrangler r2 bucket create sr-prevencion-files
```

## ✅ Testing y Validación

### Validación de Código

```bash
# TypeScript type checking
pnpm run typecheck

# ESLint (frontend)
pnpm run lint

# Ambos
pnpm run typecheck && pnpm run lint
```

### Build

```bash
# Build completo (frontend + worker)
pnpm run build

# Build individual
pnpm run build:web
pnpm run build:worker
```

## 🚀 Deployment

### Deploy Completo (Recomendado)

```bash
# Un solo comando despliega todo:
# 1. Valida TypeScript
# 2. Valida ESLint
# 3. Build Worker y Frontend
# 4. Deploy Worker a Cloudflare
# 5. Deploy Pages a Cloudflare
# 6. Verifica health checks
# 7. Muestra resumen con URLs

pnpm run deploy
```

### Deploy Individual

```bash
# Solo Worker
pnpm run deploy:worker

# Solo Pages
pnpm run deploy:pages

# Ambiente de producción
pnpm run deploy:production
```

### Verificar Deployment

```bash
# Health check del Worker
curl https://sr-prevencion.electrocicla.workers.dev/health

# Ver logs en tiempo real
npx wrangler tail
```

Para más detalles, consulta [DEPLOYMENT.md](./DEPLOYMENT.md).

## ⚙️ Variables de Entorno

### Desarrollo Local

Crea `.dev.vars` en la raíz para desarrollo local:

```env
JWT_SECRET=tu-clave-secreta-muy-larga-y-segura
CLOUDFLARE_ACCOUNT_ID=tu-account-id
```

### Producción

Configura secrets en Cloudflare:

```bash
# Agregar secret
npx wrangler secret put JWT_SECRET

# Listar secrets
npx wrangler secret list
```

### Variables en wrangler.toml

```toml
[vars]
ENVIRONMENT = "development"

[env.production.vars]
ENVIRONMENT = "production"
```

## 🔐 Autenticación

### Clientes
- Registro con email/password
- Validación de contraseña:
  - Mínimo 8 caracteres
  - Al menos 1 mayúscula
  - Al menos 1 minúscula
  - Al menos 1 número
  - Al menos 1 carácter especial
- Indicador visual de fortaleza
- JWT tokens con expiración

### Profesionales/Admin
- Cloudflare Access con Zero Trust
- Validación de roles en backend
- Permisos granulares

## 🎨 Componentes UI

### Nuevos Componentes

```typescript
// Tarjetas informativas
<InfoCard 
  icon={<Shield />}
  title="Título"
  description="Descripción..."
/>

// Proceso paso a paso
<ProcessSteps 
  steps={[
    { number: 1, title: "Paso 1", description: "..." }
  ]}
/>

// Estadísticas
<StatCard 
  title="Total"
  value={42}
  icon={FileText}
  color="blue"
/>

// Validación de contraseña
<PasswordStrength password={password} />
```

## 📋 Features

### ✅ Implementado (Producción)

#### Autenticación y Usuarios
- ✅ Registro de usuarios con validación avanzada
- ✅ Indicador de fortaleza de contraseña en tiempo real
- ✅ Login con JWT tokens
- ✅ Confirmación de contraseña con feedback visual
- ✅ Gestión de sesiones
- ✅ Cierre de sesión seguro

#### Dashboard Profesional
- ✅ Diseño moderno con fuente Inter
- ✅ Estadísticas visuales (4 métricas clave)
- ✅ Sección informativa colapsable
- ✅ Información educativa sobre prevención de riesgos
- ✅ Proceso explicado en 5 pasos
- ✅ 6 servicios principales destacados
- ✅ CTA persuasivo

#### Gestión de Trabajos
- ✅ Creación de trabajos/solicitudes
- ✅ Listado de trabajos con estados
- ✅ Vista de detalles de trabajo
- ✅ Estados: POR_REVISAR, REVISION_EN_PROGRESO, COTIZACION, TRABAJO_EN_PROGRESO, FINALIZADO

#### Infraestructura
- ✅ D1 Database con 7 tablas y migraciones
- ✅ R2 Storage para archivos
- ✅ Worker API con Hono framework
- ✅ Cloudflare Pages para frontend
- ✅ Deploy automatizado
- ✅ Health checks
- ✅ CORS configurado

#### DevOps
- ✅ Script de deploy automatizado
- ✅ Validación TypeScript automática
- ✅ Validación ESLint automática
- ✅ Build optimizado
- ✅ Documentación completa (DEPLOYMENT.md)

### 🔄 En Desarrollo

- 🔄 Carga de documentos (PDF, DOCX, XLSX, imágenes)
- 🔄 Sistema de cotizaciones por profesionales
- 🔄 Aceptación de cotizaciones
- 🔄 Workflow completo de estados
- 🔄 Dashboard de profesional
- 🔄 Dashboard de admin
- 🔄 Firma digital de documentos
- 🔄 Sistema de notificaciones

### 🎯 Roadmap Futuro

- 📱 Aplicación móvil (React Native)
- 🔔 Notificaciones push y email
- 💳 Integración con sistemas de pago chilenos (WebPay, Mercado Pago)
- ✍️ Integración con proveedores de firma electrónica chilenos
- 📊 Analytics y reportes avanzados
- 🔄 Versionado de documentos
- 📝 Audit trail completo
- 🌍 Soporte multiidioma
- 📧 Templates de correos personalizables
- 🤖 Automatización de flujos con IA

## 📚 Documentación Adicional

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía completa de deployment
- **[INITIAL-PROJECT-INSTRUCTION.MD](./INITIAL-PROJECT-INSTRUCTION.MD)** - Instrucciones originales del proyecto
- **API Endpoints** - Ver código en `worker/src/routes/`

### Endpoints Principales

```
GET  /health                    # Health check
POST /api/auth/signup           # Registro
POST /api/auth/login            # Login
GET  /api/jobs                  # Listar trabajos
POST /api/jobs                  # Crear trabajo
GET  /api/jobs/:id              # Detalles de trabajo
```

## 🔒 Seguridad

### Implementado

- ✅ JWT validation en todos los endpoints
- ✅ Bcrypt para hash de contraseñas
- ✅ Validación de fortaleza de contraseña (8+ caracteres)
- ✅ CORS configurado
- ✅ Sanitización de inputs
- ✅ Rate limiting en edge (Cloudflare)
- ✅ HTTPS obligatorio en producción
- ✅ Secrets management con Wrangler

### Best Practices

- Límites de tamaño de archivo (200MB max)
- Validación de MIME types
- Sanitización de nombres de archivo
- Tokens con expiración
- No guardar contraseñas en texto plano
- Audit logs de acciones críticas

## 🛠️ Troubleshooting

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
```bash
pnpm run r2:create
```

### Error en Build
```bash
rm -rf node_modules web/node_modules worker/node_modules
rm -rf web/dist worker/dist
pnpm install
pnpm run build
```

### Ver Logs
```bash
# Logs en tiempo real
npx wrangler tail

# Logs en dashboard
# https://dash.cloudflare.com → Workers → sr-prevencion → Logs
```

## 📊 Estado del Proyecto

- **Última actualización:** Octubre 2025
- **Estado:** ✅ Producción
- **Versión:** 0.1.0
- **Frontend:** https://sr-prevencion.pages.dev
- **Backend:** https://sr-prevencion.electrocicla.workers.dev
- **Uptime:** Monitoreado por Cloudflare

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'feat: Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nueva funcionalidad
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Cambios de formato (no afectan código)
- `refactor:` - Refactorización de código
- `test:` - Agregar o modificar tests
- `chore:` - Tareas de mantenimiento

## 📞 Soporte

- **Issues:** [GitHub Issues](https://github.com/electrocicla/docs-manager-app/issues)
- **Email:** contacto@electrocicla.cl
- **Website:** https://sr-prevencion.pages.dev

## 📄 Licencia

Proprietary - Todos los derechos reservados © 2025 Electrocicla

---

Desarrollado con ❤️ por [Electrocicla](https://github.com/electrocicla) para mejorar la prevención de riesgos laborales en Chile 🇨🇱
