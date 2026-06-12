import type { Vaga } from '@/types/vaga'

export default function CardVaga({ vaga }: { vaga: Vaga }) {
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

export function CardVagaSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
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

function LocationIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
}

export function BriefcaseIcon({ size = 13, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
}
