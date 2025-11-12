import { api } from '@/config/api';

export interface ChatMessage {
  id: string;
  userMessage: string;
  aiResponse: string;
  createdAt: string;
  tokensUsed?: number;
}

export interface SendMessageRequest {
  message: string;
  context?: Array<{ role: string; content: string }>;
  companyId?: string;
}

export interface SendMessageResponse {
  message: string;
  tokensUsed?: number;
}

class ChatService {
  /**
   * Envia mensagem para o chat e recebe resposta da IA
   */
  async sendMessage(data: SendMessageRequest): Promise<SendMessageResponse> {
    // Timeout maior para chat (120 segundos) porque a IA pode chamar tools
    const response = await api.post('/api/chat/message', data, {
      timeout: 120000, // 120 segundos (2 minutos)
    });
    return response.data.data;
  }

  /**
   * Busca histórico de conversas
   */
  async getHistory(companyId?: string, limit: number = 50): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);
    params.append('limit', limit.toString());

    const response = await api.get(`/api/chat/history?${params.toString()}`);
    return response.data.data;
  }

  /**
   * Limpa histórico de conversas
   */
  async clearHistory(companyId?: string): Promise<void> {
    const params = new URLSearchParams();
    if (companyId) params.append('companyId', companyId);

    await api.delete(`/api/chat/history?${params.toString()}`);
  }

  /**
   * Análise de dados com IA
   */
  async analyzeData(data: any, question: string): Promise<string> {
    const response = await api.post('/api/chat/analyze', { data, question });
    return response.data.data.analysis;
  }
}

export default new ChatService();

