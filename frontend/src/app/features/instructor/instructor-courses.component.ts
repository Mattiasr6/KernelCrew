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
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
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
import { AuthService } from '../../core/services/auth.service';
import { Course } from '../../core/models';

@Component({
  selector: 'app-instructor-courses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
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
    <div class="instructor-container">
      <div class="header">
        <h1>Mis Cursos</h1>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Nuevo Curso
        </button>
      </div>

      @if (loading) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (courses().length === 0) {
        <div class="empty-state">
          <mat-icon>school</mat-icon>
          <p>No tienes cursos creados</p>
          <button mat-raised-button color="primary" (click)="openDialog()">
            Crear mi primer curso
          </button>
        </div>
      } @else {
        <table mat-table [dataSource]="dataSource" class="courses-table">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Título</th>
            <td mat-cell *matCellDef="let course">{{ course.title }}</td>
          </ng-container>

          <ng-container matColumnDef="level">
            <th mat-header-cell *matHeaderCellDef>Nivel</th>
            <td mat-cell *matCellDef="let course">
              <mat-chip [class]="'level-' + course.level">{{ course.level }}</mat-chip>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Categoría</th>
            <td mat-cell *matCellDef="let course">{{ course.category }}</td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Precio</th>
            <td mat-cell *matCellDef="let course">\${{ course.price }}</td>
          </ng-container>

          <ng-container matColumnDef="published">
            <th mat-header-cell *matHeaderCellDef>Publicado</th>
            <td mat-cell *matCellDef="let course">
              <mat-slide-toggle [checked]="course.is_published" (change)="togglePublished(course)">
              </mat-slide-toggle>
            </td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Acciones</th>
            <td mat-cell *matCellDef="let course">
              <button mat-icon-button color="primary" (click)="openDialog(course)">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button color="warn" (click)="deleteCourse(course)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      }
    </div>

    @if (showDialog) {
      <div class="dialog-overlay" (click)="closeDialog()">
        <div class="dialog-content" (click)="$event.stopPropagation()">
          <h2>{{ editingCourse ? 'Editar' : 'Nuevo' }} Curso</h2>
          <form [formGroup]="form" (ngSubmit)="saveCourse()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título</mat-label>
              <input matInput formControlName="title" />
              @if (form.get('title')?.hasError('required') && form.get('title')?.touched) {
                <mat-error>El título es requerido</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción corta</mat-label>
              <textarea matInput formControlName="short_description" rows="2"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción completa</mat-label>
              <textarea matInput formControlName="description" rows="4"></textarea>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Nivel</mat-label>
                <mat-select formControlName="level">
                  <mat-option value="beginner">Principiante</mat-option>
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
                <mat-label>Duración (horas)</mat-label>
                <input matInput type="number" formControlName="duration" />
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Precio ($)</mat-label>
                <input matInput type="number" formControlName="price" />
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL de imagen</mat-label>
              <input matInput formControlName="thumbnail" placeholder="https://..." />
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
      .instructor-container {
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
      .loading {
        display: flex;
        justify-content: center;
        padding: 40px;
      }
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60px;
        color: #666;
        mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
        }
      }
      .courses-table {
        width: 100%;
      }
      mat-chip.level-beginner {
        background-color: #4caf50 !important;
        color: white !important;
      }
      mat-chip.level-intermediate {
        background-color: #ff9800 !important;
        color: white !important;
      }
      mat-chip.level-advanced {
        background-color: #f44336 !important;
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
        width: 600px;
        max-width: 95%;
        max-height: 90vh;
        overflow-y: auto;
      }
      .full-width {
        width: 100%;
        margin-bottom: 16px;
      }
      .form-row {
        display: flex;
        gap: 16px;
      }
      .form-row mat-form-field {
        flex: 1;
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
export class InstructorCoursesComponent implements OnInit {
  private courseService = inject(CourseService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  displayedColumns = ['title', 'level', 'category', 'price', 'published', 'actions'];
  dataSource = new MatTableDataSource<Course>();

  courses = signal<Course[]>([]);
  loading = false;
  saving = false;

  showDialog = false;
  editingCourse: Course | null = null;

  categories = ['Desarrollo Web', 'Móvil', 'Data Science', 'DevOps', 'Diseño', 'Negocios'];

  form: FormGroup = this.fb.group({
    title: ['', Validators.required],
    short_description: [''],
    description: [''],
    level: ['beginner', Validators.required],
    category: ['', Validators.required],
    duration: [0],
    price: [0],
    thumbnail: [''],
    is_published: [false],
  });

  ngOnInit(): void {
    this.loadMyCourses();
  }

  loadMyCourses(): void {
    this.loading = true;
    this.courseService.getCourses({ per_page: 100 }).subscribe({
      next: (response) => {
        this.courses.set(response.data.courses);
        this.dataSource.data = response.data.courses;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar cursos', 'Cerrar', { duration: 3000 });
      },
    });
  }

  openDialog(course?: Course): void {
    this.editingCourse = course || null;
    if (course) {
      this.form.patchValue(course);
    } else {
      this.form.reset({
        level: 'beginner',
        category: '',
        duration: 0,
        price: 0,
        is_published: false,
      });
    }
    this.showDialog = true;
  }

  closeDialog(): void {
    this.showDialog = false;
    this.editingCourse = null;
    this.form.reset({ level: 'beginner' });
  }

  saveCourse(): void {
    if (this.form.invalid) return;

    this.saving = true;
    const data = this.form.value;

    if (this.editingCourse) {
      this.courseService.updateCourse(this.editingCourse.id, data).subscribe({
        next: () => {
          this.snackBar.open('Curso actualizado', 'Cerrar', { duration: 3000 });
          this.closeDialog();
          this.loadMyCourses();
          this.saving = false;
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al actualizar curso', 'Cerrar', { duration: 3000 });
        },
      });
    } else {
      this.courseService.createCourse(data).subscribe({
        next: () => {
          this.snackBar.open('Curso creado', 'Cerrar', { duration: 3000 });
          this.closeDialog();
          this.loadMyCourses();
          this.saving = false;
        },
        error: () => {
          this.saving = false;
          this.snackBar.open('Error al crear curso', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }

  togglePublished(course: Course): void {
    this.courseService.updateCourse(course.id, { is_published: !course.is_published }).subscribe({
      next: () => {
        this.snackBar.open(
          course.is_published ? 'Curso despublicado' : 'Curso publicado',
          'Cerrar',
          { duration: 2000 },
        );
        this.loadMyCourses();
      },
      error: () => {
        this.snackBar.open('Error al cambiar estado', 'Cerrar', { duration: 3000 });
      },
    });
  }

  deleteCourse(course: Course): void {
    if (confirm(`¿Eliminar curso "${course.title}"?`)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.snackBar.open('Curso eliminado', 'Cerrar', { duration: 3000 });
          this.loadMyCourses();
        },
        error: () => {
          this.snackBar.open('Error al eliminar curso', 'Cerrar', { duration: 3000 });
        },
      });
    }
  }
}
