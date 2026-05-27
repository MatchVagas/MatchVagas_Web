export interface LoginRequest {
  email: string
  senha: string
}

export interface AuthResponse {
  token: string
  tipo: string
  usuarioId: number
  nome: string
  email: string
  perfil: 'CANDIDATO' | 'EMPRESA' | 'ADMIN'
}

export interface CandidatoRequest {
  nome: string
  email: string
  senha: string
  dataNascimento: string
  tipoUsuario: 'CANDIDATO'
  ativo: boolean
}

export interface EmpresaRequest {
  nome: string
  email: string
  senha: string
  dataNascimento?: string
  cnpj: string
  razaoSocial: string
  nomeFantasia: string
  descricao?: string
  porteId: number
  ramoId: number
  site?: string
}

export interface PorteOption {
  id: number
  descricao: string
}

export interface RamoOption {
  id: number
  descricao: string
}
