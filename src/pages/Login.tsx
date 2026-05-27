import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import SplitAuthLayout from '@/components/SplitAuthLayout'
import type { AuthResponse } from '@/types/auth'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const cadastroSucesso = (location.state as { cadastroSucesso?: boolean } | null)?.cadastroSucesso
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.login({ email, senha }),
    onSuccess: (data: AuthResponse) => {
      authService.saveSession(data)
      const rotas: Record<string, string> = {
        CANDIDATO: '/candidato',
        EMPRESA: '/empresa',
        ADMIN: '/admin',
      }
      navigate(rotas[data.perfil] ?? '/')
    },
  })

  const mensagemErro = error instanceof Error ? error.message : null

  return (
    <SplitAuthLayout titulo="Bem-vindo de volta" subtitulo="Acesse sua conta para continuar">
      {cadastroSucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-6">
          Conta criada com sucesso! Faça login para continuar.
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoFocus
            className={ic}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700">Senha</label>
            <a href="/esqueceu-senha" className="text-sm text-blue-600 hover:text-blue-700 transition">
              Esqueceu a senha?
            </a>
          </div>
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              required
              className={`${ic} pr-11`}
            />
            <BotaoSenha mostrar={mostrarSenha} onToggle={() => setMostrarSenha((v) => !v)} />
          </div>
        </div>

        {mensagemErro && <ErroMsg texto={mensagemErro} />}

        <button type="submit" disabled={isPending} className={btn}>
          {isPending ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Ainda não tem conta?{' '}
        <a href="/cadastro" className="text-blue-600 hover:text-blue-700 font-medium transition">
          Cadastre-se grátis
        </a>
      </p>
    </SplitAuthLayout>
  )
}

function BotaoSenha({ mostrar, onToggle }: { mostrar: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
      {mostrar
        ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
        : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
      }
    </button>
  )
}

function ErroMsg({ texto }: { texto: string }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{texto}</p>
}

const ic = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const btn = 'w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
