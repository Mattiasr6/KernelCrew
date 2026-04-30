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
      <div class="max-w-7xl mx-auto flex justify-between items-center px-4 w-full">
        <div class="flex items-center gap-8">
          <a routerLink="/" class="logo flex items-center gap-2">
            <span class="material-symbols-outlined text-cyan-400">terminal</span>
            <span class="text-zinc-50 font-black text-xl tracking-tighter">Kernel<span class="text-cyan-400">Learn</span></span>
          </a>

          <nav class="hidden md:flex items-center gap-1">
            <a routerLink="/courses" routerLinkActive="active" class="nav-link">Explorar</a>
            @if (authService.user()?.role_id !== 2) {
              <a routerLink="/subscriptions" routerLinkActive="active" class="nav-link">
                <span class="material-symbols-outlined text-sm mr-1">card_membership</span>
                Planes
              </a>
            }
            
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="nav-link admin-glow">
                <span class="material-symbols-outlined text-sm mr-1">admin_panel_settings</span>
                Panel Admin
              </a>
              <a routerLink="/admin/payments" class="nav-link admin-glow">
                <span class="material-symbols-outlined text-sm mr-1">receipt</span>
                Transacciones
              </a>
            }
            @if (authService.isInstructor()) {
              <a routerLink="/instructor" class="nav-link instructor-glow">
                <span class="material-symbols-outlined text-sm mr-1">dashboard</span>
                Panel Instructor
              </a>
            }
            @if (authService.user()?.role_id === 3) {
              <a routerLink="/my-courses" class="nav-link">
                <span class="material-symbols-outlined text-sm mr-1">school</span>
                Mis Cursos
              </a>
              <a routerLink="/my-subscriptions" class="nav-link">
                <span class="material-symbols-outlined text-sm mr-1">history</span>
                Mi Historial
              </a>
            }
          </nav>
        </div>

        <div class="flex items-center gap-4">
          @if (authService.isAuthenticated()) {
            <div class="user-info hidden sm:flex flex-col items-end mr-2">
              <span class="text-zinc-50 text-xs font-bold">{{ authService.user()?.name }}</span>
              <div class="flex items-center gap-2">
                <span 
                  class="text-[10px] uppercase tracking-widest"
                  [ngClass]="{
                    'text-violet-400': authService.isAdmin(),
                    'text-cyan-400': authService.isInstructor(),
                    'text-emerald-400': authService.isStudent()
                  }">
                  {{ authService.user()?.role }}
                </span>
                @if (authService.user()?.subscription?.plan_name) {
                  <span class="bg-amber-500/20 text-amber-500 text-xs px-2 py-1 rounded-full font-medium">
                    {{ authService.user()?.subscription?.plan_name }}
                  </span>
                }
              </div>
            </div>

            <!-- Avatar Inteligente -->
            <button mat-icon-button [matMenuTriggerFor]="menu" class="profile-btn">
              @if (authService.user()?.avatar) {
                <img [src]="authService.user()?.avatar" 
                     class="w-9 h-9 rounded-full border border-zinc-700 object-cover" 
                     [alt]="authService.user()?.name">
              } @else {
                <div class="initials-avatar">
                  {{ getInitials(authService.user()?.name) }}
                </div>
              }
            </button>

            <mat-menu #menu="matMenu" class="dark-menu">
              @if (authService.isAdmin()) {
                <button mat-menu-item routerLink="/admin">
                  <mat-icon class="text-violet-400">admin_panel_settings</mat-icon>
                  <span class="text-zinc-300">Administración</span>
                </button>
                <button mat-menu-item routerLink="/admin/payments">
                  <mat-icon class="text-cyan-400">receipt</mat-icon>
                  <span class="text-zinc-300">Transacciones</span>
                </button>
              }
              @if (authService.isInstructor()) {
                <button mat-menu-item routerLink="/instructor">
                  <mat-icon class="text-cyan-400">dashboard</mat-icon>
                  <span class="text-zinc-300">Mi Dashboard</span>
                </button>
              }
              @if (authService.isAuthenticated() && authService.isStudent()) {
                <button mat-menu-item routerLink="/my-courses">
                  <mat-icon class="text-cyan-400">school</mat-icon>
                  <span class="text-zinc-300">Mis Cursos</span>
                </button>
                <button mat-menu-item routerLink="/subscriptions">
                  <mat-icon class="text-emerald-400">card_membership</mat-icon>
                  <span class="text-zinc-300">Planes de Suscripción</span>
                </button>
                <button mat-menu-item routerLink="/my-subscriptions">
                  <mat-icon class="text-zinc-400">history</mat-icon>
                  <span class="text-zinc-300">Mi Historial</span>
                </button>
              }
              <button mat-menu-item routerLink="/profile">
                <mat-icon class="text-zinc-400">person</mat-icon>
                <span class="text-zinc-300">Mi Perfil</span>
              </button>
              <mat-divider class="border-zinc-700"></mat-divider>
              <button mat-menu-item (click)="logout()">
                <mat-icon class="text-rose-400">logout</mat-icon>
                <span class="text-rose-400">Cerrar Sesión</span>
              </button>
            </mat-menu>
          } @else {
            <div class="flex gap-2">
              <button mat-button routerLink="/login" class="text-zinc-400 hover:text-zinc-200">Entrar</button>
              <button mat-flat-button routerLink="/register" class="register-btn">Empezar</button>
            </div>
          }
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .navbar {
      background: #09090b !important;
      border-bottom: 1px solid !important;
      border-color: #27272a !important;
      height: 70px;
      position: sticky;
      top: 0;
      z-index: 40;
    }
    .nav-link {
      color: #a1a1aa;
      padding: 8px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s ease-in-out;
      display: flex;
      align-items: center;
    }
    .nav-link:hover { color: #fafafa; background: rgba(255, 255, 255, 0.05); }
    .nav-link.active { color: #06b6d4; background: rgba(6, 182, 212, 0.1); }
    
    .initials-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #18181b, #09090b);
      border: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #06b6d4;
      text-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    }

    .admin-glow { color: #8b5cf6; }
    .instructor-glow { color: #06b6d4; }

    .register-btn {
      background: linear-gradient(135deg, #06b6d4, #8b5cf6) !important;
      color: white !important;
      border-radius: 8px !important;
      font-weight: 500;
    }
    
    ::ng-deep .dark-menu .mat-mdc-menu-content {
      background-color: #27272a !important;
      border: 1px solid #3f3f46 !important;
      border-radius: 8px !important;
    }
    
    ::ng-deep .dark-menu .mat-mdc-menu-item {
      color: #e4e4e7 !important;
    }
    
    ::ng-deep .dark-menu .mat-mdc-menu-item:hover {
      background-color: #3f3f46 !important;
    }
    
    ::ng-deep .mat-divider {
      border-top-color: #3f3f46 !important;
    }
  `],
})
export class NavbarComponent {
  authService = inject(AuthService);

  getInitials(name: string | undefined): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.authService.logout();
  }
}
