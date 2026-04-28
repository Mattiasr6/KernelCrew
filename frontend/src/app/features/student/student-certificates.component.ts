import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificateService } from '../../core/services/certificate.service';
import { Certificate } from '../../core/models';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-student-certificates',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-background text-on-background min-h-screen flex font-body-md overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      
      <!-- SideNavBar (Adaptada de Stitch) -->
      <nav class="fixed left-0 top-0 h-full flex flex-col py-6 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-lg h-screen w-64 border-r border-white/10 shadow-2xl z-40 hidden md:flex">
        <div class="px-6 mb-10 flex items-center gap-4">
          <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span class="material-symbols-outlined text-white" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-100 tracking-tight">EduPortal</h1>
            <p class="font-inter text-slate-300 text-xs opacity-80">Faculty Portal</p>
          </div>
        </div>
        
        <div class="flex-1 flex flex-col px-3 gap-2">
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/dashboard">
            <span class="material-symbols-outlined text-[20px]">home</span>
            <span class="font-medium text-sm">Home</span>
          </a>
          <a class="flex items-center gap-3 px-4 py-3 bg-white/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg font-inter" routerLink="/my-certificates">
            <span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">workspace_premium</span>
            <span class="font-semibold text-sm">Mis Certificados</span>
          </a>
          <a class="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all font-inter" routerLink="/become-teacher">
            <span class="material-symbols-outlined text-[20px]">school</span>
            <span class="font-medium text-sm">Become a Teacher</span>
          </a>
        </div>

        <div class="px-6 mt-auto">
          <button class="w-full py-2.5 rounded-lg border border-white/10 text-slate-300 font-inter text-sm hover:bg-white/5 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span class="material-symbols-outlined text-[18px]">data_usage</span>
            View Status
          </button>
        </div>
      </nav>

      <!-- Main Canvas -->
      <main class="flex-1 md:ml-64 relative p-6 min-h-screen overflow-y-auto">
        <!-- Ambient Background Glow -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="max-w-[1280px] mx-auto space-y-8 animate-fade-in relative z-10">
          
          <!-- Header -->
          <header class="mb-10">
            <h1 class="text-4xl font-bold text-white mb-2 tracking-tight">Mis Certificados</h1>
            <p class="text-slate-400 font-body-md">Aquí puedes descargar los reconocimientos por tus cursos completados.</p>
          </header>

          @if (isLoading()) {
            <!-- Skeleton Loaders -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (i of [1,2,3]; track i) {
                <div class="h-48 bg-slate-900/50 rounded-2xl border border-white/5 animate-pulse"></div>
              }
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (cert of certificates(); track cert.id) {
                <div class="glass-card group rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:border-blue-500/50 bg-slate-900/40 backdrop-blur-xl border border-white/10">
                  <!-- Decorative BG Glow -->
                  <div class="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                  
                  <div class="relative z-10">
                    <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 mb-6">
                      <span class="material-symbols-outlined text-blue-400">history_edu</span>
                    </div>
                    
                    <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">{{ cert.course?.title }}</h3>
                    <p class="text-slate-400 text-sm mb-4">Emitido el: {{ cert.issued_at | date:'dd MMM, yyyy' }}</p>
                  </div>

                  <button 
                    (click)="download(cert)"
                    [disabled]="downloadingUuid() === cert.certificate_code"
                    class="relative w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 hover:border-blue-500 transition-all active:scale-95 disabled:opacity-50">
                    
                    @if (downloadingUuid() === cert.certificate_code) {
                      <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      <span>Generando PDF...</span>
                    } @else {
                      <span class="material-symbols-outlined text-[20px]">download</span>
                      <span>Descargar PDF</span>
                    }
                  </button>
                </div>
              } @empty {
                <div class="col-span-full py-20 flex flex-col items-center justify-center glass-card border-dashed bg-transparent border border-white/10 rounded-2xl">
                  <span class="material-symbols-outlined text-6xl text-slate-600 mb-4">workspace_premium</span>
                  <p class="text-slate-400 text-lg">Aún no has obtenido certificados. ¡Completa un curso para empezar!</p>
                </div>
              }
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .animate-fade-in { animation: fadeIn 0.8s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class StudentCertificatesComponent implements OnInit {
  private certService = inject(CertificateService);

  certificates = signal<Certificate[]>([]);
  isLoading = signal(true);
  downloadingUuid = signal<string | null>(null);

  ngOnInit() {
    this.loadCertificates();
  }

  loadCertificates() {
  this.isLoading.set(true);
  this.certService.getMyCertificates().subscribe({
    next: (res) => {
      // Usamos '?? []' para asegurar que siempre haya una lista
      this.certificates.set(res.data ?? []);
      this.isLoading.set(false);
    },
    error: () => this.isLoading.set(false)
  });
}

  download(cert: Certificate) {
    this.downloadingUuid.set(cert.certificate_code);
    
    this.certService.downloadPdf(cert.certificate_code).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Certificado_${cert.course?.slug || cert.id}.pdf`;
        link.click();
        
        // Limpieza
        window.URL.revokeObjectURL(url);
        this.downloadingUuid.set(null);
      },
      error: (err) => {
        console.error('Error descargando el certificado:', err);
        this.downloadingUuid.set(null);
      }
    });
  }
}
