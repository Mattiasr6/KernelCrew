import { Component, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { CurriculumService } from '../../core/services/curriculum.service';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { CertificateService } from '../../core/services/certificate.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { Course, CourseSection, Lesson } from '../../core/models';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-player',
  standalone: true,
  imports: [CommonModule, RouterLink, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="player-container">
      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      } @else if (course(); as c) {
        <!-- Ambient Background Nebula -->
        <div class="ambient-glow top-left"></div>
        <div class="ambient-glow bottom-right"></div>

        <!-- Mobile Sidebar Toggle -->
        @if (sidebarOpen) {
          <div class="sidebar-overlay" (click)="sidebarOpen = false"></div>
        }

        <!-- Navigation Header -->
        <header class="player-header">
          <button class="back-btn" [routerLink]="['/courses', c.id]">
            <span class="material-symbols-outlined">arrow_back</span>
            <span class="hidden sm:inline">Volver</span>
          </button>
          <h1 class="text-base sm:text-lg font-bold text-zinc-50 truncate mx-4">{{ c.title }}</h1>
          <div class="flex items-center gap-2 ml-auto">
            <button class="sidebar-toggle-btn md:!hidden" (click)="sidebarOpen = !sidebarOpen" aria-label="Abrir temario">
              <span class="material-symbols-outlined">list</span>
            </button>
            <a routerLink="/my-courses" class="text-xs text-zinc-500 hover:text-zinc-300 shrink-0 transition-colors hidden sm:inline">Mis Cursos</a>
          </div>
        </header>

        <div class="content-grid">
          <!-- LEFT: Main Content Area -->
          <main class="main-content">
            @if (selectedLesson(); as lesson) {
              <!-- Video Player -->
              @if (lesson.video_url) {
                <div class="video-wrapper">
                  <div class="video-glow"></div>
                  <div class="video-container">
                    <iframe
                      [src]="sanitizeVideoUrl(lesson.video_url)"
                      class="w-full h-full"
                      frameborder="0"
                      allowfullscreen
                      allow="autoplay; fullscreen"
                    ></iframe>
                  </div>
                </div>
              } @else {
                <div class="video-wrapper">
                  <div class="video-glow"></div>
                  <div class="video-empty">
                    <div class="video-empty-icon">
                      <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; font-size: 48px;">play_circle</span>
                    </div>
                    <span class="text-zinc-600 text-sm mt-2">Sin video disponible para esta lección</span>
                  </div>
                </div>
              }

              <!-- Lesson Content Card -->
              <div class="lesson-card">
                <div class="lesson-card-accent"></div>
                <h2 class="text-2xl font-bold text-zinc-50 tracking-tight mb-4">{{ lesson.title }}</h2>
                @if (lesson.content) {
                  <div class="lesson-content prose">{{ lesson.content }}</div>
                }
              </div>

              <!-- Actions Bar -->
              <div class="actions-bar">
                <div class="flex items-center gap-4 sm:gap-5">
                  <div class="progress-ring">
                    <svg class="progress-ring-svg" viewBox="0 0 40 40">
                      <circle class="progress-ring-bg" cx="20" cy="20" r="17" fill="none" stroke-width="3" />
                      <circle class="progress-ring-fill" cx="20" cy="20" r="17" fill="none" stroke-width="3"
                        [attr.stroke-dasharray]="circumference"
                        [attr.stroke-dashoffset]="circumference - (progressPct() / 100) * circumference"
                        [class.stroke-emerald-400]="progressPct() >= 100"
                      />
                    </svg>
                    <span class="progress-ring-text"
                      [class.text-emerald-400]="progressPct() >= 100"
                      [class.text-cyan-400]="progressPct() < 100">
                      {{ progressPct() }}%
                    </span>
                  </div>
                  <div class="hidden sm:block">
                    <span class="text-xs text-zinc-500 uppercase tracking-wider font-medium">Progreso</span>
                    <div class="h-1.5 w-24 lg:w-32 bg-zinc-800 rounded-full overflow-hidden mt-1">
                      <div class="h-full rounded-full transition-all duration-700 ease-out"
                        [class.bg-emerald-500]="progressPct() >= 100"
                        [class.bg-cyan-500]="progressPct() < 100"
                        [style.width.%]="progressPct()">
                      </div>
                    </div>
                  </div>
                  <span class="text-xs text-zinc-600 hidden lg:inline">{{ completedCount() }}/{{ totalLessons() }} lecciones</span>
                </div>

                @if (progressPct() < 100) {
                  <button
                    class="complete-btn group"
                    [class.completed]="isLessonCompleted(lesson.id)"
                    (click)="markLessonComplete(lesson)"
                    [disabled]="isLessonCompleted(lesson.id) || isCompleting()"
                  >
                    @if (isCompleting()) {
                      <div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Guardando...</span>
                    } @else if (isLessonCompleted(lesson.id)) {
                      <span class="material-symbols-outlined text-[18px]">check_circle</span>
                      <span>Completada</span>
                    } @else {
                      <span class="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">done</span>
                      <span>Marcar como Completada</span>
                    }
                  </button>
                } @else {
                  <div class="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">emoji_events</span>
                    <span>Curso completado</span>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty State Enhanced -->
              <div class="empty-state-enhanced">
                <div class="empty-state-graphic">
                  <div class="empty-state-ring">
                    <span class="material-symbols-outlined text-5xl text-zinc-700" style="font-variation-settings: 'FILL' 1;">touch_app</span>
                  </div>
                </div>
                <h3 class="text-xl font-semibold text-zinc-300 mt-6">Selecciona una lección</h3>
                <p class="text-zinc-500 text-sm mt-2 max-w-xs">Elige un tema del temario para comenzar tu aprendizaje</p>
              </div>
            }
          </main>

          <!-- RIGHT: Sidebar Curriculum -->
          <aside class="sidebar" [class.sidebar-open]="sidebarOpen">
            @if (canEdit()) {
              <a [routerLink]="['/instructor/courses', course()!.id, 'curriculum']"
                 class="flex items-center gap-2 px-4 py-3 mx-3 mt-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all text-sm font-semibold">
                <span class="material-symbols-outlined text-[18px]">edit_square</span>
                Editar Curso
              </a>
            }
            <div class="sidebar-header">
              <h3 class="text-sm font-bold text-zinc-100 uppercase tracking-wider">Contenido</h3>
              <div class="flex items-center gap-2">
                <span class="text-xs text-zinc-500">{{ completedCount() }}/{{ totalLessons() }}</span>
                <span class="text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">{{ progressPct() }}%</span>
              </div>
            </div>

            <div class="sidebar-body">
              @for (section of sections(); track section.id; let sIdx = $index) {
                <div class="section-group" [class.section-complete]="isSectionComplete(section)">
                  <button
                    class="section-header"
                    (click)="toggleSection($index)"
                  >
                    <span class="flex items-center gap-2.5 min-w-0">
                      <span class="material-symbols-outlined text-zinc-500 text-lg shrink-0 transition-transform duration-200"
                        [class.rotate-90]="expandedSections()[sIdx]">
                        chevron_right
                      </span>
                      @if (isSectionComplete(section)) {
                        <span class="material-symbols-outlined text-emerald-400 text-lg shrink-0" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                      } @else {
                        <span class="material-symbols-outlined text-cyan-400 text-lg shrink-0">folder</span>
                      }
                      <span class="text-xs font-semibold text-zinc-300 truncate">{{ section.title }}</span>
                    </span>
                    <span class="text-[11px] text-zinc-600 shrink-0 ml-2">
                      {{ completedCountInSection(section) }}/{{ section.lessons?.length || 0 }}
                    </span>
                  </button>

                  @if (expandedSections()[sIdx]) {
                    <div class="lessons-list">
                      @for (lesson of section.lessons; track lesson.id) {
                        <button
                          class="lesson-item"
                          [class.active]="selectedLesson()?.id === lesson.id"
                          [class.completed]="isLessonCompleted(lesson.id)"
                          (click)="selectLesson(lesson); sidebarOpen = false"
                        >
                          <span class="lesson-icon">
                            @if (isLessonCompleted(lesson.id)) {
                              <span class="material-symbols-outlined text-emerald-400 text-lg check-animated" style="font-variation-settings: 'FILL' 1;">check_circle</span>
                            } @else {
                              <span class="material-symbols-outlined text-zinc-600 text-lg">{{ selectedLesson()?.id === lesson.id ? 'play_circle' : 'radio_button_unchecked' }}</span>
                            }
                          </span>
                          <span class="text-sm truncate flex-1 text-left"
                            [class.text-zinc-100]="selectedLesson()?.id === lesson.id"
                            [class.text-zinc-400]="selectedLesson()?.id !== lesson.id && !isLessonCompleted(lesson.id)"
                            [class.text-zinc-500]="isLessonCompleted(lesson.id)">
                            {{ lesson.title }}
                          </span>
                          <span class="text-[11px] text-zinc-600 shrink-0 ml-1">{{ lesson.duration_minutes }}m</span>
                        </button>
                      }
                    </div>
                  }
                </div>
              }
              @if (sections().length === 0) {
                <div class="p-6 text-center text-zinc-500 text-sm">Sin contenido</div>
              }
            </div>

            <!-- Sidebar Footer: Course Info -->
            <div class="sidebar-footer">
              <div class="flex items-center gap-2 text-zinc-600 text-xs">
                <span class="material-symbols-outlined text-[14px]">school</span>
                <span>{{ totalLessons() }} lecciones en {{ sections().length }} secciones</span>
              </div>
            </div>
          </aside>
        </div>

        <!-- Success Modal -->
        @if (showCertificateModal()) {
          <div class="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in" (click)="showCertificateModal.set(false)">
            <div class="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center shadow-2xl animate-scale-in" (click)="$event.stopPropagation()">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-yellow-500/30 animate-float">
                <span class="material-symbols-outlined text-white text-4xl fill-icon">workspace_premium</span>
              </div>
              <h2 class="text-3xl font-bold text-zinc-50 mb-2">¡Felicidades!</h2>
              <p class="text-zinc-400 mb-2">Has completado todos los módulos del curso.</p>
              <p class="text-zinc-500 text-sm mb-8">Tu certificado está listo para descargar.</p>
              <div class="flex flex-col gap-3">
                <button class="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold text-lg shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3" (click)="downloadCertificate()">
                  <span class="material-symbols-outlined">download</span>
                  Descargar Certificado
                </button>
                <button class="text-zinc-500 hover:text-zinc-300 text-sm transition-colors" routerLink="/courses">Explorar más cursos</button>
              </div>
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* === Animations === */
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .check-animated { animation: checkPop 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
    @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    @keyframes checkPop { 0% { transform: scale(0); } 50% { transform: scale(1.2); } 100% { transform: scale(1); } }
    @keyframes glowPulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

    /* === Container === */
    .player-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #09090b;
      position: relative;
    }
    .loading { display: flex; align-items: center; justify-content: center; height: 100vh; }

    /* === Ambient Glows === */
    .ambient-glow {
      position: fixed;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      filter: blur(120px);
    }
    .ambient-glow.top-left {
      top: -200px;
      left: -200px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.08), transparent 70%);
    }
    .ambient-glow.bottom-right {
      bottom: -200px;
      right: -200px;
      background: radial-gradient(circle, rgba(139, 92, 246, 0.06), transparent 70%);
    }

    /* === Mobile Overlay === */
    .sidebar-overlay {
      display: none;
    }
    @media (max-width: 1023px) {
      .sidebar-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 45;
      }
    }

    /* === Header === */
    .player-header {
      height: 60px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 16px;
      position: sticky;
      top: 0;
      z-index: 40;
      background: rgba(9, 9, 11, 0.95);
      border-bottom: 1px solid #27272a;
      backdrop-filter: blur(12px);
    }
    .back-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: #a1a1aa;
      cursor: pointer;
      font-size: 0.875rem;
      padding: 8px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    .back-btn:hover { color: #fafafa; background: rgba(255, 255, 255, 0.05); }
    .sidebar-toggle-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      background: transparent;
      border: 1px solid #27272a;
      color: #a1a1aa;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sidebar-toggle-btn:hover { background: rgba(255, 255, 255, 0.05); color: #fafafa; }

    /* === Content Grid === */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      height: calc(100vh - 60px);
      overflow: hidden;
      position: relative;
      z-index: 1;
    }
    @media (max-width: 1024px) {
      .content-grid { grid-template-columns: 1fr; }
    }

    /* === Main Content === */
    .main-content {
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      position: relative;
    }

    /* === Video Section === */
    .video-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 16 / 9;
      overflow: hidden;
    }
    .video-glow {
      position: absolute;
      inset: -20px;
      background: radial-gradient(ellipse at center, rgba(6, 182, 212, 0.06), transparent 60%);
      pointer-events: none;
      animation: glowPulse 4s ease-in-out infinite;
    }
    .video-container {
      position: relative;
      width: 100%;
      height: 100%;
      background: #000;
      border-bottom: 1px solid #18181b;
    }
    .video-container iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }
    .video-empty {
      position: relative;
      width: 100%;
      height: 100%;
      background: #18181b;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid #27272a;
    }
    .video-empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(6, 182, 212, 0.06);
      border: 1px solid rgba(6, 182, 212, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #06b6d4;
      transition: all 0.3s ease;
    }

    /* === Lesson Card === */
    .lesson-card {
      position: relative;
      margin: 24px;
      padding: 32px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 16px;
      flex: 1;
      overflow: hidden;
      animation: slideUp 0.5s ease-out;
    }
    @media (max-width: 640px) {
      .lesson-card { margin: 16px; padding: 20px; }
    }
    .lesson-card-accent {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #06b6d4, #8b5cf6, #06b6d4);
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
    }
    @keyframes shimmer {
      0%, 100% { background-position: 0% 0; }
      50% { background-position: 100% 0; }
    }
    .lesson-content {
      color: #a1a1aa;
      font-size: 0.95rem;
      line-height: 1.75;
      white-space: pre-line;
    }
    .lesson-content p { margin-bottom: 1rem; }

    /* === Progress Ring === */
    .progress-ring {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .progress-ring-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }
    .progress-ring-bg {
      stroke: #27272a;
    }
    .progress-ring-fill {
      stroke: #06b6d4;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.7s ease-out;
    }
    .progress-ring-fill.stroke-emerald-400 {
      stroke: #10b981;
    }
    .progress-ring-text {
      position: relative;
      font-size: 0.65rem;
      font-weight: 800;
      z-index: 1;
    }
    .circumference { /* set dynamically */ }

    /* === Actions Bar === */
    .actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding: 14px 24px;
      position: sticky;
      bottom: 0;
      border-top: 1px solid #27272a;
      background: rgba(24, 24, 27, 0.7);
      backdrop-filter: blur(12px);
    }
    @media (max-width: 640px) {
      .actions-bar {
        flex-direction: column;
        padding: 12px 16px;
        gap: 12px;
      }
    }
    @media (max-width: 380px) {
      .actions-bar { padding: 10px 12px; }
    }

    .complete-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 24px;
      border-radius: 10px;
      border: none;
      font-weight: 600;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background: #06b6d4;
      color: #fff;
      white-space: nowrap;
    }
    .complete-btn:hover:not(:disabled) {
      background: #0891b2;
      transform: translateY(-1px);
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.3);
    }
    .complete-btn.completed {
      background: rgba(16, 185, 129, 0.12);
      color: #10b981;
      cursor: default;
    }
    .complete-btn:disabled:not(.completed) {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* === Empty State === */
    .empty-state-enhanced {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      padding: 40px 24px;
      text-align: center;
    }
    .empty-state-graphic {
      position: relative;
    }
    .empty-state-ring {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: #18181b;
      border: 1px solid #27272a;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      animation: float 4s ease-in-out infinite;
    }

    /* === Sidebar === */
    .sidebar {
      display: flex;
      flex-direction: column;
      border-left: 1px solid #27272a;
      background: rgba(24, 24, 27, 0.6);
      backdrop-filter: blur(16px);
      overflow: hidden;
      position: relative;
    }
    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        top: 60px;
        right: 0;
        height: calc(100vh - 60px);
        width: 340px;
        max-width: 85vw;
        z-index: 50;
        border-left: 1px solid #27272a;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: -8px 0 30px rgba(0, 0, 0, 0.4);
      }
      .sidebar.sidebar-open {
        transform: translateX(0);
      }
    }
    @media (max-width: 380px) {
      .sidebar { width: 100vw; max-width: 100vw; }
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 18px;
      border-bottom: 1px solid #27272a;
      background: rgba(24, 24, 27, 0.5);
    }
    .sidebar-body {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;
    }
    .sidebar-body::-webkit-scrollbar { width: 4px; }
    .sidebar-body::-webkit-scrollbar-track { background: transparent; }
    .sidebar-body::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }
    .sidebar-footer {
      padding: 12px 18px;
      border-top: 1px solid #27272a;
      background: rgba(24, 24, 27, 0.4);
    }

    /* === Section === */
    .section-group {
      border-bottom: 1px solid rgba(39, 39, 42, 0.3);
    }
    .section-complete {
      border-left: 2px solid rgba(16, 185, 129, 0.15);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      padding: 10px 18px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
    }
    .section-header:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .rotate-90 { transform: rotate(90deg); }
    .lessons-list { padding: 2px 0 6px; }

    /* === Lesson Items === */
    .lesson-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 18px 8px 30px;
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      text-align: left;
      position: relative;
    }
    .lesson-item:hover {
      background: rgba(255, 255, 255, 0.02);
    }
    .lesson-item:hover .lesson-icon {
      transform: scale(1.1);
    }
    .lesson-item.active {
      background: rgba(6, 182, 212, 0.06);
    }
    .lesson-item.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: #06b6d4;
      border-radius: 1px;
    }
    .lesson-icon {
      display: flex;
      align-items: center;
      transition: transform 0.2s ease;
    }

    .fill-icon { font-variation-settings: 'FILL' 1; }
  `]
})
export class CoursePlayerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private curriculumService = inject(CurriculumService);
  private enrollmentService = inject(EnrollmentService);
  private certService = inject(CertificateService);
  private notification = inject(NotificationService);
  private snackBar = inject(MatSnackBar);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);
  private authService = inject(AuthService);

  course = signal<Course | null>(null);
  sections = signal<CourseSection[]>([]);
  selectedLesson = signal<Lesson | null>(null);
  completedLessonIds = signal<number[]>([]);
  progressPct = signal(0);
  loading = signal(true);
  isCompleting = signal(false);
  showCertificateModal = signal(false);
  sidebarOpen = false;

  circumference = 2 * Math.PI * 17;

  canEdit = computed(() => {
    const c = this.course();
    const user = this.authService.user();
    if (!c || !user) return false;
    const status = c.status;
    return user.id === c.instructor_id && (status === 'DRAFT' || status === 'REJECTED');
  });

  completedCount = computed(() => this.completedLessonIds().length);
  totalLessons = computed(() => this.getAllLessons().length);

  lastLessonId: number | null = null;
  expandedSections = signal<boolean[]>([]);

  courseId = 0;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.courseId = id;
      this.loadCourse(id);
      this.loadCurriculum(id);
    }
  }

  isSectionComplete(section: CourseSection): boolean {
    const lessons = section.lessons || [];
    return lessons.length > 0 && lessons.every(l => this.isLessonCompleted(l.id));
  }

  loadCourse(id: number) {
    this.courseService.getCourse(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (res.data) this.course.set(res.data);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('No se pudo cargar el curso. Intenta de nuevo.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  loadCurriculum(courseId: number) {
    this.curriculumService.getPublicCurriculum(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const secs = res.data?.sections || [];
          this.sections.set(secs);
          this.expandedSections.set(secs.map(() => true));
          this.loadProgress(courseId);
        }
      });
  }

  loadProgress(courseId: number) {
    this.enrollmentService.getMyProgress(courseId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.progressPct.set(res.data.progress);
            this.completedLessonIds.set(res.data.completed_lesson_ids || []);
            this.lastLessonId = res.data.last_lesson_id;
          }
          this.loading.set(false);

          // Auto-select first uncompleted lesson or last watched
          const allLessons = this.getAllLessons();
          if (allLessons.length > 0) {
            const target = this.lastLessonId
              ? allLessons.find(l => l.id === this.lastLessonId)
              : allLessons.find(l => !this.isLessonCompleted(l.id));
            this.selectedLesson.set(target || allLessons[0]);
          }
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('No estás inscrito en este curso', 'OK', { duration: 5000 });
          this.router.navigate(['/courses', courseId]);
        }
      });
  }

  getAllLessons(): Lesson[] {
    return this.sections().flatMap(s => s.lessons || []);
  }

  isLessonCompleted(lessonId: number): boolean {
    return this.completedLessonIds().includes(lessonId);
  }

  completedCountInSection(section: CourseSection): number {
    return (section.lessons || []).filter(l => this.isLessonCompleted(l.id)).length;
  }

  toggleSection(index: number) {
    const current = [...this.expandedSections()];
    current[index] = !current[index];
    this.expandedSections.set(current);
  }

  selectLesson(lesson: Lesson) {
    this.selectedLesson.set(lesson);
    // Auto-expand parent section
    const idx = this.sections().findIndex(s => s.lessons?.some(l => l.id === lesson.id));
    if (idx >= 0) {
      const ex = [...this.expandedSections()];
      ex[idx] = true;
      this.expandedSections.set(ex);
    }
  }

  markLessonComplete(lesson: Lesson) {
    if (this.isLessonCompleted(lesson.id) || this.isCompleting()) return;

    this.isCompleting.set(true);
    this.enrollmentService.completeLesson(lesson.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.isCompleting.set(false);
          if (res.success && res.data) {
            const newIds = [...this.completedLessonIds(), lesson.id];
            this.completedLessonIds.set(newIds);
            this.progressPct.set(res.data.progress);

            if (res.data.certificate_ready) {
              this.showCertificateModal.set(true);
            }
          }
        },
        error: () => {
          this.isCompleting.set(false);
          this.snackBar.open('Error al guardar el progreso', 'Cerrar');
        }
      });
  }

  sanitizeVideoUrl(url: string): SafeResourceUrl {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    const src = match ? `https://www.youtube.com/embed/${match[1]}` : url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(src);
  }

  downloadCertificate() {
    this.certService.getMyCertificates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const cert = res.data?.find(c => c.course_id === this.courseId);
          if (cert) {
            this.certService.downloadPdf(cert.certificate_code)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: (blob) => {
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Certificado_${cert.certificate_code}.pdf`;
                  a.click();
                  window.URL.revokeObjectURL(url);
                }
              });
          } else {
            this.snackBar.open('Certificado no encontrado', 'Cerrar');
          }
        }
      });
  }
}
