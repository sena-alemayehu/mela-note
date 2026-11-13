## Description
<!-- Provide a brief summary of the changes introduced in this PR -->

## Related Issue
<!-- Link to issue: Closes #123 -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Security enhancement (Argon2, CSRF, rate limit, CSP, ownership check)
- [ ] Documentation update
- [ ] Refactoring / Performance improvement

## Checklist
- [ ] My code adheres to the Mela Project Standards & Specifications.
- [ ] Passwords use Argon2id; no plain-text passwords or secrets are exposed.
- [ ] Only MySQL is used (no Firebase, Supabase or hosted data services).
- [ ] Record ownership is checked on every backend operation.
- [ ] Automated tests have been added or updated, and all tests pass (`npm test`).
- [ ] Both English and Amharic translations have been maintained.
- [ ] Build passes for both frontend and backend (`npm run build`).
- [ ] No secrets or credentials committed.
