import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import EsqueceuSenha from '@/pages/EsqueceuSenha'
import Vagas from '@/pages/Vagas'
import VagaDetalhe from '@/pages/VagaDetalhe'
import PaginaCandidato from '@/pages/candidato'
import PaginaEmpresa from '@/pages/empresa'
import PaginaAdmin from '@/pages/admin'

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha />} />
        <Route path="/vagas" element={<Vagas />} />
        <Route path="/vagas/:id" element={<VagaDetalhe />} />
        <Route path="/candidato" element={<PaginaCandidato />} />
        <Route path="/empresa" element={<PaginaEmpresa />} />
        <Route path="/admin" element={<PaginaAdmin />} />
      </Routes>
    </BrowserRouter>
  )
}
