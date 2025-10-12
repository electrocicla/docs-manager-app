# SR-PREVENCION API Specification

Base URL: `/api`

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

For professionals and admins, Cloudflare Access JWT is also validated from the `Cf-Access-Jwt-Assertion` header.

## Error Responses

All endpoints may return the following error responses:

```json
{
  "error": "Error message",
  "message": "Detailed error information"
}
```

Status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Endpoints

### Auth

#### POST /api/auth/signup

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "role": "user"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/auth/login

Authenticate and receive a JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user"
  }
}
```

#### GET /api/auth/me

Get current authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "created_at": "2025-01-10T10:00:00.000Z"
  }
}
```

### Files

#### POST /api/files/upload

Upload a file (multipart/form-data).

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `file` (File) - Required
- `jobId` (string) - Optional, link file to existing job

**Response:** `200 OK`
```json
{
  "file": {
    "id": "file-123",
    "filename": "document.pdf",
    "size": 1024000,
    "mime": "application/pdf",
    "status": "POR_REVISAR",
    "created_at": "2025-01-10T10:00:00.000Z"
  }
}
```

**Limitations:**
- Max file size: 200MB
- Allowed types: PDF, DOCX, XLSX, PPTX, images (JPEG, PNG, GIF, WebP)

#### GET /api/files/:id

Get file metadata.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "file": {
    "id": "file-123",
    "filename": "document.pdf",
    "size": 1024000,
    "mime": "application/pdf",
    "status": "POR_REVISAR",
    "created_at": "2025-01-10T10:00:00.000Z",
    "job_id": "job-456"
  }
}
```

#### GET /api/files/download/:id

Download a file.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
- Returns the file as binary stream
- Headers include `Content-Type`, `Content-Disposition`, `Content-Length`

### Jobs

#### POST /api/jobs

Create a new job request.

**Headers:** `Authorization: Bearer <token>`

**Permissions:** `user` role only

**Request:**
```json
{
  "title": "Evaluation of workplace safety protocols",
  "description": "Need professional review of safety protocols",
  "fileIds": ["file-123", "file-456"]
}
```

**Response:** `200 OK`
```json
{
  "job": {
    "id": "job-789",
    "user_id": "user-123",
    "title": "Evaluation of workplace safety protocols",
    "description": "Need professional review of safety protocols",
    "status": "POR_REVISAR",
    "created_at": "2025-01-10T10:00:00.000Z",
    "updated_at": "2025-01-10T10:00:00.000Z",
    "quote_amount": null,
    "quote_currency": "CLP",
    "accepted_at": null,
    "finished_at": null,
    "professional_id": null
  }
}
```

#### GET /api/jobs

Get jobs list.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status (optional)
- `limit` - Limit results (optional)

**Behavior:**
- Users see only their own jobs
- Professionals and admins see all jobs

**Response:** `200 OK`
```json
{
  "jobs": [
    {
      "id": "job-789",
      "user_id": "user-123",
      "title": "Evaluation of workplace safety protocols",
      "status": "POR_REVISAR",
      "created_at": "2025-01-10T10:00:00.000Z",
      ...
    }
  ]
}
```

#### GET /api/jobs/:id

Get job details with files and quotes.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "job": {
    "id": "job-789",
    "user_id": "user-123",
    "title": "Evaluation of workplace safety protocols",
    "status": "COTIZACION",
    ...
  },
  "files": [
    {
      "id": "file-123",
      "filename": "document.pdf",
      ...
    }
  ],
  "quotes": [
    {
      "id": "quote-001",
      "job_id": "job-789",
      "professional_id": "prof-456",
      "amount": 500000,
      "currency": "CLP",
      "message": "Quote for safety protocol review",
      "status": "PENDING",
      "created_at": "2025-01-10T11:00:00.000Z"
    }
  ]
}
```

#### POST /api/jobs/:id/quotes

Create a quote for a job (professional/admin only).

**Headers:** `Authorization: Bearer <token>`

**Permissions:** `professional` or `admin` role

**Request:**
```json
{
  "amount": 500000,
  "message": "Quote for safety protocol review and certification"
}
```

**Response:** `200 OK`
```json
{
  "quote": {
    "id": "quote-001",
    "job_id": "job-789",
    "professional_id": "prof-456",
    "amount": 500000,
    "currency": "CLP",
    "message": "Quote for safety protocol review and certification",
    "status": "PENDING",
    "created_at": "2025-01-10T11:00:00.000Z"
  }
}
```

#### POST /api/jobs/:id/accept-quote

Accept a quote for a job (user only).

**Headers:** `Authorization: Bearer <token>`

**Permissions:** Job owner only

**Request:**
```json
{
  "quote_id": "quote-001"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Quote accepted"
}
```

**Side Effects:**
- Job status changes to `TRABAJO_EN_PROGRESO`
- Job is assigned to the professional
- Quote status changes to `ACCEPTED`
- `accepted_at` timestamp is set

#### POST /api/jobs/:id/finish

Mark a job as finished (professional/admin only).

**Headers:** `Authorization: Bearer <token>`

**Permissions:** Assigned professional or admin

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Job marked as finished"
}
```

**Side Effects:**
- Job status changes to `FINALIZADO`
- `finished_at` timestamp is set

## Job Status Flow

```
POR_REVISAR 
    ↓
REVISION_EN_PROGRESO 
    ↓
COTIZACION (quote created)
    ↓
TRABAJO_EN_PROGRESO (quote accepted)
    ↓
FINALIZADO (work completed)
```

## File Status Flow

```
POR_REVISAR → EN_REVISION → APROBADO / RECHAZADO → FIRMADO
```

## Rate Limits

Rate limiting is enforced at the Cloudflare Worker edge:
- 100 requests per minute per IP for authenticated endpoints
- 10 requests per minute per IP for signup/login

## Webhooks (Future)

Future versions may include webhooks for:
- New quote received
- Quote accepted
- Job status changed
- File uploaded
