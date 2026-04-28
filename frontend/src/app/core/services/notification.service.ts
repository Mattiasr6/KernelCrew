import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' = 'success') {
    const id = Date.now();
    this.toasts.update(t => [...t, { id, message, type }]);

    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
      this.toasts.update(t => t.filter(x => x.id !== id));
    }, 4000);
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
}
