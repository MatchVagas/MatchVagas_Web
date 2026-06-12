import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { vagaService } from '@/services/vagaService'
import { authService } from '@/services/authService'
import CardVaga, { CardVagaSkeleton } from '@/components/CardVaga'

function dashboardUrl(perfil: string) {
  if (perfil === 'EMPRESA') return '/empresa'
  if (perfil === 'ADMIN') return '/admin'
  return '/candidato'
}

export default function Home() {
  const navigate = useNavigate()
  const usuario = authService.getUsuario()
  const [busca, setBusca] = useState('')

  const { data: vagas = [], isLoading } = useQuery({
    queryKey: ['vagas', {}],
    queryFn: () => vagaService.listar(),
  })

  function handleBuscar(e: React.FormEvent) {
    e.preventDefault()
    const q = busca.trim()
    navigate(q ? `/vagas?titulo=${encodeURIComponent(q)}` : '/vagas')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-blue-600">MatchVagas</a>
          <nav className="flex items-center gap-3">
            <a href="/vagas" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2 hidden sm:block">
              Explorar vagas
            </a>
            {usuario ? (
              <a href={dashboardUrl(usuario.perfil)}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">
                Meu painel
              </a>
            ) : (
              <>
                <a href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition px-3 py-2">Entrar</a>
                <a href="/cadastro" className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition">
                  Cadastrar
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight mb-4">
            Encontre a vaga certa para você
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-10">
            Conectamos talentos às melhores oportunidades. Busque vagas de empresas
            verificadas e candidate-se com um clique.
          </p>

          <form onSubmit={handleBuscar}
            className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-full p-2 shadow-lg">
            <div className="flex items-center flex-1 gap-3 px-4">
              <SearchIcon />
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Cargo, palavra-chave ou área…"
                className="w-full py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
            <button type="submit"
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl sm:rounded-full transition shrink-0">
              Buscar vagas
            </button>
          </form>

          <p className="text-blue-300 text-sm mt-6">
            Ou <a href="/vagas" className="underline hover:text-white transition">explore todas as vagas disponíveis</a>
          </p>
        </div>
      </section>

      {/* Vagas recentes */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vagas recentes</h2>
            <p className="text-sm text-gray-500 mt-1">Oportunidades publicadas recentemente na plataforma</p>
          </div>
          <a href="/vagas" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition shrink-0">
            Ver todas →
          </a>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <CardVagaSkeleton key={i} />)}
          </div>
        ) : vagas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-sm text-gray-400">
            Nenhuma vaga publicada ainda. Volte em breve!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vagas.slice(0, 6).map((v) => <CardVaga key={v.id} vaga={v} />)}
          </div>
        )}
      </section>

      {/* Como funciona */}
      <section className="bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">Como funciona</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Passo numero="1" titulo="Crie sua conta"
              descricao="Cadastre-se grátis como candidato ou empresa em menos de um minuto." />
            <Passo numero="2" titulo="Monte seu perfil"
              descricao="Adicione currículo, experiências e formações para receber sugestões personalizadas." />
            <Passo numero="3" titulo="Candidate-se"
              descricao="Encontre a vaga ideal, candidate-se com um clique e acompanhe tudo pelo painel." />
          </div>
        </div>
      </section>

      {/* CTA candidato / empresa */}
      <section className="max-w-7xl mx-auto w-full px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
            <span className="text-3xl mb-4">👤</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Para candidatos</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Busque oportunidades, receba sugestões compatíveis com seu perfil e
              acompanhe todas as suas candidaturas em um só lugar.
            </p>
            <a href="/cadastro"
              className="inline-flex justify-center py-2.5 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition">
              Quero me candidatar
            </a>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col">
            <span className="text-3xl mb-4">🏢</span>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Para empresas</h3>
            <p className="text-sm text-gray-500 mb-6 flex-1">
              Publique vagas, gerencie candidaturas e encontre os melhores
              profissionais do mercado para o seu time.
            </p>
            <a href="/cadastro"
              className="inline-flex justify-center py-2.5 px-6 border border-blue-600 text-blue-600 hover:bg-blue-50 text-sm font-semibold rounded-lg transition">
              Quero contratar
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-bold text-blue-600">MatchVagas</span>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <a href="/vagas" className="hover:text-gray-700 transition">Vagas</a>
            <a href="/login" className="hover:text-gray-700 transition">Entrar</a>
            <a href="/cadastro" className="hover:text-gray-700 transition">Cadastrar</a>
          </nav>
          <p className="text-sm text-gray-400">© {new Date().getFullYear()} MatchVagas</p>
        </div>
      </footer>
    </div>
  )
}

function Passo({ numero, titulo, descricao }: { numero: string; titulo: string; descricao: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-bold text-lg flex items-center justify-center mx-auto mb-4">
        {numero}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{titulo}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{descricao}</p>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
