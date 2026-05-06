# KernelLearn — Plataforma de Aprendizaje Técnico con Economía de Créditos

**KernelLearn** es un Sistema de Gestión de Aprendizaje (LMS) de código abierto diseñado para la enseñanza de tecnologías de desarrollo de software, administración de sistemas e inteligencia artificial. Ofrece un modelo de monetización basado en créditos, reproductor de cursos interactivo, generación de certificados verificables y un entorno completo para la gestión de contenido educativo.

---

## Características

### Nucleares
- **Economía de Créditos**: Los estudiantes adquieren paquetes de créditos para inscribirse en cursos de forma permanente, sin suscripciones mensuales ni renovaciones automáticas.
- **Reproductor de Cursos**: Interfaz dividida 70/30 con reproductor de video embebido, panel de lecciones lateral, barra de progreso horizontal y botón de completado por lección.
- **Certificados Verificables**: Generación automática de certificados en PDF al completar el 100% del curso, con código UUID único verificable públicamente.
- **Curriculum Builder**: Constructor de secciones y lecciones con reordenamiento drag-free mediante controles explícitos, soporte para URLs de video y contenido en texto.

### Para Instructores
- **Panel de Control**: Métricas de cursos, estudiantes activos, calificaciones y barra de gamificación que incentiva la creación de contenido.
- **Editor Multi-pestaña**: Información básica, precios en créditos, currículo y configuración con bloqueo automático según el estado del curso (DRAFT / IN_REVIEW / PUBLISHED / REJECTED).
- **Flujo de Moderación**: Los cursos pasan por un proceso de revisión por parte del administrador antes de ser publicados, con retroalimentación mediante motivo de rechazo.

### Para Estudiantes
- **Biblioteca Personal**: Vista tipo grid con tarjetas de cursos inscritos, barra de progreso dinámica y acceso directo al reproductor o certificado.
- **Tienda de Créditos**: Paquetes de créditos con precios escalonados y pasarela de pago integrada con Stripe (Sandbox).
- **Asistente KAI**: Chatbot con modelo `deepseek-v4-flash` ejecutándose sobre OpenCode Go, accesible desde cualquier pantalla para resolver dudas técnicas.

### Administración
- **Moderación de Cursos**: Panel de revisión con acciones de aprobar/rechazar, motivo de rechazo editable y actualización de la lista sin recarga completa.
- **Gestión de Usuarios**: CRUD completo con activación/desactivación y restauración de cuentas eliminadas.

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Angular | 21 |
| | TypeScript | 5.9 |
| | Tailwind CSS | 3.4 |
| | Angular Material | 21 |
| Backend | Laravel | 13 |
| | PHP | 8.3 |
| | PostgreSQL | — |
| Seguridad | Laravel Sanctum | 4 |
| | Socialite (OAuth) | 5 |
| Pagos | Stripe SDK | 20 |
| Documentación | l5-swagger (OpenAPI) | — |
| PDF | barryvdh/laravel-dompdf | 3 |
| Testing | PHPUnit | 12 |
| Code Style | Laravel Pint | 1 |

---

## Arquitectura

### Backend — Service Pattern + Enums

El backend de Laravel organiza la lógica de dominio en servicios inyectables mediante el contenedor IoC, separando las responsabilidades de los controladores:

```
Controller → Service → Model
```

Las validaciones se centralizan en `FormRequest` classes para mantener los controladores ligeros y evitar reglas duplicadas. Los estados del dominio se modelan mediante Enums nativos de PHP 8.3 (`CourseStatus`, `UserRole`), garantizando type safety en todas las comparaciones.

El middleware personalizado (`ApiAuthenticate`, `CheckRoleId`) permite un control de acceso granular a nivel de ruta sin acoplar lógica de autorización a los controladores.

### Frontend — Signals + Lazy Loading

Todas las rutas utilizan `loadComponent` para lazy loading nativo de Angular. El estado reactivo se maneja mediante Signals (`signal()`, `computed()`), eliminando la necesidad de librerías externas de estado. Los componentes utilizan `takeUntilDestroyed` para la gestión automática de suscripciones RxJS.

El diseño sigue una arquitectura **Mobile-First** con Tailwind CSS, utilizando breakpoints `sm:`, `md:`, `lg:` para adaptar la interfaz desde teléfonos hasta pantallas de escritorio. El layout del instructor aísla el sidebar del navbar global mediante posicionamiento `fixed` con `top-[70px]`, evitando superposiciones.

### Base de Datos

36 migraciones que construyen progresivamente el esquema: tablas de usuarios, roles RBAC, cursos con soft-deletes y soporte de estados, secciones y lecciones, tabla pivote `lesson_user` para progreso, certificados con UUID único, paquetes de créditos y tabla de pagos.

Los seeders implementan datos hiperrealistas con 4 cursos en estados mixtos (PUBLISHED, DRAFT, REJECTED), secciones y lecciones asociadas, y el EnrollmentSeeder registra lecciones completadas en la tabla pivote para simular progreso real de estudiantes.

