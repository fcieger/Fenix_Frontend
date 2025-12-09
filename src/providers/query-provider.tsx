"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useMemo } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos (cacheTime foi renomeado para gcTime no v5)
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            retry: (failureCount, error: any) => {
              // Não retry em erros 4xx (exceto 408, 429)
              if (error?.response?.status >= 400 && error?.response?.status < 500) {
                if (error?.response?.status === 408 || error?.response?.status === 429) {
                  return failureCount < 3;
                }
                return false;
              }
              // Retry até 3 vezes para outros erros
              return failureCount < 3;
            },
            onError: (error: any) => {
              // Tratamento global de erros de query
              console.error('Query error:', error);
              // Aqui você pode adicionar integração com serviço de monitoramento
              // ou exibir notificações ao usuário
            },
          },
          mutations: {
            onError: (error: any) => {
              // Tratamento global de erros de mutação
              console.error('Mutation error:', error);
              // Aqui você pode adicionar integração com serviço de monitoramento
              // ou exibir notificações ao usuário
            },
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

