import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse } from '../models';

export interface AiMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private api = inject(ApiService);

  /**
   * Enviar mensaje al asistente KernelAI
   */
  chat(messages: AiMessage[]): Observable<ApiResponse<AiMessage>> {
    return this.api.post<ApiResponse<AiMessage>>('ai/chat', { messages });
  }
}
