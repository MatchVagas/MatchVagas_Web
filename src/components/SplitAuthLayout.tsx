interface Props {
  children: React.ReactNode
  titulo: string
  subtitulo: string
}

const features = [
  'Vagas de empresas verificadas',
  'Sugestões personalizadas por perfil',
  'Candidate-se com um clique',
  'Acompanhe todas as suas candidaturas',
]

export default function SplitAuthLayout({ children, titulo, subtitulo }: Props) {
  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — fixo enquanto direito scrolla */}
      <div className="hidden lg:flex lg:w-[460px] xl:w-[520px] shrink-0 sticky top-0 h-screen flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-12 text-white">
        <div>
          <span className="text-2xl font-bold tracking-tight">MatchVagas</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Conectando talentos às melhores oportunidades
          </h1>
          <p className="text-blue-200 text-lg mb-10">
            Encontre a vaga ideal ou contrate os melhores profissionais do mercado.
          </p>
          <ul className="space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-blue-100">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-blue-300 text-sm">© {new Date().getFullYear()} MatchVagas</p>
      </div>

      {/* Painel direito — scroll natural */}
      <div className="flex-1 bg-white">
        {/* Mobile header */}
        <div className="lg:hidden px-6 py-5 border-b border-gray-100">
          <span className="text-xl font-bold text-blue-600">MatchVagas</span>
        </div>

        <div className="flex justify-center px-6 py-12 lg:py-16 min-h-full">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">{titulo}</h2>
              <p className="text-gray-500 mt-1 text-sm">{subtitulo}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
