import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { instructorGuard } from './core/guards/instructor.guard';
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
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/components/forgot-password.component').then((m) => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/reset-password/:token',
    loadComponent: () =>
      import('./features/auth/components/reset-password.component').then((m) => m.ResetPasswordComponent),
    canActivate: [guestGuard],
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
  {
    path: 'courses/:id/learn',
    loadComponent: () =>
      import('./features/student/course-player.component').then(
        (m) => m.CoursePlayerComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'become-teacher',
    loadComponent: () =>
      import('./features/student/instructor-application.component').then(
        (m) => m.InstructorApplicationComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'my-certificates',
    loadComponent: () =>
      import('./features/student/student-certificates.component').then(
        (m) => m.StudentCertificatesComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'ai',
    loadComponent: () =>
      import('./features/student/kernel-ai/kernel-ai.component').then(
        (m) => m.KernelAIComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'subscriptions',
    loadComponent: () =>
      import('./features/student/student-subscriptions.component').then(
        (m) => m.StudentSubscriptionsComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'payment/success',
    loadComponent: () =>
      import('./features/payment/payment-success.component').then((m) => m.PaymentSuccessComponent),
    canActivate: [authGuard],
  },
  {
    path: 'payment/cancel',
    loadComponent: () =>
      import('./features/payment/payment-cancel.component').then((m) => m.PaymentCancelComponent),
    canActivate: [authGuard],
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
          import('./features/admin/admin-applications.component').then(
            (m) => m.AdminApplicationsComponent,
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
            path: '',
            loadComponent: () =>
              import('./features/instructor/instructor-dashboard.component').then(
                (m) => m.InstructorDashboardComponent,
              ),
        },
        {
            path: 'courses',
            loadComponent: () =>
              import('./features/instructor/instructor-courses.component').then(
                (m) => m.InstructorCoursesComponent,
              ),
        }
    ]
  },

  {
    path: '**',
    redirectTo: 'courses',
  },
];
