import { Component, DestroyRef, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { CertificateService } from '../../core/services/certificate.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { AuthService } from '../../core/services/auth.service';
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

    <!-- Hidden Certificate Template for PDF Generation -->
    <div style="position: absolute; left: -9999px; top: -9999px;">
      <div id="certificate-template" class="w-[1056px] h-[816px] relative flex flex-col justify-center items-center text-center bg-zinc-950" style="font-family: 'Inter', system-ui, sans-serif; border: 4px solid #27272a; padding: 64px;">
        <!-- Gradient background -->
        <div style="position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(139,92,246,0.08), transparent 70%); pointer-events: none;"></div>

        <!-- Logo -->
        <div style="position: relative; z-index: 1; margin-bottom: 48px;">
          <span style="font-size: 48px; font-weight: 900; color: #fafafa; letter-spacing: -0.02em;">Kernel</span>
          <span style="font-size: 48px; font-weight: 900; background: linear-gradient(135deg, #8b5cf6, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Learn</span>
        </div>

        <!-- Title -->
        <h2 style="position: relative; z-index: 1; font-size: 28px; font-weight: 700; color: #e4e4e7; letter-spacing: 0.2em; margin-bottom: 48px; text-transform: uppercase;">Certificado de Finalización</h2>

        <!-- "Se otorga a:" -->
        <p style="position: relative; z-index: 1; font-size: 16px; color: #a1a1aa; margin-bottom: 16px;">Se otorga el presente a:</p>

        <!-- Student Name -->
        <h1 style="position: relative; z-index: 1; font-size: 44px; font-weight: 800; color: #22d3ee; margin-bottom: 32px; letter-spacing: -0.01em;">{{ studentName() }}</h1>

        <!-- "Por haber completado:" -->
        <p style="position: relative; z-index: 1; font-size: 16px; color: #a1a1aa; margin-bottom: 12px;">Por haber completado con éxito el curso:</p>

        <!-- Course Name -->
        <h3 style="position: relative; z-index: 1; font-size: 26px; font-weight: 700; color: #fafafa; max-width: 700px; line-height: 1.3;">{{ currentCertTitle() }}</h3>

        <!-- Signatures -->
        <div style="position: relative; z-index: 1; display: flex; gap: 80px; margin-top: 80px;">
          <div style="text-align: center;">
            <div style="width: 200px; border-top: 1px solid #3f3f46; padding-top: 12px; font-size: 14px; color: #71717a;">Instructor del Curso</div>
          </div>
          <div style="text-align: center;">
            <div style="width: 200px; border-top: 1px solid #3f3f46; padding-top: 12px; font-size: 14px; color: #71717a;">Director KernelLearn</div>
          </div>
        </div>

        <!-- Footer -->
        <div style="position: absolute; bottom: 32px; left: 0; right: 0; text-align: center; font-size: 11px; color: #52525b;">
          Código de verificación: <span style="color: #71717a;">{{ currentCertCode() }}</span> &nbsp;&bull;&nbsp; Emitido: {{ currentCertDate() }}
        </div>
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
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  certificates = signal<Certificate[]>([]);
  isLoading = signal(true);
  downloadingId = signal<number | null>(null);
  studentName = signal('Estudiante KernelLearn');
  currentCertTitle = signal('');
  currentCertCode = signal('');
  currentCertDate = signal('');

  ngOnInit() {
    this.loadCertificates();
    const user = this.authService.user();
    if (user?.name) this.studentName.set(user.name);
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

  async downloadCertificate(cert: Certificate) {
    const template = document.getElementById('certificate-template');
    if (!template || this.downloadingId()) return;

    this.downloadingId.set(cert.id);
    this.currentCertTitle.set(cert.course?.title || 'Curso KernelLearn');
    this.currentCertCode.set(cert.certificate_code || '---');
    this.currentCertDate.set(new Date(cert.issued_at || Date.now()).toLocaleDateString('es-BO', {
      year: 'numeric', month: 'long', day: 'numeric',
    }));

    // Wait for DOM to update with signals
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(template, { scale: 2, backgroundColor: '#09090b', useCORS: true });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('landscape', 'px', [1056, 816]);
      pdf.addImage(imgData, 'PNG', 0, 0, 1056, 816);
      pdf.save('Certificado_KernelLearn.pdf');

      this.confetti.fireSuccessConfetti();
    } catch (err) {
      console.error('Error generando certificado:', err);
    } finally {
      this.downloadingId.set(null);
    }
  }
}
