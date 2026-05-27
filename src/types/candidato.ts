export type Genero = 'MASCULINO' | 'FEMININO' | 'NAO_BINARIO' | 'OUTRO' | 'PREFIRO_NAO_INFORMAR'
export type NivelHabilidade = 'BASICO' | 'INTERMEDIARIO' | 'AVANCADO' | 'ESPECIALISTA'

export interface CandidatoPerfil {
  id: number
  nome: string
  email: string
  dataNascimento?: string
  cpf?: string
  objetivoProfissional?: string
  disponibilidade?: string
  pretensaoSalarial?: number
  genero?: Genero
  fotoPerfilUrl?: string
  telefone?: { numero: string }
  localizacao?: { cidade?: string; estado?: string }
}

export interface CandidatoRequest {
  cpf: string
  nomeCompleto?: string
  email?: string
  dataNascimento?: string
  resumoProfissional?: string
  disponibilidade?: string
  pretensaoSalarial?: number
  genero?: Genero
  telefone?: { numero: string }
  localizacao?: { cidade?: string; estado?: string }
}

export interface Habilidade {
  nome: string
  nivel: NivelHabilidade
}

export interface Experiencia {
  id: number
  candidatoId: number
  empresa: string
  cargo: string
  descricao?: string
  dataInicio: string
  dataFim?: string
}

export interface ExperienciaRequest {
  empresa: string
  cargo: string
  descricao?: string
  dataInicio: string
  dataFim?: string
}

export interface Formacao {
  id: number
  candidatoId: number
  instituicao: string
  curso: string
  nivel: string
  dataInicio: string
  dataFim?: string
}

export interface FormacaoRequest {
  instituicao: string
  curso: string
  nivel: string
  dataInicio: string
  dataFim?: string
}

export interface Curriculo {
  id: number
  candidatoId: number
  nomeArquivo: string
  dataUpload: string
  tamanhoArquivo: number
  formatoArquivo: string
  urlArquivo?: string
}

export interface CandidaturaItem {
  id: number
  vagaId: number
  tituloVaga: string
  dataCandidatura: string
  status: string | null
  compartilharObjetivoProfissional: boolean
  compartilharDisponibilidade: boolean
  compartilharPretensaoSalarial: boolean
  compartilharCurriculo: boolean
  compartilharExperiencias: boolean
  compartilharFormacoes: boolean
  compartilharTelefone: boolean
  compartilharEndereco: boolean
}

export interface CandidaturaRequest {
  vagaId: number
  compartilharObjetivoProfissional: boolean
  compartilharDisponibilidade: boolean
  compartilharPretensaoSalarial: boolean
  compartilharCurriculo: boolean
  compartilharExperiencias: boolean
  compartilharFormacoes: boolean
  compartilharTelefone: boolean
  compartilharEndereco: boolean
}

export interface SugestaoVaga {
  vaga: {
    id: number
    titulo: string
    nomeFantasiaEmpresa: string
    tipoVagaDescricao: string
    modalidadeDescricao: string
    salarioMinimo?: number
    salarioMaximo?: number
    nomeCidade?: string
    ufEstado?: string
    areaAtuacao?: string
  }
  pontuacao: number
  motivos: string[]
}
