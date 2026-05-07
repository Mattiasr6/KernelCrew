<div align="center">
  <br/>
  <p>
    <img src="https://img.shields.io/badge/Angular-21-DD0031?logo=angular&logoColor=white" alt="Angular 21" />
    <img src="https://img.shields.io/badge/Laravel-13-FF2D20?logo=laravel&logoColor=white" alt="Laravel 13" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock&logoColor=white" alt="GSAP" />
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  </p>
  <br/>
  <h1 align="center" style="font-size: 3rem; font-weight: 900; letter-spacing: -0.04em;">
    ⚡ KernelLearn
  </h1>
  <p align="center" style="font-size: 1.2rem; color: #a1a1aa;">
    Plataforma educativa técnica con economía de créditos — <strong>Cyber-SaaS</strong> LMS
  </p>
  <br/>
  <p align="center">
    <img src="https://via.placeholder.com/800x450/09090b/06b6d4?text=KernelLearn+Preview" alt="KernelLearn" style="border-radius: 16px; border: 1px solid #27272a;" />
  </p>
  <br/>
</div>

---

## ✨ Overview

**KernelLearn** es un LMS (Learning Management System) de código abierto diseñado para la enseñanza de tecnologías de desarrollo de software, administración de sistemas e inteligencia artificial. Su modelo de monetización basado en **créditos** elimina las suscripciones recurrentes: los estudiantes compran créditos una vez y acceden a los cursos de forma permanente.

> 🎨 **Design System** — Toda la interfaz sigue el sistema de diseño "Cyber-SaaS" definido en [`DESIGN.md`](./DESIGN.md): paleta zinc/cyan/violet, enfoque dark-mode, animaciones GSAP y partículas canvas.

---

## 🚀 Quick Start

```bash
# Backend
cd backend && cp .env.example .env && composer install && php artisan key:generate
php artisan migrate --seed && php artisan serve

# Frontend (otra terminal)
cd frontend && npm install && ng serve
```

→ Abre `http://localhost:4200` — credenciales de prueba al ejecutar seeders.

---

## 🎯 Características

### Sistema de Créditos
Los estudiantes adquieren paquetes de créditos a través de Stripe y los usan para inscribirse en cursos. Sin suscripciones, sin renovaciones. Cada curso tiene un costo fijo en créditos descontado al momento de la inscripción.

### Reproductor de Cursos
Interfaz dividida con reproductor de video, panel de lecciones lateral, barra de progreso animada y botón de completado. Al terminar el 100%, se genera automáticamente un **certificado PDF verificable** con código UUID único.

### Constructor de Currículo (Curriculum Builder)
Editor multi-pestaña para instructores: información básica, pricing en créditos, secciones/lecciones arrastrables (sin drag, con controles explícitos), y soporte para URLs de video + contenido textual.

### Asistente KAI
Chatbot de IA integrado (`deepseek-v4-flash`) con interfaz flotante accesible desde cualquier pantalla. Incluye animaciones GSAP, avatar cerebral animado, burbujas de chat con glassmorphism y sugerencias contextuales.

### Administración y Moderación
Panel de revisión de cursos con flujo DRAFT → IN_REVIEW → PUBLISHED / REJECTED. Gestión completa de usuarios con activación/desactivación. Dashboard con métricas en tiempo real, gráficos Chart.js y tabla de transacciones.

---

## 🎨 Design System

| Token | Color | Uso |
|-------|-------|-----|
| `bg-zinc-950` | `#09090b` | Fondos principales (el "vacío") |
| `bg-zinc-900` | `#18181b` | Tarjetas, superficies |
| `bg-zinc-800` | `#27272a` | Hover, modales elevados |
| `text-cyan-500` | `#06b6d4` | Acento primario, botones, links |
| `text-violet-500` | `#8b5cf6` | Acento secundario, IA, premium |
| `text-emerald-500` | `#10b981` | Éxito, completado |
| `text-rose-500` | `#f43f5e` | Error, bloqueado |

