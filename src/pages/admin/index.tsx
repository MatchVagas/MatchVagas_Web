import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { adminService } from '@/services/adminService'
import { lookupService } from '@/services/lookupService'
import DashboardLayout from '@/components/DashboardLayout'
import type { EmpresaAdmin, UsuarioAdmin } from '@/types/admin'
import type { Vaga } from '@/types/vaga'

type Aba = 'overview' | 'empresas' | 'usuarios' | 'vagas'

export default function PaginaAdmin() {
  const usuario = useAuth(['ADMIN'])
  const [aba, setAba] = useState<Aba>('overview')
  const navigate = useNavigate()

  if (!usuario) return null

  const navItems = [
    { id: 'overview', label: 'Visão Geral', icon: <ChartIcon /> },
    { id: 'empresas', label: 'Empresas', icon: <BuildingIcon /> },
    { id: 'usuarios', label: 'Usuários', icon: <UsersIcon /> },
    { id: 'vagas', label: 'Vagas', icon: <BriefcaseIcon /> },
  ]

  return (
    <DashboardLayout
      navItems={navItems}
      activeItem={aba}
      onNavChange={(id) => setAba(id as Aba)}
      nomeUsuario={usuario.nome}
      perfilUsuario={usuario.perfil}
      onLogout={() => { authService.logout(); navigate('/login') }}
    >
      <div className="p-8">
        {aba === 'overview' && <AbaOverview />}
        {aba === 'empresas' && <AbaEmpresas />}
        {aba === 'usuarios' && <AbaUsuarios />}
        {aba === 'vagas' && <AbaVagas />}
      </div>
    </DashboardLayout>
  )
}

// ── VISÃO GERAL ───────────────────────────────────────────────────────────────

