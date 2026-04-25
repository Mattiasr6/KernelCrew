import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <div class="dashboard-header">
      <h2>Panel de Estadísticas</h2>
      <p>Bienvenido al centro de control de CodeCore.</p>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><h3>150</h3><p>Usuarios</p></div>
      <div class="stat-card"><h3>45</h3><p>Cursos</p></div>
      <div class="stat-card"><h3>$1,500</h3><p>Ingresos</p></div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; }
    .stat-card { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
  `]
})
export class DashboardComponent {}
