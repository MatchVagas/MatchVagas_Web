export interface EstatisticasSistema {
  totalUsuarios: number
  usuariosAtivos: number
  usuariosInativos: number
  totalCandidatos: number
  totalEmpresas: number
  totalVagas: number
  totalCandidaturas: number
  totalAdmins: number
}

export interface UsuarioAdmin {
  id: number
  nome: string
  email: string
  idade?: number
  ativo: boolean
  tipoUsuario: string
  dataCadastro: string
  dataUltimoAcesso?: string
}

export interface EmpresaAdmin {
  id: number
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  descricao?: string
  porte: string
  ramoAtuacao: string
  site?: string
  logoUrl?: string
  totalVagasAtivas?: number
  status: string
}

export interface CandidaturaAdmin {
  id: number
  vagaId: number
  tituloVaga: string
  candidatoId: number
  nomeCandidato: string
  dataCandidatura: string
  status: string
}
