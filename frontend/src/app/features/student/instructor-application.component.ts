import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { ApplicationPayload } from '../../core/models';

@Component({
  selector: 'app-instructor-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="px-4 py-6 md:py-12 min-h-screen bg-zinc-950">
      <div class="max-w-2xl mx-auto">
        <a routerLink="/my-courses" class="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          Volver a mis cursos
        </a>

        <div class="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div class="p-8 md:p-10">
            <div class="mb-8 text-center">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/20">
                <span class="material-symbols-outlined text-white text-3xl" style="font-variation-settings: 'FILL' 1;">history_edu</span>
              </div>
              <h2 class="text-2xl font-bold text-zinc-50 mb-2">Conviértete en Docente</h2>
              <p class="text-sm text-zinc-500">Comparte tu conocimiento con el mundo y genera ingresos como instructor.</p>

              <div class="flex justify-center gap-6 mt-6">
                <div class="flex items-center gap-2 text-xs text-zinc-400"><span class="material-symbols-outlined text-emerald-400 text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span> Crea tus cursos</div>
                <div class="flex items-center gap-2 text-xs text-zinc-400"><span class="material-symbols-outlined text-emerald-400 text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span> Llega a estudiantes</div>
                <div class="flex items-center gap-2 text-xs text-zinc-400"><span class="material-symbols-outlined text-emerald-400 text-[16px]" style="font-variation-settings: 'FILL' 1;">check_circle</span> Genera ingresos</div>
              </div>
            </div>

            @if (applicationStatus() === 'pending') {
              <div class="text-center py-12 animate-fade-in">
                <span class="material-symbols-outlined text-6xl text-amber-400 mb-4 block" style="font-variation-settings: 'FILL' 1;">hourglass_empty</span>
                <h3 class="text-xl font-bold text-zinc-100 mb-2">Solicitud Pendiente</h3>
                <p class="text-sm text-zinc-500">Estamos revisando tu trayectoria. Te avisaremos pronto por correo.</p>
              </div>
            } @else {
              <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
                <div>
                  <label class="block text-sm font-medium text-zinc-400 mb-1.5">Resumen de Experiencia <span class="text-rose-400">*</span></label>
                  <textarea
                    formControlName="experience_summary"
                    class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg p-4 outline-none focus:border-violet-500 transition-colors resize-none placeholder-zinc-500"
                    placeholder="Describe tu trayectoria académica y profesional..."
                    rows="4"
                    [class.border-rose-500]="isFieldInvalid('experience_summary')"
                  ></textarea>
                  @if (isFieldInvalid('experience_summary')) {
                    <p class="text-xs text-rose-400 mt-1">Mínimo 50 caracteres</p>
                  }
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-400 mb-1.5">Enlace al Portafolio <span class="text-zinc-600 font-normal">(opcional)</span></label>
                  <div class="relative">
                    <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[18px]">link</span>
                    <input
                      formControlName="portfolio_url"
                      class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg py-3 pr-4 pl-11 outline-none focus:border-violet-500 transition-colors placeholder-zinc-500"
                      placeholder="https://..."
                      type="url"
                    />
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-zinc-400 mb-1.5">Curriculum Vitae <span class="text-zinc-600 font-normal">(PDF, opcional)</span></label>
                  <div class="bg-zinc-800 border border-zinc-700 rounded-lg p-4 focus-within:border-violet-500 transition-colors">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <span class="material-symbols-outlined text-zinc-500 text-[20px]">upload_file</span>
                      <span class="text-sm text-zinc-500">{{ selectedFileName() || 'Seleccionar archivo PDF (máx. 5 MB)' }}</span>
                      <input type="file" accept=".pdf,application/pdf" class="hidden" (change)="onFileSelected($event)" />
                    </label>
                  </div>
                  @if (selectedFileName()) {
                    <p class="text-xs text-emerald-400 mt-1">{{ selectedFileName() }}</p>
                  }
                </div>

                <button
                  [disabled]="applicationForm.invalid || isLoading()"
                  class="w-full bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(139,92,246,0.2)] inline-flex items-center justify-center gap-2"
                  type="submit"
                >
                  @if (isLoading()) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  } @else {
                    <span class="material-symbols-outlined text-[18px]">send</span>
                    Enviar Solicitud
                  }
                </button>

                @if (errorMessage()) {
                  <p class="text-center text-sm text-rose-400 mt-2">{{ errorMessage() }}</p>
                }
              </form>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class InstructorApplicationComponent {
  private fb = inject(FormBuilder);
  private applicationService = inject(ApplicationService);
  private destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  applicationStatus = signal<'none' | 'pending' | 'approved' | 'rejected'>('none');
  selectedFile = signal<File | null>(null);
  selectedFileName = signal<string>('');

  applicationForm: FormGroup = this.fb.group({
    experience_summary: ['', [Validators.required, Validators.minLength(50)]],
    portfolio_url: ['', [Validators.pattern('https?://.+')]]
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.errorMessage.set('Solo se aceptan archivos PDF');
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('El archivo no debe superar los 5 MB');
        input.value = '';
        return;
      }
      this.selectedFile.set(file);
      this.selectedFileName.set(file.name);
      this.errorMessage.set(null);
    }
  }

  onSubmit() {
    if (this.applicationForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload: ApplicationPayload = {
      experience_summary: this.applicationForm.value.experience_summary,
      portfolio_url: this.applicationForm.value.portfolio_url || undefined,
      resume: this.selectedFile() ?? undefined,
    };

    this.applicationService.submitApplication(payload).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.applicationStatus.set('pending');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error en el servidor');
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.applicationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
