import { Component, OnInit, inject, DestroyRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseEditorService } from '../services/course-editor.service';
import { ApiService } from '../../../../core/services/api.service';
import { Category } from '../../../../core/models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';

@Component({
  selector: 'app-basic-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-2xl">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-50 mb-2">Información del Curso</h2>
      <p class="text-sm text-zinc-400 mb-8">Define el título, descripción y metadatos de tu curso.</p>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="36" color="primary"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
          <!-- Title -->
          <mat-form-field appearance="fill" class="w-full dark-field">
            <mat-label>Título del curso</mat-label>
            <input matInput formControlName="title" maxlength="255" />
            @if (form.get('title')?.hasError('required')) {
              <mat-error>El título es obligatorio</mat-error>
            }
          </mat-form-field>

          <!-- Description -->
          <mat-form-field appearance="fill" class="w-full dark-field">
            <mat-label>Descripción</mat-label>
            <textarea
              matInput
              formControlName="description"
              rows="6"
              class="min-h-[120px]"
            ></textarea>
            <mat-hint class="text-zinc-500">
              {{ form.get('description')?.value?.length || 0 }}/50 mínimo — Explica qué aprenderá el estudiante
            </mat-hint>
            @if (form.get('description')?.hasError('minlength')) {
              <mat-error>Mínimo 50 caracteres</mat-error>
            }
          </mat-form-field>

          <!-- Category & Level (2 columns) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <mat-form-field appearance="fill" class="w-full dark-field">
              <mat-label>Categoría</mat-label>
              <mat-select formControlName="category_id">
                @for (cat of categories(); track cat.id) {
                  <mat-option [value]="cat.id">{{ cat.name }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="fill" class="w-full dark-field">
              <mat-label>Nivel</mat-label>
              <mat-select formControlName="level">
                <mat-option value="beginner">Principiante</mat-option>
                <mat-option value="intermediate">Intermedio</mat-option>
                <mat-option value="advanced">Avanzado</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <!-- Thumbnail URL -->
          <mat-form-field appearance="fill" class="w-full dark-field">
            <mat-label>URL de la imagen (thumbnail)</mat-label>
            <input matInput formControlName="thumbnail" placeholder="https://..." />
            <mat-hint class="text-zinc-500">Opcional — URL de una imagen para la portada del curso</mat-hint>
          </mat-form-field>

          <!-- Save -->
          @if (canEdit()) {
            <div class="pt-2">
              <button
                mat-flat-button
                type="submit"
                class="save-btn"
                [disabled]="form.invalid || form.pristine || saving()"
              >
                @if (saving()) {
                  <mat-spinner diameter="20" class="inline-block mr-2"></mat-spinner>
                }
                Guardar Cambios
              </button>
            </div>
          }
        </form>
      }
    </div>
  `,
  styles: [`
    .save-btn {
      background: linear-gradient(135deg, #06b6d4, #0891b2) !important;
      color: #fff !important;
      border-radius: 10px !important;
      padding: 10px 24px !important;
      font-weight: 600 !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.2) !important;
      transition: all 0.2s ease !important;
    }
    .save-btn:hover:not(:disabled) {
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.4) !important;
    }
    .save-btn:disabled {
      opacity: 0.5;
      box-shadow: none !important;
    }
  `],
})
export class BasicEditorComponent implements OnInit {
  private fb = inject(FormBuilder);
  private editorService = inject(CourseEditorService);
  private api = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  course = this.editorService.currentCourse;

  canEdit = () => {
    const status = this.course()?.status;
    return status === 'DRAFT' || status === 'REJECTED';
  };

  loading = signal(true);
  saving = signal(false);
  categories = signal<Category[]>([]);

  form: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: ['', [Validators.required, Validators.minLength(50)]],
    category_id: [null],
    level: ['beginner'],
    thumbnail: [''],
  });

  constructor() {
    effect(() => {
      const c = this.course();
      if (c) {
        this.form.patchValue(
          {
            title: c.title,
            description: c.description,
            category_id: c.category_id ?? c.category?.id ?? null,
            level: c.level ?? 'beginner',
            thumbnail: c.thumbnail ?? '',
          },
          { emitEvent: false },
        );
        this.loading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.api.get<{ success: boolean; data: Category[] }>('courses/categories').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.success) this.categories.set(res.data);
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;

    const courseId = this.course()?.id;
    if (!courseId) return;

    this.saving.set(true);
    this.editorService
      .updateBasic(courseId, this.form.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.form.markAsPristine();
          this.snackBar.open(res.message ?? 'Información actualizada.', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message || 'Error al guardar';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        },
      });
  }
}
