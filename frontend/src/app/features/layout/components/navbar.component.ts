import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
  ],
  template: `
    <mat-toolbar class="navbar">
      <a routerLink="/" class="logo">Kernel<span class="logo-accent">Learn</span></a>

      <span class="spacer"></span>

      @if (authService.isAuthenticated()) {
        <nav class="nav-links">
          <a mat-button routerLink="/dashboard" routerLinkActive="active-link">Dashboard</a>
          <a mat-button routerLink="/courses" routerLinkActive="active-link">Cursos</a>

          @if (authService.isStudent()) {
            <a mat-button routerLink="/plans" routerLinkActive="active-link">Planes</a>
          }

          @if (authService.isInstructor() || authService.isAdmin()) {
            <a mat-button routerLink="/my-courses" routerLinkActive="active-link">Mis Cursos</a>
          }
        </nav>

        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>

        <mat-menu #userMenu="matMenu">
          <div class="user-info">
            <strong>{{ authService.user()?.name }}</strong>
            <small>{{ authService.user()?.email }}</small>
          </div>
          <mat-divider></mat-divider>
          <button mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon>
            <span>Perfil</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>logout</mat-icon>
            <span>Cerrar Sesión</span>
          </button>
        </mat-menu>
      } @else {
        <nav class="nav-links">
          <a mat-button routerLink="/courses">Cursos</a>
          <a mat-button routerLink="/login">Iniciar Sesión</a>
          <a mat-raised-button class="register-btn" routerLink="/register">Registrarse</a>
        </nav>
      }
    </mat-toolbar>
  `,
  styles: [
    `
      .navbar {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: rgba(26, 26, 46, 0.95);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid var(--glass-border);
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: var(--text-primary);
        text-decoration: none;
      }
      .logo-accent {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .spacer {
        flex: 1;
      }
      .nav-links {
        display: flex;
        gap: 8px;
        margin-right: 16px;
      }
      .nav-links a.active-link {
        background: rgba(108, 99, 255, 0.2);
        color: var(--accent-primary) !important;
      }
      .register-btn {
        background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
        color: white !important;
      }
      .user-info {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .user-info small {
        color: var(--text-secondary);
      }
    `,
  ],
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
