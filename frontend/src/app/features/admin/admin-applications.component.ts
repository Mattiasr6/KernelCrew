import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { InstructorApplication } from '../../core/models';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Canvas (Diseño Neto de Stitch adaptado para child route) -->
    <div class="max-w-container-max mx-auto space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-on-surface">Teacher Applications</h2>
          <p class="text-on-surface-variant mt-1">Review and manage pending faculty registrations.</p>
        </div>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            class="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary text-slate-200 w-full md:w-64 transition-colors" 
            placeholder="Search applicants..."
          />
        </div>
      </div>

      <!-- Data Table Glass Card -->
      <div class="bg-slate-900/60 backdrop-blur-[12px] border-t border-l border-white/10 border-b border-r border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-white/10 bg-white/5">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Usuario</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Email</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Experiencia</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Portafolio</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (app of applications(); track app.id) {
                <tr class="hover:bg-slate-800/50 transition-colors group">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold border border-white/10">
                        {{ (app.user?.name || "").substring(0,2).toUpperCase() }}
                      </div>
                      <span class="text-slate-200 font-medium">{{ app.user?.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-300">{{ app.user?.email }}</td>
                  <td class="px-6 py-4">
                    <p class="text-slate-300 truncate max-w-[250px]" [title]="app.experience_summary">
                      {{ app.experience_summary }}
                    </p>
                  </td>
                  <td class="px-6 py-4">
                    @if (app.portfolio_url) {
                      <a [href]="app.portfolio_url" target="_blank" class="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors">
                        View <span class="material-symbols-outlined text-[16px]">open_in_new</span>
                      </a>
                    } @else {
                      <span class="text-slate-500 text-sm">N/A</span>
                    }
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        (click)="approve(app.id, app.user_id)" 
                        class="bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-sm transition-colors">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                        Aprobar
                      </button>
                      <button 
                        (click)="reject(app.id)"
                        class="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-sm transition-colors">
                        <span class="material-symbols-outlined text-[16px]">close</span>
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-slate-500">
                    No hay postulaciones pendientes.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  private applicationService = inject(ApplicationService);
  private authService = inject(AuthService);

  applications = signal<InstructorApplication[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.applicationService.getPendingApplications().subscribe({
      next: (res: any) => {
        // Ajuste para la respuesta paginada de Laravel
        this.applications.set(res.data.data || res.data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  approve(appId: number, userId: number) {
    if (!confirm('¿Estás seguro de aprobar esta solicitud? El usuario se convertirá en Docente.')) return;

    this.applicationService.approveApplication(appId).subscribe({
      next: () => {
        if (userId === this.authService.user()?.id) {
          this.authService.refreshUserSession();
        }
        this.loadApplications();
      }
    });
  }

  reject(appId: number) {
    if (!confirm('¿Rechazar esta postulación?')) return;
    
    this.applicationService.rejectApplication(appId).subscribe({
      next: () => this.loadApplications()
    });
  }
}
