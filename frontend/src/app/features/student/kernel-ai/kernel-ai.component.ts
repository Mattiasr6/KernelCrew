import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiMessage } from '../../../core/services/ai.service';
import { NotificationService } from '../../../core/services/notification.service';

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
    >
      @if (isOpen()) {
        <span class="material-symbols-outlined">close</span>
      } @else {
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
      }
    </button>

    <!-- Chat Window -->
    @if (isOpen()) {
      <div class="chat-window">
        <header class="chat-header">
          <div class="flex items-center gap-3">
            <div class="ai-avatar">
              <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </div>
            <div>
              <h3 class="text-zinc-50 font-bold">MattClaw</h3>
              <span class="text-xs text-emerald-400 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                Online
              </span>
            </div>
          </div>
          <button (click)="toggleChat()" class="close-btn">
            <span class="material-symbols-outlined text-zinc-400">close</span>
          </button>
        </header>

        <div class="chat-messages" #scrollContainer>
          @for (msg of messages(); track $index) {
            <div class="message-wrapper" [class.user]="msg.role === 'user'">
              <div class="message-bubble" [class.ai-bubble]="msg.role === 'assistant'">
                {{ msg.content }}
              </div>
            </div>
          }
          @if (isThinking()) {
            <div class="message-wrapper">
              <div class="message-bubble ai-bubble flex gap-2 items-center">
                <span class="text-zinc-500 text-sm">Pensando</span>
                <span class="flex gap-1">
                  <span class="dot"></span>
                  <span class="dot" style="animation-delay: -0.3s"></span>
                  <span class="dot" style="animation-delay: -0.6s"></span>
                </span>
              </div>
            </div>
          }
        </div>

        <footer class="chat-input-area">
          <form (ngSubmit)="sendMessage()" class="flex gap-2">
            <input 
              type="text" 
              [(ngModel)]="userInput" 
              name="userInput" 
              placeholder="Escribe tu pregunta..."
              [disabled]="isThinking()"
              class="flex-1 input-field"
            />
            <button 
              type="submit" 
              [disabled]="!userInput.trim() || isThinking()"
              class="send-btn"
            >
              <span class="material-symbols-outlined">send</span>
            </button>
          </form>
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

    .fab-button {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 0 25px rgba(139, 92, 246, 0.5), 0 10px 30px rgba(0, 0, 0, 0.4);
      transition: all 0.3s ease-in-out;
    }

    .fab-button:hover {
      transform: scale(1.1);
      box-shadow: 0 0 35px rgba(139, 92, 246, 0.6), 0 15px 40px rgba(0, 0, 0, 0.5);
    }

    .fab-button.open {
      background: linear-gradient(135deg, #3f3f46, #27272a);
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
    }

    .fab-button span.material-symbols-outlined {
      font-size: 28px;
    }

    .chat-window {
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      height: 500px;
      display: flex;
      flex-direction: column;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(139, 92, 246, 0.1);
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .chat-header {
      padding: 16px 20px;
      background: #09090b;
      border-bottom: 1px solid #27272a;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .ai-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .close-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .close-btn:hover { background: #27272a; }

    .chat-messages {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #18181b;
    }

    .message-wrapper {
      display: flex;
      width: 100%;
    }

    .message-wrapper.user {
      justify-content: flex-end;
    }

    .message-bubble {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .message-wrapper.user .message-bubble {
      background: rgba(6, 182, 212, 0.15);
      color: #67e8f9;
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-bottom-right-radius: 4px;
    }

    .ai-bubble {
      background: #27272a;
      color: #d4d4d8;
      border: 1px solid #3f3f46;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
    }

    .chat-input-area {
      padding: 16px;
      background: #09090b;
      border-top: 1px solid #27272a;
    }

    .input-field {
      flex: 1;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 10px 14px;
      color: #fafafa;
      outline: none;
      transition: all 0.2s;
      font-size: 0.875rem;
    }
    .input-field::placeholder { color: #71717a; }
    .input-field:focus {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
    }
    .input-field:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .send-btn {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      color: white;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
    }

    .send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .dot {
      width: 5px;
      height: 5px;
      background: #8b5cf6;
      border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }

    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
  `]
})
export class KernelAIComponent {
  private aiService = inject(AiService);
  private notification = inject(NotificationService);

  isOpen = signal(false);
  
  messages = signal<AiMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy MattClaw, tu asistente de IA en KernelLearn. Estoy aquí para ayudarte con tus cursos, resolver dudas técnicas y guiarte en tu aprendizaje. ¿En qué puedo ayudarte hoy?' }
  ]);
  
  userInput = '';
  isThinking = signal(false);

  toggleChat() {
    this.isOpen.update(v => !v);
  }

  sendMessage() {
    if (!this.userInput.trim() || this.isThinking()) return;

    const userMsg: AiMessage = { role: 'user', content: this.userInput };
    this.messages.update(m => [...m, userMsg]);
    
    const context = [...this.messages()];
    this.userInput = '';
    this.isThinking.set(true);

    this.aiService.chat(context).subscribe({
      next: (res: any) => {
        this.messages.update(m => [...m, res.data]);
        this.isThinking.set(false);
      },
      error: (err: any) => {
        this.isThinking.set(false);
        this.notification.error(err.error?.message || 'Error en el asistente de IA');
      }
    });
  }
}
