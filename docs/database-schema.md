# Mela Note — MySQL Database Schema

All database structures are managed through Prisma ORM on **MySQL 8.4** (or MariaDB LTS).

## ER Diagram (Mermaid)

```mermaid
erDiagram
    User ||--o{ Note : owns
    User ||--o{ AuditLog : generates
    Note ||--o{ Attachment : contains

    User {
        varchar(191) id PK
        varchar(191) email UK
        varchar(120) name
        varchar(255) passwordHash
        enum role "USER, ADMIN"
        int failedLoginAttempts
        datetime lockedUntil
        datetime createdAt
        datetime updatedAt
    }

    Note {
        varchar(191) id PK
        varchar(255) title
        longtext content
        enum type "TEXT, CHECKLIST"
        enum status "ACTIVE, ARCHIVED, TRASHED"
        varchar(20) color
        boolean isPinned
        boolean isFavorite
        json labels
        json checklist
        varchar(191) userId FK
        datetime createdAt
        datetime updatedAt
        datetime archivedAt
        datetime trashedAt
    }

    Attachment {
        varchar(191) id PK
        varchar(255) fileName
        varchar(191) mimeType
        bigint sizeBytes
        varchar(255) storageKey UK
        varchar(191) noteId FK
        datetime createdAt
    }

    AuditLog {
        varchar(191) id PK
        varchar(191) userId FK
        varchar(100) action
        json details
        varchar(45) ipAddress
        varchar(255) userAgent
        datetime createdAt
    }
```

## Schema Details
- **User**: Stores credentials and role. `passwordHash` holds Argon2id hashes (or legacy bcrypt for transparent upgrade). `failedLoginAttempts` and `lockedUntil` enforce brute-force protection.
- **Note**: Notes support Markdown text, colored cards, pin sorting, and embedded JSON checklists and label arrays.
- **Attachment**: Attached files linked to a specific note. Physical files stored on disk using unique UUID keys; never accessed without an ownership check.
- **AuditLog**: Immutable security audit records.
