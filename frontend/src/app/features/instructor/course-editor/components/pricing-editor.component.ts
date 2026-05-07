import { Component, inject, DestroyRef, effect } from '@angular/core';
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseEditorService } from '../services/course-editor.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { signal } from '@angular/core';

@Component({
  selector: 'app-pricing-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="max-w-2xl">
      <h2 class="text-2xl font-bold tracking-tight text-zinc-50 mb-2">Precio en Créditos</h2>
      <p class="text-sm text-zinc-400 mb-8">Define cuántos créditos costará tu curso.</p>

      @if (loading()) {
        <div class="flex justify-center py-12">
          <mat-spinner diameter="36" color="primary"></mat-spinner>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">
          <!-- Info Card -->
          <div class="bg-amber-500/5 border border-amber-500/15 rounded-xl p-5 flex gap-4">
            <span class="material-symbols-outlined text-amber-400 text-2xl shrink-0 mt-0.5" style="font-variation-settings: 'FILL' 1;">
              database
            </span>
            <div>
              <h3 class="text-sm font-semibold text-amber-400 mb-1">Economía por Créditos</h3>
              <p class="text-xs text-zinc-400 leading-relaxed">
                Los estudiantes compran paquetes de créditos (ej: 50 créditos = $5 USD).
                Cuando un estudiante se inscribe en tu curso, se descuentan los créditos de su balance
                y tú recibes puntos de gamificación. Define un precio justo basado en la profundidad de tu contenido.
              </p>
            </div>
          </div>

          <!-- Price input -->
          <mat-form-field appearance="fill" class="w-full dark-field">
            <mat-label>Créditos</mat-label>
            <input
              matInput
              type="number"
              formControlName="price_in_credits"
              min="0"
              step="10"
              placeholder="50"
            />
            <span matTextPrefix class="flex items-center gap-1 text-amber-400 mr-2">
              <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">database</span>
            </span>
            <mat-hint class="text-zinc-500">
              Ej: 50 créditos ($5 USD aprox.) — Mínimo 0 (gratis)
            </mat-hint>
            @if (form.get('price_in_credits')?.hasError('min')) {
              <mat-error>El precio no puede ser negativo</mat-error>
            }
          </mat-form-field>

          <!-- Pricing examples -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            @for (pkg of suggestedPrices; track pkg.credits) {
              <button
                type="button"
                class="pricing-chip"
                [class.pricing-chip-active]="form.get('price_in_credits')?.value === pkg.credits"
                (click)="form.patchValue({ price_in_credits: pkg.credits })"
              >
                <span class="flex items-center gap-1 text-amber-400">
                  <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;">database</span>
                  {{ pkg.credits }}
                </span>
                <span class="text-xs text-zinc-500">{{ pkg.label }}</span>
              </button>
            }
          </div>

          <!-- Warning: students enrolled -->
          @if (course()?.students_count && course()!.students_count! > 0) {
            <div class="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 flex items-start gap-3">
              <span class="material-symbols-outlined text-amber-400 text-xl shrink-0 mt-0.5">warning</span>
              <div>
                <p class="text-sm font-medium text-amber-400">Curso con estudiantes activos</p>
                <p class="text-xs text-zinc-400 mt-1">
                  Este curso ya tiene <strong>{{ course()!.students_count }}</strong> estudiante(s) inscrito(s).
                  Cambiar el precio no afectará a quienes ya están inscritos.
                </p>
              </div>
            </div>
          }

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
                Guardar Precio
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
    .pricing-chip {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .pricing-chip:hover {
      border-color: #3f3f46;
    }
    .pricing-chip-active {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.06);
    }
  `],
})
export class PricingEditorComponent {
  private fb = inject(FormBuilder);
  private editorService = inject(CourseEditorService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  course = this.editorService.currentCourse;
  loading = signal(true);
  saving = signal(false);

  canEdit = () => {
    const status = this.course()?.status;
    return status === 'DRAFT' || status === 'REJECTED';
  };

  suggestedPrices = [
    { credits: 50, label: 'Principiante' },
    { credits: 100, label: 'Intermedio' },
    { credits: 200, label: 'Avanzado' },
  ];

  form: FormGroup = this.fb.group({
    price_in_credits: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    effect(() => {
      const c = this.course();
      if (c) {
        this.form.patchValue(
          { price_in_credits: c.price_in_credits ?? 0 },
          { emitEvent: false },
        );
        this.loading.set(false);
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;

    const courseId = this.course()?.id;
    if (!courseId) return;

    this.saving.set(true);
    this.editorService
      .updatePricing(courseId, { price_in_credits: this.form.value.price_in_credits })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.saving.set(false);
          this.form.markAsPristine();
          this.snackBar.open(res.message ?? 'Precio actualizado.', 'Cerrar', { duration: 3000 });
        },
        error: (err) => {
          this.saving.set(false);
          const msg = err?.error?.message || 'Error al guardar';
          this.snackBar.open(msg, 'Cerrar', { duration: 4000 });
        },
      });
  }
}
