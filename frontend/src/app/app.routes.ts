import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { instructorGuard } from './core/guards/instructor.guard';

// Nota: authGuard y guestGuard deberían moverse a sus propios archivos también por consistencia
// Por ahora los mantengo si existen, pero priorizo la nueva arquitectura de Admin
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('./features/auth/components/auth-callback.component').then((m) => m.AuthCallbackComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./features/courses/components/course-list.component').then(
        (m) => m.CourseListComponent,
      ),
  },
  {
    path: 'courses/:id',
    loadComponent: () =>
      import('./features/courses/components/course-detail.component').then(
        (m) => m.CourseDetailComponent,
      ),
  },

  // --- ARQUITECTURA SPRINT 2: ADMIN DASHBOARD ---
  {
    path: 'admin',
    loadComponent: () => 
      import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(
            (m) => m.UserManagementComponent,
          ),
      },
      {
        path: 'applications',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent, // Temporalmente redirige al dashboard
          ),
      }
    ],
  },

  // --- ARQUITECTURA SPRINT 2: INSTRUCTOR DASHBOARD ---
  {
    path: 'instructor',
    canActivate: [authGuard, instructorGuard],
    children: [
        {
            path: 'courses',
            loadComponent: () =>
              import('./features/instructor/instructor-courses.component').then(
                (m) => m.InstructorCoursesComponent,
              ),
        },
        {
            path: '',
            redirectTo: 'courses',
            pathMatch: 'full'
        }
    ]
  },

  {
    path: '**',
    redirectTo: 'courses',
  },
];
