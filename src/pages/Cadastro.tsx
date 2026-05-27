import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { lookupService } from '@/services/lookupService'
import SplitAuthLayout from '@/components/SplitAuthLayout'

type TipoConta = 'CANDIDATO' | 'EMPRESA'

export default function Cadastro() {
  const navigate = useNavigate()
  const [tipo, setTipo] = useState<TipoConta | null>(null)

  const titulo = !tipo ? 'Crie sua conta' : tipo === 'CANDIDATO' ? 'Cadastro de Candidato' : 'Cadastro de Empresa'
  const subtitulo = !tipo ? 'Escolha como você quer usar o MatchVagas' : 'Preencha seus dados para começar'

  return (
    <SplitAuthLayout titulo={titulo} subtitulo={subtitulo}>
      {!tipo ? (
        <EscolhaTipo onEscolher={setTipo} />
      ) : tipo === 'CANDIDATO' ? (
        <FormCandidato onVoltar={() => setTipo(null)} navigate={navigate} />
      ) : (
        <FormEmpresa onVoltar={() => setTipo(null)} navigate={navigate} />
      )}
      <p className="text-center text-sm text-gray-500 mt-6">
        Já tem conta?{' '}
        <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition">Entrar</a>
      </p>
    </SplitAuthLayout>
  )
}

function EscolhaTipo({ onEscolher }: { onEscolher: (tipo: TipoConta) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button onClick={() => onEscolher('CANDIDATO')}
        className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group">
        <span className="text-4xl">👤</span>
        <span className="font-semibold text-gray-700 group-hover:text-blue-700">Candidato</span>
        <span className="text-xs text-gray-400 text-center">Busco oportunidades de emprego</span>
      </button>
      <button onClick={() => onEscolher('EMPRESA')}
        className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition group">
        <span className="text-4xl">🏢</span>
        <span className="font-semibold text-gray-700 group-hover:text-blue-700">Empresa</span>
        <span className="text-xs text-gray-400 text-center">Quero contratar talentos</span>
      </button>
    </div>
  )
}

function FormCandidato({ onVoltar, navigate }: { onVoltar: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', dataNascimento: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.registerCandidato({
      ...form,
      dataNascimento: new Date(form.dataNascimento).toISOString(),
      tipoUsuario: 'CANDIDATO',
      ativo: true,
    }),
    onSuccess: () => navigate('/login', { state: { cadastroSucesso: true } }),
  })

  function set(f: string, v: string) { setForm((prev) => ({ ...prev, [f]: v })) }

  return (
    <>
      <button onClick={onVoltar} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition">
        <ArrowLeftIcon /> Voltar
      </button>
      <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
        <Campo label="Nome completo">
          <input type="text" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" required minLength={3} className={ic} />
        </Campo>
        <Campo label="E-mail">
          <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="seu@email.com" required className={ic} />
        </Campo>
        <Campo label="Senha">
          <div className="relative">
            <input type={mostrarSenha ? 'text' : 'password'} value={form.senha} onChange={(e) => set('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres" required minLength={6} className={`${ic} pr-11`} />
            <BotaoSenha mostrar={mostrarSenha} onToggle={() => setMostrarSenha((v) => !v)} />
          </div>
        </Campo>
        <Campo label="Data de nascimento">
          <input type="date" value={form.dataNascimento} onChange={(e) => set('dataNascimento', e.target.value)}
            required max={new Date().toISOString().split('T')[0]} className={ic} />
        </Campo>
        {error && <ErroMsg texto={error instanceof Error ? error.message : 'Erro ao cadastrar.'} />}
        <button type="submit" disabled={isPending} className={btn}>{isPending ? 'Cadastrando...' : 'Criar conta'}</button>
      </form>
    </>
  )
}

function FormEmpresa({ onVoltar, navigate }: { onVoltar: () => void; navigate: ReturnType<typeof useNavigate> }) {
  const [form, setForm] = useState({ nome: '', email: '', senha: '', cnpj: '', razaoSocial: '', nomeFantasia: '', descricao: '', porteId: '', ramoId: '', site: '' })
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const { data: portes = [] } = useQuery({ queryKey: ['portes'], queryFn: lookupService.getPortes })
  const { data: ramos = [] } = useQuery({ queryKey: ['ramos'], queryFn: lookupService.getRamos })

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authService.registerEmpresa({
      nome: form.nome, email: form.email, senha: form.senha,
      cnpj: form.cnpj, razaoSocial: form.razaoSocial, nomeFantasia: form.nomeFantasia,
      descricao: form.descricao || undefined, porteId: Number(form.porteId),
      ramoId: Number(form.ramoId), site: form.site || undefined,
    }),
    onSuccess: (data) => { authService.saveSession(data); navigate('/empresa') },
  })

  function set(f: string, v: string) { setForm((prev) => ({ ...prev, [f]: v })) }

  return (
    <>
      <button onClick={onVoltar} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition">
        <ArrowLeftIcon /> Voltar
      </button>
      <form onSubmit={(e) => { e.preventDefault(); mutate() }} className="space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Responsável</p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="Nome">
            <input type="text" value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Seu nome" required minLength={3} className={ic} />
          </Campo>
          <Campo label="E-mail">
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="seu@empresa.com" required className={ic} />
          </Campo>
        </div>
        <Campo label="Senha">
          <div className="relative">
            <input type={mostrarSenha ? 'text' : 'password'} value={form.senha} onChange={(e) => set('senha', e.target.value)}
              placeholder="Mínimo 6 caracteres" required minLength={6} className={`${ic} pr-11`} />
            <BotaoSenha mostrar={mostrarSenha} onToggle={() => setMostrarSenha((v) => !v)} />
          </div>
        </Campo>

        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide pt-2">Dados da empresa</p>
        <div className="grid grid-cols-2 gap-3">
          <Campo label="CNPJ">
            <input type="text" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="00.000.000/0000-00" required className={ic} />
          </Campo>
          <Campo label="Nome Fantasia">
            <input type="text" value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} placeholder="Nome público" required className={ic} />
          </Campo>
          <Campo label="Razão Social">
            <input type="text" value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} placeholder="Razão Social Ltda" required className={ic} />
          </Campo>
          <Campo label="Site (opcional)">
            <input type="url" value={form.site} onChange={(e) => set('site', e.target.value)} placeholder="https://" className={ic} />
          </Campo>
          <Campo label="Porte">
            <select value={form.porteId} onChange={(e) => set('porteId', e.target.value)} required className={ic}>
              <option value="">Selecione</option>
              {portes.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
            </select>
          </Campo>
          <Campo label="Ramo de atuação">
            <select value={form.ramoId} onChange={(e) => set('ramoId', e.target.value)} required className={ic}>
              <option value="">Selecione</option>
              {ramos.map((r) => <option key={r.id} value={r.id}>{r.descricao}</option>)}
            </select>
          </Campo>
        </div>
        <Campo label="Descrição (opcional)">
          <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
            placeholder="Fale sobre a empresa" rows={2} className={`${ic} resize-none`} />
        </Campo>
        {error && <ErroMsg texto={error instanceof Error ? error.message : 'Erro ao cadastrar.'} />}
        <button type="submit" disabled={isPending} className={btn}>{isPending ? 'Cadastrando...' : 'Criar conta'}</button>
      </form>
    </>
  )
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
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

function ArrowLeftIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
}

function ErroMsg({ texto }: { texto: string }) {
  return <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{texto}</p>
}

const ic = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-sm bg-white'
const btn = 'w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition'
