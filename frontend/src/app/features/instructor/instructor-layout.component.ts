import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-zinc-950 flex">
      
      <!-- SideNavBar (Persistente) -->
      <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-zinc-900/80 backdrop-blur-xl w-64 border-r border-zinc-800 hidden md:flex">
        <div class="px-6 mb-10 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-zinc-50 tracking-tight">KernelLearn</h1>
            <p class="text-zinc-500 text-xs">Faculty Portal</p>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col px-3 gap-2">
          <a 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            routerLink="/instructor"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">dashboard</span>
            <span class="font-semibold text-sm">Dashboard</span>
          </a>
          <a 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            routerLink="/my-certificates"
            routerLinkActive="active">
            <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span class="font-medium text-sm">Mis Certificados</span>
          </a>
          <a 
            class="flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-all"
            routerLink="/instructor/courses"
            routerLinkActive="active">
            <span class="material-symbols-outlined text-[20px]">menu_book</span>
            <span class="font-medium text-sm">Mis Cursos</span>
          </a>
        </div>

        <div class="px-6 mt-auto">
          <button class="w-full py-2.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">data_usage</span>
            View Status
          </button>
        </div>
      </nav>

      <!-- Main Content Area with Router Outlet -->
      <main class="flex-1 md:ml-64 relative p-6 min-h-screen overflow-y-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    
    nav a.active {
      @apply bg-cyan-500/10 text-cyan-400 border-l-4 border-cyan-500 rounded-r-lg;
    }
    
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InstructorLayoutComponent {}
