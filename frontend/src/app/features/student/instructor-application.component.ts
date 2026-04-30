import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-instructor-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <!-- Estructura Neta de Stitch -->
    <div class="bg-background text-on-background min-h-screen flex font-body-md overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      <!-- SideNavBar (Adaptada de Stitch) -->
      <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-lg h-screen w-64 border-r border-white/10 shadow-2xl z-40 hidden md:flex">
        <div class="px-6 mb-10 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-100 tracking-tight">KernelLearn</h1>
            <p class="font-inter text-slate-300 text-xs opacity-80">Faculty Portal</p>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col px-3 gap-2">
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/dashboard">
            <span class="material-symbols-outlined text-[20px]">home</span>
            <span class="font-medium text-sm">Home</span>
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/my-certificates">
            <span class="material-symbols-outlined text-[20px]">workspace_premium</span>
            <span class="font-medium text-sm">Mis Certificados</span>
          </a>
          @if (!authService.isInstructor()) {
            <a class="flex items-center gap-3 px-4 py-3 bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg font-inter">
              <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">school</span>
              <span class="font-semibold text-sm">Become a Teacher</span>
            </a>
          }
        </div>

        <div class="px-6 mt-auto">
          <button class="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 font-inter text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">data_usage</span>
            View Status
          </button>
        </div>
      </nav>

      <!-- Main Canvas -->
      <main class="flex-1 md:ml-64 relative flex items-center justify-center p-6 min-h-screen overflow-y-auto">
        <!-- Ambient Background Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <!-- Glassmorphism Form Card -->
        <div class="w-full max-w-[600px] bg-surface-container-high/60 backdrop-blur-[16px] border-t border-l border-white/10 border-b border-r border-white/5 rounded-xl shadow-2xl relative z-10 overflow-hidden">
          <div class="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div class="p-10">
            <!-- Header Area -->
            <div class="mb-10 text-center">
              <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 mb-4 shadow-inner">
                <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">history_edu</span>
              </div>
              <h2 class="text-3xl font-bold text-on-surface mb-2">Conviértete en Docente</h2>
              <p class="text-on-surface-variant">Únete a nuestra plataforma y comparte tu conocimiento con el mundo.</p>
            </div>

            <!-- Form con Lógica Angular -->
            @if (applicationStatus() === 'pending') {
              <div class="text-center py-10 animate-fade-in">
                <span class="material-symbols-outlined text-6xl text-amber-400 mb-4 block">hourglass_empty</span>
                <h3 class="text-xl font-bold text-white mb-2">Solicitud Pendiente</h3>
                <p class="text-slate-400">Estamos revisando tu trayectoria. Te avisaremos pronto.</p>
              </div>
            } @else {
              <form [formGroup]="applicationForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
                <!-- Textarea Field -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-on-surface flex items-center gap-2" for="experiencia">
                    Resumen de Experiencia <span class="text-error">*</span>
                  </label>
                  <div class="relative">
                    <textarea 
                      formControlName="experience_summary"
                      class="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container/50 focus:bg-white/10 transition-all resize-none shadow-inner" 
                      id="experiencia" 
                      placeholder="Describe brevemente tu trayectoria académica y profesional..." 
                      rows="4"
                      [class.border-error]="isFieldInvalid('experience_summary')"
                    ></textarea>
                  </div>
                </div>

                <!-- URL Input Field -->
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-medium text-on-surface" for="portafolio">Enlace al Portafolio (Opcional)</label>
                  <div class="relative flex items-center">
                    <span class="material-symbols-outlined absolute left-4 text-outline pointer-events-none" [class.text-error]="isFieldInvalid('portfolio_url')">link</span>
                    <input 
                      formControlName="portfolio_url"
                      class="w-full bg-white/5 border border-white/10 rounded-lg py-4 pr-4 pl-12 text-on-surface focus:outline-none shadow-inner transition-all" 
                      [class.border-error]="isFieldInvalid('portfolio_url')"
                      id="portafolio" 
                      placeholder="https://..." 
                      type="url"
                    />
                    @if (isFieldInvalid('portfolio_url')) {
                      <span class="material-symbols-outlined absolute right-4 text-error">error</span>
                    }
                  </div>
                  @if (isFieldInvalid('portfolio_url')) {
                    <p class="text-xs text-error mt-1">El formato de la URL no es válido.</p>
                  }
                </div>

                <div class="h-[1px] w-full bg-white/5 my-2"></div>

                <!-- Submit Button -->
                <button 
                  [disabled]="applicationForm.invalid || isLoading()"
                  class="w-full relative group overflow-hidden rounded-lg font-semibold text-white py-4 shadow-[0_0_20px_rgba(0,90,194,0.3)] transition-all active:scale-[0.98] disabled:opacity-50" 
                  type="submit">
                  <div class="absolute inset-0 bg-gradient-to-r from-inverse-primary to-secondary-container transition-transform duration-300 group-hover:scale-105"></div>
                  <div class="relative flex items-center justify-center gap-2">
                    <span>{{ isLoading() ? 'Enviando...' : 'Enviar Solicitud' }}</span>
                    <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </button>

                @if (errorMessage()) {
                  <p class="text-center text-error text-sm mt-2">{{ errorMessage() }}</p>
                }
              </form>
            }
          </div>
        </div>
      </main>
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
  authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  applicationStatus = signal<'none' | 'pending' | 'approved' | 'rejected'>('none');

  applicationForm: FormGroup = this.fb.group({
    experience_summary: ['', [Validators.required, Validators.minLength(50)]],
    portfolio_url: ['', [Validators.pattern('https?://.+')]]
  });

  onSubmit() {
    if (this.applicationForm.invalid) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.applicationService.submitApplication(this.applicationForm.value).subscribe({
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
