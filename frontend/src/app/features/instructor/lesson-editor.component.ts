import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Lesson } from '../../core/models';

@Component({
  selector: 'app-lesson-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" (click)="onClose()">
      <div class="bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-2xl p-6 sm:p-8 w-full max-w-3xl mx-auto shadow-2xl shadow-black/50 max-h-[92vh] overflow-y-auto animate-modal-in" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[18px]">play_circle</span>
            </div>
            <h3 class="text-lg font-bold text-zinc-100">{{ lesson() ? 'Editar Lección' : 'Nueva Lección' }}</h3>
          </div>
          <button (click)="onClose()" class="w-8 h-8 rounded-lg border border-zinc-800 bg-transparent flex items-center justify-center hover:bg-zinc-800 transition-colors">
            <span class="material-symbols-outlined text-zinc-500 text-[18px]">close</span>
          </button>
        </div>

        <div class="space-y-5">
          <!-- Título -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">Título de la lección</label>
            <input
              [(ngModel)]="formTitle"
              placeholder="Ej: 1.1 Introducción a la Arquitectura Limpia"
              class="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-3 outline-none focus:border-violet-500 transition-colors placeholder-zinc-500"
            />
            <p class="text-[11px] text-zinc-600 mt-1">Define un título descriptivo que motive al estudiante</p>
          </div>

          <!-- Editor WYSIWYG -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">Contenido de la lección</label>
            <quill-editor
              [(ngModel)]="formContent"
              [modules]="quillModules"
              placeholder="Escribe el contenido detallado de la lección..."
              class="quill-dark"
              style="min-height: 280px; display: block;"
            ></quill-editor>
          </div>

          <!-- URL del Video -->
          <div>
            <label class="block text-sm font-medium text-zinc-400 mb-1.5">URL del Video <span class="text-zinc-600 font-normal">(opcional)</span></label>
            <input
              [(ngModel)]="formVideoUrl"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 outline-none focus:border-violet-500 transition-colors placeholder-zinc-500"
            />
          </div>

          <!-- Grid 2 cols: Duración + Free toggle -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-zinc-400 mb-1.5">Duración <span class="text-zinc-600 font-normal">(minutos)</span></label>
              <input
                type="number"
                min="0"
                [(ngModel)]="formDuration"
                class="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg px-4 py-2.5 outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div class="flex items-end pb-2.5">
              <div class="flex items-center gap-3">
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
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-zinc-800">
          <button type="button" (click)="onClose()" class="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors font-medium">Cancelar</button>
          <button
            type="button"
            [disabled]="!formTitle.trim()"
            (click)="onSave()"
            class="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-all shadow-[0_0_12px_rgba(139,92,246,0.2)] inline-flex items-center gap-2"
          >
            <span class="material-symbols-outlined text-[16px]">check</span>
            {{ lesson() ? 'Guardar Cambios' : 'Crear Lección' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .animate-modal-in {
      animation: modalIn 0.25s ease-out;
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.96) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    /* Quill Dark Mode — respeta DESIGN.md */
    ::ng-deep .quill-dark .ql-toolbar {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 10px 10px 0 0;
      font-family: inherit;
      padding: 10px 12px;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-formats button {
      color: #a1a1aa;
      width: 28px;
      height: 28px;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-formats button:hover,
    ::ng-deep .quill-dark .ql-toolbar .ql-formats button.ql-active {
      color: #06b6d4;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-picker {
      color: #a1a1aa;
      height: 28px;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-picker:hover {
      color: #06b6d4;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-picker-options {
      background: #18181b;
      border: 1px solid #27272a;
    }
    ::ng-deep .quill-dark .ql-container {
      background: #18181b;
      border: 1px solid #27272a;
      border-top: none;
      border-radius: 0 0 10px 10px;
      min-height: 280px;
      font-family: inherit;
      font-size: 0.92rem;
    }
    ::ng-deep .quill-dark .ql-editor {
      color: #e4e4e7;
      min-height: 280px;
      padding: 16px;
      line-height: 1.7;
    }
    ::ng-deep .quill-dark .ql-editor::before {
      color: #52525b;
      font-style: normal;
    }
    ::ng-deep .quill-dark .ql-editor.ql-blank::before {
      left: 16px;
    }
    ::ng-deep .quill-dark .ql-editor h3 { color: #f4f4f5; font-size: 1.1rem; margin: 1.2em 0 0.5em; }
    ::ng-deep .quill-dark .ql-editor p { margin: 0.6em 0; line-height: 1.7; }
    ::ng-deep .quill-dark .ql-editor ul, ::ng-deep .quill-dark .ql-editor ol { padding-left: 1.5em; }
    ::ng-deep .quill-dark .ql-editor a { color: #06b6d4; text-decoration: underline; text-underline-offset: 2px; }
    ::ng-deep .quill-dark .ql-editor code {
      background: #18181b;
      color: #f43f5e;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.85em;
    }
    ::ng-deep .quill-dark .ql-editor pre {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 8px;
      padding: 14px 16px;
      color: #e4e4e7;
      font-size: 0.85em;
      line-height: 1.6;
    }
    ::ng-deep .quill-dark .ql-editor blockquote {
      border-left: 3px solid #06b6d4;
      padding: 4px 0 4px 14px;
      margin: 0.5em 0;
      color: #a1a1aa;
    }
    ::ng-deep .quill-dark .ql-toolbar .ql-stroke { stroke: currentColor; }
    ::ng-deep .quill-dark .ql-toolbar .ql-fill { fill: currentColor; }
  `],
})
export class LessonEditorComponent {
  lesson = input<Lesson | null>(null);
  save = output<{ lesson: Lesson | null; title: string; content: string; video_url: string | null; duration_minutes: number; is_free: boolean }>();
  close = output<void>();

  formTitle = '';
  formContent = '';
  formVideoUrl = '';
  formDuration = 0;
  formIsFree = false;

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: [3, false] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'code-block'],
      ['clean'],
    ],
  };

  constructor() {
    setTimeout(() => {
      const l = this.lesson();
      this.formTitle = l?.title || '';
      this.formContent = l?.content || '';
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
      content: this.formContent,
      video_url: this.formVideoUrl || null,
      duration_minutes: this.formDuration,
      is_free: this.formIsFree,
    });
  }

  onClose() {
    this.close.emit();
  }
}
