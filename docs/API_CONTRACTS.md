# Contratos API - KernelLearn Sprint 1

## Paquetes Laravel Requeridos

Para cumplir con los criterios de aceptación del Sprint 1, se necesitan instalar los siguientes paquetes:

```bash
composer require laravel/sanctum
composer require spatie/laravel-permission
composer require --dev barryvdh/laravel-debugbar
```

| Paquete | Propósito | Estado Actual |
|--------|-----------|---------------|
| `laravel/sanctum` | Autenticación por Tokens | **NO INSTALADO** - Requiere instalación inmediata |
| `spatie/laravel-permission` | RBAC y permisos | **NO INSTALADO** - Requiere instalación |

**Nota**: Laravel Sanctum está incluido en Laravel 11 pero debe publicarse su configuración. Verificar en `bootstrap/app.php` que esté registrado el middleware de Sanctum.

---

## Convenciones de la API

- **Prefix**: `/api/v1`
- **Formato**: JSON
- **Autenticación**: Token Bearer (Sanctum)
- **Paginación**: `?page=N&per_page=10`
- **Filtros**: Query params
- **Errores**: Código HTTP + formato estandarizado

---

## EPIC 1: MÓDULO DE USUARIOS Y AUTENTICACIÓN

### US-01 → Registro de Usuario

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/register` |
| **Permisos** | Público (sin auth) |
| **Middleware** | `throttle:5,1` (rate limiting) |

#### Request (JSON)

```json
{
  "name": "Juan Pérez",
  "email": "juan@ejemplo.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

#### Response - Éxito (201 Created)

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "student",
      "created_at": "2026-04-16T10:30:00Z"
    },
    "token": "1|xYz123AbC456..."
  }
}
```

#### Response - Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Los datos proporcionados no son válidos",
  "errors": {
    "email": ["El email ya está registrado"],
    "password": ["La contraseña debe tener al menos 8 caracteres"]
  }
}
```

---

### US-02 → Inicio de Sesión

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/login` |
| **Permisos** | Público (sin auth) |
| **Middleware** | `throttle:5,1` |

#### Request (JSON)

```json
{
  "email": "juan@ejemplo.com",
  "password": "password123"
}
```

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@ejemplo.com",
      "role": "student"
    },
    "token": "1|xYz123AbC456..."
  }
}
```

#### Response - Error (401 Unauthorized)

```json
{
  "success": false,
  "message": "Credenciales inválidas",
  "errors": {
    "email": ["Las credenciales proporcionadas no son correctas"]
  }
}
```

**Nota para Frontend**: El campo `role` indica la redirección:
- `admin` → `/dashboard`
- `instructor` → `/instructor/courses`
- `student` → `/courses/catalog`

---

### US-03 → Gestión de Usuarios (Admin)

#### 3.1 Listar Usuarios

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/users` |
| **Permisos** | Admin únicamente |
| **Middleware** | `auth:sanctum`, `role:admin` |

**Query Params**:
- `?page=1` - Página actual
- `?per_page=15` - Elementos por página (default: 15)
- `?search=user` - Buscar por nombre o email
- `?role=instructor` - Filtrar por rol

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Admin User",
        "email": "admin@kernellearn.com",
        "role": "admin",
        "is_active": true,
        "created_at": "2026-04-01T08:00:00Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 3,
      "per_page": 15,
      "total": 45
    }
  }
}
```

---

#### 3.2 Crear Usuario (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/admin/users` |
| **Permisos** | Admin únicamente |

#### Request (JSON)

```json
{
  "name": "María Instructor",
  "email": "maria@ejemplo.com",
  "password": "securePass123",
  "password_confirmation": "securePass123",
  "role": "instructor"
}
```

#### Response - Éxito (201 Created)

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "user": {
      "id": 5,
      "name": "María Instructor",
      "email": "maria@ejemplo.com",
      "role": "instructor",
      "is_active": true,
      "created_at": "2026-04-16T11:00:00Z"
    }
  }
}
```

---

#### 3.3 Editar Usuario (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `PUT/PATCH` |
| **Ruta** | `/api/v1/admin/users/{id}` |
| **Permisos** | Admin únicamente |

#### Request (JSON) - Ejemplo con todos los campos editables

```json
{
  "name": "María García",
  "email": "maria.garcia@ejemplo.com",
  "role": "instructor",
  "is_active": false
}
```

**Nota**: Contraseña no se puede cambiar desde aquí (endpoint separado para reset).

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "user": {
      "id": 5,
      "name": "María García",
      "email": "maria.garcia@ejemplo.com",
      "role": "instructor",
      "is_active": false,
      "updated_at": "2026-04-16T11:30:00Z"
    }
  }
}
```

---

#### 3.4 Eliminar Usuario (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `DELETE` |
| **Ruta** | `/api/v1/admin/users/{id}` |
| **Permisos** | Admin únicamente |

**Estrategia**: Eliminación lógica (soft delete) utilizando el campo `is_active`.

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

#### Response - Error (403 Forbidden)

```json
{
  "success": false,
  "message": "No tienes permiso para realizar esta acción",
  "errors": {}
}
```

