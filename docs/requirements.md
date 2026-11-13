# Mela Note — System & Technical Requirements

## 1. Compliance Requirements
- **Database**: Dedicated MySQL 8.4 instance. No hosted proprietary services (Firebase, Supabase).
- **Security**: Argon2id password hashing, HttpOnly cookies, CSRF protection, CSP, rate limiting, brute force lockout, record ownership checks.
- **Licenses**: All third-party dependencies use permissive licenses (MIT, Apache-2.0, BSD-2-Clause, ISC).
- **Internationalization**: Dual language support (English and Amharic) from external translation files (`en.json`, `am.json`).
- **Deployment**: Self-hosted VPS with Docker Compose and automated HTTPS.

## 2. Environment Prerequisites
- **Node.js**: v20+ LTS (Tested on Node.js v22 and v26)
- **Database**: MySQL 8.0+ or 8.4 LTS
- **Docker**: Docker Engine 24+ and Docker Compose v2+
- **Memory**: Minimum 1 GB RAM (2 GB recommended)
- **Storage**: Minimum 10 GB disk space
