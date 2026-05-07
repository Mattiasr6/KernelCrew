import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, ChartConfiguration, ChartData, CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';
import { AdminService, AdminStats } from '../../../core/services/admin.service';

Chart.register(CategoryScale, LinearScale, BarController, BarElement, DoughnutController, ArcElement, Tooltip, Legend);

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

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Usuarios Totales</p>
                <p class="text-4xl font-black text-zinc-50">{{ stats().total_users | number }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="material-symbols-outlined text-cyan-400 text-[16px]">group</span>
                  <span class="text-xs font-medium text-cyan-400">{{ stats().enrolled_students }} con inscripciones</span>
                </div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-cyan-400 text-2xl">people</span>
              </div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Cursos Totales</p>
                <p class="text-4xl font-black text-zinc-50">{{ stats().total_courses }}</p>
                <div class="flex items-center gap-1.5 mt-2">
                  <span class="material-symbols-outlined text-violet-400 text-[16px]">check_circle</span>
                  <span class="text-xs font-medium text-violet-400">{{ stats().published_courses }} publicados</span>
                  @if (stats().pending_courses > 0) {
                    <span class="text-xs text-amber-400 ml-1">({{ stats().pending_courses }} en revisión)</span>
                  }
                </div>
              </div>
              <div class="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-violet-400 text-2xl">school</span>
              </div>
            </div>
          </div>

          <div class="kpi-card">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">Ingresos Totales</p>
                <p class="text-4xl font-black text-amber-400">\${{ stats().total_revenue | number:'1.2-2' }}</p>
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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="chart-card">
            <div class="flex items-center justify-between mb-6">
              <div><h3 class="text-base font-bold text-zinc-100">Ingresos Mensuales</h3><p class="text-xs text-zinc-500 mt-0.5">Créditos generados por mes</p></div>
              <span class="text-xs font-semibold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full">Últ. 6 meses</span>
            </div>
            <div class="chart-wrapper"><canvas baseChart [type]="'bar'" [data]="barChartData" [options]="barChartOptions"></canvas></div>
          </div>
          <div class="chart-card">
            <div class="flex items-center justify-between mb-6">
              <div><h3 class="text-base font-bold text-zinc-100">Categorías Populares</h3><p class="text-xs text-zinc-500 mt-0.5">Inscripciones por categoría</p></div>
              <span class="text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full">{{ stats().total_enrollments }} total</span>
            </div>
            <div class="chart-wrapper flex items-center justify-center" style="max-width:240px;width:100%;margin:0 auto">
              <canvas baseChart [type]="'doughnut'" [data]="doughnutChartData" [options]="doughnutChartOptions"></canvas>
            </div>
            <div class="flex items-center justify-center gap-4 mt-4 flex-wrap">
              @for (item of doughnutLegend; track item.label) {
                <div class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full shrink-0" [style.background-color]="item.color"></span><span class="text-xs text-zinc-400">{{ item.label }} <span class="text-zinc-200 font-semibold">{{ item.value }}</span></span></div>
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

  stats = signal<AdminStats>({ total_users: 0, active_users: 0, inactive_users: 0, enrolled_students: 0, total_revenue: 0, total_courses: 0, published_courses: 0, pending_courses: 0, total_enrollments: 0, retention_rate: 0, category_distribution: [] });

  barChartData: ChartData<'bar'> = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{ data: [1200, 1900, 3000, 5000, 4200, 6000], backgroundColor: '#8b5cf6', borderRadius: 6, barThickness: 36, hoverBackgroundColor: '#a78bfa' }],
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: true, aspectRatio: 2.2,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', titleColor: '#f4f4f5', bodyColor: '#a1a1aa', borderColor: '#27272a', borderWidth: 1, cornerRadius: 8, padding: 12 } },
    scales: { x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 12 } }, border: { color: '#27272a' } }, y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#71717a', font: { size: 12 }, callback: (v) => `${(Number(v) / 1000).toFixed(1)}k` as any }, border: { color: '#27272a' }, beginAtZero: true } },
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [{ data: [], backgroundColor: [], borderColor: '#18181b', borderWidth: 3, hoverBorderColor: '#27272a' }],
  };

  doughnutChartOptions: any = { responsive: true, maintainAspectRatio: true, cutout: '68%', plugins: { legend: { display: false }, tooltip: { backgroundColor: '#18181b', titleColor: '#f4f4f5', bodyColor: '#a1a1aa', borderColor: '#27272a', borderWidth: 1, cornerRadius: 8, padding: 12 } } };

  doughnutLegend: { label: string; value: number; color: string }[] = [];

  private readonly categoryColors = ['#22d3ee', '#8b5cf6', '#f59e0b', '#10b981', '#f43f5e', '#6366f1', '#ec4899', '#14b8a6'];

  ngOnInit() {
    this.adminService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          this.stats.set(res.data);
          this.updateDonutChart(res.data.category_distribution);
        }
      },
    });
  }

  private updateDonutChart(categories: { name: string; count: number }[]) {
    const total = categories.reduce((s, c) => s + c.count, 0);
    this.doughnutChartData = {
      labels: categories.map(c => c.name),
      datasets: [{
        data: categories.map(c => c.count),
        backgroundColor: categories.map((_, i) => this.categoryColors[i % this.categoryColors.length]),
        borderColor: '#18181b',
        borderWidth: 3,
        hoverBorderColor: '#27272a',
      }],
    };
    this.doughnutLegend = categories.map((c, i) => ({
      label: c.name,
      value: c.count,
      color: this.categoryColors[i % this.categoryColors.length],
    }));
  }
}
