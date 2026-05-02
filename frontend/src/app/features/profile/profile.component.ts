import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { SubscriptionService } from '../../core/services/subscription.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="profile-container">
      <div class="max-w-2xl mx-auto w-full">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-3xl font-bold text-zinc-50">Mi Perfil</h1>
          @if (!isEditing()) {
            <button class="edit-btn" (click)="startEditing()">
              <mat-icon>edit</mat-icon>
              Editar Perfil
            </button>
          }
        </div>

        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar">
              @if (authService.user()?.avatar) {
                <img [src]="authService.user()?.avatar" alt="Avatar" class="avatar-img" />
              } @else {
                <mat-icon class="avatar-icon">person</mat-icon>
              }
            </div>
            <div class="user-info">
              <h2 class="text-xl font-semibold text-zinc-50">{{ authService.user()?.name || 'Usuario' }}</h2>
              <span class="role-badge">{{ authService.user()?.role | titlecase }}</span>
            </div>
          </div>

          @if (isEditing()) {
            <form (ngSubmit)="saveProfile()" class="edit-form">
              <div class="form-group">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-input" [(ngModel)]="formData.name" name="name" placeholder="Tu nombre" />
              </div>
              <div class="form-group">
                <label class="form-label">Avatar (URL)</label>
                <input type="url" class="form-input" [(ngModel)]="formData.avatar" name="avatar" placeholder="https://ejemplo.com/avatar.jpg" />
              </div>
              <div class="form-group">
                <label class="form-label">Biografía</label>
                <textarea class="form-input form-textarea" [(ngModel)]="formData.bio" name="bio" placeholder="Cuéntanos sobre ti..." rows="3"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono</label>
                <input type="tel" class="form-input" [(ngModel)]="formData.phone" name="phone" placeholder="+51 999 999 999" />
              </div>
              <div class="form-actions">
                <button type="button" class="cancel-btn" (click)="cancelEditing()">Cancelar</button>
                <button type="submit" class="save-btn" [disabled]="isSaving()">
                  @if (isSaving()) {
                    Guardando...
                  } @else {
                    <mat-icon>check</mat-icon>
                    Guardar Cambios
                  }
                </button>
              </div>
            </form>
          } @else {
            <div class="info-section">
              <div class="info-row">
                <div class="info-icon"><mat-icon>email</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ authService.user()?.email || 'Cargando...' }}</span>
                </div>
              </div>
              <div class="info-row">
                <div class="info-icon"><mat-icon>badge</mat-icon></div>
                <div class="info-content">
                  <span class="info-label">ID de Usuario</span>
                  <span class="info-value">#{{ authService.user()?.id }}</span>
                </div>
              </div>
              @if (userBio()) {
                <div class="info-row">
                  <div class="info-icon"><mat-icon>description</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Biografía</span>
                    <span class="info-value">{{ userBio() }}</span>
                  </div>
                </div>
              }
              @if (userPhone()) {
                <div class="info-row">
                  <div class="info-icon"><mat-icon>phone</mat-icon></div>
                  <div class="info-content">
                    <span class="info-label">Teléfono</span>
                    <span class="info-value">{{ userPhone() }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="subscription-card mt-6">
          <div class="card-header">
            <mat-icon>workspace_premium</mat-icon>
            <h3 class="text-lg font-semibold text-zinc-50">Estado de Suscripción</h3>
          </div>

          @if (subscriptionLoading()) {
            <div class="loading-state">
              <mat-progress-spinner diameter="32" mode="indeterminate"></mat-progress-spinner>
            </div>
          } @else if (activeSubscription()) {
            <div class="subscription-details">
              <div class="sub-info">
                <span class="sub-label">Plan Actual</span>
                <span class="sub-value" style="color: #06b6d4;">{{ activeSubscription()?.plan?.name }}</span>
              </div>
              <div class="sub-info">
                <span class="sub-label">Fecha de Expiración</span>
                <span class="sub-value">{{ activeSubscription()?.end_date | date: 'dd MMM yyyy' }}</span>
              </div>
              <div class="sub-info">
                <span class="sub-label">Estado</span>
                <span class="sub-value">
                  <span class="status-badge status-active">Activa</span>
                </span>
              </div>
              <div class="sub-info auto-renew-section">
                <span class="sub-label">Renovación Automática</span>
                <label class="toggle-switch">
                  <input type="checkbox" [checked]="activeSubscription()?.auto_renew" (change)="toggleAutoRenew($event)" />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          } @else {
            <div class="empty-subscription">
              <mat-icon>warning</mat-icon>
              <p class="text-zinc-500">No tienes una suscripción activa</p>
              <button class="upgrade-btn" routerLink="/subscriptions">Ver Planes</button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container { min-height: 100vh; background: #09090b; padding: 40px 20px; }
    .edit-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); color: #06b6d4; border-radius: 8px; font-weight: 500; cursor: pointer; }
    .edit-btn:hover { background: rgba(6, 182, 212, 0.2); }
    .profile-card, .subscription-card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; }
    .avatar-section { display: flex; align-items: center; gap: 20px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #27272a; }
    .avatar { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #06b6d4); display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .avatar-img { width: 100%; height: 100%; object-fit: cover; }
    .avatar-icon { font-size: 40px; color: white; }
    .user-info { display: flex; flex-direction: column; gap: 8px; }
    .role-badge { display: inline-block; background: rgba(139, 92, 246, 0.2); color: #a78bfa; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 500; width: fit-content; }
    .edit-form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { color: #a1a1aa; font-size: 0.875rem; font-weight: 500; }
    .form-input { background: #09090b; border: 1px solid #27272a; border-radius: 8px; padding: 12px 16px; color: #fafafa; font-size: 1rem; }
    .form-input:focus { outline: none; border-color: #06b6d4; }
    .form-textarea { resize: vertical; min-height: 80px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 12px; }
    .cancel-btn { padding: 10px 24px; background: transparent; border: 1px solid #3f3f46; color: #a1a1aa; border-radius: 8px; font-weight: 500; cursor: pointer; }
    .save-btn { display: flex; align-items: center; gap: 8px; padding: 10px 24px; background: linear-gradient(135deg, #8b5cf6, #7c3aed); border: none; color: white; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .save-btn:hover:not(:disabled) { box-shadow: 0 0 20px rgba(139, 92, 246, 0.4); }
    .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }
    .info-section { display: flex; flex-direction: column; gap: 16px; }
    .info-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px; background: #09090b; border-radius: 12px; }
    .info-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(139, 92, 246, 0.1); display: flex; align-items: center; justify-content: center; }
    .info-icon mat-icon { color: #a78bfa; }
    .info-content { display: flex; flex-direction: column; gap: 4px; }
    .info-label { color: #71717a; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    .info-value { color: #fafafa; font-size: 1rem; }
    .subscription-card .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #27272a; }
    .subscription-card .card-header mat-icon { color: #8b5cf6; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
    .subscription-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 20px; }
    .sub-info { display: flex; flex-direction: column; gap: 8px; }
    .sub-label { color: #71717a; font-size: 0.875rem; }
    .sub-value { font-size: 1rem; font-weight: 500; color: #fafafa; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 0.875rem; font-weight: 500; background: rgba(16, 185, 129, 0.2); color: #10b981; }
    .auto-renew-section { align-items: center; }
    .toggle-switch { position: relative; display: inline-block; width: 48px; height: 26px; }
    .toggle-switch input { opacity: 0; width: 0; height: 0; }
    .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #3f3f46; border-radius: 26px; transition: 0.3s; }
    .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.3s; }
    .toggle-switch input:checked + .toggle-slider { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 0 12px rgba(139, 92, 246, 0.5); }
    .toggle-switch input:checked + .toggle-slider:before { transform: translateX(22px); }
    .empty-subscription { text-align: center; padding: 24px; }
    .empty-subscription mat-icon { font-size: 48px; color: #71717a; margin-bottom: 16px; }
    .upgrade-btn { margin-top: 16px; padding: 10px 24px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); color: #06b6d4; border-radius: 8px; font-weight: 500; cursor: pointer; }
    .upgrade-btn:hover { background: rgba(6, 182, 212, 0.2); }
    .mt-6 { margin-top: 24px; }
  `]
})
export class ProfileComponent {
  authService = inject(AuthService);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private subscriptionService = inject(SubscriptionService);

  isEditing = signal(false);
  isSaving = signal(false);
  formData = { name: '', bio: '', phone: '', avatar: '' };
  
  subscriptionLoading = signal(true);
  activeSubscription = signal<any>(null);
  userBio = signal<string | null>(null);
  userPhone = signal<string | null>(null);

  constructor() {
    this.loadSubscription();
  }

  loadSubscription() {
    this.subscriptionLoading.set(true);
    this.subscriptionService.getActive().subscribe({
      next: (res: any) => {
        if (res.success && res.data?.subscription) {
          this.activeSubscription.set(res.data.subscription);
        }
        this.subscriptionLoading.set(false);
      },
      error: () => {
        this.subscriptionLoading.set(false);
      }
    });
  }

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
    this.isSaving.set(true);
    this.userService.updateProfile(this.formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.authService.refreshUserSession();
          this.userBio.set(this.formData.bio || null);
          this.userPhone.set(this.formData.phone || null);
          this.isEditing.set(false);
          this.notification.success('Perfil actualizado correctamente');
        }
        this.isSaving.set(false);
      },
      error: () => {
        this.notification.error('Error al actualizar el perfil');
        this.isSaving.set(false);
      }
    });
  }

  toggleAutoRenew(event: Event) {
    const target = event.target as HTMLInputElement;
    const sub = this.activeSubscription();
    if (sub) {
      this.subscriptionService.updateAutoRenew(sub.id, target.checked).subscribe({
        next: () => {
          sub.auto_renew = target.checked;
          this.activeSubscription.set({...sub});
          this.notification.success(target.checked ? 'Renovación automática activada' : 'Renovación automática desactivada');
        },
        error: () => {
          target.checked = !target.checked;
          this.notification.error('Error al actualizar la renovación');
        }
      });
    }
  }
}