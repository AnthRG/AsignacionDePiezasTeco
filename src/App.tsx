import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { PiezasPage } from './pages/PiezasPage';
import { UsuariosPage } from './pages/UsuariosPage';
import { EstatusPage } from './pages/EstatusPage';
import { ReportesPage } from './pages/ReportesPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="piezas" element={<PiezasPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="estatus" element={<EstatusPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
