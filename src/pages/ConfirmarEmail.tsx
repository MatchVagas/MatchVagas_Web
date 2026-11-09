import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { mensagemDeErro } from '@/services/api'
import SplitAuthLayout from '@/components/SplitAuthLayout'

// Destino do link enviado por e-mail no cadastro: {frontend}/confirmar-email?token=...
export default function ConfirmarEmail() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token')
  const enviado = useRef(false)

  const confirmacao = useMutation({ mutationFn: (t: string) => authService.confirmarEmail(t) })

  // O token é de uso único: o ref evita a segunda chamada do StrictMode, que falharia.
  useEffect(() => {
    if (token && !enviado.current) {
      enviado.current = true
      confirmacao.mutate(token)
    }
  }, [token, confirmacao])

  const confirmado = confirmacao.isSuccess
  const falhou = !token || confirmacao.isError

  const titulo = confirmado ? 'E-mail confirmado!' : falhou ? 'Não foi possível confirmar' : 'Confirmando seu e-mail...'
  const subtitulo = confirmado
    ? 'Sua conta está ativa. Já pode entrar.'
    : falhou
      ? 'O link é inválido, expirou ou já foi usado.'
      : 'Só um instante.'

  return (
    <SplitAuthLayout titulo={titulo} subtitulo={subtitulo}>
      {confirmado && (
        <button onClick={() => navigate('/login')} className={btn}>Ir para o login</button>
      )}

      {falhou && (
        <div className="space-y-6">
          {confirmacao.isError && (
            <ErroMsg texto={mensagemDeErro(confirmacao.error, 'Link de confirmação inválido.')} />
          )}
          <ReenviarLink />
        </div>
      )}

      <p className="text-center text-sm text-gray-500 mt-6">
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">Voltar ao login</a>
      </p>
    </SplitAuthLayout>
  )
}

function ReenviarLink() {
  const [email, setEmail] = useState('')
  const { mutate, isPending, isSuccess, error } = useMutation({
    mutationFn: () => authService.reenviarVerificacao(email),
  })

  if (isSuccess) {
    return (
      <p className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
        Se houver uma conta pendente para <strong>{email}</strong>, enviamos um novo link. Confira também a caixa de spam.
      </p>
    )
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Receber um novo link</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com" required className={ic} />
      </div>
      {error && <ErroMsg texto={mensagemDeErro(error)} />}
      <button type="submit" disabled={isPending} className={btn}>
        {isPending ? 'Enviando...' : 'Reenviar link de confirmação'}
      </button>
    </form>
  )
}

function ErroMsg({ texto }: { texto: string }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{texto}</p>
}

const ic = 'w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
const btn = 'w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
