import { Navigate, Route, Routes } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout.jsx';
import { Login } from './pages/Login.jsx';
import { EnConstruccion } from './pages/EnConstruccion.jsx';
import { ModuloEscalable } from './pages/ModuloEscalable.jsx';
import { MODULOS } from './routes/modulos.js';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      {/* El kiosco (CU-06, CU-17) usa su propio layout sin sesión (DEC-05); se implementa en el Sprint D. */}
      <Route path="/kiosco" element={<EnConstruccion titulo="Kiosco de QSF y encuesta de egreso" sprint="D" />} />
      <Route element={<MainLayout />}>
        {MODULOS.map((m) => (
          <Route
            key={m.ruta}
            path={`${m.ruta}/*`}
            element={
              m.escalable ? (
                <ModuloEscalable titulo={m.titulo} descripcion={m.descripcion} />
              ) : (
                <EnConstruccion titulo={m.titulo} descripcion={m.descripcion} sprint={m.sprint} />
              )
            }
          />
        ))}
        <Route path="/" element={<Navigate to="/tablero" replace />} />
        <Route path="*" element={<EnConstruccion titulo="Página no encontrada" />} />
      </Route>
    </Routes>
  );
}
