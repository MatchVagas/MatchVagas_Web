import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vagaService } from '@/services/vagaService'
import { authService } from '@/services/authService'
import DashboardLayout from '@/components/DashboardLayout'
import CardVaga, { CardVagaSkeleton, BriefcaseIcon } from '@/components/CardVaga'
import type { FiltrosVaga } from '@/types/vaga'

export default function Vagas() {
  const navigate = useNavigate()
  const usuario = authService.getUsuario()
  const [searchParams] = useSearchParams()
  const tituloInicial = searchParams.get('titulo') ?? ''

  const [filtros, setFiltros] = useState<FiltrosVaga>(() => (tituloInicial ? { titulo: tituloInicial } : {}))
  const [form, setForm] = useState<FiltrosVaga>(() => (tituloInicial ? { titulo: tituloInicial } : {}))

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
            {Array.from({ length: 6 }).map((_, i) => <CardVagaSkeleton key={i} />)}
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

const ic = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white'
