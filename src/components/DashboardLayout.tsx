interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface Props {
  navItems: NavItem[]
  activeItem: string
  onNavChange: (id: string) => void
  nomeUsuario: string
  perfilUsuario: string
  onLogout: () => void
  children: React.ReactNode
}

export default function DashboardLayout({
  navItems, activeItem, onNavChange, nomeUsuario, perfilUsuario, onLogout, children,
}: Props) {
  const iniciais = nomeUsuario
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const labelPerfil: Record<string, string> = {
    CANDIDATO: 'Candidato',
    EMPRESA: 'Empresa',
    ADMIN: 'Admin',
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-60 shrink-0 flex flex-col bg-white border-r border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <a href="/" className="text-lg font-bold text-blue-600">MatchVagas</a>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition text-left
                ${activeItem === item.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <span className={activeItem === item.id ? 'text-blue-600' : 'text-gray-400'}>
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
              {iniciais}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{nomeUsuario.split(' ')[0]}</p>
              <p className="text-xs text-gray-400">{labelPerfil[perfilUsuario] ?? perfilUsuario}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <LogoutIcon />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}

function LogoutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
