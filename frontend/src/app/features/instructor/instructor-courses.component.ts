import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatChipsModule,
    MatSlideToggleModule,
  ],
  template: `
    <div class="instructor-courses-container animate-fade-in">
      <div class="header-section">
        <div>
          <h1 class="text-3xl font-bold text-white">Gestión de Cursos</h1>
          <p class="text-slate-400 mt-1">Crea y administra tus contenidos educativos.</p>
        </div>
        <button class="add-btn" (click)="openDialog()">
          <span class="material-symbols-outlined">add_circle</span>
          Nuevo Curso
        </button>
      </div>

      <div class="table-card glass-card">
        @if (isLoading()) {
          <div class="loading-overlay">
            <mat-spinner diameter="50"></mat-spinner>
          </div>
        }

        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Título</th>
                <th>Nivel</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (course of courses(); track course.id) {
                <tr class="hover-row">
                  <td>
                    <span class="status-badge" [class.published]="course.status === 'published'">
                      {{ course.status === 'published' ? 'Publicado' : 'Borrador' }}
                    </span>
                  </td>
                  <td>
                    <span class="font-semibold text-slate-200">{{ course.title }}</span>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="'badge-' + course.level">
                      {{ course.level | uppercase }}
                    </span>
                  </td>
                  <td class="text-slate-300">{{ course.category }}</td>
                  <td class="font-mono text-emerald-400">\${{ course.price }}</td>
                  <td class="text-right">
                    <div class="action-group">
                      <button class="icon-btn edit" (click)="openDialog(course)" title="Editar">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="icon-btn delete" (click)="deleteCourse(course)" title="Eliminar">
                        <span class="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="empty-state">
                    <span class="material-symbols-outlined text-5xl mb-3 block">menu_book</span>
                    Aún no has creado ningún curso.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal de Creación/Edición -->
    @if (showDialog) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content glass-card" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold text-white mb-6">
            {{ editingCourse ? 'Editar' : 'Crear Nuevo' }} Curso
          </h2>
          
          <form [formGroup]="form" (ngSubmit)="saveCourse()" class="space-y-4">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título del Curso</mat-label>
              <input matInput formControlName="title" placeholder="Ej: Master en Angular" />
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <mat-error>{{ getErrorMessage('title') }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea matInput formControlName="description" rows="3"></textarea>
              @if (form.get('description')?.invalid && form.get('description')?.touched) {
                <mat-error>{{ getErrorMessage('description') }}</mat-error>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nivel</mat-label>
                <mat-select formControlName="level">
                  <mat-option value="beginner">Básico</mat-option>
                  <mat-option value="intermediate">Intermedio</mat-option>
                  <mat-option value="advanced">Avanzado</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Categoría</mat-label>
                <mat-select formControlName="category">
                  @for (cat of categories; track cat) {
                    <mat-option [value]="cat">{{ cat }}</mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Duración (Horas)</mat-label>
                <input matInput type="number" formControlName="duration_hours" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Precio ($)</mat-label>
                <input matInput type="number" formControlName="price" />
              </mat-form-field>
            </div>

            @if (errorMessage()) {
              <div class="error-banner">
                <span class="material-symbols-outlined">error</span>
                {{ errorMessage() }}
              </div>
            }

            <div class="dialog-actions">
              <button mat-button type="button" (click)="closeDialog()" class="cancel-btn">Cancelar</button>
              <button
                class="save-btn"
                type="submit"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  {{ editingCourse ? 'Actualizar' : 'Publicar Curso' }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .instructor-courses-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 10px 24px;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
      cursor: pointer;
    }

    .add-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4); }

    .table-card {
      position: relative;
      min-height: 400px;
      border-radius: 20px;
      overflow: hidden;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .data-table th {
      padding: 16px 24px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #94a3b8;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .data-table td {
      padding: 16px 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      vertical-align: middle;
    }

    .hover-row:hover { background: rgba(255, 255, 255, 0.02); }

    .status-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 700;
      background: rgba(148, 163, 184, 0.1);
      color: #94a3b8;
      border: 1px solid rgba(148, 163, 184, 0.2);
    }

    .status-badge.published {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .badge { padding: 4px 10px; border-radius: 8px; font-size: 0.7rem; font-weight: 600; }
    .badge-beginner { background: #064e3b; color: #6ee7b7; }
    .badge-intermediate { background: #78350f; color: #fcd34d; }
    .badge-advanced { background: #7f1d1d; color: #fca5a5; }

    .action-group { display: flex; justify-content: flex-end; gap: 8px; }
    
    .icon-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s;
    }

    .icon-btn:hover { background: rgba(255, 255, 255, 0.1); color: white; }
    .icon-btn.delete:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: #f8717144; }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .dialog-content {
      width: 600px;
      max-width: 95%;
      padding: 32px;
      border-radius: 24px;
      background: #0f172a;
    }

    .full-width { width: 100%; }
    .form-row { display: flex; gap: 16px; }
    .form-row mat-form-field { flex: 1; }

    .save-btn {
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      color: white;
      padding: 12px 32px;
      border-radius: 12px;
      font-weight: 600;
      border: none;
      cursor: pointer;
    }

    .error-banner {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #f87171;
      padding: 12px;
      border-radius: 12px;
      font-size: 0.9rem;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(15, 23, 42, 0.4);
      z-index: 10;
    }

    .empty-state {
      text-align: center;
      padding: 80px !important;
      color: #64748b;
    }
  `]
})
export class InstructorCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  courses = signal<Course[]>([]);
  isLoading = signal(true);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);

  showDialog = false;
  editingCourse: Course | null = null;

  categories = ['Desarrollo Web', 'Móvil', 'Data Science', 'DevOps', 'Diseño', 'IA'];

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required]],
    level: ['beginner', Validators.required],
    category: ['', Validators.required],
    duration_hours: [0, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.isLoading.set(true);
    this.courseService.getInstructorCourses().subscribe({
      next: (res: any) => {
        this.courses.set(res.data?.courses || res.data || []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openDialog(course?: Course): void {
    this.editingCourse = course || null;
    this.errorMessage.set(null);
    if (course) {
      this.form.patchValue(course);
    } else {
      this.form.reset({ level: 'beginner', duration_hours: 0, price: 0 });
    }
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingCourse = null;
    this.form.reset();
  }

  saveCourse(): void {
    if (this.form.invalid) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);
    const data = this.form.value;

    const request = this.editingCourse 
      ? this.courseService.updateCourse(this.editingCourse.id, data)
      : this.courseService.createCourse(data);

    request.subscribe({
      next: () => {
        this.snackBar.open(`Curso ${this.editingCourse ? 'actualizado' : 'creado'} con éxito`, 'OK', { duration: 3000 });
        this.isSaving.set(false);
        this.closeDialog();
        this.loadMyCourses();
      },
      error: (err) => {
        this.isSaving.set(false);
        this.handleBackendErrors(err);
      }
    });
  }

  private handleBackendErrors(err: any): void {
    if (err.status === 422 && err.error.errors) {
      Object.keys(err.error.errors).forEach(key => {
        const control = this.form.get(key);
        if (control) control.setErrors({ serverError: err.error.errors[key][0] });
      });
    } else {
      this.errorMessage.set(err.error?.message || 'Error al procesar el curso');
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.form.get(controlName);
    if (!control) return '';
    if (control.hasError('required')) return 'Este campo es obligatorio';
    if (control.hasError('serverError')) return control.getError('serverError');
    return '';
  }

  deleteCourse(course: Course): void {
    if (confirm(`¿Estás seguro de eliminar "${course.title}"?`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.snackBar.open('Curso eliminado', 'OK', { duration: 3000 });
          this.loadMyCourses();
        }
      });
    }
  }
}
