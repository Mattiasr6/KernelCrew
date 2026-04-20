# Sprint 1 - Coverage Report

## End-to-End Handshake: ✅ COMPLETADO

**Fecha:** 2026-04-20
**Entorno:** http://100.107.236.28/api/v1

---

## Backend Coverage

### Endpoints Implementados

| Method | Endpoint | Auth | Status |
|--------|----------|------|-------|
| POST | `/api/v1/auth/register` | ❌ | ✅ |
| POST | `/api/v1/auth/login` | ❌ | ✅ |
| POST | `/api/v1/auth/logout` | ✅ | ✅ |
| GET | `/api/v1/auth/me` | ✅ | ✅ |
| GET | `/api/v1/courses` | ❌ | ✅ |
| GET | `/api/v1/courses/{id}` | ❌ | ✅ |

**Total:** 6 endpoints

###Filters Soportados
- `search` - Búsqueda por título
- `min_price` - Precio mínimo
- `max_price` - Precio máximo
- `status` - Filtro por estado

### Autenticación
- Laravel Sanctum con tokens Bearer

---

## Frontend Coverage

### Servicios
- `ApiService` - Base URL: http://100.107.236.28/api/v1
- `AuthService` - login, register, logout, me, clearSession
- `CourseService` - list, getById con filtros

### Interceptors
- `AuthInterceptor` - Token + manejo 401 → redirección a login

### Componentes
- `CourseListComponent` - Lista con search, filtros de precio, paginación

### Modelos
- `User` - id, name, email, role, created_at
- `Course` - id, title, slug, description, price, status, instructor

---

## Tests

### Backend
- Feature Tests: 1 passing

---

## Epic 2 - Pendiente

- Suscripciones (modelo, migración, seeders)
- Planes de suscripción
- Integración con pasarela de pago

---

## Estado del Sprint

**Status:** ✅ COMPLETADO

**Acciones siguientes:**
1. crear PR feature/frontend-sprint-1 → main
2. Implementar Epic 2 (Suscripciones)