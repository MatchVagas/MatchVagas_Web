import api from './api'
import type { PorteOption, RamoOption } from '@/types/auth'
import type { Cidade, Escolaridade, Estado, StatusVaga } from '@/types/empresa'

export const lookupService = {
  async getPortes(): Promise<PorteOption[]> {
    const res = await api.get<PorteOption[]>('/api/lookup/vagas/portes')
    return res.data
  },

  async getRamos(): Promise<RamoOption[]> {
    const res = await api.get<RamoOption[]>('/api/lookup/vagas/ramos')
    return res.data
  },

  async getEscolaridades(): Promise<Escolaridade[]> {
    const res = await api.get<Escolaridade[]>('/api/lookup/vagas/escolaridades')
    return res.data
  },

  async getStatusVaga(): Promise<StatusVaga[]> {
    const res = await api.get<StatusVaga[]>('/api/lookup/vagas/status')
    return res.data
  },

  async getEstados(): Promise<Estado[]> {
    const res = await api.get<Estado[]>('/api/localizacao/estados')
    return res.data
  },

  async getCidades(estadoId: number): Promise<Cidade[]> {
    const res = await api.get<Cidade[]>('/api/localizacao/cidades', { params: { estadoId } })
    return res.data
  },
}
