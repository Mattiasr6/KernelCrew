import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <div class="dashboard-container">
      <h1>Bienvenido, {{ authService.user()?.name }}</h1>
      <p class="role">Rol: {{ authService.user()?.role | titlecase }}</p>

      <div class="cards-grid">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <div mat-card-avatar class="icon-avatar">
              <mat-icon>school</mat-icon>
            </div>
            <mat-card-title>Cursos</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Explora nuestro catálogo de cursos</p>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button color="primary" routerLink="/courses">Ver Cursos</button>
          </mat-card-actions>
        </mat-card>

        @if (authService.isStudent()) {
          <mat-card class="dashboard-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>card_membership</mat-icon>
              </div>
              <mat-card-title>Suscripción</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gestiona tu plan de suscripción</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/plans">Ver Planes</button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="dashboard-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>play_circle</mat-icon>
              </div>
              <mat-card-title>Mis Cursos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Continua aprendiendo</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/my-courses">Mi Progreso</button>
            </mat-card-actions>
          </mat-card>
        }

        @if (authService.isAdmin()) {
          <mat-card class="dashboard-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>people</mat-icon>
              </div>
              <mat-card-title>Usuarios</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Gestionar usuarios del sistema</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/admin/users">Admin Users</button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="dashboard-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>analytics</mat-icon>
              </div>
              <mat-card-title>Reportes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Ver estadísticas y reportes</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/admin/reports">Ver Reportes</button>
            </mat-card-actions>
          </mat-card>
        }

        @if (authService.isInstructor()) {
          <mat-card class="dashboard-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>add_circle</mat-icon>
              </div>
              <mat-card-title>Crear Curso</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Crea un nuevo curso</p>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button color="primary" routerLink="/courses/create">Nuevo Curso</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
      }
      h1 {
        margin-bottom: 8px;
        color: #333;
      }
      .role {
        color: #666;
        margin-bottom: 32px;
      }
      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 24px;
      }
      .dashboard-card {
        cursor: pointer;
        transition:
          transform 0.2s,
          box-shadow 0.2s;
      }
      .dashboard-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .icon-avatar {
        background-color: #1976d2;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 40px;
        height: 40px;
      }
    `,
  ],
})
export class DashboardComponent {
  authService = inject(AuthService);
}
