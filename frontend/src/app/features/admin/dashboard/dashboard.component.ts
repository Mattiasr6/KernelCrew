import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService, AdminStats } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container animate-fade-in">
      <div class="dashboard-header mb-10">
        <h2 class="text-3xl font-bold text-white">Centro de Control</h2>
        <p class="text-slate-400">Resumen ejecutivo del rendimiento de KernelLearn.</p>
      </div>

      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="flex items-center gap-4">
            <div class="icon-wrapper blue">
              <span class="material-symbols-outlined">group</span>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Total Usuarios</p>
              <h3 class="text-3xl font-bold text-white">{{ stats()?.total_users || 0 }}</h3>
            </div>
          </div>
        </div>

        <div class="stat-card glass-card featured">
          <div class="flex items-center gap-4">
            <div class="icon-wrapper green">
              <span class="material-symbols-outlined">payments</span>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Ingresos Totales</p>
              <h3 class="text-3xl font-bold text-emerald-400">
                \${{ (stats()?.total_revenue || 0) | number:'1.2-2' }}
              </h3>
            </div>
          </div>
        </div>

        <div class="stat-card glass-card">
          <div class="flex items-center gap-4">
            <div class="icon-wrapper purple">
              <span class="material-symbols-outlined">verified_user</span>
            </div>
            <div>
              <p class="text-slate-400 text-sm">Estudiantes Activos</p>
              <h3 class="text-3xl font-bold text-purple-400">{{ stats()?.active_students || 0 }}</h3>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        <div class="glass-card p-6">
          <h4 class="text-white font-bold mb-4">Métricas de Retención</h4>
          <div class="flex items-end gap-4">
            <span class="text-5xl font-black text-blue-500">{{ stats()?.retention_rate || 0 }}%</span>
            <p class="text-slate-500 text-sm pb-2">usuarios con suscripción activa</p>
          </div>
        </div>
        <div class="glass-card p-6">
          <h4 class="text-white font-bold mb-4">Catálogo Educativo</h4>
          <div class="flex items-end gap-4">
            <span class="text-5xl font-black text-purple-500">{{ stats()?.total_courses || 0 }}</span>
            <p class="text-slate-500 text-sm pb-2">cursos publicados actualmente</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
    
    .stat-card { padding: 24px; border-radius: 20px; transition: transform 0.3s; }
    .stat-card:hover { transform: translateY(-5px); }
    .stat-card.featured { border: 1px solid rgba(16, 185, 129, 0.3); box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }

    .icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; }
    .icon-wrapper span { font-size: 32px; }
    .icon-wrapper.blue { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .icon-wrapper.green { background: rgba(16, 185, 129, 0.1); color: #10b981; }
    .icon-wrapper.purple { background: rgba(167, 139, 250, 0.1); color: #a78bfa; }
  `]
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<AdminStats | null>(null);

  ngOnInit() {
    this.adminService.getStats().subscribe({
      next: (res) => this.stats.set(res.data),
      error: (err) => console.error('Error cargando stats:', err)
    });
  }
}