Tipografía: **Inter** para UI + **JetBrains Mono** para código. Animaciones con **GSAP** (ScrollTrigger, stagger, quickTo), partículas con **Canvas 2D**, y transiciones de ruta con **Angular Animations**.

---

## 🏗️ Stack

| Capa | Tecnología | Versión |
|------|-----------|---------|
| **Frontend** | Angular + TypeScript | 21 / 5.9 |
| | Tailwind CSS | 3.4 |
| | Angular Material | 21 |
| | GSAP (animaciones) | 3.12 |
| **Backend** | Laravel | 13 |
| | PHP | 8.3 |
| | PostgreSQL | 15+ |
| **Auth** | Laravel Sanctum + Socialite | — |
| **Pagos** | Stripe SDK | 20 |
| **IA** | OpenRouter (deepseek-v4-flash) | — |

---

## 📁 Estructura

```
backend/
├── app/
│   ├── Enums/           CourseStatus, UserRole
│   ├── Http/Controllers/  Admin, Api/V1, Instructor
│   ├── Http/Middleware/    ApiAuthenticate, CheckRoleId
│   ├── Models/           Eloquent ORM
│   └── Services/         KernelAI, Certificate, PlanLevel
├── database/
│   ├── migrations/       36 migraciones progresivas
│   └── seeders/          Datos hiperrealistas
└── routes/api.php

frontend/
├── src/app/
│   ├── core/             guards, interceptors, models, services
│   ├── features/         admin, auth, courses, instructor, landing,
│   │                     layout, payment, profile, student
│   ├── layouts/          admin-layout (sidebar responsive)
│   ├── shared/           student-sidebar, pipes
│   ├── app.ts            raíz con route transitions
│   └── app.routes.ts     lazy-loading nativo
```

---

## 🧩 Componentes Destacados

| Componente | Descripción |
|-----------|-------------|
| `course-player` | Reproductor con sidebar glassmorphism, progress ring SVG, checkmarks animados, modal de certificado con confetti |
| `landing` | Hero con partículas canvas + violeta, GSAP stagger reveal, ScrollTrigger, 3D tilt en cards |
| `kernel-ai` | FAB con anillo pulsante, chat glassmorphism, avatar orb animado, sugerencias contextuales |
| `admin-layout` | Sidebar responsive con drawer mobile, Material Symbols, overlay backdrop |
| `error-pages` | 403/404/500 con glows ambientales, números flotantes, navegación con Location.back() |
| `navbar` | Avatar alineado, menú dropdown estilizado, credit balance badge |

---

## 🔌 API REST (Principales Endpoints)

### Públicos
| Método | Ruta |
|--------|------|
| `GET` | `/api/v1/courses` |
| `GET` | `/api/v1/courses/featured` |
| `GET` | `/api/v1/courses/{id}` |
| `GET` | `/api/v1/courses/{courseId}/curriculum` |
| `GET` | `/api/v1/certificates/{uuid}/verify` |

### Autenticados
| Método | Ruta |
|--------|------|
| `POST` | `/api/v1/auth/login` |
| `POST` | `/api/v1/auth/register` |
| `GET` | `/api/v1/auth/me` |
| `POST` | `/api/v1/courses/{course}/enroll-credits` |
| `POST` | `/api/v1/lessons/{id}/complete` |
| `GET` | `/api/v1/student/my-courses` |
| `POST` | `/api/v1/ai/chat` |

### Admin
| Método | Ruta |
|--------|------|
| `GET` | `/api/v1/admin/courses/pending` |
| `PATCH` | `/api/v1/admin/courses/{id}/approve` |
| `PATCH` | `/api/v1/admin/courses/{id}/reject` |

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea tu rama: `git checkout -b feat/mi-mejora`
3. Haz tus cambios (frontend o backend)
4. Asegúrate de que pase el build: `cd frontend && npx ng build`
5. Commit y push: `git commit -m "feat: descripción" && git push origin feat/mi-mejora`
6. Abre un Pull Request

---

## 📄 Licencia

**MIT** — El nombre y logotipo de KernelLearn son marcas registradas del equipo de desarrollo.
