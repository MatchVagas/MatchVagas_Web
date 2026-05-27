import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { empresaService } from '@/services/empresaService'
import { lookupService } from '@/services/lookupService'
import { notificacaoService } from '@/services/notificacaoService'
import DashboardLayout from '@/components/DashboardLayout'
import ModalVaga from './ModalVaga'
import type { Empresa, VagaForm } from '@/types/empresa'
import type { Vaga } from '@/types/vaga'

type Aba = 'vagas' | 'candidatos' | 'notificacoes' | 'perfil'

export default function PaginaEmpresa() {
  const usuario = useAuth(['EMPRESA'])
  const [aba, setAba] = useState<Aba>('vagas')
  const navigate = useNavigate()

  const { data: naoLidas = 0 } = useQuery({
    queryKey: ['notificacoes-contagem'],
    queryFn: notificacaoService.getContagemNaoLidas,
    refetchInterval: 60_000,
  })

  if (!usuario) return null

  const navItems = [
    { id: 'vagas', label: 'Minhas Vagas', icon: <BriefcaseIcon /> },
    { id: 'candidatos', label: 'Candidatos', icon: <UsersIcon /> },
    { id: 'notificacoes', label: 'Notificações', icon: <BellIcon />, badge: naoLidas },
    { id: 'perfil', label: 'Perfil da Empresa', icon: <BuildingIcon /> },
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
        {aba === 'vagas' && <AbaVagas />}
        {aba === 'candidatos' && <AbaCandidatos />}
        {aba === 'notificacoes' && <AbaNotificacoes />}
        {aba === 'perfil' && <AbaPerfil />}
      </div>
    </DashboardLayout>
  )
}

// ── ABA VAGAS ─────────────────────────────────────────────────────────────────

