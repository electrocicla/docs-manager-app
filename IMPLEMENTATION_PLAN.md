# 📋 Plan de Implementación: Sistema de Empresas y Trabajadores

## ✅ Completed Tasks

### 1. ✅ Base de Datos (D1)
- [x] Migraciones SQL creadas: 2025-10-23-001 y 2025-10-23-002
- [x] Tablas: companies, workers, worker_documents, worker_document_types
- [x] Migraciones aplicadas a producción ✨
- [x] Índices creados para optimización

### 2. ✅ Tipos TypeScript
- [x] `web/src/types/company.ts` - Types para Company, Worker, WorkerDocument, etc.
- [x] DocumentStatus enum: PENDING, UNDER_REVIEW, IN_REVIEW, APPROVED, EXPIRED, REJECTED

### 3. ✅ Hooks personalizados
- [x] `web/src/hooks/useCompany.ts` - useCompanies(), useWorkers(), useWorkerProfile()
- [x] Lógica de fetch/create/update/delete

### 4. ✅ Componentes UI iniciados
- [x] `CompanyCard.tsx` - Tarjeta de empresa con info
- [x] `WorkerCard.tsx` - Tarjeta de trabajador con foto y status docs
- [x] `DocumentCard.tsx` - Documento con estados de color, fechas, días restantes

---

## 🚧 Tasks por Implementar

### BACKEND (Worker/API)

#### Step 1: Crear rutas para Empresas
**Archivo:** `worker/src/routes/companies.ts`

```typescript
// POST /api/companies - Crear empresa
// GET /api/companies - Listar empresas del usuario
// GET /api/companies/:id - Obtener detalle de empresa
// PUT /api/companies/:id - Actualizar empresa
// DELETE /api/companies/:id - Eliminar empresa
```

#### Step 2: Crear rutas para Trabajadores
**Archivo:** `worker/src/routes/workers.ts`

```typescript
// POST /api/companies/:companyId/workers - Crear trabajador
// GET /api/companies/:companyId/workers - Listar trabajadores de empresa
// GET /api/workers/:id - Obtener perfil completo del trabajador
// PUT /api/workers/:id - Actualizar info del trabajador
// DELETE /api/workers/:id - Eliminar trabajador
```

#### Step 3: Crear rutas para Documentos
**Archivo:** `worker/src/routes/documents.ts`

```typescript
// POST /api/workers/:workerId/documents/:docType/upload - Subir documento
// GET /api/workers/:workerId/documents - Listar documentos del trabajador
// GET /api/workers/:workerId/documents/:docId/download - Descargar documento
// PUT /api/workers/:workerId/documents/:docId - Admin: cambiar estado
// DELETE /api/workers/:workerId/documents/:docId - Eliminar documento
```

#### Step 4: Crear rutas R2 para subidas
**Archivo:** `worker/src/lib/r2.ts`

```typescript
// generateSignedUploadUrl() - URL firmada para subida cliente
// downloadFile(r2Key) - Descargar archivo de R2
// deleteFile(r2Key) - Eliminar archivo de R2
```

---

### FRONTEND (React)

#### Step 5: Crear páginas principales
**Archivos:**
- `web/src/pages/CompaniesPage.tsx` - Listar empresas, crear, buscar
- `web/src/pages/CompanyDetailsPage.tsx` - Detalle de empresa, trabajadores
- `web/src/pages/WorkerProfilePage.tsx` - Perfil completo del trabajador
- `web/src/pages/AdminPanel.tsx` - Panel para admin: revisar docs, cambiar estados

#### Step 6: Crear formularios
**Archivos:**
- `web/src/components/forms/CompanyForm.tsx` - Crear/editar empresa
- `web/src/components/forms/WorkerForm.tsx` - Crear/editar trabajador
- `web/src/components/forms/DocumentUploadForm.tsx` - Upload de 6 documentos

#### Step 7: Crear componentes complejos
**Archivos:**
- `web/src/components/WorkerProfileHeader.tsx` - Foto, nombre, RUT, info básica
- `web/src/components/DocumentsSection.tsx` - Grid de 6 documentos con estados
- `web/src/components/AdminDocumentReview.tsx` - Panel admin con estado/comentarios

#### Step 8: Integración de roles
**Modificar:** `web/src/pages/Dashboard/DashboardUsuario.tsx`

