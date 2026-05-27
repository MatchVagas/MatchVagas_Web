export interface Empresa {
  id: number
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  descricao?: string
  porte?: string
  ramoAtuacao?: string
  site?: string
  logoUrl?: string
  telefone?: { id?: number; numero: string; tipoTelefoneId?: number; wpp?: boolean }
  totalVagasAtivas?: number
  status: string
}

export interface EmpresaRequest {
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  descricao?: string
  porteId: number
  ramoId: number
  site?: string
  telefone?: { numero: string; tipoTelefoneId: number; wpp: boolean }
}

export interface VagaForm {
  empresaId: number
  titulo: string
  descricao: string
  requisitos: string
  beneficios?: string
  tipoVagaId: number
  modalidadeId: number
  salarioMinimo: number
  salarioMaximo: number
  cargaHoraria: string
  idadeMinima?: number
  idadeMaxima?: number
  escolaridadeId: number
  areaAtuacao: string
  dataExpiracao?: string
  statusVagaId: number
  numeroVagas: number
  cidadeId: number
}

export interface CandidaturaRecebida {
  id: number
  vagaId: number
  tituloVaga: string
  dataCandidatura: string
  status: string | null
  candidatoId: number
  nomeCandidato: string
  objetivoProfissional?: string
  disponibilidade?: string
  pretensaoSalarial?: number
  curriculoNomeArquivo?: string
  curriculoCaminho?: string
  experiencias?: { id: number; empresa: string; cargo: string; descricao?: string; dataInicio: string; dataFim?: string }[]
  formacoes?: { id: number; instituicao: string; curso: string; nivel: string; dataInicio: string; dataFim?: string }[]
  telefones?: string[]
  endereco?: string
}

export interface Estado {
  id: number
  nome: string
  uf: string
}

export interface Cidade {
  id: number
  nome: string
  estadoId: number
  ufEstado: string
}

export interface Escolaridade {
  id: number
  nome: string
  ordem: number
}

export interface StatusVaga {
  id: number
  descricao: string
}
