import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-5 right-5 z-[2000] flex flex-col gap-3 pointer-events-none">
      @for (toast of notificationService.toasts(); track toast.id) {
        <div
          class="flex items-start gap-3 px-5 py-4 rounded-xl border shadow-2xl animate-slide-in pointer-events-auto"
          [ngClass]="{
            'bg-zinc-900 border-zinc-800 shadow-[0_0_15px_rgba(6,182,212,0.15)]': toast.type === 'success',
            'bg-red-500/10 border-red-500/20 text-red-400': toast.type === 'error',
            'bg-blue-500/10 border-blue-500/20 text-blue-400': toast.type === 'info'
          }">
          @if (toast.type === 'success') {
            <span class="material-symbols-outlined text-cyan-400 mt-0.5" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
            <div class="flex flex-col">
              <span class="text-sm font-semibold text-zinc-100">{{ toast.message }}</span>
              @if (toast.subtext) {
                <span class="text-xs text-zinc-500 mt-0.5">{{ toast.subtext }}</span>
              }
            </div>
          } @else {
            <span class="material-symbols-outlined">
              {{ toast.type === 'error' ? 'error' : 'info' }}
            </span>
            <span class="font-semibold text-sm">{{ toast.message }}</span>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .animate-slide-in {
      animation: slideIn 0.35s ease-out forwards;
    }
    @keyframes slideIn {
      from { transform: translateX(100%) translateY(-10px); opacity: 0; }
      to { transform: translateX(0) translateY(0); opacity: 1; }
    }
  `]
})
export class NotificationComponent {
  notificationService = inject(NotificationService);
}
