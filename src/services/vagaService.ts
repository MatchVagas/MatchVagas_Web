import api from './api'
import type { FiltrosVaga, Modalidade, TipoVaga, Vaga } from '@/types/vaga'

export const vagaService = {
  async listar(filtros: FiltrosVaga = {}): Promise<Vaga[]> {
    const params = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== '' && v !== undefined),
    )
    const res = await api.get<Vaga[]>('/api/vagas', { params })
    return res.data
  },

  async buscarPorId(id: number): Promise<Vaga> {
    const res = await api.get<Vaga>(`/api/vagas/${id}`)
    return res.data
  },

  async getTipos(): Promise<TipoVaga[]> {
    const res = await api.get<TipoVaga[]>('/api/lookup/vagas/tipos')
    return res.data
  },

  async getModalidades(): Promise<Modalidade[]> {
    const res = await api.get<Modalidade[]>('/api/lookup/vagas/modalidades')
    return res.data
  },
}
