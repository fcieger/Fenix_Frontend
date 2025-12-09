import { SdkErrorHandler } from '@/lib/sdk/error-handler';
import type {
  FormatRequestFn,
  FormatResponseFn,
  ServiceTransformers,
} from './service-types';

/**
 * Base Service
 * Classe base abstrata para todos os services do projeto
 *
 * Fornece estrutura comum com formatação de request/response
 * e tratamento de erros padronizado.
 *
 * @template TRequestPayload - Tipo do payload de request original
 * @template TResponseData - Tipo da resposta da API original
 * @template TFormattedRequest - Tipo do payload formatado para envio
 * @template TFormattedResponse - Tipo da resposta formatada para retorno
 */
export abstract class BaseService<
  TRequestPayload = any,
  TResponseData = any,
  TFormattedRequest = TRequestPayload,
  TFormattedResponse = TResponseData
> {
  protected transformers?: ServiceTransformers<
    TRequestPayload,
    TResponseData,
    TFormattedRequest,
    TFormattedResponse
  >;

  constructor(
    transformers?: ServiceTransformers<
      TRequestPayload,
      TResponseData,
      TFormattedRequest,
      TFormattedResponse
    >
  ) {
    this.transformers = transformers;
  }

  /**
   * Formata o payload antes de enviar para a API
   */
  protected formatRequest(payload: TRequestPayload): TFormattedRequest {
    if (this.transformers?.formatRequest) {
      return this.transformers.formatRequest(payload);
    }
    return payload as unknown as TFormattedRequest;
  }

  /**
   * Formata a resposta da API antes de retornar
   */
  protected formatResponse(data: TResponseData): TFormattedResponse {
    if (this.transformers?.formatResponse) {
      return this.transformers.formatResponse(data);
    }
    return data as unknown as TFormattedResponse;
  }

  /**
   * Wrapper para tratamento de erros padronizado
   */
  protected handleError(error: unknown): never {
    const errorInfo = SdkErrorHandler.handleError(error);
    throw new Error(errorInfo.message);
  }

  /**
   * Executa uma operação com tratamento de erro e formatação
   *
   * @param operation - Função assíncrona que executa a operação
   * @param formatResponse - Função opcional de formatação de response (sobrescreve a padrão)
   * @returns Promise com o resultado formatado
   */
  protected async executeWithFormatting<T>(
    operation: () => Promise<TResponseData>,
    formatResponse?: FormatResponseFn<TResponseData, T>
  ): Promise<T> {
    try {
      const response = await operation();
      const formatter = formatResponse || this.transformers?.formatResponse;
      if (formatter) {
        return formatter(response) as T;
      }
      return response as unknown as T;
    } catch (error) {
      this.handleError(error);
    }
  }
}

