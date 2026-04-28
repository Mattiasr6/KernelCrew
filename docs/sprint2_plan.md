# Plan de Acción - Sprint 2 (CodeCore/KernelLearn)

Este documento detalla la arquitectura técnica para las épicas del Sprint 2, enfocándose en escalabilidad, seguridad y modularidad.

## Fase 1: Arquitectura Single-Site y Dashboards
Implementación de paneles diferenciados para Admin e Instructor bajo una misma SPA en Angular.

### Backend (Laravel 11)
- **Controladores:**
    - `app/Http/Controllers/Admin/AdminDashboardController`: Estadísticas globales.
    - `app/Http/Controllers/Instructor/InstructorDashboardController`: Estadísticas de cursos propios.
- **Rutas:** Protegidas por `auth:sanctum` y middleware de roles (`role:admin` / `role:instructor`).

### Frontend (Angular 18)
- **Estructura:** Módulos lazy-loaded en `features/admin` y `features/instructor`.
- **Seguridad:** Guards funcionales (`admin.guard.ts`, `instructor.guard.ts`).

## Fase 2: Autenticación OAuth 2.0 (Google/GitHub)
Integración con Laravel Socialite para login externo.

### Backend
- **Librería:** `laravel/socialite`.
- **Migración:** Soporte para `provider` y `provider_id` en `users`.
- **Flujo:** Redirección desde Angular -> Callback en Laravel -> Emisión de Token Sanctum.

## Fase 3: Roles Fluidos y Gamificación
Permitir que roles administrativos consuman contenido y reciban recompensas.

### Backend
- **Gamificación:** Sistema de créditos `free_enrollments_balance`.
- **Lógica:** `CourseObserver` para otorgar inscripciones gratuitas al publicar cursos.
- **Autorización:** `Policies` para permitir el auto-enrolamiento.

## Fase 4: Motor de Certificados
Generación automática de PDFs al completar el progreso.

### Backend
- **Librería:** `barryvdh/laravel-dompdf`.
- **Procesamiento:** `GenerateCertificateJob` (asíncrono) disparado por `CourseEnrollmentObserver`.
- **Seguridad:** Validación vía UUID único y QR.

---
*Aprobado por: Tech Lead / Arquitecto de Software*
