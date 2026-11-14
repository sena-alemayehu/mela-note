# Mela Note — System Architecture

## Architecture Diagram
```
[ Client Browser (Next.js 16 + React 19) ]
                 |
                 | HTTPS / Cookie Auth / REST
                 v
[ Reverse Proxy (Caddy / Nginx) - Automated SSL ]
                 |
        +--------+--------+
        |                 |
        v                 v
[ Next.js Frontend ]  [ NestJS 11 Backend API ]
 (Port 3000)           (Port 3001)
                          |
             +------------+------------+
             |                         |
             v                         v
     [ Prisma ORM 7 ]        [ Local Storage / Uploads ]
             |               (Random UUID storage keys)
             v
   [ MySQL 8.4 Database ]
```

## Security Layer
1. **Argon2id Hashing**: High-cost password hashing resistant to GPU/ASIC cracking.
2. **HttpOnly Cookies**: JWT session tokens stored in HttpOnly, SameSite=Lax cookies, completely immune to JavaScript theft / XSS token exfiltration.
3. **Double-Submit CSRF**: XSRF-TOKEN cookie verified against `x-csrf-token` header on all mutating requests.
4. **Helmet & Strict CSP**: Content-Security-Policy headers restricting script execution, frame embedding, and MIME sniffing.
5. **Rate Limiting & Lockout**: Throttler limits public endpoints; 5 consecutive failed logins trigger a 15-minute account lockout.
6. **Strict Server Ownership**: Every database query joins or filters by `userId` to eliminate Insecure Direct Object References (IDOR).
7. **Audit Trail**: Sensitive security and data actions recorded in the `AuditLog` table.
