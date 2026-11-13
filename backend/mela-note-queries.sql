-- =========================================
-- MELA NOTE DATABASE QUERIES
-- =========================================

USE mela_note;

-- 1. View all registered users
SELECT id, name, email, createdAt
FROM User
ORDER BY createdAt DESC;

-- 2. Count registered users
SELECT COUNT(*) AS total_registered_users
FROM User;

-- 3. View all notes
SELECT *
FROM Note
ORDER BY createdAt DESC;

-- 4. View notes belonging to each user
SELECT
    u.name AS user_name,
    u.email,
    n.id AS note_id,
    n.title,
    n.type,
    n.status,
    n.isPinned,
    n.createdAt
FROM User u
LEFT JOIN Note n ON n.userId = u.id
ORDER BY n.createdAt DESC;

-- 5. Count all notes
SELECT COUNT(*) AS total_notes
FROM Note;

-- 6. Count notes by status
SELECT status, COUNT(*) AS total
FROM Note
GROUP BY status;

-- 7. View archived notes
SELECT id, title, userId, archivedAt
FROM Note
WHERE status = 'ARCHIVED';

-- 8. View trashed notes
SELECT id, title, userId, trashedAt
FROM Note
WHERE status = 'TRASHED';

-- 9. View attachments
SELECT *
FROM Attachment
ORDER BY createdAt DESC;

-- 10. Count attachments
SELECT COUNT(*) AS total_attachments
FROM Attachment;