function AbaVagas() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'novo' | Vaga | null>(null)
  const [confirmarExcluir, setConfirmarExcluir] = useState<number | null>(null)

  const { data: empresa } = useQuery({ queryKey: ['minha-empresa'], queryFn: empresaService.getMinhaEmpresa })
  const { data: vagas = [], isLoading } = useQuery({ queryKey: ['minhas-vagas'], queryFn: empresaService.getMinhasVagas })

  const { mutate: salvar, isPending: salvando, error: erroSalvar } = useMutation({
    mutationFn: (data: VagaForm) =>
      modal && modal !== 'novo'
        ? empresaService.atualizarVaga((modal as Vaga).id, data)
        : empresaService.criarVaga(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['minhas-vagas'] }); setModal(null) },
  })

  const { mutate: excluir, isPending: excluindo } = useMutation({
    mutationFn: (id: number) => empresaService.excluirVaga(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['minhas-vagas'] }); setConfirmarExcluir(null) },
  })

  const coreStatus: Record<string, string> = {
    ATIVA: 'bg-green-100 text-green-700',
    ENCERRADA: 'bg-gray-100 text-gray-500',
    PAUSADA: 'bg-yellow-100 text-yellow-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Minhas Vagas</h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-1">{vagas.length} {vagas.length === 1 ? 'vaga publicada' : 'vagas publicadas'}</p>}
        </div>
        <button onClick={() => setModal('novo')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
          <PlusIcon /> Nova vaga
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
      ) : vagas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500 mb-2">Nenhuma vaga publicada ainda.</p>
          <button onClick={() => setModal('novo')} className="text-sm text-blue-600 hover:underline">Publicar primeira vaga →</button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {vagas.map((v) => (
            <div key={v.id} className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 truncate">{v.titulo}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${coreStatus[v.statusDescricao?.toUpperCase()] ?? 'bg-gray-100 text-gray-500'}`}>
                    {v.statusDescricao}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  {[v.tipoVagaDescricao, v.modalidadeDescricao, [v.nomeCidade, v.ufEstado].filter(Boolean).join(', ')].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-1 ml-4 shrink-0">
                <button onClick={() => setModal(v)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Editar"><EditIcon /></button>
                <button onClick={() => setConfirmarExcluir(v.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Excluir"><TrashIcon /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && empresa && (
        <ModalVaga empresaId={empresa.id} vaga={modal !== 'novo' ? modal : undefined}
          onSalvar={salvar} onFechar={() => setModal(null)} isPending={salvando} error={erroSalvar} />
      )}

      {confirmarExcluir !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><TrashIcon color="#dc2626" size={20} /></div>
            <h3 className="font-semibold text-gray-800 mb-2">Excluir vaga?</h3>
            <p className="text-sm text-gray-500 mb-6">Esta ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={() => excluir(confirmarExcluir)} disabled={excluindo}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg text-sm font-medium transition">
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ABA CANDIDATOS ────────────────────────────────────────────────────────────

function AbaCandidatos() {
  const qc = useQueryClient()
  const [vagaFiltro, setVagaFiltro] = useState('')
  const [expandido, setExpandido] = useState<number | null>(null)

  const { data: candidaturas = [], isLoading } = useQuery({ queryKey: ['candidaturas-empresa'], queryFn: empresaService.getCandidaturas })
  const { data: statusList = [] } = useQuery({ queryKey: ['status-vaga'], queryFn: lookupService.getStatusVaga, staleTime: Infinity })

  const { mutate: atualizarStatus } = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) => empresaService.atualizarStatusCandidatura(id, statusId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['candidaturas-empresa'] }),
  })

  const { mutate: baixarCurriculo } = useMutation({
    mutationFn: (id: number) => empresaService.downloadCurriculoCandidato(id),
  })

  const vagas = [...new Set(candidaturas.map((c) => c.tituloVaga))]
  const filtradas = vagaFiltro ? candidaturas.filter((c) => c.tituloVaga === vagaFiltro) : candidaturas

  const coreStatus: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    EM_ANALISE: 'bg-blue-100 text-blue-700',
    APROVADO: 'bg-green-100 text-green-700',
    REPROVADO: 'bg-red-100 text-red-700',
    CANCELADO: 'bg-gray-100 text-gray-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidatos</h1>
          {!isLoading && <p className="text-sm text-gray-500 mt-1">{filtradas.length} {filtradas.length === 1 ? 'candidatura' : 'candidaturas'}</p>}
        </div>
        {vagas.length > 1 && (
          <select value={vagaFiltro} onChange={(e) => setVagaFiltro(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            <option value="">Todas as vagas</option>
            {vagas.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-gray-500 text-sm">Nenhum candidato ainda.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filtradas.map((c) => {
            const status = c.status ?? 'PENDENTE'
            const cor = coreStatus[status] ?? 'bg-gray-100 text-gray-500'
            const data = new Date(c.dataCandidatura).toLocaleDateString('pt-BR')
            const aberto = expandido === c.id

            return (
              <div key={c.id}>
                <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition cursor-pointer" onClick={() => setExpandido(aberto ? null : c.id)}>
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                    {c.nomeCandidato[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{c.nomeCandidato}</p>
                    <p className="text-xs text-gray-400">{c.tituloVaga} · {data}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cor}`}>{status.replace('_', ' ')}</span>
                  <ChevronIcon down={!aberto} />
                </div>

                {aberto && (
                  <div className="px-5 pb-5 pt-1 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {c.objetivoProfissional && <Info rotulo="Objetivo" valor={c.objetivoProfissional} />}
                      {c.disponibilidade && <Info rotulo="Disponibilidade" valor={c.disponibilidade} />}
                      {c.pretensaoSalarial != null && <Info rotulo="Pretensão" valor={`R$ ${Number(c.pretensaoSalarial).toLocaleString('pt-BR')}`} />}
                      {c.telefones && c.telefones.length > 0 && <Info rotulo="Telefone" valor={c.telefones.join(', ')} />}
                      {c.endereco && <Info rotulo="Endereço" valor={c.endereco} />}
                    </div>

                    {c.experiencias && c.experiencias.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2 font-medium">Experiências</p>
                        <div className="space-y-1">
                          {c.experiencias.map((exp) => (
                            <p key={exp.id} className="text-sm text-gray-700">{exp.cargo} — {exp.empresa} ({exp.dataInicio}–{exp.dataFim ?? 'Atual'})</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {c.formacoes && c.formacoes.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-2 font-medium">Formações</p>
                        <div className="space-y-1">
                          {c.formacoes.map((f) => (
                            <p key={f.id} className="text-sm text-gray-700">{f.curso} — {f.instituicao} ({f.nivel})</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      {c.curriculoNomeArquivo && (
                        <button onClick={() => baixarCurriculo(c.id)}
                          className="text-xs text-blue-600 hover:underline border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition">
                          Baixar currículo
                        </button>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Status:</span>
                        <select defaultValue="" onChange={(e) => { if (e.target.value) atualizarStatus({ id: c.id, statusId: Number(e.target.value) }) }}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                          <option value="" disabled>Selecione</option>
                          {statusList.map((s) => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── ABA NOTIFICAÇÕES ──────────────────────────────────────────────────────────

function AbaNotificacoes() {
  const qc = useQueryClient()

  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes'],
    queryFn: notificacaoService.getMinhas,
  })

  const { mutate: marcarLida } = useMutation({
    mutationFn: (id: number) => notificacaoService.marcarLida(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificacoes'] }); qc.invalidateQueries({ queryKey: ['notificacoes-contagem'] }) },
  })

  const { mutate: marcarTodas, isPending: marcandoTodas } = useMutation({
    mutationFn: notificacaoService.marcarTodasLidas,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notificacoes'] }); qc.invalidateQueries({ queryKey: ['notificacoes-contagem'] }) },
  })

  const naoLidas = notificacoes.filter((n) => !n.lida).length

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificações</h1>
          {!isLoading && naoLidas > 0 && <p className="text-sm text-gray-500 mt-1">{naoLidas} não {naoLidas === 1 ? 'lida' : 'lidas'}</p>}
        </div>
        {naoLidas > 0 && (
          <button onClick={() => marcarTodas()} disabled={marcandoTodas} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
      ) : notificacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center"><p className="text-gray-500 text-sm">Nenhuma notificação.</p></div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {notificacoes.map((n) => (
            <div key={n.id} className={`px-5 py-4 flex items-start gap-3 ${!n.lida ? 'bg-blue-50/50' : ''}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.lida ? 'bg-blue-500' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{n.titulo}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.mensagem}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.dataEnvio).toLocaleString('pt-BR')}</p>
              </div>
              {!n.lida && (
                <button onClick={() => marcarLida(n.id)} className="text-xs text-gray-400 hover:text-blue-600 shrink-0">Marcar como lida</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ABA PERFIL ────────────────────────────────────────────────────────────────

function AbaPerfil() {
  const qc = useQueryClient()
  const { data: empresa, isLoading } = useQuery({ queryKey: ['minha-empresa'], queryFn: empresaService.getMinhaEmpresa })
  const { data: portes = [] } = useQuery({ queryKey: ['portes'], queryFn: lookupService.getPortes, staleTime: Infinity })
  const { data: ramos = [] } = useQuery({ queryKey: ['ramos'], queryFn: lookupService.getRamos, staleTime: Infinity })

  const { mutate: salvar, isPending, error } = useMutation({
    mutationFn: (data: Parameters<typeof empresaService.atualizar>[1]) => empresaService.atualizar(empresa!.id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['minha-empresa'] }),
  })

  if (isLoading || !empresa) {
    return <div className="max-w-3xl space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
  }

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{empresa.nomeFantasia}</h1>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${empresa.status === 'APROVADA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {empresa.status}
          </span>
        </div>
      </div>

      <LogoSection empresa={empresa} />
      <FormPerfil empresa={empresa} portes={portes} ramos={ramos} isPending={isPending} error={error} onSalvar={salvar} />
    </div>
  )
}

function LogoSection({ empresa }: { empresa: Empresa }) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: (f: File) => empresaService.uploadLogo(f, !!empresa.logoUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['minha-empresa'] }),
  })

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: empresaService.removerLogo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['minha-empresa'] }),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Logo da empresa</h2>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0 overflow-hidden border border-gray-100">
          {empresa.logoUrl
            ? <img src={empresa.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            : (empresa.nomeFantasia?.[0] ?? '?').toUpperCase()
          }
        </div>
        <div className="flex gap-2">
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            {uploading ? 'Enviando...' : 'Alterar logo'}
          </button>
          {empresa.logoUrl && (
            <button onClick={() => remover()} disabled={removendo}
              className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50">
              {removendo ? '...' : 'Remover'}
            </button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      <p className="text-xs text-gray-400 mt-3">JPG, PNG ou WebP. Máximo 5 MB.</p>
    </div>
  )
}

function FormPerfil({ empresa, portes, ramos, isPending, error, onSalvar }: {
  empresa: Empresa
  portes: { id: number; descricao: string }[]
  ramos: { id: number; descricao: string }[]
  isPending: boolean
  error: unknown
  onSalvar: (data: Parameters<typeof empresaService.atualizar>[1]) => void
}) {
  const [form, setForm] = useState({
    cnpj: empresa.cnpj ?? '',
    razaoSocial: empresa.razaoSocial ?? '',
    nomeFantasia: empresa.nomeFantasia ?? '',
    descricao: empresa.descricao ?? '',
    porteId: 0,
    ramoId: 0,
    site: empresa.site ?? '',
  })

  function set(campo: string, valor: string | number) { setForm((f) => ({ ...f, [campo]: valor })) }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSalvar(form as Parameters<typeof empresaService.atualizar>[1]) }} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Identificação</h2>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="CNPJ"><input type="text" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} required className={ic} /></Campo>
          <Campo label="Site"><input type="url" value={form.site} onChange={(e) => set('site', e.target.value)} placeholder="https://" className={ic} /></Campo>
          <Campo label="Razão Social"><input type="text" value={form.razaoSocial} onChange={(e) => set('razaoSocial', e.target.value)} required className={ic} /></Campo>
          <Campo label="Nome Fantasia"><input type="text" value={form.nomeFantasia} onChange={(e) => set('nomeFantasia', e.target.value)} required className={ic} /></Campo>
          <Campo label="Porte">
            <select value={form.porteId || ''} onChange={(e) => set('porteId', Number(e.target.value))} required className={ic}>
              <option value="">{empresa.porte ?? 'Selecione'}</option>
              {portes.map((p) => <option key={p.id} value={p.id}>{p.descricao}</option>)}
            </select>
          </Campo>
          <Campo label="Ramo de Atuação">
            <select value={form.ramoId || ''} onChange={(e) => set('ramoId', Number(e.target.value))} required className={ic}>
              <option value="">{empresa.ramoAtuacao ?? 'Selecione'}</option>
              {ramos.map((r) => <option key={r.id} value={r.id}>{r.descricao}</option>)}
            </select>
          </Campo>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Sobre a empresa</h2>
        <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
          rows={5} className={`${ic} resize-none`} placeholder="Conte sobre a empresa, cultura e missão" />
      </div>

      {error instanceof Error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error.message}</p>
      )}

      <button type="submit" disabled={isPending}
        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition">
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
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

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{rotulo}</p>
      <p className="text-sm text-gray-700">{valor}</p>
    </div>
  )
}

function BriefcaseIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg> }
function UsersIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> }
function BellIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> }
function BuildingIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M9 3v18M15 3v18M2 9h20M2 15h20" /></svg> }
function PlusIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> }
function EditIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg> }
function TrashIcon({ color = 'currentColor', size = 15 }: { color?: string; size?: number }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg> }
function ChevronIcon({ down }: { down: boolean }) { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: down ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg> }

const ic = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm'
