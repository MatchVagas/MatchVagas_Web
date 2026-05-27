import api from './api'
import type { Notificacao } from '@/types/notificacao'

export const notificacaoService = {
  async getMinhas(): Promise<Notificacao[]> {
    const res = await api.get<Notificacao[]>('/api/notificacoes/minhas')
    return res.data
  },

  async getContagemNaoLidas(): Promise<number> {
    const res = await api.get<Record<string, number>>('/api/notificacoes/minhas/contagem')
    return res.data['naoLidas'] ?? 0
  },

  async marcarLida(id: number): Promise<Notificacao> {
    const res = await api.patch<Notificacao>(`/api/notificacoes/${id}/lida`)
    return res.data
  },

  async marcarTodasLidas(): Promise<void> {
    await api.patch('/api/notificacoes/lidas/todas')
  },

  async excluir(id: number): Promise<void> {
    await api.delete(`/api/notificacoes/${id}`)
  },
}
