import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, instructorGuard } from './core/guards/auth.guard';

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
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./features/auth/components/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/auth/components/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then((m) => m.ProfileComponent),
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
    path: 'my-courses',
    loadComponent: () =>
      import('./features/instructor/instructor-courses.component').then(
        (m) => m.InstructorCoursesComponent,
      ),
    canActivate: [authGuard, instructorGuard],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/components/admin-users.component').then(
            (m) => m.AdminUsersComponent,
          ),
      },
      {
        path: 'courses',
        loadComponent: () =>
          import('./features/admin/components/admin-courses.component').then(
            (m) => m.AdminCoursesComponent,
          ),
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'courses',
  },
];
