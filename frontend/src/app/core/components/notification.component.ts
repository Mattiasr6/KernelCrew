import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[2000] flex flex-col gap-3">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div 
          class="flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl animate-slide-in"
          [ngClass]="{
            'bg-emerald-500/10 border-emerald-500/20 text-emerald-400': toast.type === 'success',
            'bg-red-500/10 border-red-500/20 text-red-400': toast.type === 'error',
            'bg-blue-500/10 border-blue-500/20 text-blue-400': toast.type === 'info'
          }">
          <span class="material-symbols-outlined">
            {{ toast.type === 'success' ? 'check_circle' : toast.type === 'error' ? 'error' : 'info' }}
          </span>
          <span class="font-semibold text-sm">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.3s ease-out forwards;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
