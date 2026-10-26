#  Mela Note    Organize your thoughts, simplify your life

Mela Note is a responsive personal note-taking application designed to help users create, manage, organize, and retrieve their notes easily. It supports text notes, checklists, note archiving, and file attachments.

The project is part of the Mela application family and aims to provide a simple, secure, and user-friendly note-taking experience.

##  Project Objectives

- Allow users to create, edit, and delete personal notes.
- Organize notes using colors, pins, and labels.
- Support checklist notes with completion tracking.
- Provide search and filtering capabilities.
- Allow users to archive notes and restore deleted notes.
- Support file and image attachments.
- Provide a responsive interface for desktop, tablet, and mobile devices.
- Support English and Amharic.
- Protect user data through appropriate authentication and authorization.

##  Technology Stack

### Technology Stack

   Frontend:- Next.js, React, and TypeScript for the user interface.
   Styling:- Tailwind CSS for responsive design.
   Backend:- NestJS and TypeScript for application logic and APIs.
   Database:- MySQL to store application data.
   ORM:- Prisma to manage database operations.
   Validation:- Zod to validate data.
   Testing:- Vitest or Jest and Playwright to test the application.
   CI/CD:- GitHub Actions to automate code checks.
   Deployment:- Docker Compose to run the application and its services.

##  Project Structure

mela-note/
├── frontend/
│   ├── public/
│   │   ├── images/
│   │   └── icons/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── notes/
│   │   │   │   └── page.tsx
│   │   │   ├── archive/
│   │   │   │   └── page.tsx
│   │   │   └── trash/
│   │   │       └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── notes/
│   │   │   └── ui/
│   │   ├── lib/
│   │   ├── i18n/
│   │   └── types/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── auth/
│   │   ├── notes/
│   │   ├── prisma/
│   │   ├── attachments/
│   │   ├── common/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── tests/
│   ├── test-cases.md
│   └── e2e/
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   ├── database-schema.md
│   ├── api-documentation.md
│   ├── user-guide.md
│   └── wireframes/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md


##  Main Features

### 1. User Authentication
- Sign in through the  Mela Auth service.
- Protect pages and note-management operations.
- Restrict access to each user's private notes.

### 2. Note Management
- Create and edit text notes.
- Delete notes by moving them to the trash.
- Archive notes without deleting them permanently.
- Automatically save note changes.

### 3. Checklists
- Create checklist notes.
- Add checklist items.
- Mark items as completed or incomplete.

### 4. Note Organization
- Choose note colors.
- Pin important notes.
- Organize notes using labels and tags.
- Search and filter notes.

### 5. Attachments
- Attach supported files and images through theMela Drive storage module.
- Verify permissions before allowing access to attachments.

### 6. Responsive Design and Localization
- Support desktop, tablet, and mobile screens.
- Provide English and Amharic interface translations.
- Maintain a consistent design across the  Mela application family.

##  Team Members and Responsibilities

### Team Members and Responsibilities

- Sena – Team Leader and UI/UX Designer: Coordinates the project and designs the user interface.
- Solomon – Backend and Database Developer: Manages MySQL, Prisma, APIs, and security.
- Fiker – Frontend Developer: Builds the dashboard, note editor, checklists, and autosave features.
- Yonaf – UI Components and Integration Support: Creates reusable components and supports attachments, translations, and responsive design.
- Woynshet – QA and Testing Engineer: Tests the application, reports bugs, and checks release readiness.

##  Getting Started

### Prerequisites

Install the following tools before running the application:

- Node.js 20.9 or newer, compatible with the selected Next.js version.
- npm.
- MySQL.
- Git.
- Visual Studio Code (recommended).

Docker is needed if you use the provided Docker Compose configuration.

### 1. Clone the Repository

   bash
git clone <https://github.com/sena-alemayehu/mela-note>
cd Mela-note
   

Replace `<https://github.com/sena-alemayehu/mela-note>` with your actual GitHub repository URL.

### 2. Set Up the Frontend

   bash
cd frontend
npm install
   

Create a local environment file from `.env.example` if the frontend requires environment variables.

Start the development server:

   bash
npm run dev -- --webpack
   

Open the application at:

http://localhost:3000

The Webpack option is useful for the current Windows environment if Turbopack's native bindings are blocked by an application-control policy.

### 3. Set Up the Backend

Open a separate terminal:

   bash
cd backend
npm install
   

Create a `.env` file using `.env.example` as a template. Configure the required database connection and other environment variables.

Generate the Prisma client:

   bash
npx prisma generate
   

After confirming that the MySQL server and database configuration are ready, apply the project's migrations using the migration instructions maintained by the backend team.

Start the backend using the development script configured in `backend/package.json`.

### 4. Database Setup

Mela Note uses MySQL and Prisma.

The backend team is responsible for:

- Defining the database schema.
- Creating and maintaining migrations.
- Configuring database access.
- Protecting database credentials.
- Maintaining backups and testing recovery.

Do not commit real database credentials or other secrets to GitHub.

### 5. Run Tests

Use the scripts configured in each package's `package.json`.

For example:

   bash
npm test
   

The exact test commands depend on the testing tools configured by the development team.

##  Security Guidelines

Security is a core requirement of  Mela Note.

- Use secure authentication and session management.
- Validate incoming data on the server.
- Use parameterized database queries through the ORM.
- Check note ownership before reading or modifying private records.
- Protect against cross-site scripting (XSS) and cross-site request forgery (CSRF), where applicable.
- Apply rate limiting to login and public endpoints.
- Store secrets in environment variables.
- Restrict file-upload types and sizes.
- Check permissions before serving attachments.
- Keep dependencies updated and enable vulnerability alerts.
- Maintain automated database backups and verify restoration procedures.

##  GitHub Collaboration

The team follows a feature-branch workflow.

1. Create an issue describing the task.
2. Create a feature branch.
3. Implement and test the change.
4. Commit with a meaningful message.
5. Open a pull request.
6. Request review from at least one other team member.
7. Merge only after the required checks and review are complete.

The `main` branch should remain protected.

##  Documentation

Project documentation is maintained in the `docs/` directory.

- `requirements.md` — Project requirements.
- `architecture.md` — Application architecture.
- `database-schema.md` — Database design.
- `api-documentation.md` — API endpoints and usage.
- `user-guide.md` — Instructions for users.
- `wireframes/` — UI/UX wireframes and design references.

##  Future Enhancements

Potential future improvements include:

- Note reminders.
- Sharing and collaboration betweenMela users.
- Rich-text or Markdown editing.
- Drag-and-drop note organization.
- Exporting notes to PDF.
- Offline support through a Progressive Web App (PWA).
- Saving attachments directly to   Mela Drive.

These enhancements should be implemented after the core note-taking features are stable.

##  Project Status

Mela Note is under development.

The final implementation status of individual features should be verified against the actual code and test results before being reported as complete.

##  License

The project's license has not yet been specified. Add the selected license and its terms before distributing the application.

---    Mela Note — Organize your thoughts, simplify your lif   