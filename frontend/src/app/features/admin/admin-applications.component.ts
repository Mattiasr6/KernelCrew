import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { InstructorApplication } from '../../core/models';

@Component({
  selector: 'app-admin-applications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold text-zinc-50">Postulaciones de Instructores</h2>
          <p class="text-zinc-400 mt-1">Revisa y gestiona las solicitudes de nuevos docentes.</p>
        </div>
        <div class="relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
          <input
            type="text"
            class="bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-cyan-500 text-zinc-300 w-full md:w-64 transition-colors placeholder-zinc-600"
            placeholder="Buscar postulantes..."
          />
        </div>
      </div>

      <div class="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-zinc-800 bg-zinc-900/50">
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Usuario</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Email</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Experiencia</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">Portafolio</th>
                <th class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-500 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-800">
              @for (app of applications(); track app.id) {
                <tr class="hover:bg-zinc-800/30 transition-colors group">
                  <td class="px-6 py-4" data-label="Usuario">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center font-bold text-white border border-zinc-700 text-sm">
                        {{ (app.user?.name || "").substring(0,2).toUpperCase() }}
                      </div>
                      <span class="text-zinc-200 font-medium">{{ app.user?.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-zinc-400 text-sm" data-label="Email">{{ app.user?.email }}</td>
                  <td class="px-6 py-4" data-label="Experiencia">
                    <p class="text-zinc-400 text-sm truncate max-w-[250px]" [title]="app.experience_summary">
                      {{ app.experience_summary }}
                    </p>
                  </td>
                  <td class="px-6 py-4" data-label="Portafolio">
                    <div class="flex flex-col gap-1">
                      @if (app.portfolio_url) {
                        <a [href]="app.portfolio_url" target="_blank" class="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors text-sm">
                          <span class="material-symbols-outlined text-[16px]">open_in_new</span> Portafolio
                        </a>
                      }
                      @if (app.resume_path) {
                        <a [href]="applicationService.getResumeDownloadUrl(app.id)" target="_blank" class="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-sm">
                          <span class="material-symbols-outlined text-[16px]">description</span> CV (PDF)
                        </a>
                      }
                      @if (!app.portfolio_url && !app.resume_path) {
                        <span class="text-zinc-500 text-sm">N/A</span>
                      }
                    </div>
                  </td>
                  <td class="px-6 py-4 text-right" data-label="Acciones">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        (click)="approve(app.id, app.user_id)"
                        class="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-sm transition-colors">
                        <span class="material-symbols-outlined text-[16px]">check</span>
                        Aprobar
                      </button>
                      <button
                        (click)="reject(app.id)"
                        class="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 rounded-full px-3 py-1 flex items-center gap-1 text-sm transition-colors">
                        <span class="material-symbols-outlined text-[16px]">close</span>
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="px-6 py-10 text-center text-zinc-500">
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
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    @media (max-width: 767px) {
      table, thead, tbody, th, td, tr { display: block; }
      thead { display: none; }
      tr {
        padding: 16px;
        margin-bottom: 12px;
        background: #18181b;
        border: 1px solid #27272a;
        border-radius: 12px;
      }
      td {
        padding: 6px 0 !important;
        border: none !important;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      td::before {
        content: attr(data-label);
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: #71717a;
        min-width: 90px;
        flex-shrink: 0;
        padding-top: 2px;
      }
      td[data-label="Acciones"] {
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
        padding-top: 8px !important;
        border-top: 1px solid #27272a !important;
      }
      td[data-label="Acciones"] .opacity-0 { opacity: 1 !important; }
      td[data-label="Acciones"] .group-hover\\:opacity-100 { opacity: 1 !important; }
      td[data-label="Usuario"] {
        font-weight: 600;
        font-size: 1rem;
      }
    }
  `]
})
export class AdminApplicationsComponent implements OnInit {
  protected applicationService = inject(ApplicationService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  applications = signal<InstructorApplication[]>([]);
  isLoading = signal(false);

  ngOnInit() {
    this.loadApplications();
  }

  loadApplications() {
    this.isLoading.set(true);
    this.applicationService.getPendingApplications().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    this.applicationService.approveApplication(appId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
    
    this.applicationService.rejectApplication(appId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.loadApplications()
    });
  }
}
