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
      <div class="dashboard-header">
        <h1>Bienvenido, {{ authService.user()?.name }}</h1>
        <p class="role">Rol: {{ authService.user()?.rol?.nombre | titlecase }}</p>
      </div>

      <div class="cards-grid">
        <mat-card class="glass-card">
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
            <button mat-button routerLink="/courses">Ver Cursos</button>
          </mat-card-actions>
        </mat-card>

        @if (authService.isStudent()) {
          <mat-card class="glass-card">
            <mat-card-header>
              <div mat-card-avatar class="icon-avatar">
                <mat-icon>database</mat-icon>
              </div>
              <mat-card-title>Tienda de Créditos</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p>Adquiere créditos para nuevos cursos</p>
              <div class="mt-2 flex items-center gap-2 text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">database</span>
                <span class="text-sm font-bold">Saldo: {{ (authService.user()?.credits_balance ?? 0) }} créditos</span>
              </div>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button routerLink="/credits">Comprar Créditos</button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="glass-card">
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
              <button mat-button routerLink="/my-courses">Mi Progreso</button>
            </mat-card-actions>
          </mat-card>
        }

        @if (authService.isAdmin()) {
          <mat-card class="glass-card">
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
              <button mat-button routerLink="/admin/users">Admin Users</button>
            </mat-card-actions>
          </mat-card>

          <mat-card class="glass-card">
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
              <button mat-button routerLink="/admin">Ver Reportes</button>
            </mat-card-actions>
          </mat-card>
        }

        @if (authService.isInstructor()) {
          <mat-card class="glass-card">
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
              <button mat-button routerLink="/instructor/courses">Nuevo Curso</button>
            </mat-card-actions>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        background: #09090b;
        min-height: 100vh;
        padding: 32px;
        max-width: 1200px;
        margin: 0 auto;
      }
      @media (max-width: 640px) { .dashboard-container { padding: 20px 16px; } }
      .dashboard-header {
        margin-bottom: 32px;
      }
      .dashboard-header h1 {
        background: linear-gradient(135deg, #06b6d4, #8b5cf6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        font-size: 2.5rem;
        margin-bottom: 8px;
      }
      .role {
        color: #a1a1aa;
      }
      .cards-grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(1, 1fr);
      }
      @media (min-width: 641px) {
        .cards-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (min-width: 1025px) {
        .cards-grid {
          grid-template-columns: repeat(3, 1fr);
        }
      }
      .glass-card {
        background: #18181b !important;
        border: 1px solid #27272a !important;
        border-radius: 16px !important;
        box-shadow: none !important;
        transition: transform 0.3s ease, border-color 0.3s ease;
        cursor: pointer;
      }
      .glass-card:hover {
        transform: translateY(-4px);
        border-color: #06b6d4 !important;
        box-shadow: 0 0 20px rgba(6, 182, 212, 0.15) !important;
      }
      .icon-avatar {
        background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important;
        color: white !important;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        width: 40px;
        height: 40px;
      }
      mat-card-content p {
        color: #a1a1aa !important;
      }
    `,
  ],
})
export class DashboardComponent {
  authService = inject(AuthService);
}
