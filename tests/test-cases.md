# Mela Note — Test Cases and Quality Assurance Matrix

## 1. Authentication & Security
| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| SEC-01 | Register with valid credentials | User created, password hashed with Argon2id, JWT HttpOnly cookie and Bearer token returned | Pass |
| SEC-02 | Password hashing verification | Passwords stored with `$argon2id$` prefix, never plain text | Pass |
| SEC-03 | Login with valid credentials | 200 OK, secure HttpOnly cookie set, XSRF-TOKEN cookie set | Pass |
| SEC-04 | Login with incorrect password | 401 Unauthorized, failedLoginAttempts incremented, audit log recorded | Pass |
| SEC-05 | Login lockout after 5 failed attempts | 401 Unauthorized with temporary lockout message (15 minutes), lockedUntil set | Pass |
| SEC-06 | CSRF validation on cookie requests | Requests using cookie auth missing X-CSRF-Token rejected with 403 Forbidden | Pass |
| SEC-07 | Content-Security-Policy & Helmet headers | Responses include nosniff, frame-ancestors none, strict CSP | Pass |
| SEC-08 | Record ownership (IDOR prevention) | User A cannot view, edit, or delete notes or attachments belonging to User B (404/403) | Pass |
| SEC-09 | File upload type validation | Disallowed file extensions (.exe, .sh, .html) rejected with 400 Bad Request | Pass |
| SEC-10 | File upload size limit | Files larger than 25 MB rejected | Pass |
| SEC-11 | Secure file download headers | Downloads served with nosniff and CSP none | Pass |
| SEC-12 | Audit logging | Actions recorded: register, login, logout, lockout, note create/delete, attachment upload/delete | Pass |

## 2. Core Features & UX
| ID | Test Case | Expected Result | Status |
|---|---|---|---|
| FEAT-01 | Create text note | Note saved with title, content, color, pin status | Pass |
| FEAT-02 | Create checklist note | Checklist items added with checkboxes, progress indicator displayed | Pass |
| FEAT-03 | Tick/untick checklist item | Item state toggled, line-through applied, counter updated | Pass |
| FEAT-04 | Add and remove labels | Labels added as chips, removed with click | Pass |
| FEAT-05 | Search by title or content | Matching notes displayed in real-time, empty state if no match | Pass |
| FEAT-06 | Filter by label | Clicking a label chip filters notes to only those tagged with that label | Pass |
| FEAT-07 | Autosave note changes | Debounced autosave triggers 1.5s after typing with status pill | Pass |
| FEAT-08 | Move to Trash & Restore | Trashed notes hidden from active view, visible in Trash, restored cleanly | Pass |
| FEAT-09 | Permanent deletion | Note and all associated physical attachment files removed | Pass |
| FEAT-10 | Attachments preview & download | Previews image, PDF, audio files; downloads file safely | Pass |
| FEAT-11 | Language switching (EN / AM) | UI seamlessly switches between English and Amharic with full dictionary | Pass |
| FEAT-12 | Responsive grid | Adapts across desktop, tablet, and mobile breakpoints | Pass |
