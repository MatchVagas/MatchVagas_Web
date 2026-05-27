import api from './api'
import type {
  CandidatoPerfil, CandidatoRequest, CandidaturaItem, CandidaturaRequest,
  Curriculo, Experiencia, ExperienciaRequest, Formacao, FormacaoRequest,
  Habilidade, SugestaoVaga,
} from '@/types/candidato'

export const candidatoService = {
  async getMeuPerfil(): Promise<CandidatoPerfil> {
    const res = await api.get<CandidatoPerfil>('/api/candidatos/meu-perfil')
    return res.data
  },

  async criarPerfil(data: CandidatoRequest): Promise<CandidatoPerfil> {
    const res = await api.post<CandidatoPerfil>('/api/candidatos', data)
    return res.data
  },

  async atualizarPerfil(data: CandidatoRequest): Promise<CandidatoPerfil> {
    const res = await api.put<CandidatoPerfil>('/api/candidatos/meu-perfil', data)
    return res.data
  },

  async uploadFoto(arquivo: File, jaTemFoto: boolean): Promise<string> {
    const form = new FormData()
    form.append('arquivo', arquivo)
    const method = jaTemFoto ? 'put' : 'post'
    const res = await api[method]<string>('/api/candidatos/meu-perfil/foto', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async removerFoto(): Promise<void> {
    await api.delete('/api/candidatos/meu-perfil/foto')
  },

  // Habilidades
  async getHabilidades(): Promise<Habilidade[]> {
    const res = await api.get<Habilidade[]>('/api/candidatos/habilidades')
    return res.data
  },

  async adicionarHabilidade(data: Habilidade): Promise<Habilidade> {
    const res = await api.post<Habilidade>('/api/candidatos/habilidades', data)
    return res.data
  },

  async removerHabilidade(nome: string): Promise<void> {
    await api.delete(`/api/candidatos/habilidades/${encodeURIComponent(nome)}`)
  },

  // Experiências
  async getExperiencias(): Promise<Experiencia[]> {
    const res = await api.get<Experiencia[]>('/api/candidatos/experiencias')
    return res.data
  },

  async adicionarExperiencia(data: ExperienciaRequest): Promise<Experiencia> {
    const res = await api.post<Experiencia>('/api/candidatos/experiencias', data)
    return res.data
  },

  async atualizarExperiencia(id: number, data: ExperienciaRequest): Promise<Experiencia> {
    const res = await api.put<Experiencia>(`/api/candidatos/experiencias/${id}`, data)
    return res.data
  },

  async removerExperiencia(id: number): Promise<void> {
    await api.delete(`/api/candidatos/experiencias/${id}`)
  },

  // Formações
  async getFormacoes(): Promise<Formacao[]> {
    const res = await api.get<Formacao[]>('/api/candidatos/formacoes')
    return res.data
  },

  async adicionarFormacao(data: FormacaoRequest): Promise<Formacao> {
    const res = await api.post<Formacao>('/api/candidatos/formacoes', data)
    return res.data
  },

  async atualizarFormacao(id: number, data: FormacaoRequest): Promise<Formacao> {
    const res = await api.put<Formacao>(`/api/candidatos/formacoes/${id}`, data)
    return res.data
  },

  async removerFormacao(id: number): Promise<void> {
    await api.delete(`/api/candidatos/formacoes/${id}`)
  },

  // Currículo
  async getMeuCurriculo(): Promise<Curriculo> {
    const res = await api.get<Curriculo>('/api/candidatos/curriculo')
    return res.data
  },

  async uploadCurriculo(arquivo: File): Promise<Curriculo> {
    const form = new FormData()
    form.append('arquivo', arquivo)
    const res = await api.post<Curriculo>('/api/candidatos/curriculo/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data
  },

  async downloadCurriculo(): Promise<void> {
    const res = await api.get('/api/candidatos/curriculo/download', { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'curriculo'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  async removerCurriculo(): Promise<void> {
    await api.delete('/api/candidatos/curriculo')
  },

  // Sugestões
  async getSugestoes(): Promise<SugestaoVaga[]> {
    const res = await api.get<SugestaoVaga[]>('/api/candidatos/sugestoes')
    return res.data
  },

  // Candidaturas
  async getMinhasCandidaturas(): Promise<CandidaturaItem[]> {
    const res = await api.get<CandidaturaItem[]>('/api/candidaturas/minhas')
    return res.data
  },

  async candidatar(data: CandidaturaRequest): Promise<void> {
    await api.post('/api/candidaturas', data)
  },

  async atualizarCompartilhamento(id: number, data: Omit<CandidaturaRequest, 'vagaId'>): Promise<CandidaturaItem> {
    const res = await api.patch<CandidaturaItem>(`/api/candidaturas/${id}/compartilhamento`, data)
    return res.data
  },
}