---

## Instalación

### Requisitos del Sistema

- PHP 8.3+
- Composer 2
- Node.js 20+
- PostgreSQL 15+
- Stripe Account (Sandbox) para pagos
- OpenRouter API Key para el asistente KAI

### Backend

```bash
git clone <repo-url> kernel-learn
cd kernel-learn/backend

cp .env.example .env
# Configurar conexión a base de datos en .env

composer install

php artisan key:generate
php artisan migrate --seed

php artisan storage:link

php artisan serve
```

### Frontend

```bash
cd frontend

npm install

ng serve
```

La aplicación estará disponible en `http://localhost:4200`. Las credenciales de prueba se muestran al ejecutar los seeders:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@kernellearn.com | admin123 |
| Instructor | andrea@kernellearn.com | instructor123 |
| Estudiante | mattias@kernellearn.com | password |

---

## Estructura del Proyecto

```
backend/
├── app/
│   ├── Enums/                 # Enums PHP 8.3 (CourseStatus, UserRole)
│   ├── Http/
│   │   ├── Controllers/       # Controladores agrupados por dominio
│   │   │   ├── Admin/         # Moderación y gestión administrativa
│   │   │   ├── Api/V1/        # Endpoints públicos y protegidos
│   │   │   └── Instructor/    # Dashboard y métricas del creador
│   │   ├── Middleware/        # ApiAuthenticate, CheckRoleId
│   │   └── Requests/          # FormRequest de validación
│   ├── Models/                # Eloquent ORM
│   ├── Observers/             # CourseObserver (reembolso al eliminar)
│   └── Services/              # Lógica de dominio (KernelAI, Certificate, PlanLevel)
├── bootstrap/app.php          # Middleware aliases
├── config/services.php        # OpenRouter, Stripe config
├── database/
│   ├── migrations/            # 36 migraciones
│   └── seeders/               # Seeders realistas con datos coherentes
├── routes/api.php             # Definición de rutas REST
└── storage/app/public/        # Assets públicos

frontend/
├── src/app/
│   ├── core/
│   │   ├── guards/            # auth, admin, instructor guards
│   │   ├── interceptors/      # auth, error interceptors
│   │   ├── models/            # Interfaces TypeScript
│   │   └── services/          # ApiService, AuthService, etc.
│   ├── features/
│   │   ├── admin/             # Moderación, usuarios, transacciones
│   │   ├── auth/              # Login, registro, OAuth callback
│   │   ├── courses/           # Catálogo, detalle, reseñas
│   │   ├── instructor/        # Dashboard, editor multi-pestaña, curriculum
│   │   ├── landing/           # Landing page con hero y featured courses
│   │   ├── layout/            # Navbar global
│   │   ├── payment/           # Confirmación de pago
│   │   ├── profile/           # Perfil de usuario
│   │   └── student/           # Mis cursos, reproductor, certificados, créditos
│   ├── app.ts                 # Componente raíz
│   └── app.routes.ts          # Configuración de rutas lazy-loaded
```

---

## API REST (Principales Endpoints)

### Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/courses` | Catálogo paginado con filtros |
| GET | `/api/v1/courses/featured` | Cursos destacados para landing |
| GET | `/api/v1/courses/{id}` | Detalle del curso |
| GET | `/api/v1/courses/{courseId}/curriculum` | Temario público |
| GET | `/api/v1/certificates/{uuid}/verify` | Verificación pública de certificado |

### Autenticados
| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Inicio de sesión |
| POST | `/api/v1/auth/register` | Registro |
| GET | `/api/v1/auth/me` | Perfil del usuario autenticado |
| POST | `/api/v1/courses/{course}/enroll-credits` | Inscripción con créditos |
| POST | `/api/v1/lessons/{id}/complete` | Marcar lección completada |
| GET | `/api/v1/student/my-courses` | Cursos inscritos con progreso |
| POST | `/api/v1/ai/chat` | Chat con asistente KAI |

### Instructor
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/instructor/courses` | Lista de cursos del instructor |
| PATCH | `/api/v1/instructor/courses/{id}/basic` | Actualizar información básica |
| PATCH | `/api/v1/instructor/courses/{id}/pricing` | Actualizar precio en créditos |
| POST | `/api/v1/instructor/courses/{courseId}/sections` | Crear sección |
| POST | `/api/v1/instructor/sections/{sectionId}/lessons` | Crear lección |

### Administrador
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/v1/admin/courses/pending` | Cursos pendientes de revisión |
| PATCH | `/api/v1/admin/courses/{id}/approve` | Aprobar curso |
| PATCH | `/api/v1/admin/courses/{id}/reject` | Rechazar curso (con motivo) |

---

## Licencia

KernelLearn se distribuye bajo licencia MIT. El nombre y logotipo de KernelLearn son marcas registradas del equipo de desarrollo.
