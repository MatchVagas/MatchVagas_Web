import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { lookupService } from '@/services/lookupService'
import type { VagaForm } from '@/types/empresa'
import type { Vaga } from '@/types/vaga'

interface Props {
  empresaId: number
  vaga?: Vaga
  onSalvar: (data: VagaForm) => void
  onFechar: () => void
  isPending: boolean
  error: unknown
}

const VAZIO: Omit<VagaForm, 'empresaId'> = {
  titulo: '', descricao: '', requisitos: '', beneficios: '',
  tipoVagaId: 0, modalidadeId: 0, salarioMinimo: 0, salarioMaximo: 0,
  cargaHoraria: '', escolaridadeId: 0, areaAtuacao: '',
  statusVagaId: 0, numeroVagas: 1, cidadeId: 0,
  dataExpiracao: '',
}

export default function ModalVaga({ empresaId, vaga, onSalvar, onFechar, isPending, error }: Props) {
  const [form, setForm] = useState<Omit<VagaForm, 'empresaId'>>(() =>
    vaga ? {
      titulo: vaga.titulo, descricao: vaga.descricao, requisitos: vaga.requisitos,
      beneficios: vaga.beneficios ?? '', tipoVagaId: vaga.tipoVagaId,
      modalidadeId: vaga.modalidadeId, salarioMinimo: Number(vaga.salarioMinimo),
      salarioMaximo: Number(vaga.salarioMaximo), cargaHoraria: vaga.cargaHoraria,
      idadeMinima: vaga.idadeMinima, idadeMaxima: vaga.idadeMaxima,
      escolaridadeId: vaga.escolaridadeId, areaAtuacao: vaga.areaAtuacao,
      dataExpiracao: vaga.dataExpiracao ? vaga.dataExpiracao.split('T')[0] : '',
      statusVagaId: vaga.statusVagaId, numeroVagas: vaga.numeroVagas,
      cidadeId: vaga.cidadeId,
    } : VAZIO
  )

  const [estadoId, setEstadoId] = useState<number>(0)

  const { data: tipos = [] } = useQuery({ queryKey: ['tipos-vaga'], queryFn: lookupService.getPortes.bind(null) })
  const { data: tiposVaga = [] } = useQuery({ queryKey: ['tipos-vaga-lookup'], queryFn: () => import('@/services/vagaService').then(m => m.vagaService.getTipos()) })
  const { data: modalidades = [] } = useQuery({ queryKey: ['modalidades'], queryFn: () => import('@/services/vagaService').then(m => m.vagaService.getModalidades()) })
  const { data: escolaridades = [] } = useQuery({ queryKey: ['escolaridades'], queryFn: lookupService.getEscolaridades, staleTime: Infinity })
  const { data: statusList = [] } = useQuery({ queryKey: ['status-vaga'], queryFn: lookupService.getStatusVaga, staleTime: Infinity })
  const { data: estados = [] } = useQuery({ queryKey: ['estados'], queryFn: lookupService.getEstados, staleTime: Infinity })
  const { data: cidades = [] } = useQuery({
    queryKey: ['cidades', estadoId],
    queryFn: () => lookupService.getCidades(estadoId),
    enabled: estadoId > 0,
  })

  // Evita warning de unused var
  void tipos

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSalvar({ ...form, empresaId })
  }

  const mensagemErro = error instanceof Error ? error.message : null

  // Fechar com Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onFechar])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            {vaga ? 'Editar vaga' : 'Nova vaga'}
          </h2>
          <button onClick={onFechar} className="text-gray-400 hover:text-gray-600 transition">
            <XIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Secao titulo="Informações básicas">
            <Campo label="Título da vaga *">
              <input type="text" value={form.titulo} onChange={(e) => set('titulo', e.target.value)}
                placeholder="Ex: Desenvolvedor Frontend Pleno" required minLength={5} className={ic} />
            </Campo>
            <Campo label="Área de atuação *">
              <input type="text" value={form.areaAtuacao} onChange={(e) => set('areaAtuacao', e.target.value)}
                placeholder="Ex: Tecnologia da Informação" required className={ic} />
            </Campo>
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Tipo de vaga *">
                <select value={form.tipoVagaId || ''} onChange={(e) => set('tipoVagaId', Number(e.target.value))} required className={ic}>
                  <option value="">Selecione</option>
                  {tiposVaga.map((t) => <option key={t.id} value={t.id}>{t.descricao}</option>)}
                </select>
              </Campo>
              <Campo label="Modalidade *">
                <select value={form.modalidadeId || ''} onChange={(e) => set('modalidadeId', Number(e.target.value))} required className={ic}>
                  <option value="">Selecione</option>
                  {modalidades.map((m) => <option key={m.id} value={m.id}>{m.descricao}</option>)}
                </select>
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Descrição e requisitos">
            <Campo label="Descrição *">
              <textarea value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
                required minLength={20} rows={4} placeholder="Descreva as responsabilidades e o dia a dia da vaga"
                className={`${ic} resize-none`} />
            </Campo>
            <Campo label="Requisitos *">
              <textarea value={form.requisitos} onChange={(e) => set('requisitos', e.target.value)}
                required rows={3} placeholder="Liste os requisitos necessários para a vaga"
                className={`${ic} resize-none`} />
            </Campo>
            <Campo label="Benefícios">
              <textarea value={form.beneficios ?? ''} onChange={(e) => set('beneficios', e.target.value)}
                rows={2} placeholder="VR, VT, plano de saúde..."
                className={`${ic} resize-none`} />
            </Campo>
          </Secao>

          <Secao titulo="Remuneração e condições">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Salário mínimo (R$) *">
                <input type="number" value={form.salarioMinimo || ''} onChange={(e) => set('salarioMinimo', Number(e.target.value))}
                  required min={0} className={ic} />
              </Campo>
              <Campo label="Salário máximo (R$) *">
                <input type="number" value={form.salarioMaximo || ''} onChange={(e) => set('salarioMaximo', Number(e.target.value))}
                  required min={0} className={ic} />
              </Campo>
              <Campo label="Carga horária *">
                <input type="text" value={form.cargaHoraria} onChange={(e) => set('cargaHoraria', e.target.value)}
                  placeholder="Ex: 40h/semana" required className={ic} />
              </Campo>
              <Campo label="Nº de vagas *">
                <input type="number" value={form.numeroVagas} onChange={(e) => set('numeroVagas', Number(e.target.value))}
                  required min={1} className={ic} />
              </Campo>
              <Campo label="Idade mínima">
                <input type="number" value={form.idadeMinima ?? ''} onChange={(e) => set('idadeMinima', e.target.value ? Number(e.target.value) : undefined)}
                  min={16} className={ic} />
              </Campo>
              <Campo label="Idade máxima">
                <input type="number" value={form.idadeMaxima ?? ''} onChange={(e) => set('idadeMaxima', e.target.value ? Number(e.target.value) : undefined)}
                  min={16} className={ic} />
              </Campo>
            </div>
          </Secao>

          <Secao titulo="Escolaridade, local e status">
            <div className="grid grid-cols-2 gap-4">
              <Campo label="Escolaridade mínima *">
                <select value={form.escolaridadeId || ''} onChange={(e) => set('escolaridadeId', Number(e.target.value))} required className={ic}>
                  <option value="">Selecione</option>
                  {escolaridades.map((e) => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
              </Campo>
              <Campo label="Status *">
                <select value={form.statusVagaId || ''} onChange={(e) => set('statusVagaId', Number(e.target.value))} required className={ic}>
                  <option value="">Selecione</option>
                  {statusList.map((s) => <option key={s.id} value={s.id}>{s.descricao}</option>)}
                </select>
              </Campo>
              <Campo label="Estado">
                <select value={estadoId || ''} onChange={(e) => { setEstadoId(Number(e.target.value)); set('cidadeId', 0) }} className={ic}>
                  <option value="">Selecione o estado</option>
                  {estados.map((e) => <option key={e.id} value={e.id}>{e.nome} ({e.uf})</option>)}
                </select>
              </Campo>
              <Campo label="Cidade *">
                <select value={form.cidadeId || ''} onChange={(e) => set('cidadeId', Number(e.target.value))} required disabled={!estadoId} className={ic}>
                  <option value="">Selecione a cidade</option>
                  {cidades.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </Campo>
              <Campo label="Data de expiração">
                <input type="date" value={form.dataExpiracao ?? ''} onChange={(e) => set('dataExpiracao', e.target.value)}
                  min={new Date().toISOString().split('T')[0]} className={ic} />
              </Campo>
            </div>
          </Secao>

          {mensagemErro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{mensagemErro}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onFechar} className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={isPending} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition">
              {isPending ? 'Salvando...' : vaga ? 'Salvar alterações' : 'Publicar vaga'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{titulo}</p>
      {children}
    </div>
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

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

const ic = 'w-full px-3 py-2 text-sm rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white disabled:bg-gray-100'
