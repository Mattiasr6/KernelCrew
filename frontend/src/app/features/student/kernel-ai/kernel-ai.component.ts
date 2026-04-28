import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiService, AiMessage } from '../../../core/services/ai.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-kernel-ai',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressSpinnerModule],
  template: `
    <div class="ai-chat-container glass-card animate-fade-in">
      <header class="chat-header">
        <div class="flex items-center gap-3">
          <div class="ai-avatar">
            <span class="material-symbols-outlined">smart_toy</span>
          </div>
          <div>
            <h3 class="text-white font-bold">KernelAI Assistant</h3>
            <span class="text-xs text-emerald-400 flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              Online
            </span>
          </div>
        </div>
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
            <div class="message-bubble ai-bubble flex gap-2">
              <div class="dot animate-bounce">.</div>
              <div class="dot animate-bounce [animation-delay:-0.3s]">.</div>
              <div class="dot animate-bounce [animation-delay:-0.5s]">.</div>
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
            placeholder="Haz una pregunta sobre el curso..."
            [disabled]="isThinking()"
            class="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500/50"
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
  `,
  styles: [`
    .ai-chat-container {
      width: 400px;
      height: 500px;
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.8);
      border-radius: 24px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    }

    .chat-header {
      padding: 20px;
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .ai-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .chat-messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .message-wrapper {
      display: flex;
      width: 100%;
    }

    .message-wrapper.user {
      justify-content: flex-end;
    }

    .message-bubble {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 0.9rem;
      line-height: 1.5;
      background: #3b82f6;
      color: white;
      border-bottom-right-radius: 4px;
    }

    .ai-bubble {
      background: rgba(255, 255, 255, 0.05);
      color: #e2e8f0;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      border-bottom-left-radius: 4px;
    }

    .chat-input-area {
      padding: 20px;
      background: rgba(255, 255, 255, 0.02);
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .send-btn {
      width: 42px;
      height: 42px;
      background: #3b82f6;
      color: white;
      border-radius: 12px;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .send-btn:hover:not(:disabled) {
      background: #2563eb;
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .animate-fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class KernelAIComponent {
  private aiService = inject(AiService);
  private notification = inject(NotificationService);

  messages = signal<AiMessage[]>([
    { role: 'assistant', content: '¡Hola! Soy KernelAI. ¿En qué puedo ayudarte hoy?' }
  ]);
  
  userInput = '';
  isThinking = signal(false);

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
