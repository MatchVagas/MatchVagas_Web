import api from './api'
import type { EstatisticasSistema, EmpresaAdmin, UsuarioAdmin, CandidaturaAdmin } from '@/types/admin'
import type { Vaga } from '@/types/vaga'

export const adminService = {
  async getEstatisticas(): Promise<EstatisticasSistema> {
    const res = await api.get<EstatisticasSistema>('/api/admin/estatisticas')
    return res.data
  },

  async getEmpresas(): Promise<EmpresaAdmin[]> {
    const res = await api.get<EmpresaAdmin[]>('/api/admin/empresas')
    return res.data
  },

  async getEmpresasPendentes(): Promise<EmpresaAdmin[]> {
    const res = await api.get<EmpresaAdmin[]>('/api/admin/empresas/pendentes')
    return res.data
  },

  async aprovarEmpresa(id: number): Promise<EmpresaAdmin> {
    const res = await api.patch<EmpresaAdmin>(`/api/admin/empresas/${id}/aprovar`)
    return res.data
  },

  async rejeitarEmpresa(id: number): Promise<EmpresaAdmin> {
    const res = await api.patch<EmpresaAdmin>(`/api/admin/empresas/${id}/rejeitar`)
    return res.data
  },

  async getUsuarios(): Promise<UsuarioAdmin[]> {
    const res = await api.get<UsuarioAdmin[]>('/api/admin/usuarios')
    return res.data
  },

  async ativarUsuario(id: number): Promise<void> {
    await api.patch(`/api/admin/usuarios/${id}/ativar`)
  },

  async desativarUsuario(id: number): Promise<void> {
    await api.patch(`/api/admin/usuarios/${id}/desativar`)
  },

  async excluirUsuario(id: number): Promise<void> {
    await api.delete(`/api/admin/usuarios/${id}`)
  },

  async getVagas(): Promise<Vaga[]> {
    const res = await api.get<Vaga[]>('/api/admin/vagas')
    return res.data
  },

  async atualizarStatusVaga(id: number, statusId: number): Promise<Vaga> {
    const res = await api.patch<Vaga>(`/api/admin/vagas/${id}/status/${statusId}`)
    return res.data
  },

  async excluirVaga(id: number): Promise<void> {
    await api.delete(`/api/admin/vagas/${id}`)
  },

  async getCandidaturas(): Promise<CandidaturaAdmin[]> {
    const res = await api.get<CandidaturaAdmin[]>('/api/admin/candidaturas')
    return res.data
  },

  async atualizarStatusCandidatura(id: number, statusId: number): Promise<CandidaturaAdmin> {
    const res = await api.patch<CandidaturaAdmin>(`/api/admin/candidaturas/${id}/status/${statusId}`)
    return res.data
  },
}
