import { Component, DestroyRef, inject, signal, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiMessage } from '../../../core/services/ai.service';
import { NotificationService } from '../../../core/services/notification.service';
import { gsap } from 'gsap';

@Component({
  selector: 'app-kernel-ai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- FAB Button -->
    <button
      (click)="toggleChat()"
      class="fab-button"
      [class.open]="isOpen()"
      [class.notif]="hasNewMessage()"
    >
      <span class="fab-ring"></span>
      <span class="fab-icon">
        @if (isOpen()) {
          <span class="material-symbols-outlined">close</span>
        } @else {
          <span class="kai-fab-logo">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="7" width="18" height="12" rx="3" />
              <circle cx="9" cy="13" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="15" cy="13" r="1.5" fill="currentColor" stroke="none" />
              <path d="M9 4v3M15 4v3M5 19v2M19 19v2" />
              <path d="M7 19v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1" opacity="0.5" />
            </svg>
          </span>
        }
      </span>
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="chat-window" #chatWindow>
        <!-- Header -->
        <header class="chat-header">
          <div class="flex items-center gap-3">
            <div class="kai-avatar">
              <div class="kai-avatar-orb"></div>
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1; font-size: 16px;">psychology</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-zinc-50 font-bold text-sm">KAI</h3>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full status-dot"></span>
                <span class="text-[11px] text-zinc-500">Online</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="header-btn" title="Limpiar conversación" (click)="clearChat()">
              <span class="material-symbols-outlined text-zinc-500" style="font-size: 18px;">delete_sweep</span>
            </button>
            <button (click)="toggleChat()" class="header-btn" title="Cerrar">
              <span class="material-symbols-outlined text-zinc-500" style="font-size: 18px;">close</span>
            </button>
          </div>
        </header>

        <!-- Messages -->
        <div class="chat-messages" #scrollContainer>
          @if (messages().length === 1 && messages()[0].role === 'assistant') {
            <!-- Welcome State -->
            <div class="welcome-state">
              <div class="welcome-orb">
                <span class="material-symbols-outlined" style="font-size: 32px; font-variation-settings: 'FILL' 1;">psychology</span>
              </div>
              <p class="text-zinc-300 text-sm text-center leading-relaxed">{{ messages()[0].content }}</p>
              <div class="suggestions">
                <button class="suggestion-chip" (click)="askSuggestion(1)">
                  <span class="material-symbols-outlined text-[14px]">code</span>
                  Duda técnica
                </button>
                <button class="suggestion-chip" (click)="askSuggestion(2)">
                  <span class="material-symbols-outlined text-[14px]">school</span>
                  Recomiéndame un curso
                </button>
                <button class="suggestion-chip" (click)="askSuggestion(3)">
                  <span class="material-symbols-outlined text-[14px]">star</span>
                  Consejos de estudio
                </button>
              </div>
            </div>
          } @else {
            @for (msg of messages(); track $index) {
              <div class="message-wrapper" [class.user]="msg.role === 'user'" [class.msg-enter]="true">
                @if (msg.role === 'assistant') {
                  <div class="msg-avatar">
                    <span class="material-symbols-outlined" style="font-size: 13px; font-variation-settings: 'FILL' 1;">psychology</span>
                  </div>
                }
                <div class="message-bubble" [class.user-bubble]="msg.role === 'user'" [class.ai-bubble]="msg.role === 'assistant'">
                  {{ msg.content }}
                </div>
              </div>
            }
          }
          @if (isThinking()) {
            <div class="message-wrapper thinking-wrapper">
              <div class="msg-avatar">
                <span class="material-symbols-outlined" style="font-size: 13px; font-variation-settings: 'FILL' 1;">psychology</span>
              </div>
              <div class="message-bubble ai-bubble thinking-bubble">
                <div class="thinking-dots">
                  <span class="tdot"></span>
                  <span class="tdot" style="animation-delay: -0.4s"></span>
                  <span class="tdot" style="animation-delay: -0.8s"></span>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Input Area -->
        <footer class="chat-input-area">
          <form (ngSubmit)="sendMessage()" class="input-row">
            <div class="input-wrapper">
              <input
                type="text"
                [(ngModel)]="userInput"
                name="userInput"
                placeholder="Pregúntale a KAI..."
                [disabled]="isThinking()"
                class="input-field"
                #messageInput
              />
              <button
                type="submit"
                [disabled]="!userInput.trim() || isThinking()"
                class="send-btn"
              >
                @if (isThinking()) {
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                } @else {
                  <span class="material-symbols-outlined" style="font-size: 18px;">arrow_upward</span>
                }
              </button>
            </div>
          </form>
          <p class="input-hint">KAI puede cometer errores. Verifica información crítica.</p>
        </footer>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 50;
    }
    @media (max-width: 480px) {
      :host { bottom: 16px; right: 16px; }
    }

    /* === FAB === */
    .fab-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border: none;
      cursor: pointer;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.4), 0 8px 25px rgba(0, 0, 0, 0.3);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: visible;
    }
    .fab-button:hover {
      transform: scale(1.08);
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.55), 0 12px 35px rgba(0, 0, 0, 0.4);
    }
    .fab-button.open {
      background: #27272a;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }
    .fab-button.open:hover {
      background: #3f3f46;
    }
    .fab-ring {
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 1.5px solid rgba(139, 92, 246, 0.2);
      animation: fabPulse 2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }
    .fab-button.open .fab-ring {
      opacity: 0;
    }
    @keyframes fabPulse {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(1.3); opacity: 0; }
    }
    .fab-button.notif .fab-ring {
      border-color: rgba(6, 182, 212, 0.4);
      animation: fabPulse 1.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
    }
    .fab-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .fab-icon .material-symbols-outlined {
      font-size: 26px;
    }

    /* === Chat Window === */
    .chat-window {
      position: absolute;
      bottom: 72px;
      right: 0;
      width: 380px;
      height: 540px;
      display: flex;
      flex-direction: column;
      background: rgba(24, 24, 27, 0.92);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(63, 63, 70, 0.6);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.08);
      animation: chatEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: bottom right;
    }
    @keyframes chatEnter {
      from { opacity: 0; transform: scale(0.92) translateY(12px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    @media (max-width: 480px) {
      .chat-window {
        width: calc(100vw - 32px);
        height: 70vh;
        right: 0;
        bottom: 68px;
      }
    }

    /* === Header === */
    .chat-header {
      padding: 14px 18px;
      background: rgba(9, 9, 11, 0.6);
      border-bottom: 1px solid rgba(39, 39, 42, 0.6);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }
    .header-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .header-btn:hover { background: rgba(255, 255, 255, 0.05); }

    /* === KAI Avatar === */
    .kai-avatar {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      overflow: hidden;
    }
    .kai-avatar-orb {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      border-radius: inherit;
      animation: orbShift 4s ease-in-out infinite;
    }
    @keyframes orbShift {
      0%, 100% { filter: hue-rotate(0deg) brightness(1); }
      50% { filter: hue-rotate(15deg) brightness(1.1); }
    }
    .kai-avatar .material-symbols-outlined {
      position: relative;
      z-index: 1;
    }
    .status-dot {
      animation: statusPulse 2s ease-in-out infinite;
    }
    @keyframes statusPulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* === Messages === */
    .chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: rgba(24, 24, 27, 0.3);
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-track { background: transparent; }
    .chat-messages::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 4px; }

    .message-wrapper {
      display: flex;
      align-items: flex-end;
      gap: 8px;
      width: 100%;
    }
    .message-wrapper.user {
      justify-content: flex-end;
    }
    .msg-avatar {
      width: 26px;
      height: 26px;
      border-radius: 8px;
      background: linear-gradient(135deg, #8b5cf6, #06b6d4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      flex-shrink: 0;
    }

    .message-bubble {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.85rem;
      line-height: 1.55;
      word-break: break-word;
    }
    .user-bubble {
      background: rgba(6, 182, 212, 0.12);
      color: #67e8f9;
      border: 1px solid rgba(6, 182, 212, 0.2);
      border-bottom-right-radius: 4px;
    }
    .ai-bubble {
      background: rgba(39, 39, 42, 0.6);
      color: #d4d4d8;
      border: 1px solid rgba(63, 63, 70, 0.4);
      border-bottom-left-radius: 4px;
    }

    /* Message enter animation */
    .msg-enter {
      animation: msgSlide 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes msgSlide {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* === Welcome State === */
    .welcome-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      padding: 20px 12px;
      gap: 20px;
    }
    .welcome-orb {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15));
      border: 1px solid rgba(139, 92, 246, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b5cf6;
      animation: welcomeFloat 3s ease-in-out infinite;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.1);
    }
    @keyframes welcomeFloat {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    .suggestions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      width: 100%;
    }
    .suggestion-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      background: rgba(39, 39, 42, 0.5);
      border: 1px solid rgba(63, 63, 70, 0.4);
      color: #a1a1aa;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .suggestion-chip:hover {
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.3);
      color: #c4b5fd;
    }

    /* === Thinking === */
    .thinking-wrapper {
      align-items: center;
    }
    .thinking-bubble {
      padding: 14px 18px;
    }
    .thinking-dots {
      display: flex;
      gap: 5px;
      align-items: center;
    }
    .tdot {
      width: 6px;
      height: 6px;
      background: #8b5cf6;
      border-radius: 50%;
      animation: thinkBounce 1.2s infinite ease-in-out both;
    }
    @keyframes thinkBounce {
      0%, 80%, 100% { transform: scale(0.4); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }

    /* === Input Area === */
    .chat-input-area {
      padding: 12px 14px 10px;
      background: rgba(9, 9, 11, 0.6);
      border-top: 1px solid rgba(39, 39, 42, 0.6);
      flex-shrink: 0;
    }
    .input-row {
      width: 100%;
    }
    .input-wrapper {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(24, 24, 27, 0.6);
      border: 1px solid #27272a;
      border-radius: 12px;
      padding: 4px;
      transition: all 0.2s ease;
    }
    .input-wrapper:focus-within {
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.06);
    }
    .input-field {
      flex: 1;
      background: transparent;
      border: none;
      padding: 8px 10px;
      color: #fafafa;
      font-size: 0.85rem;
      outline: none;
      font-family: inherit;
    }
    .input-field::placeholder { color: #52525b; }
    .input-field:disabled { opacity: 0.5; }

    .send-btn {
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
    }
    .send-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .input-hint {
      text-align: center;
      font-size: 0.65rem;
      color: #3f3f46;
      margin-top: 6px;
    }
  `]
})
export class KernelAIComponent implements AfterViewInit {
  private aiService = inject(AiService);
  private notification = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private hostRef = inject(ElementRef);

  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  isOpen = signal(false);
  hasNewMessage = signal(false);

  messages = signal<AiMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy KAI, tu asistente de IA en KernelLearn. Estoy aquí para ayudarte con tus cursos, resolver dudas técnicas y guiarte en tu aprendizaje. ¿En qué puedo ayudarte hoy?' }
  ]);

  userInput = '';
  isThinking = signal(false);

  ngAfterViewInit(): void {
    gsap.from(this.hostRef.nativeElement, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.7)',
      delay: 1,
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    this.hasNewMessage.set(false);
  }

  clearChat() {
    this.messages.set([
      { role: 'assistant', content: '¡Hola! Soy KAI, tu asistente de IA en KernelLearn. Estoy aquí para ayudarte con tus cursos, resolver dudas técnicas y guiarte en tu aprendizaje. ¿En qué puedo ayudarte hoy?' }
    ]);
  }

  askSuggestion(type: number) {
    const suggestions: Record<number, string> = {
      1: 'Ayúdame con una duda técnica sobre programación',
      2: '¿Qué curso me recomiendas para empezar?',
      3: 'Dame consejos para estudiar mejor',
    };
    this.userInput = suggestions[type] || '';
    this.sendMessage();
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isThinking()) return;

    const userMsg: AiMessage = { role: 'user', content: this.userInput };
    this.messages.update(m => [...m, userMsg]);

    const context = [...this.messages()];
    this.userInput = '';
    this.isThinking.set(true);

    this.aiService.chat(context).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res: any) => {
        this.messages.update(m => [...m, res.data]);
        this.isThinking.set(false);
        this.scrollToBottom();
      },
      error: (err: any) => {
        this.isThinking.set(false);
        this.notification.error(err.error?.message || 'Error en el asistente de IA');
      }
    });
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scrollContainer()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
