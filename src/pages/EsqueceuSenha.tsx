import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import SplitAuthLayout from '@/components/SplitAuthLayout'

type Passo = 'email' | 'codigo' | 'senha' | 'sucesso'

export default function EsqueceuSenha() {
  const navigate = useNavigate()
  const [passo, setPasso] = useState<Passo>('email')
  const [email, setEmail] = useState('')
  const [tokenReset, setTokenReset] = useState('')

  const titulos: Record<Passo, string> = {
    email: 'Esqueceu sua senha?',
    codigo: 'Verifique seu e-mail',
    senha: 'Crie uma nova senha',
    sucesso: 'Senha redefinida!',
  }
  const subtitulos: Record<Passo, string> = {
    email: 'Informe seu e-mail e enviaremos um código de verificação.',
    codigo: 'Digite o código de 6 dígitos que enviamos para você.',
    senha: 'Escolha uma senha segura com no mínimo 6 caracteres.',
    sucesso: 'Sua senha foi alterada com sucesso.',
  }

  return (
    <SplitAuthLayout titulo={titulos[passo]} subtitulo={subtitulos[passo]}>
      {passo !== 'sucesso' && <IndicadorPassos passo={passo} />}

      {passo === 'email' && <PassoEmail onSucesso={(e) => { setEmail(e); setPasso('codigo') }} />}
      {passo === 'codigo' && <PassoCodigo email={email} onVoltar={() => setPasso('email')} onSucesso={(token) => { setTokenReset(token); setPasso('senha') }} />}
      {passo === 'senha' && <PassoSenha token={tokenReset} onSucesso={() => setPasso('sucesso')} />}
      {passo === 'sucesso' && <Sucesso onIrParaLogin={() => navigate('/login')} />}

      {passo !== 'sucesso' && (
        <p className="text-center text-sm text-gray-500 mt-6">
          Lembrou a senha?{' '}
          <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">Voltar ao login</a>
        </p>
      )}
    </SplitAuthLayout>
  )
}

function IndicadorPassos({ passo }: { passo: Passo }) {
  const passos = ['email', 'codigo', 'senha']
  const indice = passos.indexOf(passo)

  if (passo === 'sucesso') return null

  return (
    <div className="flex items-center justify-center gap-2">
      {passos.map((p, i) => (
        <div key={p} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
            ${i <= indice ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
            {i < indice ? <CheckIcon /> : i + 1}
          </div>
          {i < passos.length - 1 && (
            <div className={`w-12 h-0.5 ${i < indice ? 'bg-blue-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function PassoEmail({ onSucesso }: { onSucesso: (email: string) => void }) {
  const [email, setEmail] = useState('')

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.esqueceuSenha(email),
    onSuccess: () => onSucesso(email),
  })

  return (
    <>
      <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            autoFocus
            className={inputClass}
          />
        </div>

        {error && <MensagemErro texto={extrairErro(error)} />}

        <button type="submit" disabled={isPending} className={btnPrimary}>
          {isPending ? 'Enviando...' : 'Enviar código'}
        </button>
      </form>
    </>
  )
}

function PassoCodigo({
  email,
  onVoltar,
  onSucesso,
}: {
  email: string
  onVoltar: () => void
  onSucesso: (token: string) => void
}) {
  const [digitos, setDigitos] = useState(['', '', '', '', '', ''])
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.verificarCodigo(email, digitos.join('')),
    onSuccess: (token) => onSucesso(token),
  })

  function handleChange(index: number, valor: string) {
    const v = valor.replace(/\D/g, '').slice(0, 1)
    const novos = [...digitos]
    novos[index] = v
    setDigitos(novos)
    if (v && index < 5) inputs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digitos[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!colado) return
    e.preventDefault()
    const novos = colado.split('').concat(['', '', '', '', '', '']).slice(0, 6)
    setDigitos(novos)
    inputs.current[Math.min(colado.length, 5)]?.focus()
  }

  const codigoCompleto = digitos.every((d) => d !== '')

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onVoltar} className="text-gray-400 hover:text-gray-600 transition">
          <ArrowLeftIcon />
        </button>
        <p className="text-sm text-gray-500">Enviado para <span className="font-medium">{email}</span></p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); if (codigoCompleto) mutate() }} className="space-y-6">
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
          {digitos.map((d, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoFocus={i === 0}
              className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-gray-900
                border-gray-300 bg-white"
            />
          ))}
        </div>

        {error && <MensagemErro texto={extrairErro(error)} />}

        <button type="submit" disabled={isPending || !codigoCompleto} className={btnPrimary}>
          {isPending ? 'Verificando...' : 'Verificar código'}
        </button>
      </form>
    </>
  )
}

function PassoSenha({ token, onSucesso }: { token: string; onSucesso: () => void }) {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const senhasIguais = novaSenha === confirmar

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.redefinirSenha(token, novaSenha),
    onSuccess: onSucesso,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!senhasIguais) return
    mutate()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Nova senha</label>
          <div className="relative">
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              autoFocus
              className={`${inputClass} pr-11`}
            />
            <button
              type="button"
              onClick={() => setMostrarSenha((v) => !v)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {mostrarSenha ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
          <input
            type={mostrarSenha ? 'text' : 'password'}
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            placeholder="Repita a senha"
            required
            className={`${inputClass} ${confirmar && !senhasIguais ? 'border-red-400 focus:ring-red-500' : ''}`}
          />
          {confirmar && !senhasIguais && (
            <p className="text-xs text-red-500 mt-1">As senhas não coincidem.</p>
          )}
        </div>

        {error && <MensagemErro texto={extrairErro(error)} />}

        <button type="submit" disabled={isPending || !senhasIguais} className={btnPrimary}>
          {isPending ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </>
  )
}

function Sucesso({ onIrParaLogin }: { onIrParaLogin: () => void }) {
  return (
    <div className="text-center py-4">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
      <button onClick={onIrParaLogin} className={btnPrimary}>
        Ir para o login
      </button>
    </div>
  )
}

function MensagemErro({ texto }: { texto: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
      {texto}
    </p>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function extrairErro(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Ocorreu um erro. Tente novamente.'
}

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white'

const btnPrimary =
  'w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
