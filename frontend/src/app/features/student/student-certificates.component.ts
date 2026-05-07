import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../core/services/certificate.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { Certificate } from '../../core/models';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 py-6 md:py-10 animate-fade-in">
      <div class="max-w-5xl mx-auto">
        <!-- Header -->
        <div class="mb-10">
          <h1 class="text-3xl font-bold tracking-tight text-zinc-50">Mis Certificados</h1>
          <p class="text-sm text-zinc-500 mt-1">Descarga los reconocimientos por tus cursos completados</p>
        </div>

        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (i of [1,2,3]; track i) {
              <div class="h-52 bg-zinc-900 rounded-2xl border border-zinc-800 animate-pulse"></div>
            }
          </div>
        } @else if (certificates().length === 0) {
          <div class="flex flex-col items-center justify-center py-20 px-6 bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl">
            <span class="material-symbols-outlined text-6xl text-zinc-600 mb-4">workspace_premium</span>
            <p class="text-zinc-400 text-lg">Aún no has obtenido certificados. ¡Completa un curso para empezar!</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (cert of certificates(); track cert.id) {
              <div class="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:-translate-y-1 transition-all">
                <div class="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <span class="material-symbols-outlined text-cyan-400 text-2xl">workspace_premium</span>
                </div>
                <h3 class="text-lg font-bold text-zinc-100 mb-1 line-clamp-2">{{ cert.course?.title }}</h3>
                <p class="text-xs text-zinc-500 mb-5">Emitido el {{ cert.issued_at | date:'dd MMM, yyyy' }}</p>

                <button
                  (click)="downloadCertificate(cert)"
                  [disabled]="downloadingId() === cert.id"
                  class="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] inline-flex items-center justify-center gap-2"
                >
                  @if (downloadingId() === cert.id) {
                    <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Generando PDF...</span>
                  } @else {
                    <span class="material-symbols-outlined text-[18px]">download</span>
                    Descargar Certificado
                  }
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>


  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.6s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class StudentCertificatesComponent implements OnInit {
  private certService = inject(CertificateService);
  private confetti = inject(ConfettiService);
  private destroyRef = inject(DestroyRef);

  certificates = signal<Certificate[]>([]);
  isLoading = signal(true);
  downloadingId = signal<number | null>(null);

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
    this.isLoading.set(true);
    this.certService.getMyCertificates().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.certificates.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  downloadCertificate(cert: Certificate) {
    if (this.downloadingId()) return;
    this.downloadingId.set(cert.id);

    this.certService.downloadPdf(cert.certificate_code)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Certificado_KernelLearn_${cert.certificate_code}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloadingId.set(null);
          this.confetti.fireSuccessConfetti();
        },
        error: () => {
          this.downloadingId.set(null);
        },
      });
  }
}
