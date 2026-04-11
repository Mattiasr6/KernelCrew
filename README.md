# CodeCore – Plataforma de Cursos en Línea con Suscripciones y Pagos Automatizados

Aplicación web para la gestión de cursos en línea, suscripciones de usuarios y pagos automatizados. Construida como proyecto formativo utilizando **Laravel** (API REST) y **Angular** (SPA).

---

## Tabla de Contenidos

- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Primeros Pasos](#primeros-pasos)
- [Diseño de la Base de Datos](#diseño-de-la-base-de-datos)
- [Decisiones de Arquitectura](#decisiones-de-arquitectura)
- [Sprints – Metodología Scrum](#sprints--metodología-scrum)
- [Historias de Usuario y Backlog](#historias-de-usuario-y-backlog)
- [Documentación de la API](#documentación-de-la-api)
- [Roles del Equipo](#roles-del-equipo)

---

## Tecnologías Utilizadas

| Capa        | Tecnología                               |
|-------------|------------------------------------------|
| **Backend**   | Laravel (PHP) – API REST                 |
| **Frontend**  | Angular (TypeScript) – SPA               |
| **Base de Datos** | PostgreSQL (normalizada a 3FN)        |
| **Autenticación** | Laravel Sanctum (basada en tokens)    |
| **Pagos**     | Stripe Checkout (modo sandbox/prueba)    |
| **Control de Versiones** | Git + GitHub                   |
| **Gestión del Proyecto** | Notion / GitHub Projects       |

---

## Estructura del Proyecto

```
CodeCore/
├── README.md                    ← Este archivo
├── proyecto_consigna.txt        ← Consigna original del proyecto
├── backend/                     ← API Laravel
│   ├── app/
│   │   ├── Http/Controllers/    ← Controladores API
│   │   ├── Models/              ← Modelos Eloquent
│   │   └── Policies/            ← Políticas de autorización
│   ├── database/
│   │   ├── migrations/          ← Migraciones de base de datos
│   │   └── seeders/             ← Semillas iniciales
│   ├── routes/
│   │   └── api.php              ← Rutas de la API
│   └── tests/                   ← Pruebas PHPUnit
├── frontend/                    ← SPA Angular
│   ├── src/app/
│   │   ├── core/                ← Servicios, guards, interceptores
│   │   ├── features/            ← Módulos funcionales
│   │   │   ├── auth/            ← Login, registro
│   │   │   ├── courses/         ← Catálogo y detalle de cursos
│   │   │   ├── subscriptions/   ← Planes y gestión de suscripciones
│   │   │   ├── payments/        ← Flujo de pagos
│   │   │   ├── reports/         ← Reportes de administrador
│   │   │   └── admin/           ← Panel de administrador
│   │   ├── shared/              ← Componentes y utilidades compartidas
│   │   └── app.routes.ts        ← Rutas de la aplicación
│   └── src/environments/        ← Configuraciones de entorno
└── docs/                        ← Documentación (diagramas, historias de usuario, etc.)
```

---

## Primeros Pasos

### Requisitos Previos

- PHP >= 8.2
- Composer
- Node.js >= 18 y npm
- PostgreSQL >= 14
- Git

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
# Configurar credenciales de la BD en .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (Angular)

```bash
cd frontend
npm install
ng serve
```

La API estará disponible en `http://localhost:8000` y el frontend en `http://localhost:4200`.

---

## Diseño de la Base de Datos

La base de datos está normalizada a **Tercera Forma Normal (3FN)**.

### Relación de Entidades (Conceptual)

```
┌──────────┐       ┌──────────────────┐       ┌────────────────────┐
│  users   │───────│ user_subscriptions│───────│ subscription_plans │
└────┬─────┘       └────────┬─────────┘       └────────────────────┘
     │                      │
     │                      │
     │              ┌───────┴───────┐
     │              │    payments    │
     │              └───────────────┘
     │
     │       ┌────────────────────┐
     └───────│ course_enrollments │
             └────────┬───────────┘
                      │
             ┌────────┴────────┐
             │     courses      │
             └─────────────────┘
```

### Tablas

| Tabla                  | Descripción                                          |
|------------------------|------------------------------------------------------|
| `users`                | Cuentas de usuario con acceso basado en roles         |
| `courses`              | Catálogo de cursos con metadatos                     |
| `subscription_plans`   | Planes de suscripción disponibles (Básico, Pro, Premium)|
| `user_subscriptions`   | Suscripciones activas e históricas por usuario        |
| `payments`             | Registro de transacciones de pago                    |
| `course_enrollments`   | Inscripción de usuarios en cursos con seguimiento de progreso |

### Cumplimiento 3FN

- **1FN:** Todos los atributos son atómicos (sin valores multivaluados en un solo campo).
- **2FN:** Todos los atribulos no clave dependen completamente de la clave primaria.
- **3FN:** No existen dependencias transitivas entre atribulos no clave.

Ver `docs/` para el diagrama ER y scripts SQL.

---

## Decisiones de Arquitectura

1. **Enfoque API-first**: Laravel actúa como API REST pura; Angular la consume.
2. **Laravel Sanctum** para autenticación basada en tokens (más simple que Passport para SPA).
3. **Interceptores en Angular** para adjuntar tokens JWT a cada solicitud HTTP.
4. **Control de acceso basado en roles (RBAC)**: Tres roles – `admin`, `instructor`, `student`.
5. **Stripe Sandbox** para pagos simulados con confirmación por webhook.
6. **Módulos funcionales** en Angular para carga diferida y separación de responsabilidades.

---

## Sprints – Metodología Scrum

| Sprint | Duración | Objetivo                                              | Entregable Principal                    |
|--------|----------|-------------------------------------------------------|-----------------------------------------|
| **0**  | Semana 1 | Configuración de entorno, repo, BD inicial, historias | Backlog priorizado, arquitectura definida |
| **1**  | Semana 2 | Autenticación, roles, ABMC de usuarios y cursos        | Login funcional + ABMC de cursos        |
| **2**  | Semana 3 | Módulo de suscripciones + integración de pagos         | Usuario puede contratar plan y pagar    |
| **3**  | Semana 4 | Restricción de acceso por suscripción + reportes       | Estudiante solo ve cursos según su plan |
| **4**  | Semana 5 | Pulido de UI/UX, pruebas, documentación, demo final    | Sistema completo funcionando            |

### Checklist Sprint 0

- [x] Repositorio inicializado con estructura monorepo
- [x] README con estructura del proyecto
- [x] Migraciones de base de datos creadas (cumple 3FN)
- [x] Historias de usuario definidas en el backlog
- [ ] Entornos configurados (desarrollo local)
- [ ] Estrategia de ramas en Git definida

---

## Historias de Usuario y Backlog

Las historias de usuario están detalladas en `docs/USER_STORIES.md`.

### Epic 1: Usuarios y Autenticación

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-01 | Como visitante, quiero registrarme con email/contraseña para acceder   | Alta      | 1      |
| US-02 | Como usuario registrado, quiero iniciar sesión para ver mi panel      | Alta      | 1      |
| US-03 | Como admin, quiero gestionar usuarios (CRUD) para mantener la plataforma | Alta   | 1      |
| US-04 | Como usuario, quiero recuperar mi contraseña si la olvido             | Media     | 1      |

### Epic 2: Gestión de Cursos

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-05 | Como visitante, quiero ver el catálogo de cursos con filtros          | Alta      | 1      |
| US-06 | Como estudiante, quiero ver el detalle de un curso antes de inscribirme | Alta    | 1      |
| US-07 | Como instructor, quiero crear y editar mis propios cursos             | Alta      | 1      |
| US-08 | Como admin, quiero gestionar todos los cursos (CRUD completo)         | Alta      | 1      |

### Epic 3: Suscripciones

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-09 | Como estudiante, quiero ver los planes de suscripción disponibles     | Alta      | 2      |
| US-10 | Como estudiante, quiero suscribirme a un plan para acceder a cursos   | Alta      | 2      |
| US-11 | Como estudiante, quiero que mi suscripción se renueve automáticamente | Media     | 2      |
| US-12 | Como estudiante, quiero ver mi historial de suscripciones             | Media     | 2      |

### Epic 4: Pagos

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-13 | Como estudiante, quiero pagar mi suscripción con pasarela de prueba   | Alta      | 2      |
| US-14 | Como estudiante, quiero confirmación de pago antes de la activación   | Alta      | 2      |
| US-15 | Como admin, quiero ver los registros de transacciones de pago         | Media     | 2      |

### Epic 5: Control de Acceso a Cursos

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-16 | Como estudiante, quiero ver solo los cursos permitidos por mi plan    | Alta      | 3      |
| US-17 | Como estudiante, quiero inscribirme en un curso al que tengo acceso   | Alta      | 3      |
| US-18 | Como estudiante, quiero ver mi progreso en los cursos inscritos       | Media     | 3      |

### Epic 6: Reportes

| ID    | Historia                                                              | Prioridad | Sprint |
|-------|-----------------------------------------------------------------------|-----------|--------|
| US-19 | Como admin, quiero ver ingresos mensuales por tipo de suscripción     | Alta      | 3      |
| US-20 | Como admin, quiero ver los 5 cursos más inscritos                     | Alta      | 3      |
| US-21 | Como admin, quiero ver estudiantes activos vs inactivos               | Alta      | 3      |

---

## Documentación de la API

Los endpoints de la API se documentarán aquí una vez implementados. Laravel Sanctum maneja la autenticación.

| Método | Endpoint                          | Descripción                        | Auth     |
|--------|-----------------------------------|------------------------------------|----------|
| POST   | `/api/register`                   | Registrar un nuevo usuario         | No       |
| POST   | `/api/login`                      | Autenticar usuario                 | No       |
| POST   | `/api/logout`                     | Cerrar sesión                      | Sí       |
| GET    | `/api/courses`                    | Listar cursos (paginado)           | No*      |
| GET    | `/api/courses/{id}`               | Ver detalle del curso              | No*      |
| POST   | `/api/courses`                    | Crear un curso                     | Admin/Instructor |
| PUT    | `/api/courses/{id}`               | Actualizar un curso                | Admin/Instructor |
| DELETE | `/api/courses/{id}`               | Eliminar un curso                  | Admin    |
| GET    | `/api/subscription-plans`         | Listar planes de suscripción       | No       |
| POST   | `/api/subscriptions`              | Suscribirse a un plan             | Sí       |
| POST   | `/api/payments`                   | Iniciar pago                       | Sí       |
| GET    | `/api/reports/revenue`            | Reporte de ingresos mensuales      | Admin    |
| GET    | `/api/reports/top-courses`        | Top 5 cursos más inscritos         | Admin    |
| GET    | `/api/reports/students`           | Estudiantes activos vs inactivos   | Admin    |

*Listado público; el detalle puede requerir autenticación para el contenido del curso.

---

## Roles del Equipo

| Rol                | Responsabilidades                                               |
|--------------------|-----------------------------------------------------------------|
| **Product Owner**    | Define prioridades del backlog, valida criterios de aceptación  |
| **Scrum Master**     | Facilita las dailies, elimina impedimentos, asegura Scrum       |
| **Backend Developer** | Endpoints Laravel, modelos, migraciones, controladores         |
| **Frontend Developer** | Componentes Angular, servicios de API, gestión de estado      |

Los roles rotan en cada sprint para que cada miembro del equipo experimente todas las posiciones.

---

## Licencia

Este proyecto es de carácter educativo como parte de la materia **Desarrollo de Sistemas I**.
