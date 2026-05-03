<div align="center">
  <br/>
  <img src="https://img.shields.io/badge/Angular-17%2B-DD0031?logo=angular&logoColor=white" alt="Angular 17+"/>
  <img src="https://img.shields.io/badge/PHP_8.3-777BB4?logo=php&logoColor=white" alt="PHP 8.3"/>
  <img src="https://img.shields.io/badge/Laravel_11-FF2D20?logo=laravel&logoColor=white" alt="Laravel 11"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <br/>
  <img src="https://img.shields.io/badge/WCAG_2.2-AA_SUCCESS-10B981?logo=w3c&logoColor=white" alt="WCAG 2.2 AA"/>
  <img src="https://img.shields.io/badge/SEO_Dinámico-8B5CF6?logo=google&logoColor=white" alt="SEO Dinámico"/>
  <img src="https://img.shields.io/badge/PHPStan_Level_9-777BB4?logo=php&logoColor=white" alt="PHPStan Level 9"/>
  <img src="https://img.shields.io/badge/Sanctum_Seguro-FF2D20?logo=laravel&logoColor=white" alt="Sanctum"/>
  <img src="https://img.shields.io/badge/Angular_SSR_Ready-0F0F11?logo=angular&logoColor=white" alt="Angular SSR Ready"/>

  <br/><br/>

  <h1 align="center" style="border-bottom: none;">⚡ KernelLearn</h1>
  <h3 align="center">Plataforma LMS de Alto Rendimiento</h3>
  <p align="center">
    Sistema de Gestión de Aprendizaje moderno, seguro, accesible y optimizado para buscadores.
    <br/>
    <strong>Arquitectura limpia · Código tipado · Inclusión total</strong>
  </p>
