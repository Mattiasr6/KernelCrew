import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-student-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-zinc-900/80 backdrop-blur-lg h-screen w-64 border-r border-zinc-800 shadow-2xl z-40 hidden md:flex">
      <div class="px-6 mb-10 flex items-center gap-4">
        <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg">
          <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        </div>
        <div>
          <h1 class="text-lg font-black text-zinc-100 tracking-tight">KernelLearn</h1>
          <p class="font-inter text-zinc-400 text-xs">Student Portal</p>
        </div>
      </div>
      
      <div class="flex-1 flex flex-col px-3 gap-2">
        <a 
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all font-inter"
          routerLink="/dashboard"
          routerLinkActive="bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-r-lg"
          [routerLinkActiveOptions]="{ exact: true }">
          <span class="material-symbols-outlined text-[20px]">home</span>
          <span class="font-medium text-sm">Home</span>
        </a>
        <a 
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all font-inter"
          routerLink="/my-certificates"
          routerLinkActive="bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-r-lg">
          <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
          <span class="font-semibold text-sm">Mis Certificados</span>
        </a>
        @if (!authService.isInstructor()) {
          <a 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all font-inter"
            routerLink="/become-teacher"
            routerLinkActive="bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-r-lg">
            <span class="material-symbols-outlined text-[20px]">school</span>
            <span class="font-medium text-sm">Ser Instructor</span>
          </a>
        }
      </div>

      <div class="px-6 mt-auto">
        <button class="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-400 font-inter text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-sm">
          <span class="material-symbols-outlined text-[18px]">data_usage</span>
          Estado
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class StudentSidebarComponent {
  authService = inject(AuthService);
}
