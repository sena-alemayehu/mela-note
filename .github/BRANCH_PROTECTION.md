# Mela Note — GitHub Collaboration & Branch Protection Policy

In accordance with **Mela Project Standards & Specifications (Rule 4)**:
- **One repository per project** inside the company organization (`sena-alemayehu/mela-note`).
- **Protected `main` branch**: Direct pushes to `main` are disallowed.
- **Feature branch workflow**: All development must occur on feature branches (`feature/...` or `fix/...`).
- **Required Pull Request Reviews**: Every change must go through a pull request reviewed and approved by at least one other team member.
- **Required Status Checks**:
  1. `CI Pipeline / Backend Tests & Build`
  2. `CI Pipeline / Frontend Lint & Build`
  3. `Secret Scanning / Scan for Accidental Secrets`
- **Linear git history**: Squash and merge or rebase merge preferred.
- **Project Board & Issues**: All tasks and bugs are tracked using GitHub Issues and the Mela Note Project Board.
