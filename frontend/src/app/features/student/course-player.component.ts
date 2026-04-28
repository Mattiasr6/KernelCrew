import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CertificateService } from '../../core/services/certificate.service';
import { NotificationService } from '../../core/services/notification.service';
import { Course, Certificate } from '../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule],
  template: `
    <div class="player-container animate-fade-in">
      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (course()) {
        <!-- Navigation Header -->
        <header class="player-header">
          <button class="back-btn" [routerLink]="['/courses', course()!.id]">
            <span class="material-symbols-outlined">arrow_back</span>
            Volver
          </button>
          <h1 class="text-xl font-bold text-white truncate">{{ course()!.title }}</h1>
          <div class="user-progress">
             <span class="text-sm text-slate-400">Progreso:</span>
             <span class="text-sm font-bold text-blue-400">{{ progress() }}%</span>
          </div>
        </header>

        <div class="content-grid">
          <!-- Main Player -->
          <div class="main-player">
            <div class="video-container aspect-video bg-black rounded-2xl border border-white/5 relative overflow-hidden flex items-center justify-center group">
               <span class="material-symbols-outlined text-8xl text-white/20 group-hover:scale-110 transition-transform cursor-pointer">play_circle</span>
               
               <!-- Success Overlay -->
               @if (progress() === 100) {
                 <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                    <span class="material-symbols-outlined text-7xl text-yellow-400 mb-4 animate-bounce">workspace_premium</span>
                    <h2 class="text-3xl font-bold text-white mb-2">¡Felicidades, Graduado!</h2>
                    <p class="text-slate-400 mb-8">Has completado satisfactoriamente este curso. Tu certificado está listo.</p>
                    
                    <button class="certificate-btn" (click)="downloadCertificate()" [disabled]="isDownloading()">
                      @if (isDownloading()) {
                        <mat-spinner diameter="20"></mat-spinner>
                      } @else {
                        <span class="material-symbols-outlined">download</span>
                        Descargar Certificado PDF
                      }
                    </button>
                 </div>
               }
            </div>

            <div class="lesson-info mt-8 glass-card p-8">
              <h2 class="text-2xl font-bold text-white mb-4">Módulo Final: Evaluación de Conocimientos</h2>
              <p class="text-slate-300 leading-relaxed">
                Este es el último paso para obtener tu certificación. Al marcar esta lección como completada, el sistema validará tu trayectoria y generará el documento oficial.
              </p>
              
              <div class="mt-10 pt-8 border-t border-white/5 flex justify-between items-center">
                <div class="progress-bar-container flex-1 mr-8">
                   <div class="flex justify-between mb-2">
                     <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Tu Avance</span>
                     <span class="text-xs font-bold text-blue-400">{{ progress() }}%</span>
                   </div>
                   <div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div class="h-full bg-blue-500 transition-all duration-700" [style.width.%]="progress()"></div>
                   </div>
                </div>

                @if (progress() < 100) {
                  <button class="complete-btn" (click)="completeCourse()" [disabled]="isUpdating()">
                    @if (isUpdating()) {
                      <mat-spinner diameter="20" class="mr-2"></mat-spinner>
                      <span>Procesando...</span>
                    } @else {
                      <span>Marcar como completado</span>
                      <span class="material-symbols-outlined ml-2">done_all</span>
                    }
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Sidebar Content -->
          <aside class="lesson-sidebar glass-card">
            <h3 class="p-6 font-bold text-white border-b border-white/5">Contenido del Curso</h3>
            <div class="lessons-list p-4 space-y-2">
               <div class="lesson-item active">
                  <span class="material-symbols-outlined">play_circle</span>
                  <span>1. Introducción</span>
               </div>
               <div class="lesson-item locked">
                  <span class="material-symbols-outlined">lock</span>
                  <span>2. Fundamentos</span>
               </div>
               <div class="lesson-item locked">
                  <span class="material-symbols-outlined">lock</span>
                  <span>3. Proyecto Final</span>
               </div>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .player-container { min-height: 100vh; background: #020617; padding: 0; }
    .loading { display: flex; justify-content: center; align-items: center; height: 100vh; }
    
    .player-header {
      height: 70px; background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(10px);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: sticky; top: 0; z-index: 100;
    }

    .back-btn {
      display: flex; align-items: center; gap: 8px; background: transparent;
      border: none; color: #94a3b8; cursor: pointer; font-weight: 600;
    }
    .back-btn:hover { color: white; }

    .content-grid {
      display: grid; grid-template-columns: 1fr 350px; gap: 0; height: calc(100vh - 70px);
    }
    @media (max-width: 1200px) { .content-grid { grid-template-columns: 1fr; overflow-y: auto; } }

    .main-player { padding: 40px; overflow-y: auto; }
    .lesson-sidebar { border-radius: 0; border-top: none; border-bottom: none; background: rgba(15, 23, 42, 0.4); }

    .complete-btn {
      display: flex; align-items: center; gap: 10px; padding: 14px 28px;
      border-radius: 12px; background: #3b82f6; color: white; font-weight: 700;
      border: none; cursor: pointer; transition: all 0.3s;
    }
    .complete-btn:hover { background: #2563eb; transform: translateY(-2px); }

    .certificate-btn {
      display: flex; align-items: center; gap: 12px; padding: 18px 36px;
      border-radius: 16px; background: linear-gradient(135deg, #fbbf24, #d97706);
      color: white; font-weight: 800; border: none; cursor: pointer;
      box-shadow: 0 10px 30px rgba(217, 119, 6, 0.4); transition: all 0.3s;
    }
    .certificate-btn:hover { transform: scale(1.05); box-shadow: 0 15px 40px rgba(217, 119, 6, 0.6); }

    .lesson-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: 10px; color: #64748b; font-size: 0.9rem; transition: all 0.2s;
    }
    .lesson-item.active { background: rgba(59, 130, 246, 0.1); color: #60a5fa; }
    .lesson-item.locked { opacity: 0.5; }

    .animate-fade-in { animation: fadeIn 0.5s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class CoursePlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private certService = inject(CertificateService);
  private notification = inject(NotificationService);

  course = signal<Course | null>(null);
  progress = signal(0);
  loading = signal(true);
  isUpdating = signal(false);
  isDownloading = signal(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(+id);
      this.loadProgress(+id);
    }
  }

  loadCourse(id: number) {
    this.courseService.getCourse(id).subscribe({
      next: (res) => {
        this.course.set(res.data.course);
        this.loading.set(false);
      },
      error: () => this.router.navigate(['/courses'])
    });
  }

  loadProgress(id: number) {
    this.courseService.getEnrollmentStatus(id).subscribe({
      next: (res) => {
        if (!res.data) {
           this.snackBar.open('No estás inscrito en este curso', 'Cerrar');
           this.router.navigate(['/courses', id]);
           return;
        }
        this.progress.set(res.data.progress);
      }
    });
  }

  completeCourse() {
    this.isUpdating.set(true);
    this.courseService.updateProgress(this.course()!.id, 100).subscribe({
      next: (res) => {
        this.progress.set(100);
        this.isUpdating.set(false);
        this.notification.success('¡Curso completado! Tu certificado ha sido generado.');
      },
      error: () => this.isUpdating.set(false)
    });
  }

  downloadCertificate() {
    this.isDownloading.set(true);
    // Buscamos el certificado por curso en el listado del servicio
    this.certService.getMyCertificates().subscribe({
      next: (res) => {
        const cert = res.data.find(c => c.course_id === this.course()!.id);
        if (cert) {
          this.certService.downloadPdf(cert.certificate_code).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `Certificado_${this.course()!.slug}.pdf`;
              a.click();
              this.isDownloading.set(false);
            },
            error: () => this.isDownloading.set(false)
          });
        } else {
          this.isDownloading.set(false);
          this.snackBar.open('Certificado no encontrado', 'Cerrar');
        }
      }
    });
  }
}