---

### US-04 → Recuperación de Contraseña

#### 4.1 Solicitar Recuperación

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/forgot-password` |
| **Permisos** | Público |

#### Request (JSON)

```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Se ha enviado un enlace de recuperación a tu correo electrónico",
  "data": {
    "token": "abc123def456",
    "expires_in": 3600
  }
}
```

**Nota (Desarrollo)**: En entorno de desarrollo,返回token-simulado en la respuesta para testing. En producción, enviar por email real.

---

#### 4.2 Restablecer Contraseña

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/auth/reset-password` |
| **Permisos** | Público (token requerido) |

#### Request (JSON)

```json
{
  "token": "abc123def456",
  "email": "usuario@ejemplo.com",
  "password": "newPassword123",
  "password_confirmation": "newPassword123"
}
```

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente. Por favor, inicia sesión con tu nueva contraseña."
}
```

---

#### Response - Error (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "El token ha expirado o es inválido",
  "errors": {
    "token": ["El token de recuperación ha expirado. Por favor, solicita uno nuevo."]
  }
}
```

---

## EPIC 2: MÓDULO DE CURSOS

### US-05 → Catálogo Público de Cursos

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/courses` |
| **Permisos** | Público (sin auth) |
| **Middleware** | `throttle:60,1` |

**Query Params**:
- `?page=1` - Página
- `?per_page=10` - Elementos por página
- `?search=python` - Buscador por título
- `?level=beginner` - Filtrar por nivel
- `?category=programming` - Filtrar por categoría

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "Introducción a Python",
        "description": "Aprende los fundamentos de Python desde cero",
        "level": "beginner",
        "category": "programming",
        "duration_hours": 20,
        "instructor_name": "Carlos Ruiz",
        "is_published": true
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 5,
      "per_page": 10,
      "total": 48
    },
    "filters": {
      "levels": ["beginner", "intermediate", "advanced"],
      "categories": ["programming", "design", "marketing", "data_science"]
    }
  }
}
```

---

### US-06 → Detalle de Curso

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/courses/{id}` |
| **Permisos** | Público |

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "data": {
    "course": {
      "id": 1,
      "title": "Introducción a Python",
      "description": "Curso completo de Python para principiantes",
      "syllabus": "1. Variables\n2. Tipos de datos\n3. Funciones\n4. Objetos",
      "requirements": "No se requiere experiencia previa",
      "level": "beginner",
      "category": "programming",
      "duration_hours": 20,
      "instructor": {
        "id": 2,
        "name": "Carlos Ruiz"
      },
      "subscription_required": "basic",
      "is_enrolled": false,
      "can_enroll": true
    }
  }
}
```

**Nota**:
- `subscription_required` indica el plan mínimo necesario (null si no requiere)
- `can_enroll` indica si el usuario actual tiene acceso

---

### US-07 → Crear/Editar Cursos (Instructor)

#### 7.1 Crear Curso

| Atributo | Valor |
|----------|-------|
| **Método** | `POST` |
| **Ruta** | `/api/v1/instructor/courses` |
| **Permisos** | Instructor, Admin |
| **Middleware** | `auth:sanctum`, `role:instructor,admin` |

#### Request (JSON)

```json
{
  "title": "Python Intermedio",
  "description": "Lleva tus habilidades de Python al siguiente nivel",
  "syllabus": "1. Decoradores\n2. Generadores\n3. Context managers\n4. Testing",
  "duration_hours": 30,
  "level": "intermediate",
  "category": "programming",
  "requirements": "Conocimiento básico de Python"
}
```

**Valores válidos**:
- `level`: `beginner`, `intermediate`, `advanced`
- `category`: Según catálogo definido

#### Response - Éxito (201 Created)

```json
{
  "success": true,
  "message": "Curso creado exitosamente",
  "data": {
    "course": {
      "id": 5,
      "title": "Python Intermedio",
      "description": "Lleva tus habilidades de Python al siguiente nivel",
      "level": "intermediate",
      "category": "programming",
      "is_published": false,
      "created_at": "2026-04-16T12:00:00Z"
    }
  }
}
```

---

#### 7.2 Editar Curso

| Atributo | Valor |
|----------|-------|
| **Método** | `PUT/PATCH` |
| **Ruta** | `/api/v1/instructor/courses/{id}` |
| **Permisos** | Instructor (dueño del curso), Admin |

**Restricciones**:
- Un instructor solo puede editar cursos donde `instructor_id` sea igual a su ID
- Admin puede editar todos los cursos

#### Request (JSON) - Ejemplo parcial

