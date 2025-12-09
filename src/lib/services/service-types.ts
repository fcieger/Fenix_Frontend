/**
 * Service Layer Types
 * Tipos genéricos para services e transformadores
 */

/**
 * Tipo para função de formatação de request
 */
export type FormatRequestFn<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Tipo para função de formatação de response
 */
export type FormatResponseFn<TInput, TOutput> = (input: TInput) => TOutput;

/**
 * Configuração de transformadores para um service
 */
export interface ServiceTransformers<
  TRequestPayload = any,
  TResponseData = any,
  TFormattedRequest = TRequestPayload,
  TFormattedResponse = TResponseData
> {
  formatRequest?: FormatRequestFn<TRequestPayload, TFormattedRequest>;
  formatResponse?: FormatResponseFn<TResponseData, TFormattedResponse>;
}

