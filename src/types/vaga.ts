export interface Vaga {
  id: number
  nomeFantasiaEmpresa: string
  empresaId: number
  titulo: string
  descricao: string
  requisitos: string
  beneficios?: string
  tipoVagaId: number
  tipoVagaDescricao: string
  modalidadeId: number
  modalidadeDescricao: string
  salarioMinimo: number
  salarioMaximo: number
  cargaHoraria: string
  idadeMinima?: number
  idadeMaxima?: number
  escolaridadeId: number
  escolaridadeNome: string
  areaAtuacao: string
  dataPublicacao: string
  dataExpiracao?: string
  statusVagaId: number
  statusDescricao: string
  numeroVagas: number
  cidadeId: number
  nomeCidade: string
  ufEstado: string
}

export interface FiltrosVaga {
  titulo?: string
  areaAtuacao?: string
  tipoVagaId?: string
  modalidadeId?: string
  nomeEmpresa?: string
}

export interface TipoVaga {
  id: number
  descricao: string
}

export interface Modalidade {
  id: number
  descricao: string
}
