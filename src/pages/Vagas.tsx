import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vagaService } from '@/services/vagaService'
import { authService } from '@/services/authService'
import DashboardLayout from '@/components/DashboardLayout'
import type { FiltrosVaga, Vaga } from '@/types/vaga'

export default function Vagas() {
  const navigate = useNavigate()
  const usuario = authService.getUsuario()

  const [filtros, setFiltros] = useState<FiltrosVaga>({})
  const [form, setForm] = useState<FiltrosVaga>({})

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ['vagas', filtros],
    queryFn: () => vagaService.listar(filtros),
  })
  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-vaga'], queryFn: vagaService.getTipos, staleTime: Infinity })
  const { data: modalidades = [] } = useQuery({ queryKey: ['modalidades'], queryFn: vagaService.getModalidades, staleTime: Infinity })

  function set(campo: keyof FiltrosVaga, valor: string) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }
  function handleBuscar(e: React.FormEvent) { e.preventDefault(); setFiltros({ ...form }) }
  function handleLimpar() { setForm({}); setFiltros({}) }

  const temFiltros = Object.values(filtros).some((v) => v)

  const corpo = (
    <div className="max-w-7xl mx-auto w-full px-6 py-8 flex gap-8">
      {/* Sidebar de filtros */}
      <aside className="w-72 shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-8">
          <h2 className="font-semibold text-gray-800 mb-5">Filtrar vagas</h2>
          <form onSubmit={handleBuscar} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Cargo ou palavra-chave</label>
              <input type="text" value={form.titulo ?? ''} onChange={(e) => set('titulo', e.target.value)}
                placeholder="Ex: Desenvolvedor" className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Área de atuação</label>
              <input type="text" value={form.areaAtuacao ?? ''} onChange={(e) => set('areaAtuacao', e.target.value)}
                placeholder="Ex: Tecnologia" className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Empresa</label>
              <input type="text" value={form.nomeEmpresa ?? ''} onChange={(e) => set('nomeEmpresa', e.target.value)}
                placeholder="Nome da empresa" className={ic} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Tipo de vaga</label>
              <select value={form.tipoVagaId ?? ''} onChange={(e) => set('tipoVagaId', e.target.value)} className={ic}>
                <option value="">Todos</option>
                {tipos.map((t) => <option key={t.id} value={t.id}>{t.descricao}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Modalidade</label>
              <select value={form.modalidadeId ?? ''} onChange={(e) => set('modalidadeId', e.target.value)} className={ic}>
                <option value="">Todas</option>
                {modalidades.map((m) => <option key={m.id} value={m.id}>{m.descricao}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
              Buscar
            </button>
            {temFiltros && (
              <button type="button" onClick={handleLimpar}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg transition">
                Limpar filtros
              </button>
            )}
          </form>
        </div>
      </aside>

      {/* Lista de vagas */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Vagas disponíveis</h1>
            {!isLoading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {vagas.length} {vagas.length === 1 ? 'vaga encontrada' : 'vagas encontradas'}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : vagas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon size={24} color="#9ca3af" />
            </div>
            <h3 className="text-gray-700 font-medium mb-1">Nenhuma vaga encontrada</h3>
            <p className="text-sm text-gray-400">
              {temFiltros ? 'Tente ajustar os filtros.' : 'Nenhuma vaga cadastrada ainda.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {vagas.map((v) => <CardVaga key={v.id} vaga={v} />)}
          </div>
        )}
      </div>
    </div>
  )

  if (usuario) {
    const painelUrl = usuario.perfil === 'EMPRESA' ? '/empresa' : '/candidato'
    const navItems = [
      { id: 'vagas', label: 'Explorar vagas', icon: <SearchIcon /> },
      { id: 'painel', label: 'Meu painel', icon: <LayoutIcon /> },
    ]
    return (
      <DashboardLayout
        navItems={navItems}
        activeItem="vagas"
        onNavChange={(id) => { if (id === 'painel') navigate(painelUrl) }}
        nomeUsuario={usuario.nome}
        perfilUsuario={usuario.perfil}
        onLogout={() => { authService.logout(); navigate('/login') }}
      >
        {corpo}
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">MatchVagas</a>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-800 transition px-3 py-2">Entrar</a>
            <a href="/cadastro" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">Cadastrar</a>
          </div>
        </div>
      </header>
      {corpo}
    </div>
  )
}

function CardVaga({ vaga }: { vaga: Vaga }) {
  const salario = vaga.salarioMinimo && vaga.salarioMaximo
    ? `${fmt(vaga.salarioMinimo)} – ${fmt(vaga.salarioMaximo)}`
    : vaga.salarioMinimo ? `A partir de ${fmt(vaga.salarioMinimo)}` : null

  return (
    <a href={`/vagas/${vaga.id}`}
      className="flex flex-col bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition group">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
          {vaga.nomeFantasiaEmpresa?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition leading-snug truncate">
            {vaga.titulo}
          </h2>
          <p className="text-sm text-gray-500 truncate">{vaga.nomeFantasiaEmpresa}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge texto={vaga.tipoVagaDescricao} cor="blue" />
        <Badge texto={vaga.modalidadeDescricao} cor={corModalidade(vaga.modalidadeDescricao)} />
      </div>

      <div className="space-y-1 text-sm text-gray-500 flex-1">
        {(vaga.nomeCidade || vaga.ufEstado) && (
          <div className="flex items-center gap-1.5">
            <LocationIcon />
            <span>{[vaga.nomeCidade, vaga.ufEstado].filter(Boolean).join(', ')}</span>
          </div>
        )}
        {vaga.areaAtuacao && (
          <div className="flex items-center gap-1.5">
            <BriefcaseIcon />
            <span>{vaga.areaAtuacao}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        {salario
          ? <span className="text-sm font-semibold text-gray-800">{salario}</span>
          : <span className="text-sm text-gray-400">A combinar</span>
        }
        <span className="text-xs text-gray-400">{vaga.numeroVagas} {vaga.numeroVagas === 1 ? 'vaga' : 'vagas'}</span>
      </div>
    </a>
  )
}

function Badge({ texto, cor }: { texto: string; cor: 'blue' | 'green' | 'purple' | 'gray' }) {
  const cores = { blue: 'bg-blue-100 text-blue-700', green: 'bg-green-100 text-green-700', purple: 'bg-purple-100 text-purple-700', gray: 'bg-gray-100 text-gray-600' }
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cores[cor]}`}>{texto}</span>
}

function corModalidade(m: string): 'green' | 'purple' | 'gray' {
  const s = m?.toLowerCase() ?? ''
  if (s.includes('remoto')) return 'green'
  if (s.includes('híbrido') || s.includes('hibrido')) return 'purple'
  return 'gray'
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function LayoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function LocationIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

function BriefcaseIcon({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
}

const ic = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white'