```json
{
  "title": "Python Intermedio - Edición Actualizada",
  "description": "Contenido ampliado con ejemplos prácticos"
}
```

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Curso actualizado exitosamente",
  "data": {
    "course": {
      "id": 5,
      "title": "Python Intermedio - Edición Actualizada",
      "is_published": false,
      "updated_at": "2026-04-16T12:30:00Z"
    }
  }
}
```

#### Response - Error (403 Forbidden)

```json
{
  "success": false,
  "message": "No tienes permiso para editar este curso",
  "errors": {}
}
```

---

### US-08 → Gestión de Cursos (Admin)

#### 8.1 Listar Todos los Cursos

| Atributo | Valor |
|----------|-------|
| **Método** | `GET` |
| **Ruta** | `/api/v1/admin/courses` |
| **Permisos** | Admin únicamente |

**Query Params**:
- `?page=1`
- `?search=título`
- `?is_published=true` - Filtrar por estado
- `?instructor_id=2` - Filtrar por instructor

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "Introducción a Python",
        "instructor": {
          "id": 2,
          "name": "Carlos Ruiz"
        },
        "level": "beginner",
        "category": "programming",
        "is_published": true,
        "created_at": "2026-04-10T08:00:00Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "last_page": 2,
      "total": 15
    }
  }
}
```

---

#### 8.2 Publicar/Despublicar Curso

| Atributo | Valor |
|----------|-------|
| **Método** | `PATCH` |
| **Ruta** | `/api/v1/admin/courses/{id}/publish` |
| **Permisos** | Admin únicamente |

#### Request (JSON)

```json
{
  "is_published": true
}
```

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Curso publicado exitosamente"
}
```

---

#### 8.3 Asignar Instructor

| Atributo | Valor |
|----------|-------|
| **Método** | `PATCH` |
| **Ruta** | `/api/v1/admin/courses/{id}/assign-instructor` |
| **Permisos** | Admin únicamente |

#### Request (JSON)

```json
{
  "instructor_id": 5
}
```

---

#### 8.4 Eliminar Curso (Admin)

| Atributo | Valor |
|----------|-------|
| **Método** | `DELETE` |
| **Ruta** | `/api/v1/admin/courses/{id}` |
| **Permisos** | Admin únicamente |

**Estrategia**: Soft delete (usa la columna `deleted_at` existente).

#### Response - Éxito (200 OK)

```json
{
  "success": true,
  "message": "Curso eliminado exitosamente"
}
```

---

## Resumen de Rutas API

| US | Método | Ruta | Rol(es) | Auth |
|----|--------|------|--------|------|
| US-01 | POST | `/api/v1/auth/register` | Público | No |
| US-02 | POST | `/api/v1/auth/login` | Público | No |
| US-03 | GET | `/api/v1/admin/users` | Admin | Sí |
| US-03 | POST | `/api/v1/admin/users` | Admin | Sí |
| US-03 | PUT | `/api/v1/admin/users/{id}` | Admin | Sí |
| US-03 | DELETE | `/api/v1/admin/users/{id}` | Admin | Sí |
| US-04 | POST | `/api/v1/auth/forgot-password` | Público | No |
| US-04 | POST | `/api/v1/auth/reset-password` | Público | No |
| US-05 | GET | `/api/v1/courses` | Público | No |
| US-06 | GET | `/api/v1/courses/{id}` | Público | No |
| US-07 | POST | `/api/v1/instructor/courses` | Instructor | Sí |
| US-07 | PUT | `/api/v1/instructor/courses/{id}` | Instructor | Sí |
| US-08 | GET | `/api/v1/admin/courses` | Admin | Sí |
| US-08 | PATCH | `/api/v1/admin/courses/{id}/publish` | Admin | Sí |
| US-08 | PATCH | `/api/v1/admin/courses/{id}/assign-instructor` | Admin | Sí |
| US-08 | DELETE | `/api/v1/admin/courses/{id}` | Admin | Sí |

---

## Formato de Respuesta de Error Estándar

Todos los endpoints deben seguir este formato para errores:

```json
{
  "success": false,
  "message": "Mensaje descriptivo para el usuario",
  "errors": {
    "campo_especifico": ["Mensaje de error validación"]
  },
  "code": "ERROR_CODE"
}
```

**Códigos de error comunes**:

| Código | HTTP | Descripción |
|--------|------|--------------|
| `UNAUTHORIZED` | 401 | No autenticado |
| `FORBIDDEN` | 403 | Sin permisos |
| `NOT_FOUND` | 404 | Recurso no encontrado |
| `VALIDATION_ERROR` | 422 | Error de validación |
| `SERVER_ERROR` | 500 | Error interno |

---

## Endpoints Adicionales Requeridos

Para completar el flujo de autenticación, agregar estos endpoints:

| Método | Ruta | Descripción |
|--------|------|--------------|
| POST | `/api/v1/auth/logout` | Cerrar sesión (invalida token) |
| GET | `/api/v1/auth/me` | Obtener usuario actual |
| POST | `/api/v1/auth/refresh` | Refrescar token |

---

## Próximos Pasos para Implementación

1. **Instalar paquetes**: `composer require laravel/sanctum spatie/laravel-permission`
2. **Publicar configuración de Sanctum**: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
3. **Configurar migrate de permisos**: Publicar migración de Spatie
4. **Crear API Routes**: Archivo `routes/api.php` con prefix `api/v1`
5. **Crear Controllers**: AuthController, UserController, CourseController, InstructorCourseController, AdminCourseController, AdminUserController
6. **Configurar Middleware**: Role middleware using Spatie