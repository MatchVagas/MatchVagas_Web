import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'
import type { AuthResponse } from '@/types/auth'

export function useAuth(perfisPermitidos?: AuthResponse['perfil'][]): AuthResponse | null {
  const navigate = useNavigate()
  const usuario = authService.getUsuario()

  useEffect(() => {
    if (!usuario) {
      navigate('/login')
      return
    }
    if (perfisPermitidos && !perfisPermitidos.includes(usuario.perfil)) {
      navigate('/')
    }
  }, [usuario, navigate, perfisPermitidos])

  return usuario
}