```typescript
// Si rol === 'ADMIN'
//   - Mostrar AdminPanel
//   - Acceso a revisar todos los documentos
//   - Cambiar estados y fechas
// Si rol === 'USER'
//   - Mostrar CompaniesPage
//   - Crear empresas
//   - Gestionar trabajadores
```

---

## 📊 Estructura de Datos en Base de Datos

### Companies
```sql
id, user_id, name, rut, industry, address, city, region, phone, email, website, 
employees_count, description, logo_r2_key, status, created_at, updated_at
```

### Workers
```sql
id, company_id, first_name, last_name, rut, email, phone, job_title, department,
profile_image_r2_key, additional_comments, status, created_at, updated_at
```

### Worker Documents
```sql
id, worker_id, document_type_id, status, emission_date, expiry_date,
file_r2_key, file_r2_key_back, file_name, file_size, mime_type,
reviewed_by, reviewed_at, admin_comments, created_at, updated_at
```

---

## 🔐 Permisos y Control de Acceso

### USUARIO (role: 'user')
- ✅ Ver sus empresas
- ✅ Crear empresas
- ✅ Editar sus empresas
- ✅ Crear trabajadores en sus empresas
- ✅ Subir documentos de trabajadores
- ❌ Cambiar estado de documentos (solo admin)
- ❌ Ver empresas de otros usuarios

### ADMIN (role: 'admin')
- ✅ Ver TODAS las empresas
- ✅ Ver TODOS los trabajadores
- ✅ Cambiar estado de documentos (PENDING → APPROVED, etc.)
- ✅ Agregar comentarios a documentos
- ✅ Modificar fechas de emisión/vencimiento
- ✅ Descargar documentos

---

## 🎨 Colores de Estados de Documentos

| Estado | Color | Tailwind |
|--------|-------|----------|
| Faltante/Pendiente | Gris | `bg-gray-100 text-gray-800` |
| En espera de revisión | Naranja | `bg-orange-100 text-orange-800` |
| En revisión | Amarillo | `bg-yellow-100 text-yellow-800` |
| Aprobado/Vigente | Verde | `bg-green-100 text-green-800` |
| Vencido | Rojo | `bg-red-100 text-red-800` |

---

## 📱 Componentes de UI necesarios

### Completados ✅
- [x] CompanyCard
- [x] WorkerCard
- [x] DocumentCard

### Pendientes
- [ ] CompanyList + Search/Filter
- [ ] WorkerList + Grid
- [ ] WorkerProfileHeader
- [ ] DocumentUploadArea (drag & drop)
- [ ] DocumentGrid (6 documentos)
- [ ] AdminDocumentPanel
- [ ] StatusBadge (con tooltip)
- [ ] FileUploadProgress

---

## 🚀 Pasos para Deployment

### Pre-deployment
1. [ ] Implementar todas las rutas API
2. [ ] Implementar todos los componentes
3. [ ] Testing local: `pnpm run dev`
4. [ ] Build: `pnpm run build`

### Deployment
```bash
# Las migraciones ya están en producción ✅
# Solo falta:
pnpm run deploy  # Deploy del Worker + Pages
```

---

## 📝 Checklist Final

- [ ] Rutas API completadas
- [ ] Componentes UI completados
- [ ] Integración de roles funcional
- [ ] Upload a R2 funcionando
- [ ] Admin panel operativo
- [ ] Build sin errores
- [ ] Deploy a producción
- [ ] Testing en producción

---

## 💡 Tips de Implementación

1. **Reutilizar componentes:** CompanyCard, WorkerCard, DocumentCard son base
2. **Usar TailwindCSS:** Seguir guía oficial de Tailwind
3. **Validación:** Usar zod o similar para validar datos
4. **Errores:** Mostrar mensajes claros con Boton/Tarjeta
5. **Loading:** Usar skeleton screens mientras se carga
6. **Seguridad:** Verificar roles en backend Y frontend

---

## 🔗 Referencias

- Tailwind CSS: https://tailwindcss.com
- React Best Practices: https://react.dev
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare R2: https://developers.cloudflare.com/r2/

---

**Última actualización:** 23 de Octubre de 2025
**Estado:** Migraciones en producción ✨ | Componentes base listos | Falta implementar rutas API y páginas
