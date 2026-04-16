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
    <mat-toolbar color="primary" class="navbar">
      <a routerLink="/" class="logo">CodeCore</a>

      <span class="spacer"></span>

      @if (authService.isAuthenticated()) {
        <nav class="nav-links">
          <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a mat-button routerLink="/courses" routerLinkActive="active">Cursos</a>

          @if (authService.isStudent()) {
            <a mat-button routerLink="/plans" routerLinkActive="active">Planes</a>
          }

          @if (authService.isInstructor() || authService.isAdmin()) {
            <a mat-button routerLink="/my-courses" routerLinkActive="active">Mis Cursos</a>
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
          <a mat-raised-button routerLink="/register">Registrarse</a>
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
      }
      .logo {
        font-size: 24px;
        font-weight: bold;
        color: white;
        text-decoration: none;
      }
      .spacer {
        flex: 1;
      }
      .nav-links {
        display: flex;
        gap: 8px;
        margin-right: 16px;
      }
      .nav-links a.active {
        background: rgba(255, 255, 255, 0.15);
      }
      .user-info {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .user-info small {
        color: #666;
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
