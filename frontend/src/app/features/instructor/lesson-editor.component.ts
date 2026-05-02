import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../../core/models';

@Component({
  selector: 'app-lesson-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center" (click)="onClose()">
      <div class="bg-zinc-900 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl" (click)="$event.stopPropagation()">
        <!-- Header -->
        <h3 class="text-lg font-bold text-zinc-100 mb-6">
          {{ lesson() ? 'Editar Lección' : 'Nueva Lección' }}
        </h3>

        <div class="space-y-4">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">Título de la lección</label>
            <input
              [(ngModel)]="formTitle"
              placeholder="Ej: 1.1 Introducción a PHP"
              class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors placeholder-zinc-500"
            />
          </div>

          <!-- URL del Video -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">URL del Video (opcional)</label>
            <input
              [(ngModel)]="formVideoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors placeholder-zinc-500"
            />
          </div>

          <!-- Duración -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">Duración (minutos)</label>
            <input
              type="number"
              min="0"
              [(ngModel)]="formDuration"
              class="w-full bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          <!-- Toggle Preview Gratuita -->
          <div class="flex items-center gap-3 py-2">
            <button
              (click)="formIsFree = !formIsFree"
              class="relative w-11 h-6 rounded-full transition-colors"
              [class.bg-cyan-600]="formIsFree"
              [class.bg-zinc-700]="!formIsFree"
            >
              <span
                class="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform"
                [class.translate-x-5]="formIsFree"
              ></span>
            </button>
            <span class="text-sm text-zinc-300">Vista Previa Gratuita</span>
            @if (formIsFree) {
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Preview</span>
            }
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button class="px-4 py-2 rounded-lg text-zinc-400 hover:text-zinc-200 transition-colors" (click)="onClose()">Cancelar</button>
          <button
            class="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="!formTitle.trim()"
            (click)="onSave()"
          >
            {{ lesson() ? 'Guardar Cambios' : 'Crear Lección' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class LessonEditorComponent {
  lesson = input<Lesson | null>(null);
  save = output<{ lesson: Lesson | null; title: string; video_url: string; duration_minutes: number; is_free: boolean }>();
  close = output<void>();

  formTitle = '';
  formVideoUrl = '';
  formDuration = 0;
  formIsFree = false;

  constructor() {
    // Inicializamos desde el input
    setTimeout(() => {
      const l = this.lesson();
      this.formTitle = l?.title || '';
      this.formVideoUrl = l?.video_url || '';
      this.formDuration = l?.duration_minutes || 0;
      this.formIsFree = l?.is_free || false;
    });
  }

  onSave() {
    if (!this.formTitle.trim()) return;
    this.save.emit({
      lesson: this.lesson(),
      title: this.formTitle,
      video_url: this.formVideoUrl,
      duration_minutes: this.formDuration,
      is_free: this.formIsFree,
    });
  }

  onClose() {
    this.close.emit();
  }
}
