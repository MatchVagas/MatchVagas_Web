import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { authService } from '@/services/authService'
import { candidatoService } from '@/services/candidatoService'
import { notificacaoService } from '@/services/notificacaoService'
import DashboardLayout from '@/components/DashboardLayout'
import type {
  CandidatoPerfil, CandidatoRequest, CandidaturaItem, CandidaturaRequest,
  Experiencia, ExperienciaRequest, Formacao, FormacaoRequest,
  Habilidade, NivelHabilidade, SugestaoVaga,
} from '@/types/candidato'

type Aba = 'inicio' | 'candidaturas' | 'notificacoes' | 'perfil'

export default function PaginaCandidato() {
  const usuario = useAuth(['CANDIDATO'])
  const [aba, setAba] = useState<Aba>('inicio')
  const navigate = useNavigate()

  const { data: naoLidas = 0 } = useQuery({
    queryKey: ['notificacoes-contagem'],
    queryFn: notificacaoService.getContagemNaoLidas,
    refetchInterval: 60_000,
  })

  if (!usuario) return null

  const navItems = [
    { id: 'inicio', label: 'Início', icon: <HomeIcon /> },
    { id: 'candidaturas', label: 'Candidaturas', icon: <ListIcon /> },
    { id: 'notificacoes', label: 'Notificações', icon: <BellIcon />, badge: naoLidas },
    { id: 'perfil', label: 'Meu Perfil', icon: <UserIcon /> },
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
        {aba === 'inicio' && <AbaInicio usuarioId={usuario.usuarioId} />}
        {aba === 'candidaturas' && <AbaCandidaturas />}
        {aba === 'notificacoes' && <AbaNotificacoes />}
        {aba === 'perfil' && <AbaPerfil nome={usuario.nome} email={usuario.email} />}
      </div>
    </DashboardLayout>
  )
}

// ── ABA INÍCIO ────────────────────────────────────────────────────────────────

function AbaInicio({ usuarioId }: { usuarioId: number }) {
  const qc = useQueryClient()
  const [modalVagaId, setModalVagaId] = useState<number | null>(null)
  const [modalTitulo, setModalTitulo] = useState('')

  const { data: sugestoes = [], isLoading } = useQuery({
    queryKey: ['sugestoes', usuarioId],
    queryFn: candidatoService.getSugestoes,
  })

  const { mutate: candidatar, isPending: candidatando } = useMutation({
    mutationFn: (data: CandidaturaRequest) => candidatoService.candidatar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sugestoes', usuarioId] }); setModalVagaId(null) },
  })

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vagas para você</h1>
          <p className="text-gray-500 text-sm mt-1">Sugestões baseadas no seu perfil</p>
        </div>
        <a href="/vagas" className="text-sm text-blue-600 hover:underline">Ver todas →</a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : sugestoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500 mb-1">Nenhuma sugestão por agora.</p>
          <p className="text-sm text-gray-400">Complete seu perfil para receber vagas compatíveis.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sugestoes.map((s) => (
            <CardSugestao key={s.vaga.id} sugestao={s}
              onCandidatar={() => { setModalVagaId(s.vaga.id); setModalTitulo(s.vaga.titulo) }} />
          ))}
        </div>
      )}

      {modalVagaId !== null && (
        <ModalCandidatura
          vagaId={modalVagaId}
          tituloVaga={modalTitulo}
          isPending={candidatando}
          onCandidatar={candidatar}
          onFechar={() => setModalVagaId(null)}
        />
      )}
    </div>
  )
}

