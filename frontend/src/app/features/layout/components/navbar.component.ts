import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
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
  ],
  template: `
    <mat-toolbar class="navbar glass-card">
      <div class="container mx-auto flex justify-between items-center px-4">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="logo flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-500">terminal</span>
            <span class="text-white font-black text-xl tracking-tighter">Kernel<span class="text-blue-500">Learn</span></span>
          </a>

          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/courses" routerLinkActive="active" class="nav-link">Explorar</a>
            
            <!-- Botones dinámicos por ROL -->
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="nav-link admin-glow">
                <span class="material-symbols-outlined text-sm mr-1">admin_panel_settings</span>
                Panel Admin
              </a>
            }
            @if (authService.isInstructor()) {
              <a routerLink="/instructor" class="nav-link instructor-glow">
                <span class="material-symbols-outlined text-sm mr-1">dashboard</span>
                Panel Instructor
              </a>
            }
          </nav>
        </div>

        <div class="flex items-center gap-4">
          @if (authService.isAuthenticated()) {
            <div class="user-info hidden sm:flex flex-col items-end mr-2">
              <span class="text-white text-xs font-bold">{{ authService.user()?.name }}</span>
              <span class="text-[10px] uppercase tracking-widest" 
                    [ngClass]="{
                      'text-purple-400': authService.isAdmin(),
                      'text-blue-400': authService.isInstructor(),
                      'text-emerald-400': authService.isStudent()
                    }">
                {{ authService.user()?.role }}
              </span>
            </div>

            <button mat-icon-button [matMenuTriggerFor]="menu" class="profile-btn">
              <img [src]="authService.user()?.avatar || 'https://ui-avatars.com/api/?name=' + authService.user()?.name" 
                   class="w-8 h-8 rounded-full border border-white/20" alt="Avatar">
            </button>

            <mat-menu #menu="matMenu" class="dark-menu">
              @if (authService.isAdmin()) {
                <button mat-menu-item routerLink="/admin">
                  <mat-icon>admin_panel_settings</mat-icon>
                  <span>Administración</span>
                </button>
              }
              @if (authService.isInstructor()) {
                <button mat-menu-item routerLink="/instructor">
                  <mat-icon>dashboard</mat-icon>
                  <span>Mi Dashboard</span>
                </button>
              }
              <button mat-menu-item routerLink="/profile">
                <mat-icon>person</mat-icon>
                <span>Mi Perfil</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="text-red-400">
                <mat-icon class="text-red-400">logout</mat-icon>
                <span>Cerrar Sesión</span>
              </button>
            </mat-menu>
          } @else {
            <div class="flex gap-2">
              <button mat-button routerLink="/login" class="text-slate-300">Entrar</button>
              <button mat-raised-button routerLink="/register" class="register-btn">Empezar</button>
            </div>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
      height: 70px;
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .nav-link {
      color: #94a3b8;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
    }
    .nav-link:hover { color: white; background: rgba(255, 255, 255, 0.05); }
    .nav-link.active { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    
    .admin-glow { color: #a78bfa; }
    .admin-glow:hover { box-shadow: 0 0 15px rgba(167, 139, 250, 0.2); color: white; }
    
    .instructor-glow { color: #60a5fa; }
    .instructor-glow:hover { box-shadow: 0 0 15px rgba(96, 165, 250, 0.2); color: white; }

    .register-btn {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
      color: white !important;
      border-radius: 8px !important;
    }
  `],
})
export class NavbarComponent {
  authService = inject(AuthService);

  logout(): void {
    this.authService.logout();
  }
}