function AbaOverview() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminService.getEstatisticas,
  })

  const { data: pendentes = [] } = useQuery({
    queryKey: ['empresas-pendentes'],
    queryFn: adminService.getEmpresasPendentes,
  })

  const cards = stats ? [
    { label: 'Total de usuários', valor: stats.totalUsuarios, cor: 'bg-blue-50 text-blue-700' },
    { label: 'Usuários ativos', valor: stats.usuariosAtivos, cor: 'bg-green-50 text-green-700' },
    { label: 'Candidatos', valor: stats.totalCandidatos, cor: 'bg-purple-50 text-purple-700' },
    { label: 'Empresas', valor: stats.totalEmpresas, cor: 'bg-orange-50 text-orange-700' },
    { label: 'Vagas publicadas', valor: stats.totalVagas, cor: 'bg-cyan-50 text-cyan-700' },
    { label: 'Candidaturas', valor: stats.totalCandidaturas, cor: 'bg-pink-50 text-pink-700' },
    { label: 'Admins', valor: stats.totalAdmins, cor: 'bg-gray-100 text-gray-700' },
    { label: 'Usuários inativos', valor: stats.usuariosInativos, cor: 'bg-red-50 text-red-700' },
  ] : []

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral</h1>
        <p className="text-gray-500 text-sm mt-1">Estatísticas do sistema</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500 mb-1">{c.label}</p>
              <p className={`text-3xl font-bold ${c.cor.split(' ')[1]}`}>{c.valor.toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}

      {pendentes.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <h2 className="font-semibold text-yellow-800 mb-3">
            {pendentes.length} {pendentes.length === 1 ? 'empresa pendente' : 'empresas pendentes'} de aprovação
          </h2>
          <div className="space-y-2">
            {pendentes.slice(0, 3).map((e) => (
              <div key={e.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2.5 border border-yellow-100">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{e.nomeFantasia}</p>
                  <p className="text-xs text-gray-400">{e.cnpj} · {e.ramoAtuacao}</p>
                </div>
                <a href="#" onClick={(ev) => { ev.preventDefault(); }} className="text-xs text-blue-600 hover:underline">Ver empresas →</a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── EMPRESAS ──────────────────────────────────────────────────────────────────

function AbaEmpresas() {
  const qc = useQueryClient()
  const [filtro, setFiltro] = useState<'todas' | 'pendentes'>('pendentes')

  const { data: todas = [], isLoading: loadingTodas } = useQuery({ queryKey: ['admin-empresas'], queryFn: adminService.getEmpresas })
  const { data: pendentes = [], isLoading: loadingPendentes } = useQuery({ queryKey: ['empresas-pendentes'], queryFn: adminService.getEmpresasPendentes })

  const isLoading = filtro === 'todas' ? loadingTodas : loadingPendentes
  const lista: EmpresaAdmin[] = filtro === 'todas' ? todas : pendentes

  const { mutate: aprovar, isPending: aprovando, variables: aprovandoId } = useMutation({
    mutationFn: (id: number) => adminService.aprovarEmpresa(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-empresas'] }); qc.invalidateQueries({ queryKey: ['empresas-pendentes'] }) },
  })

  const { mutate: rejeitar, isPending: rejeitando, variables: rejeitandoId } = useMutation({
    mutationFn: (id: number) => adminService.rejeitarEmpresa(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-empresas'] }); qc.invalidateQueries({ queryKey: ['empresas-pendentes'] }) },
  })

  const statusCor: Record<string, string> = {
    APROVADA: 'bg-green-100 text-green-700',
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    REJEITADA: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-1">{lista.length} {lista.length === 1 ? 'empresa' : 'empresas'}</p>}
        </div>
        <div className="flex gap-2">
          {(['pendentes', 'todas'] as const).map((f) => (
            <button key={f} onClick={() => setFiltro(f)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition ${filtro === f ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              {f === 'pendentes' ? `Pendentes ${pendentes.length > 0 ? `(${pendentes.length})` : ''}` : 'Todas'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
      ) : lista.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500 text-sm">{filtro === 'pendentes' ? 'Nenhuma empresa pendente.' : 'Nenhuma empresa cadastrada.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {lista.map((e) => (
            <div key={e.id} className="flex items-center justify-between px-5 py-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0">
                    {e.nomeFantasia[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.nomeFantasia}</p>
                    <p className="text-xs text-gray-400">{e.cnpj} · {e.ramoAtuacao} · {e.porte}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusCor[e.status] ?? 'bg-gray-100 text-gray-600'}`}>{e.status}</span>
                {e.status === 'PENDENTE' && (
                  <>
                    <button onClick={() => aprovar(e.id)} disabled={aprovando && aprovandoId === e.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition">
                      {aprovando && aprovandoId === e.id ? '...' : 'Aprovar'}
                    </button>
                    <button onClick={() => rejeitar(e.id)} disabled={rejeitando && rejeitandoId === e.id}
                      className="px-3 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition">
                      {rejeitando && rejeitandoId === e.id ? '...' : 'Rejeitar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── USUÁRIOS ──────────────────────────────────────────────────────────────────

function AbaUsuarios() {
  const qc = useQueryClient()
  const [busca, setBusca] = useState('')

  const { data: usuarios = [], isLoading } = useQuery({ queryKey: ['admin-usuarios'], queryFn: adminService.getUsuarios })

  const { mutate: ativar } = useMutation({
    mutationFn: (id: number) => adminService.ativarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const { mutate: desativar } = useMutation({
    mutationFn: (id: number) => adminService.desativarUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: (id: number) => adminService.excluirUsuario(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-usuarios'] }),
  })

  const filtrados: UsuarioAdmin[] = busca
    ? usuarios.filter((u) => u.nome.toLowerCase().includes(busca.toLowerCase()) || u.email.toLowerCase().includes(busca.toLowerCase()))
    : usuarios

  const tipoCor: Record<string, string> = {
    CANDIDATO: 'bg-purple-100 text-purple-700',
    EMPRESA: 'bg-orange-100 text-orange-700',
    ADMIN: 'bg-blue-100 text-blue-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-1">{filtrados.length} de {usuarios.length}</p>}
        </div>
        <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-14 animate-pulse" />)}</div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-gray-500 text-sm">Nenhum usuário encontrado.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtrados.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${u.ativo ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm">{u.nome}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoCor[u.tipoUsuario] ?? 'bg-gray-100 text-gray-600'}`}>{u.tipoUsuario}</span>
                <button onClick={() => u.ativo ? desativar(u.id) : ativar(u.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition ${u.ativo ? 'text-yellow-600 border-yellow-200 hover:bg-yellow-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}>
                  {u.ativo ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => { if (confirm(`Excluir ${u.nome}?`)) excluir(u.id) }}
                  className="text-xs text-red-500 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── VAGAS ─────────────────────────────────────────────────────────────────────

function AbaVagas() {
  const qc = useQueryClient()
  const [busca, setBusca] = useState('')

  const { data: vagas = [], isLoading } = useQuery({ queryKey: ['admin-vagas'], queryFn: adminService.getVagas })
  const { data: statusList = [] } = useQuery({ queryKey: ['status-vaga'], queryFn: lookupService.getStatusVaga, staleTime: Infinity })

  const { mutate: atualizarStatus } = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) => adminService.atualizarStatusVaga(id, statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vagas'] }),
  })

  const { mutate: excluir } = useMutation({
    mutationFn: (id: number) => adminService.excluirVaga(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-vagas'] }),
  })

  const filtradas: Vaga[] = busca
    ? vagas.filter((v) => v.titulo.toLowerCase().includes(busca.toLowerCase()) || v.nomeFantasiaEmpresa?.toLowerCase().includes(busca.toLowerCase()))
    : vagas

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas</h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-1">{filtradas.length} de {vagas.length}</p>}
        </div>
        <input type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título ou empresa..."
          className="w-64 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-14 animate-pulse" />)}</div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-gray-500 text-sm">Nenhuma vaga encontrada.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtradas.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 text-sm truncate">{v.titulo}</p>
                <p className="text-xs text-gray-400">{v.nomeFantasiaEmpresa} · {v.areaAtuacao}</p>
              </div>
              <div className="flex items-center gap-3 ml-4 shrink-0">
                <span className="text-xs text-gray-500">{v.statusDescricao}</span>
                <select defaultValue="" onChange={(e) => { if (e.target.value) atualizarStatus({ id: v.id, statusId: Number(e.target.value) }) }}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="" disabled>Status</option>
                  {statusList.map((s) => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                </select>
                <button onClick={() => { if (confirm(`Excluir vaga "${v.titulo}"?`)) excluir(v.id) }}
                  className="text-xs text-red-500 px-2.5 py-1 rounded-lg border border-red-200 hover:bg-red-50 transition">
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChartIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" /></svg> }
function BuildingIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M9 3v18M15 3v18M2 9h20M2 15h20" /></svg> }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> }
function BriefcaseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> }