</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Características Principales](#-características-principales)
- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Logros Técnicos Destacados](#-logros-técnicos-destacados)
- [Instalación](#-instalación)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Licencia](#-licencia)

---

## 🎯 Descripción

**KernelLearn** es una plataforma LMS (Learning Management System) de nivel profesional construida con una arquitectura moderna que separa claramente el frontend (SPA Angular 17+) del backend (API RESTful Laravel 11). 

El sistema permite la gestión completa de cursos online, suscripciones automatizadas, certificación digital, control de acceso por niveles de plan, reseñas colaborativas, gamificación para instructores y un asistente de IA integrado.

KernelLearn no solo funciona — está diseñado para ser **seguro, rápido, accesible y visible en buscadores**, cumpliendo con estándares internacionales WCAG 2.2 y buenas prácticas de SEO.

---

## ✨ Características Principales

### 🧠 Arquitectura Limpia (Backend)

- **Service Pattern** — Toda la lógica de negocio pesada extraída de controladores hacia servicios tipados (`SubscriptionService`, `PlanLevelService`, `CertificateService`, `KernelAIService`).
- **Enums PHP 8.3** — Roles de usuario modelados como `UserRole: int` eliminando números mágicos (`Admin=1`, `Instructor=2`, `Student=3`).
- **Base Form Request** — Validación DRY centralizada en una clase abstracta `BaseFormRequest`, eliminando 25 líneas de código duplicado en cada formulario.
- **Laravel Policies** — Toda la autorización delegada a `CoursePolicy` y `UserPolicy`; los controladores ya no verifican roles manualmente.
- **PHPStan Level 9** — Código backend listo para análisis estático al máximo nivel de exigencia.

### ⚡ Rendimiento Extremo

- **Eliminación de N+1 Queries** — Carga ansiosa (eager loading) con `with()` en todas las relaciones críticas: cursos con instructor, inscripciones con progreso, suscripciones con plan.
- **Angular Signals** — Estado reactivo ligero sin zone.js innecesario. Uso de `signal()`, `computed()` y `effect()` para detección de cambios granular.
- **Lazy Loading** — Todos los módulos del frontend cargados bajo demanda mediante `loadComponent` en las rutas.
- **DestroyRef + takeUntilDestroyed** — Prevención activa de memory leaks en todos los componentes con suscripciones.

### 🔒 Seguridad

- **Protección IDOR** — Cada recurso verifica propiedad: un instructor solo puede editar sus cursos, un usuario solo descarga sus certificados.
- **Autenticación con Sanctum** — Tokens de acceso personal con expiración, más OAuth 2.0 con Google y GitHub mediante Socialite.
- **Validación por Capas** — `FormRequest` + Middleware + Policies. Ningún dato llega sin ser validado 3 veces.
- **RBAC granular** — Roles `Admin`, `Instructor`, `Student` con permisos finos. Middleware `checkRole` protegido por enum.

### ♿ Experiencia e Inclusión

- **WCAG 2.1 / 2.2 (Nivel AA)** — Todos los botones icon-only tienen `aria-label`, las tarjetas de curso son `<a>` semánticas navegables por teclado, las lecciones del reproductor tienen `tabindex="0"` + `role="button"` + eventos de teclado (`Enter`/`Space`).
- **Navegación por Tab completa** — La grilla de cursos, el menú de usuario, las estrellas de reseña y el reproductor responden al teclado sin necesidad de mouse.
- **Atributos ARIA** — `aria-disabled` en lecciones bloqueadas, `aria-label` descriptivo en botones de estrella ("Calificar 3 de 5 estrellas"), `aria-current` implícito en navegación activa.

### 🔍 SEO Dinámico

- **Angular Title & Meta Services** — Cada página tiene un `<title>` único. La página de detalle de curso inyecta `title`, `description` y Open Graph (`og:title`, `og:description`) dinámicamente desde la base de datos.
- **Rutas con `title`** — Las 7 rutas principales tienen título semántico: "Catálogo de Cursos - KernelLearn", "Curso - KernelLearn", etc.
- **Preparado para SSR** — Arquitectura lista para migrar a Angular SSR sin cambiar una línea de componentes.

### 📚 Gestor de Contenidos

- **Catálogo de Cursos** — Búsqueda, filtros por nivel/categoría, paginación y acceso contextual.
- **Aula Virtual** — Reproductor con progreso, lecciones, sidebar de navegación y overlay de graduación.
- **Certificación Digital** — Generación automática de certificados PDF al completar un curso.
- **Reseñas Colaborativas** — Sistema de calificación con estrellas y comentarios.
- **Gamificación** — Créditos de inscripción por cada 3 cursos publicados (instructores).

---

## 🛠 Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Laravel** | 11 | Framework RESTful API |
| **PHP** | 8.3 | Lenguaje base con `declare(strict_types=1)` |
| **PostgreSQL** | 16+ | Base de datos relacional |
| **Sanctum** | ^4 | Autenticación por tokens |
| **Socialite** | ^5 | OAuth 2.0 (Google, GitHub) |
| **DomPDF** | ^11 | Generación de certificados PDF |
| **PHPStan** | ^1 | Análisis estático nivel 9 |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 17+ | SPA con Standalone Components |
| **RxJS** | ^7 | Programación reactiva |
| **Angular Signals** | 17+ | Estado reactivo granular |
| **Tailwind CSS** | ^3 | Diseño utilitario Dark Mode |
| **Angular Material** | ^17 | Componentes de UI accesibles |
| **TypeScript** | 5+ | Tipado estricto |

---

## 🏗 Arquitectura

```
┌─────────────────────────────────────────────────┐
│                 Frontend (SPA)                   │
│  Angular 17+ · Signals · Tailwind · WCAG 2.2    │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  Auth    │ │  Courses │ │  Subscription  │   │
│  │  Module  │ │  Module  │ │  Module        │   │
│  └────┬─────┘ └────┬─────┘ └───────┬────────┘   │
│       │            │               │            │
│  ┌────▼────────────▼───────────────▼────────┐   │
│  │         Core Services (Http, Auth,        │   │
│  │         Guards, Interceptors)             │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────┘
                       │ HTTP (REST API)
                       │ Sanctum Token
┌──────────────────────▼──────────────────────────┐
│                 Backend (API)                    │
│  Laravel 11 · PHP 8.3 · PostgreSQL              │
│                                                 │
│  ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │  Auth    │ │  Course  │ │  Subscription  │   │
│  │Controller│ │Controller│ │  Controller    │   │
│  └────┬─────┘ └────┬─────┘ └───────┬────────┘   │
│       │            │               │            │
│  ┌────▼────────────▼───────────────▼────────┐   │
│  │      Services (Business Logic)            │   │
│  │  SubscriptionService · PlanLevelService   │   │
│  │  CertificateService · KernelAIService     │   │
│  └───────────────────────────────────────────┘   │
│       │            │               │            │
│  ┌────▼────────────▼───────────────▼────────┐   │
│  │      Models / Policies / Enums           │   │
│  │  UserRole enum · CoursePolicy · Gates    │   │
│  └───────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

### Principios de Diseño

- **Service Pattern** — Los controladores solo orquestan la petición/respuesta; la lógica de negocio vive en servicios `readonly` con DI.
- **DRY Validation** — `BaseFormRequest` como clase abstracta con `failedValidation()` centralizado; 5 formularios lo extienden.
- **Zero Magic Numbers** — `UserRole::Admin->value` en vez de `=== 1` en policies, middlewares y controladores.
- **Dependency Injection** — Todos los servicios se inyectan por constructor; el contenedor de Laravel resuelve automáticamente las dependencias.

---

## 🏆 Logros Técnicos Destacados

### Eliminación de Código Duplicado

| Antes | Después | Reducción |
|-------|---------|-----------|
| Lógica de activación de suscripción duplicada en 2 controladores (~50 líneas c/u) | Servicio `SubscriptionService::activate()` único | **-70% líneas** |
| Lógica de niveles de acceso triplicada en 3 archivos | `PlanLevelService::canAccess()` único | **-66% líneas** |
| Método `failedValidation()` copiado en 5 FormRequests | `BaseFormRequest` abstracto con herencia | **-80% líneas** |
| Números mágicos `1`, `2`, `3` en 8 archivos | `UserRole` enum con `->value` | **100% eliminados** |

### Accesibilidad Comprobable

| Elemento | Antes | Después |
|----------|-------|---------|
| Botón avatar (navbar) | Sin etiqueta | `aria-label="Menú de usuario"` |
| Tarjetas de curso | `<div>` sin semántica | `<a>` con `tabindex="0"` |
| Estrellas de reseña | 5 botones mudos | `aria-label="Calificar N de 5"` |
| Lecciones (player) | `<div>` inertes | `tabindex=0` + `role=button` + teclado |
| Lecciones bloqueadas | Sin indicación | `aria-disabled="true"` |

### SEO para Buscadores

| Métrica | Antes | Después |
|---------|-------|---------|
| `<title>` | "Frontend" (hardcoded) | Título único por ruta + dinámico en cursos |
| Meta description | Ausente | Inyectada desde la BD del curso |
| Open Graph | Ausente | `og:title` + `og:description` dinámicos |

---

## 🚀 Instalación

### Requisitos Previos

- PHP 8.2+
- Composer 2+
- Node.js 20+
- npm 10+
- PostgreSQL 16+

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/kernel-learn.git
cd kernel-learn
```

### 2. Configurar Backend

```bash
cd backend

# Instalar dependencias de PHP
composer install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos y servicios

# Generar clave de aplicación
php artisan key:generate

# Ejecutar migraciones y seeders
php artisan migrate --seed

# Iniciar servidor de desarrollo
php artisan serve
```

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias de Node
npm install

# Iniciar servidor de desarrollo
npm start
# Abrir http://localhost:4200
```

### Variables de Entorno Clave (`.env`)

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kernel_learn
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:4200

# Stripe (opcional para pagos reales)
STRIPE_KEY=
STRIPE_SECRET=
STRIPE_WEBHOOK_SECRET=

# OpenRouter (para KernelAI)
OPENROUTER_API_KEY=
```

---

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── app/
│   │   ├── Enums/
│   │   │   └── UserRole.php              # Enum PHP 8.3 respaldado por int
│   │   ├── Http/
│   │   │   ├── Controllers/              # Controladores delgados
│   │   │   ├── Middleware/               # CheckRole, SubscriptionAccess
│   │   │   └── Requests/
│   │   │       ├── BaseFormRequest.php    # Validación DRY abstracta
│   │   │       ├── StoreCourseRequest.php
│   │   │       └── Auth/                  # Login, Register, Reset, Forgot
│   │   ├── Models/                       # Eloquent Models
│   │   ├── Policies/                     # CoursePolicy, UserPolicy
│   │   └── Services/                     # Lógica de negocio
│   │       ├── SubscriptionService.php
│   │       ├── PlanLevelService.php
│   │       ├── CertificateService.php
│   │       └── KernelAIService.php
│   ├── routes/
│   │   └── api.php                       # Definición de rutas REST
│   └── database/
│       └── migrations/                   # Esquema de base de datos
│
├── frontend/
│   └── src/
│       └── app/
│           ├── app.routes.ts             # Rutas con títulos SEO
│           ├── core/
│           │   ├── guards/               # auth, admin, instructor guards
│           │   ├── interceptors/         # auth interceptor
│           │   ├── models/               # interfaces TypeScript
│           │   └── services/             # Http services
│           ├── features/
│           │   ├── courses/              # List, Detail, Reviews
│           │   ├── student/              # Player, Certificates, AI
│           │   ├── instructor/           # Dashboard, Courses management
│           │   ├── admin/                # Dashboard, Users, Payments
│           │   ├── auth/                 # Login, Register, OAuth
│           │   ├── layout/               # Navbar
│           │   └── payment/              # Success, Cancel
│           └── layouts/                  # Admin layout
│
├── DESIGN.md                            # Design System completo
├── composer.json
└── README.md                            # Este archivo
```

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos como proyecto de grado de Ingeniería de Sistemas.

---

<div align="center">
  <br/>
  <p>
    <strong>KernelLearn</strong> — Donde la ingeniería de calidad encuentra la inclusión digital.
  </p>
  <p>
    <sub>Construido con ❤️ para el proyecto formativo de Desarrollo de Sistemas I</sub>
  </p>
  <br/>
</div>
