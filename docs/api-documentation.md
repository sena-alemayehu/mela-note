# Mela Note — API Documentation

## Overview
The Mela Note API is built with NestJS, MySQL, and Prisma. It enforces strict security baselines including Argon2id password hashing, HttpOnly session cookies, CSRF protection, rate limiting, and record ownership validation.

- **Base URL**: `http://localhost:3001/api` (or `/api` in production behind Caddy/Nginx)
- **Authentication**: JWT stored in secure `HttpOnly` cookie named `token`, or passed as `Authorization: Bearer <token>`
- **CSRF Token**: Sent via `x-csrf-token` header for state-mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`) authenticated via cookies. Obtainable from `GET /api/auth/csrf-token` or read from the `XSRF-TOKEN` cookie.

---

## 1. Authentication Endpoints

### 1.1 Get CSRF Token
- **Endpoint**: `GET /api/auth/csrf-token`
- **Authentication**: Public
- **Response**:
```json
{
  "csrfToken": "4f8a29..."
}
```
*Note*: Sets an `XSRF-TOKEN` cookie readable by client-side JavaScript.

### 1.2 Register
- **Endpoint**: `POST /api/auth/register`
- **Authentication**: Public
- **Request Body**:
```json
{
  "name": "Abebe Bikila",
  "email": "abebe@example.com",
  "password": "SecurePassword123"
}
```
- **Validation**:
  - `name`: 1–120 characters
  - `email`: Valid email format, maximum 191 characters
  - `password`: Minimum 8 characters, maximum 72 UTF-8 bytes (hashed with Argon2id)
- **Response** (`201 Created`):
```json
{
  "message": "Registration successful.",
  "user": {
    "id": "clx...",
    "name": "Abebe Bikila",
    "email": "abebe@example.com",
    "role": "USER",
    "createdAt": "2026-11-13T12:00:00.000Z"
  },
  "accessToken": "eyJhbGciOi...",
  "csrfToken": "4f8a29..."
}
```
*Note*: Sets secure `HttpOnly` cookie `token` and `XSRF-TOKEN` cookie.

### 1.3 Login
- **Endpoint**: `POST /api/auth/login`
- **Rate Limit**: Maximum 5 attempts per 60 seconds.
- **Account Lockout**: 5 consecutive failed attempts lock the account for 15 minutes.
- **Request Body**:
```json
{
  "email": "abebe@example.com",
  "password": "SecurePassword123"
}
```
- **Response** (`200 OK`):
```json
{
  "message": "Login successful.",
  "user": {
    "id": "clx...",
    "name": "Abebe Bikila",
    "email": "abebe@example.com",
    "role": "USER"
  },
  "accessToken": "eyJhbGciOi...",
  "csrfToken": "4f8a29..."
}
```

### 1.4 Get Profile
- **Endpoint**: `GET /api/auth/me`
- **Authentication**: Required
- **Response** (`200 OK`):
```json
{
  "id": "clx...",
  "name": "Abebe Bikila",
  "email": "abebe@example.com",
  "role": "USER",
  "createdAt": "2026-11-13T12:00:00.000Z"
}
```

### 1.5 Logout
- **Endpoint**: `POST /api/auth/logout`
- **Authentication**: Required
- **Response** (`200 OK`):
```json
{
  "message": "Logged out successfully."
}
```
*Note*: Clears authentication cookies `token` and `XSRF-TOKEN`.

---

## 2. Notes Endpoints

All notes endpoints enforce server-side ownership. Users can only access and manipulate their own notes.

### 2.1 Create Note
- **Endpoint**: `POST /api/notes`
- **Authentication**: Required
- **Request Body**:
```json
{
  "title": "Grocery Shopping",
  "content": "Weekly shopping list",
  "type": "CHECKLIST",
  "color": "#FFF8E1",
  "isPinned": true,
  "isFavorite": false,
  "labels": ["shopping", "personal"],
  "checklist": [
    { "id": "1", "text": "Organic Apples", "completed": false },
    { "id": "2", "text": "Almond Milk", "completed": true }
  ]
}
```
- **Response** (`201 Created`): Returns created note object with `attachments: []`.

### 2.2 List Notes (with Filtering & Search)
- **Endpoint**: `GET /api/notes`
- **Authentication**: Required
- **Query Parameters**:
  - `status`: `ACTIVE` (default), `ARCHIVED`, or `TRASHED`
  - `search`: Case-insensitive search on title or content
  - `label`: Filter by specific tag/label
  - `type`: Filter by `TEXT` or `CHECKLIST`
- **Response** (`200 OK`): Array of note objects sorted by pinned status, then updated time.

### 2.3 List Favorite Notes
- **Endpoint**: `GET /api/notes/favorites`
- **Authentication**: Required
- **Response** (`200 OK`): Array of active favorite notes.

### 2.4 Get Note by ID
- **Endpoint**: `GET /api/notes/:id`
- **Authentication**: Required
- **Response** (`200 OK`): Single note object including attachments.

### 2.5 Update Note
- **Endpoint**: `PATCH /api/notes/:id`
- **Authentication**: Required
- **Request Body**: Any subset of `title`, `content`, `type`, `color`, `isPinned`, `isFavorite`, `labels`, `checklist`.
- **Response** (`200 OK`): Updated note object.

### 2.6 Move Note to Trash
- **Endpoint**: `PATCH /api/notes/:id/trash`
- **Authentication**: Required
- **Response** (`200 OK`): `{ "message": "Note moved to Trash" }`

### 2.7 Archive Note
- **Endpoint**: `PATCH /api/notes/:id/archive`
- **Authentication**: Required
- **Response** (`200 OK`): `{ "message": "Note archived" }`

### 2.8 Restore Note
- **Endpoint**: `PATCH /api/notes/:id/restore`
- **Authentication**: Required
- **Response** (`200 OK`): `{ "message": "Note restored" }`

### 2.9 Permanently Delete Note
- **Endpoint**: `DELETE /api/notes/:id/permanent`
- **Authentication**: Required
- **Description**: Permanently removes the note from the database and safely deletes all physical attachment files stored on disk.
- **Response** (`200 OK`): `{ "message": "Note permanently deleted" }`

---

## 3. Attachments Endpoints

### 3.1 Upload Attachment
- **Endpoint**: `POST /api/attachments/notes/:noteId`
- **Authentication**: Required
- **Content-Type**: `multipart/form-data`
- **Form Field**: `file`
- **Constraints**:
  - Maximum size: 25 MB
  - Allowed types: Images (JPEG, PNG, GIF, WebP, SVG), Documents (PDF, TXT, CSV, DOC, DOCX, XLS, XLSX, PPT, PPTX), Audio (MP3, WAV, OGG, M4A, WEBM).
- **Response** (`201 Created`):
```json
{
  "id": "clx...",
  "fileName": "diagram.png",
  "mimeType": "image/png",
  "sizeBytes": 145020,
  "createdAt": "2026-11-13T12:00:00.000Z",
  "noteId": "clx...",
  "downloadUrl": "/api/attachments/clx.../download"
}
```

### 3.2 List User Attachments
- **Endpoint**: `GET /api/attachments`
- **Authentication**: Required
- **Response** (`200 OK`): List of all attachments belonging to active notes of the user.

### 3.3 Download Attachment
- **Endpoint**: `GET /api/attachments/:id/download`
- **Authentication**: Required (ownership verified)
- **Security Headers Set**:
  - `X-Content-Type-Options: nosniff`
  - `Content-Security-Policy: default-src 'none'`
  - `Content-Disposition: attachment; filename="<fileName>"`

### 3.4 Delete Attachment
- **Endpoint**: `DELETE /api/attachments/:id`
- **Authentication**: Required
- **Response** (`200 OK`): `{ "message": "Attachment deleted successfully." }`
