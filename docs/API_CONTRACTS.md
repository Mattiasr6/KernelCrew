# Contratos API - KernelLearn (Actualizado)

## Paquetes Laravel Instalados

| Paquete | Propósito | Estado |
|--------|-----------|---------------|
| `laravel/sanctum` | Autenticación por Tokens | **INSTALADO** |
| `spatie/laravel-permission` | RBAC y permisos | **INSTALADO** |
| `darkaonline/l5-swagger` | Documentación OpenAPI | **INSTALADO** |

---

## Convenciones de la API

- **Prefix**: `/api/v1`
- **Formato**: JSON
- **Autenticación**: Token Bearer (Sanctum)
- **Paginación**: `?page=N&per_page=10`
- **Filtros**: Query params (search, min_price, max_price, status)
- **Errores**: Código HTTP + formato estandarizado `{ "success": false, "message": "...", "errors": [...] }`

---

## EPIC 1: MÓDULO DE USUARIOS Y AUTENTICACIÓN

### Autenticación

| Método | Ruta | Permisos | Descripción |
|----------|-------|-----------|-------------|
| `POST` | `/api/v1/auth/register` | Público | Registro de nuevo usuario (rol student por defecto) |
| `POST` | `/api/v1/auth/login` | Público | Inicio de sesión y generación de token |
| `POST` | `/api/v1/auth/logout` | Auth | Cierre de sesión e invalidación de token |
| `GET` | `/api/v1/auth/me` | Auth | Obtener datos del usuario autenticado |
| `POST` | `/api/v1/auth/forgot-password` | Público | Solicitar link de recuperación |
| `POST` | `/api/v1/auth/reset-password` | Público | Restablecer contraseña con token |

### Gestión de Usuarios (Admin)

| Método | Ruta | Permisos | Descripción |
|----------|-------|-----------|-------------|
| `GET` | `/api/v1/admin/users` | Admin | Listar usuarios (incluye eliminados, paginado, búsqueda) |
| `DELETE` | `/api/v1/admin/users/{id}` | Admin | Soft delete de usuario |
| `PATCH` | `/api/v1/admin/users/{id}/restore` | Admin | Restaurar usuario eliminado |
| `PATCH` | `/api/v1/admin/users/{id}/toggle-status` | Admin | Activar/desactivar usuario (`is_active`) |

---

## EPIC 2: MÓDULO DE CURSOS

### Cursos

| Método | Ruta | Permisos | Descripción |
|----------|-------|-----------|-------------|
| `GET` | `/api/v1/courses` | Público* | Listar cursos (Público: solo publicados. Admin/Instructor: todos) |
| `GET` | `/api/v1/courses/{id}` | Público | Detalle de un curso |
| `POST` | `/api/v1/courses` | Instructor/Admin | Crear nuevo curso (status draft por defecto) |
| `PUT` | `/api/v1/courses/{id}` | Instructor(dueño)/Admin | Actualizar datos del curso |
| `DELETE` | `/api/v1/courses/{id}` | Instructor(dueño)/Admin | Soft delete de curso |
| `PATCH` | `/api/v1/courses/{id}/restore` | Admin | Restaurar curso eliminado |

---

## Formato de Respuesta Estándar (Ejemplo)

### Éxito (200 OK)
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": { ... },
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 10,
    "total": 50
  }
}
```

### Error de Validación (422 Unprocessable Entity)
```json
{
  "success": false,
  "message": "Los datos proporcionados no son válidos",
  "errors": {
    "email": ["El email ya está registrado"]
  }
}
```

---

## Notas Técnicas
- **Búsqueda**: El sistema utiliza `ilike` para búsquedas insensibles a mayúsculas/minúsculas (PostgreSQL).
- **Soft Deletes**: Implementado en `User` y `Course` para mantener integridad referencial.
- **Roles**: Gestionados mediante Spatie (`admin`, `instructor`, `student`).
- **Swagger**: La documentación interactiva está disponible en `/api/documentation` (generada por L5-Swagger).
