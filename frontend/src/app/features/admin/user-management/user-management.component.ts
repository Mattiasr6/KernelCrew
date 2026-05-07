import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  template: `
    <div class="user-mgmt-container animate-fade-in">
      <div class="header-section">
        <div>
      <h2 class="text-3xl font-bold text-zinc-50">Gestión de Usuarios</h2>
      <p class="text-zinc-400 mt-1">Administra los roles y accesos del sistema KernelLearn.</p>
        </div>
        <button class="add-btn">
          <span class="material-symbols-outlined">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      <div class="table-card">
        @if (isLoading()) {
          <div class="loading-overlay">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        }

        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.id) {
                <tr class="hover-row">
              <td class="font-mono text-zinc-500" data-label="ID">#{{ user.id }}</td>
              <td data-label="Usuario">
                <div class="flex items-center gap-3">
                  @if (user.avatar) {
                    <img [src]="user.avatar" class="w-9 h-9 rounded-xl border border-zinc-700 object-cover" [alt]="user.name">
                  } @else {
                    <div class="avatar-circle">{{ getInitials(user.name) }}</div>
                  }
                  <span class="font-semibold text-zinc-200">{{ user.name }}</span>
                </div>
              </td>
              <td class="text-zinc-300 text-sm" data-label="Email">{{ user.email }}</td>
                  <td data-label="Rol">
                    <span class="badge" [ngClass]="getRoleClass(user.rol?.nombre || user.role || 'student')">
                      {{ (user.rol?.nombre || user.role || 'student') | uppercase }}
                    </span>
                  </td>
                  <td data-label="Estado">
                    <span class="status-indicator" [class.active]="user.is_active">
                      {{ user.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="text-zinc-400 text-sm" data-label="Registro">
                    {{ user.created_at | date:'dd/MM/yyyy' }}
                  </td>
                  <td class="text-right" data-label="Acciones">
                    <div class="action-group">
                      <button class="icon-btn edit" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        class="icon-btn toggle" 
                        [title]="user.is_active ? 'Desactivar' : 'Activar'"
                        (click)="toggleUser(user)">
                        <span class="material-symbols-outlined">
                          {{ user.is_active ? 'block' : 'check_circle' }}
                        </span>
                      </button>
                      <button class="icon-btn delete" title="Eliminar">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="7" class="empty-state">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-mgmt-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
.add-btn { display: flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #06b6d4, #0891b2); color: white; padding: 10px 20px; border-radius: 12px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.3); transition: all 0.2s ease; }
.add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(6, 182, 212, 0.4); }
.table-card { position: relative; min-height: 400px; border-radius: 20px; overflow: hidden; background: #18181b; border: 1px solid #27272a; }
.data-table { width: 100%; border-collapse: collapse; text-align: left; }
.data-table th { padding: 16px 24px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: #a1a1aa; border-bottom: 1px solid #27272a; }
.data-table td { padding: 16px 24px; border-bottom: 1px solid #27272a; vertical-align: middle; }
    .hover-row:hover { background: rgba(255, 255, 255, 0.02); }
    
    .avatar-circle {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #18181b, #09090b);
      color: #06b6d4;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
      border: 1px solid #27272a;
    }

    .badge { padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
    .badge-admin { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; border: 1px solid rgba(139, 92, 246, 0.2); }
    .badge-instructor { background: rgba(6, 182, 212, 0.1); color: #06b6d4; border: 1px solid rgba(6, 182, 212, 0.2); }
    .badge-student { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }

    .status-indicator { display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #71717a; }
    .status-indicator.active { color: #10b981; }
    .status-indicator::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .action-group { display: flex; justify-content: flex-end; gap: 8px; }
    .icon-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255, 255, 255, 0.05); border: 1px solid #27272a; color: #a1a1aa; cursor: pointer; transition: all 0.2s; }
    .icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fafafa; }
    .loading-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.4); z-index: 10; }
    .empty-state { text-align: center; padding: 60px !important; color: #71717a; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 767px) {
      .data-table, .data-table thead, .data-table tbody,
      .data-table th, .data-table td, .data-table tr { display: block; }
      .data-table thead { display: none; }
      .data-table tr {
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #27272a;
        border-radius: 12px;
      }
      .data-table td {
        padding: 6px 0 !important;
        border: none !important;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .data-table td::before {
        content: attr(data-label);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #71717a;
        min-width: 70px;
        flex-shrink: 0;
      }
      td[data-label="Acciones"] {
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
        padding-top: 8px !important;
        border-top: 1px solid #27272a !important;
      }
      td[data-label="Usuario"] {
        font-weight: 600;
        font-size: 1rem;
      }
      .action-group { justify-content: flex-start; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  
  users = signal<User[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.userService.getUsers().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.users.set(res.data?.users || res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  getInitials(name: string): string {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  }

  toggleUser(user: User) {
    this.userService.toggleStatus(user.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadUsers(),
      error: () => {}
    });
  }

  getRoleClass(role: string): string {
    const r = role.toLowerCase();
    if (r === 'admin') return 'badge-admin';
    if (r === 'instructor' || r === 'docente') return 'badge-instructor';
    return 'badge-student';
  }
}
