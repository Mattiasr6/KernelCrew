import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            <mat-icon>person</mat-icon>
          </div>
          <h1>{{ authService.user()?.name || 'Usuario' }}</h1>
          <span class="role">{{ authService.user()?.role | titlecase }}</span>
        </div>
        
        <mat-card-content>
          <div class="info-row">
            <mat-icon>email</mat-icon>
            <span>{{ authService.user()?.email || 'Cargando...' }}</span>
          </div>
          
          <div class="info-row">
            <mat-icon>badge</mat-icon>
            <span>ID: {{ authService.user()?.id || 'N/A' }}</span>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #0f0f1a;
      padding: 20px;
    }
    .profile-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 32px;
      max-width: 400px;
      width: 100%;
      backdrop-filter: blur(10px);
    }
    .profile-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 24px;
    }
    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6c63ff, #00d9ff);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .avatar mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: white;
    }
    h1 {
      color: #e0e0e0;
      margin: 0 0 8px 0;
      font-size: 1.5rem;
    }
    .role {
      color: #6c63ff;
      font-weight: 500;
      background: rgba(108, 99, 255, 0.2);
      padding: 4px 16px;
      border-radius: 16px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #e0e0e0;
    }
    .info-row mat-icon {
      color: #a0a0a0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
  `],
})
export class ProfileComponent {
  authService = inject(AuthService);
}