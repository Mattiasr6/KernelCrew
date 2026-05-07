import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  subtext?: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  toasts = signal<Toast[]>([]);
  private nextId = 1;

  show(message: string, type: 'success' | 'error' | 'info' = 'success', subtext?: string) {
    const id = this.nextId++;
    this.toasts.update(t => [...t, { id, message, subtext, type }]);

    setTimeout(() => {
      this.toasts.update(t => t.filter(x => x.id !== id));
    }, 4000);
  }

  success(msg: string, subtext?: string) { this.show(msg, 'success', subtext); }
  error(msg: string) { this.show(msg, 'error'); }
}
