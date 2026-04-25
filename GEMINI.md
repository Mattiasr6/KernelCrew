# CodeCore (KernelCrew) - Project Context & Standards

You are working on **CodeCore**, an online course platform with subscriptions and automated payments.

## Architecture & Tech Stack
- **Backend:** Laravel (PHP) as a RESTful API.
- **Frontend:** Angular (TypeScript) as a Single Page Application (SPA).
- **Database:** PostgreSQL (Normalized to 3FN).
- **Authentication:** Laravel Sanctum (Token-based).
- **Payments:** Stripe Checkout (Sandbox mode).
- **RBAC:** Three roles – `admin`, `instructor`, `student`.

## Key Directories
- `/backend`: Laravel API.
  - `app/Http/Controllers`: API Logic.
  - `app/Models`: Eloquent models (Course, User, Payment, etc.).
  - `database/migrations`: 3FN schema definitions.
- `/frontend`: Angular SPA.
  - `src/app/core`: Services, guards, and interceptors.
  - `src/app/features`: Functional modules (auth, courses, subscriptions, etc.).
- `/docs`: Project documentation, user stories, and API contracts.

## Engineering Standards

### Backend (Laravel)
- **API First:** All responses must be JSON.
- **Naming:** Follow PSR-12. Controllers should be suffix with `Controller`.
- **Validation:** Use FormRequests for validation logic (`app/Http/Requests`).
- **Database:** Ensure all migrations maintain 3FN compliance.
- **Testing:** Add/update PHPUnit tests in `backend/tests`.

### Frontend (Angular)
- **Modular Design:** Use feature modules and lazy loading.
- **Service Layer:** All API calls must go through services in `core/services`.
- **Interceptors:** Use interceptors for handling Auth tokens and errors.
- **Styles:** Prefer Vanilla CSS/SCSS; avoid adding heavy UI libraries unless requested.

## Project Status (Sprint 1)
Focus: Authentication, Roles, and CRUD for Users and Courses.
- Auth is implemented using Sanctum.
- RBAC is in place with custom tables.
- Course CRUD is under development.

## Common Commands

### Backend
- `php artisan migrate`
- `php artisan db:seed`
- `php artisan test`

### Frontend
- `npm install`
- `ng serve`
- `ng test`
