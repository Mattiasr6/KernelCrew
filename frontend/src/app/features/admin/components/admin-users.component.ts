import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
  ],
  template: `
    <div class="admin-container">
      <div class="header">
        <h1>Gestión de Usuarios</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Usuario
        </button>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Buscar usuarios</mat-label>
        <input
          matInput
          [(ngModel)]="search"
          placeholder="Nombre o email"
          (keyup.enter)="loadUsers()"
        />
        <mat-icon matSuffix>search</mat-icon>
      </mat-form-field>

      <mat-form-field appearance="outline" class="role-filter">
        <mat-label>Filtrar por rol</mat-label>
        <mat-select [(ngModel)]="roleFilter" (selectionChange)="loadUsers()">
          <mat-option value="">Todos</mat-option>
          <mat-option value="admin">Admin</mat-option>
          <mat-option value="instructor">Instructor</mat-option>
          <mat-option value="student">Estudiante</mat-option>
        </mat-select>
      </mat-form-field>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="users-table">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>ID</th>
            <td mat-cell *matCellDef="let user">{{ user.id }}</td>
          </ng-container>

          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Nombre</th>
            <td mat-cell *matCellDef="let user">{{ user.name }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let user">{{ user.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rol</th>
            <td mat-cell *matCellDef="let user">
              <mat-chip [class]="'role-' + user.role">{{ user.role }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let user">
              <button mat-icon-button color="primary" (click)="openDialog(user)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteUser(user)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <mat-paginator
          [length]="totalItems"
          [pageSize]="pageSize"
          [pageIndex]="currentPage - 1"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="onPageChange($event)"
        >
        </mat-paginator>
      }
    </div>

    @if (showDialog) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <h2>{{ editingUser ? 'Editar' : 'Nuevo' }} Usuario</h2>
          <form [formGroup]="form" (ngSubmit)="saveUser()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre</mat-label>
              <input matInput formControlName="name" />
              @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
                <mat-error>El nombre es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" />
              @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                <mat-error>El email es requerido</mat-error>
              }
              @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                <mat-error>Ingresa un email válido</mat-error>
              }
            </mat-form-field>

            @if (!editingUser) {
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Contraseña</mat-label>
                <input matInput type="password" formControlName="password" />
                @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                  <mat-error>La contraseña es requerida</mat-error>
                }
                @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                  <mat-error>Mínimo 8 caracteres</mat-error>
                }
              </mat-form-field>
            }

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Rol</mat-label>
              <mat-select formControlName="role">
                <mat-option value="student">Estudiante</mat-option>
                <mat-option value="instructor">Instructor</mat-option>
                <mat-option value="admin">Admin</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()">Cancelar</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="form.invalid || saving"
              >
                @if (saving) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  Guardar
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .admin-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        h1 {
          margin: 0;
        }
      }
      .search-field {
        width: 300px;
        margin-right: 16px;
      }
      .role-filter {
        width: 200px;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
      .users-table {
        width: 100%;
        margin-bottom: 16px;
      }
      mat-chip.role-admin {
        background-color: #9c27b0 !important;
        color: white !important;
      }
      mat-chip.role-instructor {
        background-color: #2196f3 !important;
        color: white !important;
      }
      mat-chip.role-student {
        background-color: #4caf50 !important;
        color: white !important;
      }
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .dialog-content {
        background: white;
        padding: 24px;
        border-radius: 8px;
        width: 400px;
        max-width: 90%;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }
    `,
  ],
})
export class AdminUsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['id', 'name', 'email', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();

  users = signal<User[]>([]);
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;

  search = '';
  roleFilter = '';
  loading = false;
  saving = false;

  showDialog = false;
  editingUser: User | null = null;
  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['student', Validators.required],
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService
      .getUsers({
        page: this.currentPage,
        per_page: this.pageSize,
        search: this.search || undefined,
        role: this.roleFilter || undefined,
      })
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
          this.dataSource.data = response.data;
          this.totalItems = response.meta.total;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
        },
      });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  openDialog(user?: User): void {
    this.editingUser = user || null;
    if (user) {
      this.form.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      this.form.reset({ role: 'student' });
    }
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingUser = null;
    this.form.reset({ role: 'student' });
  }

  saveUser(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const data = this.form.value;

    if (this.editingUser) {
      this.userService.updateUser(this.editingUser.id, data).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado', 'Cerrar', { duration: 3000 });
          this.closeDialog();
          this.loadUsers();
          this.saving = false;
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al actualizar usuario', 'Cerrar', { duration: 3000 });
        },
      });
    } else {
      this.userService.createUser(data).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado', 'Cerrar', { duration: 3000 });
          this.closeDialog();
          this.loadUsers();
          this.saving = false;
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al crear usuario', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`¿Eliminar usuario ${user.name}?`)) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado', 'Cerrar', { duration: 3000 });
          this.loadUsers();
        },
        error: () => {
          this.snackBar.open('Error al eliminar usuario', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}