function CardSugestao({ sugestao, onCandidatar }: { sugestao: SugestaoVaga; onCandidatar: () => void }) {
  const { vaga, pontuacao, motivos } = sugestao
  const salario = vaga.salarioMinimo && vaga.salarioMaximo
    ? `${fmt(vaga.salarioMinimo)} – ${fmt(vaga.salarioMaximo)}`
    : vaga.salarioMinimo ? `A partir de ${fmt(vaga.salarioMinimo)}` : null
  const cor = pontuacao >= 75 ? 'text-green-700 bg-green-50' : pontuacao >= 50 ? 'text-yellow-700 bg-yellow-50' : 'text-gray-600 bg-gray-100'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start gap-4 hover:border-blue-200 transition">
      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
        {vaga.nomeFantasiaEmpresa?.[0]?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <a href={`/vagas/${vaga.id}`} className="font-semibold text-gray-900 hover:text-blue-700 transition">{vaga.titulo}</a>
            <p className="text-sm text-gray-500">{vaga.nomeFantasiaEmpresa}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${cor}`}>{pontuacao}% compatível</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-400">
          {[vaga.nomeCidade, vaga.ufEstado].filter(Boolean).join(', ') && <span>{[vaga.nomeCidade, vaga.ufEstado].filter(Boolean).join(', ')}</span>}
          {vaga.tipoVagaDescricao && <span>{vaga.tipoVagaDescricao}</span>}
          {vaga.modalidadeDescricao && <span>{vaga.modalidadeDescricao}</span>}
          {salario && <span className="text-gray-700 font-medium">{salario}</span>}
        </div>
        {motivos.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {motivos.map((m) => <span key={m} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{m}</span>)}
          </div>
        )}
      </div>
      <button onClick={onCandidatar}
        className="shrink-0 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
        Candidatar
      </button>
    </div>
  )
}

// ── ABA CANDIDATURAS ──────────────────────────────────────────────────────────

function AbaCandidaturas() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<CandidaturaItem | null>(null)

  const { data: candidaturas = [], isLoading } = useQuery({
    queryKey: ['minhas-candidaturas'],
    queryFn: candidatoService.getMinhasCandidaturas,
  })

  const { mutate: salvarCompartilhamento, isPending: salvando } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<CandidaturaRequest, 'vagaId'> }) =>
      candidatoService.atualizarCompartilhamento(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['minhas-candidaturas'] }); setEditando(null) },
  })

  const coreStatus: Record<string, string> = {
    PENDENTE: 'bg-yellow-100 text-yellow-700',
    EM_ANALISE: 'bg-blue-100 text-blue-700',
    APROVADO: 'bg-green-100 text-green-700',
    REPROVADO: 'bg-red-100 text-red-700',
    CANCELADO: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Minhas Candidaturas</h1>
        {!isLoading && <p className="text-gray-500 text-sm mt-1">{candidaturas.length} {candidaturas.length === 1 ? 'candidatura' : 'candidaturas'}</p>}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse h-16" />)}</div>
      ) : candidaturas.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500 mb-2">Você ainda não se candidatou a nenhuma vaga.</p>
          <a href="/vagas" className="text-sm text-blue-600 hover:underline">Ver vagas disponíveis →</a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {candidaturas.map((c) => {
            const data = new Date(c.dataCandidatura).toLocaleDateString('pt-BR')
            const status = c.status ?? 'PENDENTE'
            const cor = coreStatus[status] ?? 'bg-gray-100 text-gray-500'
            return (
              <div key={c.id} className="px-5 py-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <a href={`/vagas/${c.vagaId}`} className="font-medium text-gray-900 hover:text-blue-700 transition truncate block">{c.tituloVaga}</a>
                    <p className="text-xs text-gray-400 mt-0.5">Candidatado em {data}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cor}`}>
                      {status.replace('_', ' ')}
                    </span>
                    <button onClick={() => setEditando(c)} className="text-xs text-gray-400 hover:text-blue-600 underline">Compartilhamento</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editando && (
        <ModalCompartilhamento
          candidatura={editando}
          isPending={salvando}
          onSalvar={(data) => salvarCompartilhamento({ id: editando.id, data })}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function ModalCompartilhamento({ candidatura, isPending, onSalvar, onFechar }: {
  candidatura: CandidaturaItem
  isPending: boolean
  onSalvar: (data: Omit<CandidaturaRequest, 'vagaId'>) => void
  onFechar: () => void
}) {
  const [opts, setOpts] = useState({
    compartilharObjetivoProfissional: candidatura.compartilharObjetivoProfissional,
    compartilharDisponibilidade: candidatura.compartilharDisponibilidade,
    compartilharPretensaoSalarial: candidatura.compartilharPretensaoSalarial,
    compartilharCurriculo: candidatura.compartilharCurriculo,
    compartilharExperiencias: candidatura.compartilharExperiencias,
    compartilharFormacoes: candidatura.compartilharFormacoes,
    compartilharTelefone: candidatura.compartilharTelefone,
    compartilharEndereco: candidatura.compartilharEndereco,
  })

  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }))
  const opcoes: { key: keyof typeof opts; label: string }[] = [
    { key: 'compartilharObjetivoProfissional', label: 'Objetivo profissional' },
    { key: 'compartilharDisponibilidade', label: 'Disponibilidade' },
    { key: 'compartilharPretensaoSalarial', label: 'Pretensão salarial' },
    { key: 'compartilharCurriculo', label: 'Currículo' },
    { key: 'compartilharExperiencias', label: 'Experiências' },
    { key: 'compartilharFormacoes', label: 'Formações' },
    { key: 'compartilharTelefone', label: 'Telefone' },
    { key: 'compartilharEndereco', label: 'Endereço' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base font-bold text-gray-900 mb-1">Compartilhamento</h2>
        <p className="text-sm text-gray-500 mb-4">{candidatura.tituloVaga}</p>
        <div className="space-y-2 mb-5">
          {opcoes.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer py-1 px-2 rounded-lg hover:bg-gray-50">
              <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={() => onSalvar(opts)} disabled={isPending}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition">
            {isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
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
          <button onClick={() => marcarTodas()} disabled={marcandoTodas}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50">
            Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-white rounded-xl border border-gray-200 h-16 animate-pulse" />)}</div>
      ) : notificacoes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <p className="text-gray-500 text-sm">Nenhuma notificação.</p>
        </div>
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
                <button onClick={() => marcarLida(n.id)} className="text-xs text-gray-400 hover:text-blue-600 shrink-0">
                  Marcar como lida
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── ABA PERFIL ────────────────────────────────────────────────────────────────

function AbaPerfil({ nome, email }: { nome: string; email: string }) {
  const qc = useQueryClient()
  const { data: perfil, isLoading, isError } = useQuery({
    queryKey: ['meu-perfil'],
    queryFn: candidatoService.getMeuPerfil,
    retry: false,
  })

  const { mutate: salvar, isPending, error } = useMutation({
    mutationFn: (data: CandidatoRequest) =>
      !isError && perfil ? candidatoService.atualizarPerfil(data) : candidatoService.criarPerfil(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meu-perfil'] }),
  })

  if (isLoading) {
    return <div className="max-w-3xl space-y-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse" />)}</div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        <p className="text-gray-500 text-sm mt-1">{perfil ? 'Mantenha suas informações atualizadas.' : 'Complete seu perfil para receber sugestões de vagas.'}</p>
      </div>

      <FotoSection perfil={perfil} />
      <FormPerfil perfil={perfil} nomeUsuario={nome} emailUsuario={email} isPending={isPending} error={error} onSalvar={salvar} />
      <CurriculoSection />
      <HabilidadesSection />
      <ExperienciasSection />
      <FormacoesSection />
    </div>
  )
}

function FotoSection({ perfil }: { perfil?: CandidatoPerfil }) {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: (f: File) => candidatoService.uploadFoto(f, !!perfil?.fotoPerfilUrl),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meu-perfil'] }),
  })

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: candidatoService.removerFoto,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meu-perfil'] }),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Foto de perfil</h2>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl shrink-0 overflow-hidden">
          {perfil?.fotoPerfilUrl
            ? <img src={perfil.fotoPerfilUrl} alt="Foto" className="w-full h-full object-cover" />
            : (perfil?.nome?.[0] ?? '?').toUpperCase()
          }
        </div>
        <div className="flex gap-2">
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
            {uploading ? 'Enviando...' : 'Alterar foto'}
          </button>
          {perfil?.fotoPerfilUrl && (
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

function CurriculoSection() {
  const qc = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: curriculo, isError } = useQuery({
    queryKey: ['meu-curriculo'],
    queryFn: candidatoService.getMeuCurriculo,
    retry: false,
  })

  const { mutate: upload, isPending: uploading } = useMutation({
    mutationFn: (f: File) => candidatoService.uploadCurriculo(f),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meu-curriculo'] }),
  })

  const { mutate: remover, isPending: removendo } = useMutation({
    mutationFn: candidatoService.removerCurriculo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['meu-curriculo'] }),
  })

  const { mutate: baixar, isPending: baixando } = useMutation({
    mutationFn: candidatoService.downloadCurriculo,
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Currículo</h2>
      {curriculo && !isError ? (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <FileIcon />
            <div>
              <p className="text-sm font-medium text-gray-800">{curriculo.nomeArquivo}</p>
              <p className="text-xs text-gray-400">
                {curriculo.formatoArquivo?.toUpperCase()} · {(curriculo.tamanhoArquivo / 1024).toFixed(0)} KB
                · Enviado em {new Date(curriculo.dataUpload).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => baixar()} disabled={baixando}
              className="text-xs text-blue-600 hover:underline disabled:opacity-50">
              {baixando ? '...' : 'Baixar'}
            </button>
            <button onClick={() => inputRef.current?.click()} className="text-xs text-gray-500 hover:underline">
              Substituir
            </button>
            <button onClick={() => remover()} disabled={removendo}
              className="text-xs text-red-500 hover:underline disabled:opacity-50">
              {removendo ? '...' : 'Remover'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm text-gray-500 mb-2">Nenhum currículo enviado</p>
          <button onClick={() => inputRef.current?.click()} disabled={uploading}
            className="text-sm text-blue-600 hover:underline disabled:opacity-50">
            {uploading ? 'Enviando...' : '+ Enviar currículo'}
          </button>
        </div>
      )}
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      <p className="text-xs text-gray-400 mt-3">PDF, DOC ou DOCX. Máximo 5 MB.</p>
    </div>
  )
}

function HabilidadesSection() {
  const qc = useQueryClient()
  const [novoNome, setNovoNome] = useState('')
  const [novoNivel, setNovoNivel] = useState<NivelHabilidade>('BASICO')

  const { data: habilidades = [], isLoading } = useQuery({
    queryKey: ['habilidades'],
    queryFn: candidatoService.getHabilidades,
  })

  const { mutate: adicionar, isPending: adicionando } = useMutation({
    mutationFn: (data: Habilidade) => candidatoService.adicionarHabilidade(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habilidades'] }); setNovoNome('') },
  })

  const { mutate: remover } = useMutation({
    mutationFn: (nome: string) => candidatoService.removerHabilidade(nome),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habilidades'] }),
  })

  const nivelLabel: Record<NivelHabilidade, string> = {
    BASICO: 'Básico', INTERMEDIARIO: 'Intermediário', AVANCADO: 'Avançado', ESPECIALISTA: 'Especialista',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Habilidades</h2>

      {!isLoading && habilidades.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {habilidades.map((h) => (
            <div key={h.nome} className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm">
              <span className="text-gray-800">{h.nome}</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500 text-xs">{nivelLabel[h.nivel]}</span>
              <button onClick={() => remover(h.nome)} className="ml-1 text-gray-400 hover:text-red-500 transition">×</button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); if (novoNome.trim()) adicionar({ nome: novoNome.trim(), nivel: novoNivel }) }}
        className="flex gap-2">
        <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Ex: React"
          className={`${ic} flex-1`} />
        <select value={novoNivel} onChange={(e) => setNovoNivel(e.target.value as NivelHabilidade)} className={ic} style={{ width: 'auto' }}>
          {(Object.keys(nivelLabel) as NivelHabilidade[]).map((n) => <option key={n} value={n}>{nivelLabel[n]}</option>)}
        </select>
        <button type="submit" disabled={adicionando || !novoNome.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold rounded-lg transition">
          Adicionar
        </button>
      </form>
    </div>
  )
}

function ExperienciasSection() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<Experiencia | 'novo' | null>(null)

  const { data: experiencias = [], isLoading } = useQuery({
    queryKey: ['experiencias'],
    queryFn: candidatoService.getExperiencias,
  })

  const { mutate: salvar, isPending: salvando } = useMutation({
    mutationFn: (data: ExperienciaRequest) =>
      editando && editando !== 'novo'
        ? candidatoService.atualizarExperiencia(editando.id, data)
        : candidatoService.adicionarExperiencia(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['experiencias'] }); setEditando(null) },
  })

  const { mutate: remover } = useMutation({
    mutationFn: (id: number) => candidatoService.removerExperiencia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['experiencias'] }),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Experiências Profissionais</h2>
        <button onClick={() => setEditando('novo')} className="text-sm text-blue-600 hover:underline">+ Adicionar</button>
      </div>

      {isLoading ? <div className="h-12 bg-gray-100 rounded-lg animate-pulse" /> : (
        <div className="space-y-3">
          {experiencias.map((exp) => (
            <div key={exp.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">{exp.cargo}</p>
                <p className="text-sm text-gray-600">{exp.empresa}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {exp.dataInicio} — {exp.dataFim ?? 'Atual'}
                </p>
                {exp.descricao && <p className="text-xs text-gray-500 mt-1">{exp.descricao}</p>}
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button onClick={() => setEditando(exp)} className="text-xs text-gray-400 hover:text-blue-600">Editar</button>
                <button onClick={() => remover(exp.id)} className="text-xs text-gray-400 hover:text-red-500">Remover</button>
              </div>
            </div>
          ))}
          {experiencias.length === 0 && <p className="text-sm text-gray-400">Nenhuma experiência adicionada.</p>}
        </div>
      )}

      {editando !== null && (
        <FormExperiencia
          inicial={editando !== 'novo' ? editando : undefined}
          isPending={salvando}
          onSalvar={salvar}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function FormExperiencia({ inicial, isPending, onSalvar, onFechar }: {
  inicial?: Experiencia
  isPending: boolean
  onSalvar: (data: ExperienciaRequest) => void
  onFechar: () => void
}) {
  const [form, setForm] = useState<ExperienciaRequest>({
    empresa: inicial?.empresa ?? '',
    cargo: inicial?.cargo ?? '',
    descricao: inicial?.descricao ?? '',
    dataInicio: inicial?.dataInicio ?? '',
    dataFim: inicial?.dataFim ?? '',
  })

  function set(k: keyof ExperienciaRequest, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <div className="mt-4 p-4 border border-blue-200 rounded-xl bg-blue-50/30 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Empresa"><input value={form.empresa} onChange={(e) => set('empresa', e.target.value)} required className={ic} /></Campo>
        <Campo label="Cargo"><input value={form.cargo} onChange={(e) => set('cargo', e.target.value)} required className={ic} /></Campo>
        <Campo label="Data de início"><input type="text" placeholder="MM/AAAA" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} className={ic} /></Campo>
        <Campo label="Data de fim"><input type="text" placeholder="MM/AAAA (ou vazio se atual)" value={form.dataFim ?? ''} onChange={(e) => set('dataFim', e.target.value)} className={ic} /></Campo>
      </div>
      <Campo label="Descrição">
        <textarea value={form.descricao ?? ''} onChange={(e) => set('descricao', e.target.value)} rows={2} className={`${ic} resize-none`} />
      </Campo>
      <div className="flex gap-2 justify-end">
        <button onClick={onFechar} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
        <button onClick={() => onSalvar(form)} disabled={isPending}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition">
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

function FormacoesSection() {
  const qc = useQueryClient()
  const [editando, setEditando] = useState<Formacao | 'novo' | null>(null)

  const { data: formacoes = [], isLoading } = useQuery({
    queryKey: ['formacoes'],
    queryFn: candidatoService.getFormacoes,
  })

  const { mutate: salvar, isPending: salvando } = useMutation({
    mutationFn: (data: FormacaoRequest) =>
      editando && editando !== 'novo'
        ? candidatoService.atualizarFormacao(editando.id, data)
        : candidatoService.adicionarFormacao(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['formacoes'] }); setEditando(null) },
  })

  const { mutate: remover } = useMutation({
    mutationFn: (id: number) => candidatoService.removerFormacao(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['formacoes'] }),
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Formação Acadêmica</h2>
        <button onClick={() => setEditando('novo')} className="text-sm text-blue-600 hover:underline">+ Adicionar</button>
      </div>

      {isLoading ? <div className="h-12 bg-gray-100 rounded-lg animate-pulse" /> : (
        <div className="space-y-3">
          {formacoes.map((f) => (
            <div key={f.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-900 text-sm">{f.curso}</p>
                <p className="text-sm text-gray-600">{f.instituicao} · {f.nivel}</p>
                <p className="text-xs text-gray-400 mt-0.5">{f.dataInicio} — {f.dataFim ?? 'Em curso'}</p>
              </div>
              <div className="flex gap-2 ml-3 shrink-0">
                <button onClick={() => setEditando(f)} className="text-xs text-gray-400 hover:text-blue-600">Editar</button>
                <button onClick={() => remover(f.id)} className="text-xs text-gray-400 hover:text-red-500">Remover</button>
              </div>
            </div>
          ))}
          {formacoes.length === 0 && <p className="text-sm text-gray-400">Nenhuma formação adicionada.</p>}
        </div>
      )}

      {editando !== null && (
        <FormFormacao
          inicial={editando !== 'novo' ? editando : undefined}
          isPending={salvando}
          onSalvar={salvar}
          onFechar={() => setEditando(null)}
        />
      )}
    </div>
  )
}

function FormFormacao({ inicial, isPending, onSalvar, onFechar }: {
  inicial?: Formacao
  isPending: boolean
  onSalvar: (data: FormacaoRequest) => void
  onFechar: () => void
}) {
  const [form, setForm] = useState<FormacaoRequest>({
    instituicao: inicial?.instituicao ?? '',
    curso: inicial?.curso ?? '',
    nivel: inicial?.nivel ?? '',
    dataInicio: inicial?.dataInicio ?? '',
    dataFim: inicial?.dataFim ?? '',
  })

  function set(k: keyof FormacaoRequest, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  return (
    <div className="mt-4 p-4 border border-blue-200 rounded-xl bg-blue-50/30 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Instituição"><input value={form.instituicao} onChange={(e) => set('instituicao', e.target.value)} required className={ic} /></Campo>
        <Campo label="Curso"><input value={form.curso} onChange={(e) => set('curso', e.target.value)} required className={ic} /></Campo>
        <Campo label="Nível">
          <select value={form.nivel} onChange={(e) => set('nivel', e.target.value)} className={ic}>
            <option value="">Selecione</option>
            <option value="Ensino Médio">Ensino Médio</option>
            <option value="Técnico">Técnico</option>
            <option value="Graduação">Graduação</option>
            <option value="Pós-graduação">Pós-graduação</option>
            <option value="Mestrado">Mestrado</option>
            <option value="Doutorado">Doutorado</option>
          </select>
        </Campo>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Início"><input placeholder="MM/AAAA" value={form.dataInicio} onChange={(e) => set('dataInicio', e.target.value)} className={ic} /></Campo>
          <Campo label="Fim"><input placeholder="MM/AAAA" value={form.dataFim ?? ''} onChange={(e) => set('dataFim', e.target.value)} className={ic} /></Campo>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onFechar} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">Cancelar</button>
        <button onClick={() => onSalvar(form)} disabled={isPending}
          className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition">
          {isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

function FormPerfil({ perfil, nomeUsuario, emailUsuario, isPending, error, onSalvar }: {
  perfil?: CandidatoPerfil; nomeUsuario: string; emailUsuario: string
  isPending: boolean; error: unknown; onSalvar: (d: CandidatoRequest) => void
}) {
  const [form, setForm] = useState<CandidatoRequest>({
    cpf: perfil?.cpf ?? '',
    nomeCompleto: perfil?.nome ?? nomeUsuario,
    email: perfil?.email ?? emailUsuario,
    dataNascimento: perfil?.dataNascimento ?? '',
    resumoProfissional: perfil?.objetivoProfissional ?? '',
    disponibilidade: perfil?.disponibilidade ?? '',
    pretensaoSalarial: perfil?.pretensaoSalarial,
    genero: perfil?.genero,
    telefone: perfil?.telefone,
    localizacao: perfil?.localizacao,
  })

  function set<K extends keyof CandidatoRequest>(campo: K, valor: CandidatoRequest[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSalvar(form) }} className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Dados pessoais</h2>
        <div className="grid grid-cols-2 gap-4">
          <Campo label="Nome completo">
            <input type="text" value={form.nomeCompleto ?? ''} onChange={(e) => set('nomeCompleto', e.target.value)} className={ic} />
          </Campo>
          <Campo label="CPF">
            <input type="text" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" required className={ic} />
          </Campo>
          <Campo label="Data de nascimento">
            <input type="date" value={typeof form.dataNascimento === 'string' ? form.dataNascimento : ''} onChange={(e) => set('dataNascimento', e.target.value)} className={ic} />
          </Campo>
          <Campo label="Gênero">
            <select value={form.genero ?? ''} onChange={(e) => set('genero', (e.target.value as typeof form.genero) || undefined)} className={ic}>
              <option value="">Prefiro não informar</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="NAO_BINARIO">Não-binário</option>
              <option value="OUTRO">Outro</option>
            </select>
          </Campo>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Informações profissionais</h2>
        <Campo label="Objetivo profissional">
          <textarea value={form.resumoProfissional ?? ''} onChange={(e) => set('resumoProfissional', e.target.value)}
            rows={4} placeholder="Descreva seu objetivo e experiências" className={`${ic} resize-none`} />
        </Campo>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Campo label="Disponibilidade">
            <input type="text" value={form.disponibilidade ?? ''} onChange={(e) => set('disponibilidade', e.target.value)} placeholder="Ex: Imediata, 30 dias" className={ic} />
          </Campo>
          <Campo label="Pretensão salarial (R$)">
            <input type="number" value={form.pretensaoSalarial ?? ''} onChange={(e) => set('pretensaoSalarial', e.target.value ? Number(e.target.value) : undefined)} min={0} className={ic} />
          </Campo>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Contato e localização</h2>
        <div className="grid grid-cols-3 gap-4">
          <Campo label="Telefone">
            <input type="tel" value={form.telefone?.numero ?? ''} onChange={(e) => set('telefone', { numero: e.target.value })} placeholder="(00) 00000-0000" className={ic} />
          </Campo>
          <Campo label="Cidade">
            <input type="text" value={form.localizacao?.cidade ?? ''} onChange={(e) => set('localizacao', { ...form.localizacao, cidade: e.target.value })} placeholder="Sua cidade" className={ic} />
          </Campo>
          <Campo label="Estado (UF)">
            <input type="text" value={form.localizacao?.estado ?? ''} onChange={(e) => set('localizacao', { ...form.localizacao, estado: e.target.value })} placeholder="SP" maxLength={2} className={ic} />
          </Campo>
        </div>
      </div>

      {error instanceof Error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{error.message}</p>
      )}

      <button type="submit" disabled={isPending}
        className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition">
        {isPending ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  )
}

// ── MODAL CANDIDATURA ─────────────────────────────────────────────────────────

function ModalCandidatura({ vagaId, tituloVaga, isPending, onCandidatar, onFechar }: {
  vagaId: number; tituloVaga: string
  isPending: boolean
  onCandidatar: (data: CandidaturaRequest) => void
  onFechar: () => void
}) {
  const [opts, setOpts] = useState({
    compartilharObjetivoProfissional: true,
    compartilharDisponibilidade: true,
    compartilharPretensaoSalarial: false,
    compartilharCurriculo: true,
    compartilharExperiencias: true,
    compartilharFormacoes: true,
    compartilharTelefone: false,
    compartilharEndereco: false,
  })

  const toggle = (k: keyof typeof opts) => setOpts((o) => ({ ...o, [k]: !o[k] }))
  const opcoes: { key: keyof typeof opts; label: string }[] = [
    { key: 'compartilharObjetivoProfissional', label: 'Objetivo profissional' },
    { key: 'compartilharDisponibilidade', label: 'Disponibilidade' },
    { key: 'compartilharPretensaoSalarial', label: 'Pretensão salarial' },
    { key: 'compartilharCurriculo', label: 'Currículo' },
    { key: 'compartilharExperiencias', label: 'Experiências' },
    { key: 'compartilharFormacoes', label: 'Formações' },
    { key: 'compartilharTelefone', label: 'Telefone' },
    { key: 'compartilharEndereco', label: 'Endereço' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onFechar}>
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Candidatar-se</h2>
        <p className="text-sm text-gray-500 mb-5">Selecione o que deseja compartilhar com <span className="font-medium text-gray-700">{tituloVaga}</span></p>
        <div className="space-y-2 mb-6">
          {opcoes.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-gray-50">
              <input type="checkbox" checked={opts[key]} onChange={() => toggle(key)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={() => onCandidatar({ vagaId, ...opts })} disabled={isPending}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition">
            {isPending ? 'Enviando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}

function HomeIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> }
function ListIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg> }
function BellIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg> }
function UserIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> }
function FileIcon() { return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg> }

const ic = 'w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-sm'
