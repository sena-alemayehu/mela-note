# Mela Note ✦

> Fast, beautiful, and secure personal notes with checklists, color themes, file attachments, and dual language support (English & Amharic).

Built with **Next.js 16**, **NestJS 11**, **MySQL 8.4**, and **Prisma ORM**. Fully compliant with the Mela Project Standards & Specifications.

---

## Features

- **Authentication & Security**:
  - Passwords hashed with **Argon2id** (OWASP recommended parameters).
  - Secure **HttpOnly**, `SameSite=Lax` cookies for JWT session management.
  - Double-Submit **CSRF protection** on all state-mutating requests.
  - Brute-force protection: Rate limiting and **15-minute account lockout** after 5 failed attempts.
  - Strict server-side **record ownership** validation (IDOR prevention).
  - Security headers & **Content-Security-Policy (CSP)** powered by Helmet.
  - Comprehensive **Audit Logging** for security and sensitive data events.
- **Core Capabilities**:
  - 📄 Text notes and **☑️ Checklist notes** with tick-off items and live progress.
  - 🎨 Google Keep-style pastel color palette and **📌 Pinning**.
  - ⭐ **Favorites** and **▣ Archive** workflows.
  - 🏷️ **Labels & Tags** with real-time tag filtering.
  - ⚡ **Debounced Autosave** with visual save status indicator.
  - 📎 **File & Image Attachments** (up to 25 MB) with strict MIME validation, random storage keys, and secure download headers.
  - 🗑️ **Trash** with instant restore and permanent delete with disk cleanup.
  - 🌍 Full bilingual support: **English** and **Amharic (አማርኛ)** loaded from translation files.
  - 📱 Mobile-first, responsive card grid design.

---

## Tech Stack

| Layer | Technology | License |
|---|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS | MIT / Permissive |
| **Backend** | NestJS 11, TypeScript, Express, Helmet, Throttler | MIT / Permissive |
| **ORM & Migrations**| Prisma 7 on MySQL | Apache-2.0 |
| **Database** | MySQL 8.4 LTS | GPLv2 / Self-hosted |
| **Password Hashing** | Argon2 (Argon2id) | MIT |
| **Testing** | Jest, ts-jest, Playwright | MIT / Apache-2.0 |
| **Deployment** | Docker Compose, Caddy (Automated HTTPS) | Apache-2.0 |

---

## Quick Start (Local Development)

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v20+ LTS (Tested on v22 & v26)
- [MySQL](https://dev.mysql.com/downloads/) 8.0+ or 8.4 LTS (or MariaDB LTS)

### 2. Backend Setup
1. Open a terminal and navigate to `backend`:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your MySQL credentials:
   ```env
   DATABASE_URL="mysql://mela_app:your_password@localhost:3306/mela_note"
   PORT=3001
   JWT_SECRET="your_strong_random_secret_at_least_32_characters"
   ```
4. Run database migrations:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
5. Start the backend development server:
   ```bash
   npm run start:dev
   ```
   The backend API will listen at `http://localhost:3001/api`.

### 3. Frontend Setup
1. In a new terminal, navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Automated Testing

### Backend Unit & Integration Tests (Jest)
Run all backend tests:
```bash
cd backend
npm test
```
*Covers Argon2id password hashing, CSRF guards, account lockout, note operations, record ownership, and attachment deletion.*

### End-to-End Tests (Playwright)
Run end-to-end tests across Desktop Chrome, Mobile Safari, and Tablet:
```bash
npx playwright test
```

---

## Database Backups & Restoration

Automated backup scripts are provided for both Linux/VPS and Windows PowerShell environments:

- **Linux / Docker**:
  ```bash
  # Backup to ./backups/mela_note_TIMESTAMP.sql.gz
  ./backend/scripts/backup-db.sh

  # Restore backup
  ./backend/scripts/restore-db.sh ./backups/mela_note_20261113_000000.sql.gz
  ```
- **Windows PowerShell**:
  ```powershell
  # Backup
  .\backend\scripts\backup-db.ps1

  # Restore
  .\backend\scripts\restore-db.ps1 -BackupFile .\backups\mela_note_20261113_000000.sql
  ```

---

## Production Deployment (Docker Compose & Automated HTTPS)

Mela Note is configured for self-hosted deployment on your own VPS with automated Let's Encrypt SSL/TLS certificates via Caddy:

1. Clone repository to your VPS:
   ```bash
   git clone https://github.com/sena-alemayehu/mela-note.git
   cd mela-note
   ```
2. Create production `.env` from template:
   ```bash
   cp .env.example .env
   ```
   Set `DOMAIN=notes.yourdomain.com` and generate secure database and JWT passwords.
3. Launch all containers:
   ```bash
   docker compose up -d --build
   ```
4. Verify HTTPS: Visit `https://notes.yourdomain.com`. Caddy will automatically provision and renew your free TLS certificate.

---

## Documentation Links

- [API Documentation](file:///docs/api-documentation.md)
- [User Guide](file:///docs/user-guide.md)
- [System Architecture](file:///docs/architecture.md)
- [Database Schema](file:///docs/database-schema.md)
- [Dependency License Audit](file:///docs/dependency-license-audit.md)
- [Test Execution Matrix](file:///tests/test-cases.md)
- [GitHub Collaboration & Branch Protection](file:///.github/BRANCH_PROTECTION.md)

---

## License
All code and dependencies use permissive open-source licenses (MIT, Apache-2.0, BSD-2-Clause, ISC).
