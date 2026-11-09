import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 em /api/auth (login recusado, e-mail não confirmado) é erro do formulário,
    // não sessão expirada: recarregar a página apagaria a mensagem.
    const rotaDeAutenticacao = error.config?.url?.startsWith('/api/auth/')
    if (error.response?.status === 401 && !rotaDeAutenticacao) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

/** Mensagem que o backend devolveu (ErrorResponse.message), ou o texto padrão. */
export function mensagemDeErro(error: unknown, padrao = 'Não foi possível concluir. Tente novamente.'): string {
  if (axios.isAxiosError(error)) {
    const mensagem = (error.response?.data as { message?: string } | undefined)?.message
    if (mensagem) return mensagem
  }
  return padrao
}

export default api
