import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificacoesApi } from '../lib/api';

export function useNotificacoes() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notificacoes'],
    queryFn: async () => {
      const { data } = await notificacoesApi.findAll();
      return data;
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificacoesApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificacoesApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  return {
    notificacoes: query.data?.notificacoes || [],
    totalNaoLidas: query.data?.totalNaoLidas || 0,
    isLoading: query.isLoading,
    markAsRead: markAsRead.mutate,
    markAllAsRead: markAllAsRead.mutate,
  };
}
