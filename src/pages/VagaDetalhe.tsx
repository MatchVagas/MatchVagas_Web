import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { vagaService } from '@/services/vagaService'
import { authService } from '@/services/authService'
import { candidatoService } from '@/services/candidatoService'
import DashboardLayout from '@/components/DashboardLayout'
import type { CandidaturaRequest } from '@/types/candidato'

function dashboardUrl(perfil: string) {
  if (perfil === 'EMPRESA') return '/empresa'
  if (perfil === 'ADMIN') return '/admin'
  return '/candidato'
}

export default function VagaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const usuario = authService.getUsuario()
  const [showModal, setShowModal] = useState(false)

  const { data: vaga, isLoading, isError } = useQuery({
    queryKey: ['vaga', id],
    queryFn: () => vagaService.buscarPorId(Number(id)),
    enabled: !!id,
  })

  const { mutate: candidatar, isPending: candidatando, isSuccess: candidatou } = useMutation({
    mutationFn: (data: CandidaturaRequest) => candidatoService.candidatar(data),
    onSuccess: () => setShowModal(false),
  })

  if (isLoading) return <PaginaCarregando />
  if (isError || !vaga) return <PaginaErro onVoltar={() => navigate('/vagas')} />

  const salario =
    vaga.salarioMinimo && vaga.salarioMaximo
      ? `${formatarMoeda(vaga.salarioMinimo)} – ${formatarMoeda(vaga.salarioMaximo)}`
      : vaga.salarioMinimo
        ? `A partir de ${formatarMoeda(vaga.salarioMinimo)}`
        : 'A combinar'

  const conteudo = (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl shrink-0">
            {vaga.nomeFantasiaEmpresa?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900">{vaga.titulo}</h1>
            <p className="text-gray-500 mt-0.5">{vaga.nomeFantasiaEmpresa}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge texto={vaga.tipoVagaDescricao} cor="blue" />
              <Badge texto={vaga.modalidadeDescricao} cor={corModalidade(vaga.modalidadeDescricao)} />
              {vaga.statusDescricao && <Badge texto={vaga.statusDescricao} cor="gray" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Secao titulo="Descrição da vaga">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{vaga.descricao}</p>
          </Secao>
          <Secao titulo="Requisitos">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{vaga.requisitos}</p>
          </Secao>
          {vaga.beneficios && (
            <Secao titulo="Benefícios">
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{vaga.beneficios}</p>
            </Secao>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Informações da vaga</h2>
            <dl className="space-y-3 text-sm">
              <InfoItem rotulo="Salário" valor={salario} />
              <InfoItem rotulo="Carga horária" valor={vaga.cargaHoraria} />
              <InfoItem rotulo="Local" valor={[vaga.nomeCidade, vaga.ufEstado].filter(Boolean).join(', ')} />
              <InfoItem rotulo="Área de atuação" valor={vaga.areaAtuacao} />
              <InfoItem rotulo="Escolaridade" valor={vaga.escolaridadeNome} />
              <InfoItem rotulo="Vagas abertas" valor={String(vaga.numeroVagas)} />
              {(vaga.idadeMinima || vaga.idadeMaxima) && (
                <InfoItem rotulo="Faixa etária" valor={`${vaga.idadeMinima ?? '—'} a ${vaga.idadeMaxima ?? '—'} anos`} />
              )}
              {vaga.dataExpiracao && (
                <InfoItem rotulo="Encerra em" valor={new Date(vaga.dataExpiracao).toLocaleDateString('pt-BR')} />
              )}
            </dl>
          </div>

          {candidatou ? (
            <div className="w-full py-3 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl text-center text-sm">
              Candidatura enviada!
            </div>
          ) : usuario?.perfil === 'CANDIDATO' ? (
            <button
              onClick={() => setShowModal(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Candidatar-se
            </button>
          ) : usuario?.perfil === 'EMPRESA' || usuario?.perfil === 'ADMIN' ? (
            <button
              onClick={() => navigate(dashboardUrl(usuario.perfil))}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition"
            >
              Meu painel
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Candidatar-se
              </button>
              <p className="text-xs text-center text-gray-400">Faça login para se candidatar a esta vaga</p>
            </>
          )}
        </div>
      </div>

      {showModal && vaga && (
        <ModalCandidatura
          vagaId={vaga.id}
          tituloVaga={vaga.titulo}
          isPending={candidatando}
          onCandidatar={candidatar}
          onFechar={() => setShowModal(false)}
        />
      )}
    </div>
  )

  if (usuario) {
    const painelUrl = dashboardUrl(usuario.perfil)
    const navItems = [
      { id: 'vagas', label: 'Explorar vagas', icon: <SearchIcon /> },
      { id: 'painel', label: 'Meu painel', icon: <LayoutIcon /> },
    ]
    return (
      <DashboardLayout
        navItems={navItems}
        activeItem="vagas"
        onNavChange={(navId) => { if (navId === 'painel') navigate(painelUrl) }}
        nomeUsuario={usuario.nome}
        perfilUsuario={usuario.perfil}
        onLogout={() => { authService.logout(); navigate('/login') }}
      >
        {conteudo}
      </DashboardLayout>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 transition">
              <ArrowLeftIcon />
            </button>
            <a href="/" className="text-xl font-bold text-blue-600">MatchVagas</a>
            <span className="text-gray-300 hidden sm:block">·</span>
            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-xs">{vaga.titulo}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-gray-600 hover:text-gray-800 transition px-3 py-2">Entrar</a>
            <a href="/cadastro" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">Cadastrar</a>
          </div>
        </div>
      </header>
      {conteudo}
    </div>
  )
}

function ModalCandidatura({ vagaId, tituloVaga, isPending, onCandidatar, onFechar }: {
  vagaId: number
  tituloVaga: string
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
        <p className="text-sm text-gray-500 mb-5">
          Selecione o que deseja compartilhar com <span className="font-medium text-gray-700">{tituloVaga}</span>
        </p>

        <div className="space-y-2 mb-6">
          {opcoes.map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={opts[key]}
                onChange={() => toggle(key)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onFechar} className="flex-1 py-2.5 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button
            onClick={() => onCandidatar({ vagaId, ...opts })}
            disabled={isPending}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition"
          >
            {isPending ? 'Enviando...' : 'Confirmar candidatura'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-3">{titulo}</h2>
      {children}
    </div>
  )
}

function InfoItem({ rotulo, valor }: { rotulo: string; valor?: string | null }) {
  if (!valor) return null
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-400 shrink-0">{rotulo}</dt>
      <dd className="text-gray-700 font-medium text-right">{valor}</dd>
    </div>
  )
}

function Badge({ texto, cor }: { texto: string; cor: 'blue' | 'green' | 'purple' | 'gray' }) {
  const cores = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-600',
  }
  return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cores[cor]}`}>{texto}</span>
}

function PaginaCarregando() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function PaginaErro({ onVoltar }: { onVoltar: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500 mb-4">Vaga não encontrada.</p>
        <button onClick={onVoltar} className="text-blue-600 hover:underline text-sm">Voltar para vagas</button>
      </div>
    </div>
  )
}

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
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

function corModalidade(modalidade: string): 'green' | 'purple' | 'gray' {
  const m = modalidade?.toLowerCase() ?? ''
  if (m.includes('remoto')) return 'green'
  if (m.includes('híbrido') || m.includes('hibrido')) return 'purple'
  return 'gray'
}

function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
}
