import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
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
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    RouterLink,
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
                    <span class="status-badge" [ngClass]="getStatusClass(course.status)">
                      {{ getStatusLabel(course.status) }}
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
                      @if (course.status === 'DRAFT' || course.status === 'REJECTED') {
                        <button class="icon-btn review" (click)="requestReview(course)" title="Enviar a revisión">
                          <span class="material-symbols-outlined">how_to_vote</span>
                        </button>
                      }
                      <button class="icon-btn edit" [routerLink]="['/instructor', 'courses', course.id, 'curriculum']" title="Editar contenido">
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
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-[22px]">add_circle</span>
              </div>
              <div>
                <h2 class="text-lg font-bold text-zinc-100">{{ editingCourse ? 'Editar' : 'Crear Nuevo' }} Curso</h2>
                <p class="text-xs text-zinc-500 mt-0.5">Completa la información básica del curso</p>
              </div>
            </div>
            <button (click)="closeDialog()" class="close-btn">
              <span class="material-symbols-outlined text-zinc-500 hover:text-zinc-300 text-[20px]">close</span>
            </button>
          </div>

          <form [formGroup]="form" (ngSubmit)="saveCourse()" class="space-y-5">
            <!-- Title -->
            <div>
              <label class="form-label">Título del Curso</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">badge</span>
                <input class="form-input" formControlName="title" placeholder="Ej: Arquitectura Limpia con .NET 8" />
              </div>
              @if (form.get('title')?.invalid && form.get('title')?.touched) {
                <p class="form-error">{{ getErrorMessage('title') }}</p>
              }
            </div>

            <!-- Description -->
            <div>
              <label class="form-label">Descripción</label>
              <div class="input-wrapper">
                <span class="material-symbols-outlined input-icon">description</span>
                <textarea class="form-input min-h-[90px] resize-y" formControlName="description" rows="3" placeholder="Describe qué aprenderán los estudiantes..."></textarea>
              </div>
              @if (form.get('description')?.invalid && form.get('description')?.touched) {
                <p class="form-error">{{ getErrorMessage('description') }}</p>
              }
            </div>

            <!-- Grid 2x2: Level, Category, Duration, Price -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label">Nivel</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">signal_cellular_alt</span>
                  <select class="form-input" formControlName="level">
                    <option value="beginner">Principiante</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="form-label">Categoría</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">category</span>
                  <select class="form-input" formControlName="category">
                    @for (cat of categories; track cat) {
                      <option [value]="cat">{{ cat }}</option>
                    }
                  </select>
                </div>
              </div>
              <div>
                <label class="form-label">Duración (Horas)</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">schedule</span>
                  <input class="form-input" type="number" formControlName="duration_hours" min="1" placeholder="40" />
                </div>
              </div>
              <div>
                <label class="form-label">Precio ($)</label>
                <div class="input-wrapper">
                  <span class="material-symbols-outlined input-icon">attach_money</span>
                  <input class="form-input" type="number" formControlName="price" min="0" placeholder="29.99" />
                </div>
              </div>
            </div>

            <!-- Error Banner -->
            @if (errorMessage()) {
              <div class="error-banner">
                <span class="material-symbols-outlined text-[16px] text-rose-400 shrink-0">error</span>
                <span class="text-sm text-rose-300">{{ errorMessage() }}</span>
              </div>
            }

            <!-- Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button type="button" (click)="closeDialog()" class="cancel-btn">Cancelar</button>
              <button
                class="submit-btn"
                type="submit"
                [disabled]="form.invalid || isSaving()"
              >
                @if (isSaving()) {
                  <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                } @else {
                  <span class="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Crear Borrador
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

    .status-badge.draft {
      background: rgba(39, 39, 42, 0.1);
      color: #a1a1aa;
      border: 1px solid rgba(63, 63, 70, 0.2);
    }

    .status-badge.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .status-badge.approved {
      background: rgba(6, 182, 212, 0.1);
      color: #06b6d4;
      border: 1px solid rgba(6, 182, 212, 0.2);
    }

    .status-badge.published {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }

    .status-badge.rejected {
      background: rgba(244, 63, 94, 0.1);
      color: #f43f5e;
      border: 1px solid rgba(244, 63, 94, 0.2);
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
    .icon-btn.review:hover { background: rgba(245, 158, 11, 0.1); color: #f59e0b; border-color: #f59e0b44; }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }

    .dialog-content {
      width: 560px;
      max-width: 100%;
      background: rgba(24, 24, 27, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid #27272a;
      border-radius: 20px;
      padding: 28px;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
      animation: dialogIn 0.2s ease-out;
    }

    @keyframes dialogIn {
      from { opacity: 0; transform: scale(0.96) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .close-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid #3f3f46;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .close-btn:hover { background: #27272a; border-color: #52525b; }

    .form-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #a1a1aa;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      font-size: 18px;
      color: #52525b;
      pointer-events: none;
    }

    .form-input {
      width: 100%;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 11px 14px 11px 42px;
      color: #fafafa;
      font-size: 0.9rem;
      font-family: inherit;
      outline: none;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    .form-input:focus {
      border-color: #06b6d4;
      box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.08);
    }
    .form-input::placeholder { color: #52525b; }
    select.form-input { cursor: pointer; }
    select.form-input option { background: #18181b; color: #fafafa; }

    .form-error {
      margin-top: 6px;
      font-size: 0.75rem;
      color: #f43f5e;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .error-banner {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      background: rgba(244, 63, 94, 0.08);
      border: 1px solid rgba(244, 63, 94, 0.2);
      border-radius: 10px;
      padding: 12px 14px;
    }

    .cancel-btn {
      padding: 10px 20px;
      border-radius: 10px;
      background: transparent;
      border: 1px solid #3f3f46;
      color: #a1a1aa;
      font-size: 0.88rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }
    .cancel-btn:hover { color: #fafafa; background: rgba(255, 255, 255, 0.04); }

    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 10px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: #fff;
      font-size: 0.88rem;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);
    }
    .submit-btn:hover:not(:disabled) {
      box-shadow: 0 0 25px rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
    }
    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      box-shadow: none;
    }

    .full-width { width: 100%; }

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
  private destroyRef = inject(DestroyRef);

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
    this.courseService.getInstructorCourses().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
      this.courseService.deleteCourse(course.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.snackBar.open('Curso eliminado', 'OK', { duration: 3000 });
          this.loadMyCourses();
        }
      });
    }
  }

  requestReview(course: Course): void {
    this.courseService.requestReview(course.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.snackBar.open('Curso enviado a revisión', 'OK', { duration: 3000 });
          this.loadMyCourses();
        },
        error: (err) => {
          this.snackBar.open(err.error?.message || 'Error al enviar a revisión', 'Cerrar');
        }
      });
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      'DRAFT': 'status-badge draft',
      'IN_REVIEW': 'status-badge pending',
      'PUBLISHED': 'status-badge published',
      'REJECTED': 'status-badge rejected'
    };
    return classes[status] || 'status-badge';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'DRAFT': 'Borrador',
      'IN_REVIEW': 'En Revisión',
      'PUBLISHED': 'Publicado',
      'REJECTED': 'Rechazado'
    };
    return labels[status] || status;
  }
}
