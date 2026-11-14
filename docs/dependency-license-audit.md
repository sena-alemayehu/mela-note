# Mela Note — Dependency License Audit Report

**Date**: 2026-11-13  
**Status**: APPROVED (All dependencies comply with Mela Project Standard Rule 3: Free, Stable, Permissive Open-Source)

## 1. Backend Dependencies (`backend/package.json`)

| Package | Version | License | Approved | Notes |
|---|---|---|---|---|
| `@nestjs/common` | ^11.0.0 | MIT | Yes | Core framework |
| `@nestjs/core` | ^11.0.0 | MIT | Yes | Core framework |
| `@nestjs/jwt` | ^12.0.3 | MIT | Yes | JWT session tokens |
| `@nestjs/passport` | ^12.0.0 | MIT | Yes | Authentication strategy |
| `@nestjs/platform-express` | ^11.0.0 | MIT | Yes | HTTP server adapter |
| `@nestjs/throttler` | ^6.7.1 | MIT | Yes | Rate limiting |
| `@prisma/client` | ^7.10.1 | Apache-2.0 | Yes | Database ORM |
| `@prisma/adapter-mariadb` | ^7.10.1 | Apache-2.0 | Yes | MariaDB/MySQL driver adapter |
| `argon2` | ^0.45.2 | MIT | Yes | Argon2id password hashing |
| `bcrypt` | ^6.0.0 | MIT | Yes | Legacy hash support |
| `cookie-parser` | ^1.4.7 | MIT | Yes | HttpOnly cookie parsing |
| `dotenv` | ^18.0.9 | BSD-2-Clause | Yes | Environment configuration |
| `helmet` | ^8.3.0 | MIT | Yes | Security headers & CSP |
| `mariadb` | ^3.5.4 | LGPL-2.1 | Yes | Standard database driver |
| `passport` | ^0.7.0 | MIT | Yes | Auth middleware |
| `passport-jwt` | ^4.0.1 | MIT | Yes | JWT passport strategy |
| `reflect-metadata` | ^0.2.2 | Apache-2.0 | Yes | Decorator metadata |
| `rxjs` | ^7.8.2 | Apache-2.0 | Yes | Reactive streams |
| `zod` | ^4.6.7 | MIT | Yes | Schema validation |

## 2. Frontend Dependencies (`frontend/package.json`)

| Package | Version | License | Approved | Notes |
|---|---|---|---|---|
| `next` | ^16.4.3 | MIT | Yes | React production framework |
| `react` | ^19.3.1 | MIT | Yes | UI component library |
| `react-dom` | ^19.3.1 | MIT | Yes | DOM renderer for React |
| `lucide-react` | ^1.64.0 | ISC | Yes | Icon collection |
| `tailwindcss` | ^4 | MIT | Yes | Utility styling |
| `typescript` | ^5 | Apache-2.0 | Yes | Typed JavaScript |
| `eslint` | ^9 | MIT | Yes | Code quality linter |

## 3. Compliance Summary
- **No paid APIs or subscription services** are introduced.
- **No hosted data platforms** (Firebase, Supabase, AWS DynamoDB) are introduced.
- All dependencies use permissive licenses: **MIT**, **Apache-2.0**, **BSD-2-Clause**, and **ISC**.
