# CodeCore (KernelLearn) - Online Course Platform

CodeCore es una plataforma educativa moderna construida con una arquitectura de alto rendimiento, diseñada para la gestión de cursos, suscripciones automatizadas y certificación digital.

## 🚀 Arquitectura Técnica

La plataforma sigue una separación clara de responsabilidades (SoC) entre el frontend y el backend:

### **Backend: Laravel 11 (RESTful API)**
- **Motor:** PHP 8.3 + Laravel 11.
- **Base de Datos:** PostgreSQL (Normalización 3FN).
- **Autenticación:** Laravel Sanctum para tokens de sesión y **Laravel Socialite** para integración OAuth 2.0 (Google & GitHub).
- **Seguridad:** Middleware Custom RBAC (Role-Based Access Control) y Policies para blindaje de recursos.
- **Generación de Archivos:** `laravel-dompdf` para la creación dinámica de certificados de graduación.
- **Infraestructura:** Despliegue optimizado para redes privadas mediante **Tailscale**.

### **Frontend: Angular 18 (SPA)**
- **Estado Reactivo:** Uso extensivo de **Angular Signals** para una gestión de estado ligera y predecible.
- **Diseño:** Tailwind CSS con estética **Glassmorphism Dark Mode**.
- **Componentes:** Arquitectura basada en Standalone Components y carga perezosa (Lazy Loading).
- **Feedback:** Sistema custom de notificaciones (Toasts) y estados de carga inteligentes (Skeletons/Spinners).

## 🛠️ Stack de Desarrollo IA

Este proyecto fue desarrollado utilizando un ecosistema de agentes de IA avanzados:

- **Mattias CLI (Gemini):** Arquitecto principal y encargado de la implementación de lógica de negocio, migraciones y seguridad de red.
- **Stitch.ai:** Generación de interfaces visuales de alta fidelidad y prototipado rápido de componentes UI/UX.
- **Lógica de Agentes:** El desarrollo se ejecutó siguiendo flujos de trabajo de "Senior Software Engineer", priorizando el blindaje de código y la integridad arquitectónica.

## 📦 Instalación

### Requisitos
- Node.js 20+
- PHP 8.2+
- Composer
- PostgreSQL

### Backend
```bash
cd backend
composer install
php artisan migrate --seed
php artisan serve
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---
*Desarrollado para el proyecto formativo de Desarrollo de Sistemas I.*
