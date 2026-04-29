import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './features/layout/components/navbar.component';
import { NotificationComponent } from './core/components/notification.component';
import { KernelAIComponent } from './features/student/kernel-ai/kernel-ai.component';
import { AuthService } from './core/services/auth.service';
import { SubscriptionService } from './core/services/subscription.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationComponent, KernelAIComponent, CommonModule],
  template: `
    <app-notification></app-notification>
    <app-navbar></app-navbar>
    <main>
      <router-outlet></router-outlet>
    </main>
    @if (showKernelAI()) {
      <app-kernel-ai></app-kernel-ai>
    }
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1;
      }
    `,
  ],
})
export class App {
  private authService = inject(AuthService);
  private subscriptionService = inject(SubscriptionService);
  
  showKernelAI = () => {
    const user = this.authService.user();
    return user?.role_id === 3;
  };
}
