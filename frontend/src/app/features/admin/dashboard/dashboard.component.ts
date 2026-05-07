import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="px-4 py-6 md:py-10 animate-fade-in">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10">
          <h1 class="text-3xl font-bold tracking-tight text-zinc-50">Centro de Control</h1>
          <p class="text-sm text-zinc-500 mt-1">Resumen ejecutivo de KernelLearn en tiempo real</p>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <!-- Usuarios Totales -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Usuarios Totales</p>
                <p class="text-4xl font-black text-zinc-50">{{ (stats()?.total_users ?? 0) | number }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="material-symbols-outlined text-cyan-400 text-[16px]">people</span>
                  <span class="text-xs font-medium text-cyan-400">{{ (stats()?.active_students ?? 0) }} activos</span>
                </div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-cyan-400 text-2xl">people</span>
              </div>
            </div>
          </div>

          <!-- Cursos Totales -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Cursos Totales</p>
                <p class="text-4xl font-black text-zinc-50">{{ stats()?.total_courses ?? 0 }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="material-symbols-outlined text-violet-400 text-[16px]">school</span>
                  <span class="text-xs font-medium text-violet-400">{{ stats()?.retention_rate ?? 0 }}% retención</span>
                </div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-violet-400 text-2xl">school</span>
              </div>
            </div>
          </div>

          <!-- Ingresos -->
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Ingresos Totales</p>
                <p class="text-4xl font-black text-amber-400">\${{ ((stats()?.total_revenue ?? 0) / 100) | number:'1.2-2' }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="material-symbols-outlined text-amber-400 text-[16px]" style="font-variation-settings: 'FILL' 1;">database</span>
                  <span class="text-xs font-medium text-amber-400">USD</span>
                </div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-amber-400 text-2xl" style="font-variation-settings: 'FILL' 1;">database</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Bar Chart: Ingresos Mensuales -->
          <div class="chart-card">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-base font-bold text-zinc-100">Ingresos Mensuales</h3>
                <p class="text-xs text-zinc-500 mt-0.5">Créditos generados por mes</p>
              </div>
              <span class="text-xs font-semibold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">Últ. 6 meses</span>
            </div>
            <div class="chart-wrapper">
              <canvas baseChart [type]="'bar'" [data]="barChartData" [options]="barChartOptions"></canvas>
            </div>
          </div>

          <!-- Doughnut Chart: Usuarios por Rol -->
          <div class="chart-card">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h3 class="text-base font-bold text-zinc-100">Usuarios por Rol</h3>
                <p class="text-xs text-zinc-500 mt-0.5">Distribución de la plataforma</p>
              </div>
              <span class="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">Total {{ stats()?.total_users ?? 0 }}</span>
            </div>
            <div class="chart-wrapper flex items-center justify-center">
              <div style="max-width: 240px; width: 100%;">
                <canvas baseChart [type]="'doughnut'" [data]="doughnutChartData" [options]="doughnutChartOptions"></canvas>
              </div>
            </div>
            <div class="flex items-center justify-center gap-6 mt-4">
              @for (item of doughnutLegend; track item.label) {
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full shrink-0" [style.background-color]="item.color"></span>
                  <span class="text-xs text-zinc-400">{{ item.label }} <span class="text-zinc-200 font-semibold">{{ item.value }}%</span></span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    .kpi-card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 24px 28px; transition: all 0.25s ease; }
    .kpi-card:hover { border-color: #3f3f46; transform: translateY(-2px); }
    .chart-card { background: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 28px; }
    .chart-wrapper { position: relative; width: 100%; }
  `],
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private destroyRef = inject(DestroyRef);

  stats = signal<AdminStats | null>(null);

  ngOnInit() {
    this.adminService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) this.stats.set(res.data);
      },
    });
  }

  barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{ data: [1200, 1900, 3000, 5000, 4200, 6000], backgroundColor: '#8b5cf6', borderRadius: 6, barThickness: 36, hoverBackgroundColor: '#a78bfa' }],
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', titleColor: '#f4f4f5', bodyColor: '#a1a1aa', borderColor: '#27272a', borderWidth: 1, cornerRadius: 8, padding: 12 } },
    scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 12 } }, border: { color: '#27272a' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 12 }, callback: (val) => `${(Number(val) / 1000).toFixed(1)}k` }, border: { color: '#27272a' }, beginAtZero: true } },
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: ['Estudiantes', 'Instructores', 'Admins'],
    datasets: [{ data: [85, 12, 3], backgroundColor: ['#22d3ee', '#8b5cf6', '#3f3f46'], borderColor: '#18181b', borderWidth: 3, hoverBorderColor: '#27272a', hoverBackgroundColor: ['#67e8f9', '#a78bfa', '#52525b'] }],
  };

  doughnutChartOptions: any = { responsive: true, maintainAspectRatio: true, cutout: '68%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', titleColor: '#f4f4f5', bodyColor: '#a1a1aa', borderColor: '#27272a', borderWidth: 1, cornerRadius: 8, padding: 12 } } };

  doughnutLegend = [
    { label: 'Estudiantes', value: 85, color: '#22d3ee' },
    { label: 'Instructores', value: 12, color: '#8b5cf6' },
    { label: 'Admins', value: 3, color: '#3f3f46' },
  ];
}
