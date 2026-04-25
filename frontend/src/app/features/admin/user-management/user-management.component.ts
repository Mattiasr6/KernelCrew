import { Component } from '@angular/core';

@Component({
  selector: 'app-user-management',
  standalone: true,
  template: `
    <h2>Gestión de Usuarios</h2>
    <div class="table-container">
      <p>Aquí podrás gestionar roles y estados de los usuarios.</p>
    </div>
  `,
  styles: [`.table-container { background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin-top: 20px; }`]
})
export class UserManagementComponent {}
