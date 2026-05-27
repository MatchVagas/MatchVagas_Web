import api from './api'
import type { CandidaturaRecebida, Empresa, EmpresaRequest, VagaForm } from '@/types/empresa'
import type { Vaga } from '@/types/vaga'

export const empresaService = {
  async getMinhaEmpresa(): Promise<Empresa> {
    const res = await api.get<Empresa>('/api/empresas/minha-empresa')
    return res.data
  },

  async atualizar(id: number, data: EmpresaRequest): Promise<Empresa> {
    const res = await api.put<Empresa>(`/api/empresas/${id}`, data)
    return res.data
  },

  async uploadLogo(arquivo: File, jaTemLogo: boolean): Promise<string> {
    const form = new FormData()
    form.append('arquivo', arquivo)
    const method = jaTemLogo ? 'put' : 'post'
    const res = await api[method]<string>('/api/empresas/minha-empresa/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async removerLogo(): Promise<void> {
    await api.delete('/api/empresas/minha-empresa/logo')
  },

  async getMinhasVagas(): Promise<Vaga[]> {
    const res = await api.get<Vaga[]>('/api/vagas/minhas')
    return res.data
  },

  async criarVaga(data: VagaForm): Promise<Vaga> {
    const res = await api.post<Vaga>('/api/vagas', data)
    return res.data
  },

  async atualizarVaga(id: number, data: VagaForm): Promise<Vaga> {
    const res = await api.put<Vaga>(`/api/vagas/${id}`, data)
    return res.data
  },

  async excluirVaga(id: number): Promise<void> {
    await api.delete(`/api/vagas/${id}`)
  },

  async getCandidaturas(): Promise<CandidaturaRecebida[]> {
    const res = await api.get<CandidaturaRecebida[]>('/api/candidaturas/empresa')
    return res.data
  },

  async atualizarStatusCandidatura(id: number, statusId: number): Promise<void> {
    await api.patch(`/api/candidaturas/${id}/empresa/status/${statusId}`)
  },

  async downloadCurriculoCandidato(candidaturaId: number): Promise<void> {
    const res = await api.get(`/api/candidaturas/${candidaturaId}/curriculo/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'curriculo'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
