import { Component, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="px-4 py-6 md:py-12">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-50">Mi Perfil</h1>
            <p class="text-sm text-zinc-500 mt-1">Administra tu información personal</p>
          </div>
          @if (!isEditing()) {
            <button mat-stroked-button class="edit-btn" (click)="startEditing()">
              <span class="material-symbols-outlined text-[16px]">edit</span>
              Editar
            </button>
          }
        </div>

        <!-- Profile Card -->
        <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
          <!-- Avatar + Name -->
          <div class="flex items-center gap-5 pb-6 mb-6 border-b border-zinc-800">
            <div class="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center overflow-hidden shrink-0">
              @if (authService.user()?.avatar) {
                <img [src]="authService.user()?.avatar" alt="Avatar" class="w-full h-full object-cover" />
              } @else {
                <span class="text-3xl font-black text-white">
                  {{ (authService.user()?.name || '?')[0] | uppercase }}
                </span>
              }
            </div>
            <div class="min-w-0">
              <h2 class="text-lg font-semibold text-zinc-100 truncate">{{ authService.user()?.name || 'Usuario' }}</h2>
              <span class="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                [ngClass]="{
                  'bg-violet-500/10 text-violet-400 border border-violet-500/20': authService.user()?.role === 'admin',
                  'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20': authService.user()?.role === 'instructor' || authService.user()?.role === 'docente',
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20': authService.user()?.role === 'student'
                }">
                {{ authService.user()?.role }}
              </span>
            </div>
          </div>

          @if (isEditing()) {
            <!-- Edit Form -->
            <form (ngSubmit)="saveProfile()" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1.5">Nombre</label>
                <input type="text" class="form-input" [(ngModel)]="formData.name" name="name" placeholder="Tu nombre" />
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1.5">Avatar (URL)</label>
                <input type="url" class="form-input" [(ngModel)]="formData.avatar" name="avatar" placeholder="https://ejemplo.com/avatar.jpg" />
                <p class="text-xs text-zinc-600 mt-1">Opcional — URL pública de tu imagen de perfil</p>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1.5">Biografía</label>
                <textarea class="form-input min-h-[100px] resize-y" [(ngModel)]="formData.bio" name="bio" placeholder="Cuéntanos sobre ti..." rows="3"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-zinc-400 mb-1.5">Teléfono</label>
                <input type="tel" class="form-input" [(ngModel)]="formData.phone" name="phone" placeholder="+51 999 999 999" />
              </div>

              <div class="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button type="button" mat-stroked-button class="cancel-btn" (click)="cancelEditing()">
                  Cancelar
                </button>
                <button type="submit" mat-flat-button class="submit-btn" [disabled]="!formData.name.trim() || isSaving()">
                  @if (isSaving()) {
                    <mat-spinner diameter="18" class="inline-block mr-1"></mat-spinner>
                    Guardando...
                  } @else {
                    <span class="material-symbols-outlined text-[16px] mr-1">check</span>
                    Guardar Cambios
                  }
                </button>
              </div>
            </form>
          } @else {
            <!-- Info Display -->
            <div class="space-y-3">
              <div class="info-row">
                <div class="info-icon email-icon">
                  <span class="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <div class="info-content">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ authService.user()?.email || 'Cargando...' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-icon id-icon">
                  <span class="material-symbols-outlined text-[20px]">badge</span>
                </div>
                <div class="info-content">
                  <span class="info-label">ID de Usuario</span>
                  <span class="info-value">#{{ authService.user()?.id }}</span>
                </div>
              </div>
              @if (userBio()) {
                <div class="info-row">
                  <div class="info-icon bio-icon">
                    <span class="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Biografía</span>
                    <span class="info-value">{{ userBio() }}</span>
                  </div>
                </div>
              }
              @if (userPhone()) {
                <div class="info-row">
                  <div class="info-icon phone-icon">
                    <span class="material-symbols-outlined text-[20px]">phone</span>
                  </div>
                  <div class="info-content">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">{{ userPhone() }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* Buttons */
    .edit-btn {
      color: #06b6d4 !important;
      border-color: rgba(6, 182, 212, 0.3) !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      padding: 8px 18px !important;
      display: inline-flex !important;
      align-items: center !important;
      gap: 6px !important;
    }
    .edit-btn:hover {
      background: rgba(6, 182, 212, 0.08) !important;
    }
    .submit-btn {
      background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
      color: #fff !important;
      border-radius: 10px !important;
      font-weight: 600 !important;
      padding: 10px 24px !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
      transition: all 0.2s ease !important;
    }
    .submit-btn:hover:not(:disabled) {
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.4) !important;
    }
    .submit-btn:disabled {
      opacity: 0.5;
      box-shadow: none !important;
    }
    .cancel-btn {
      color: #a1a1aa !important;
      border-color: #3f3f46 !important;
      border-radius: 10px !important;
      font-weight: 500 !important;
      padding: 10px 20px !important;
    }
    .cancel-btn:hover {
      color: #fafafa !important;
      background: rgba(255, 255, 255, 0.04) !important;
    }

    /* Form inputs */
    .form-input {
      width: 100%;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 12px 16px;
      color: #fafafa;
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
    }
    .form-input::placeholder { color: #52525b; }

    /* Info rows */
    .info-row {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 14px 16px;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 12px;
      transition: all 0.15s ease;
    }
    .info-row:hover {
      border-color: #3f3f46;
    }
    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .email-icon {
      background: rgba(6, 182, 212, 0.1);
      color: #06b6d4;
    }
    .id-icon {
      background: rgba(139, 92, 246, 0.1);
      color: #8b5cf6;
    }
    .bio-icon {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }
    .phone-icon {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }
    .info-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .info-label {
      color: #71717a;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .info-value {
      color: #fafafa;
      font-size: 0.95rem;
      word-break: break-word;
    }
  `],
})
export class ProfileComponent {
  authService = inject(AuthService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  isEditing = signal(false);
  isSaving = signal(false);
  formData = { name: '', bio: '', phone: '', avatar: '' };
  userBio = signal<string | null>(null);
  userPhone = signal<string | null>(null);

  startEditing() {
    const user = this.authService.user();
    this.formData = {
      name: user?.name || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
      avatar: user?.avatar || ''
    };
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.isEditing.set(false);
  }

  saveProfile() {
    if (!this.formData.name.trim()) return;
    this.isSaving.set(true);
    this.userService.updateProfile(this.formData).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success) {
          this.authService.refreshUserSession();
          this.userBio.set(this.formData.bio || null);
          this.userPhone.set(this.formData.phone || null);
          this.isEditing.set(false);
          this.snackBar.open('Perfil actualizado correctamente', 'Cerrar', { duration: 3000 });
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('Error al actualizar el perfil', 'Cerrar', { duration: 4000 });
      }
    });
  }
}
