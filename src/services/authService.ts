import api from './api'
import type { AuthResponse, CandidatoRequest, EmpresaRequest, LoginRequest } from '@/types/auth'

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/login', data)
    return response.data
  },

  async registerCandidato(data: CandidatoRequest): Promise<void> {
    await api.post('/api/auth/register', data)
  },

  async registerEmpresa(data: EmpresaRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/api/auth/register-empresa', data)
    return response.data
  },

  async esqueceuSenha(email: string): Promise<void> {
    await api.post('/api/auth/esqueceu-senha', { email })
  },

  async verificarCodigo(email: string, codigo: string): Promise<string> {
    const res = await api.post<{ token: string }>('/api/auth/verificar-codigo', { email, codigo })
    return res.data.token
  },

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    await api.post('/api/auth/redefinir-senha', { token, novaSenha })
  },

  saveSession(auth: AuthResponse) {
    localStorage.setItem('token', auth.token)
    localStorage.setItem('usuario', JSON.stringify(auth))
  },

  getUsuario(): AuthResponse | null {
    const raw = localStorage.getItem('usuario')
    return raw ? (JSON.parse(raw) as AuthResponse) : null
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  },
}
