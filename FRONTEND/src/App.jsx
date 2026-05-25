import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Prestamos from './pages/Prestamos';
import Pagos from './pages/Pagos';
import Documentos from './pages/Documentos';
import Simulador from './pages/Simulador';
import Login from './pages/Login'; // 👈 Faltaba importar el Login
import Caja from './pages/Caja'; // 👈 Faltaba importar la Caja

// Componente "Guardia": Si no hay token en memoria, te patea al /login
const RutaProtegida = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  // Leemos si hay una sesión activa para saber si mostramos el menú lateral
  const estaLogueado = !!localStorage.getItem('auth_token');

  return (
    <Router>
      <div className="app-layout">
        
        {/* Solo mostramos el Sidebar si el usuario inició sesión */}
        {estaLogueado && <Sidebar />}

        {/* Si no está logueado (en el login), le quitamos el margen izquierdo para que ocupe todo */}
        <main className="main-content" style={{ marginLeft: estaLogueado ? '250px' : '0' }}>
          <Routes>
            {/* RUTAS PÚBLICAS */}
            <Route path="/login" element={<Login />} />
            <Route path="/simulador" element={<Simulador />} />

            {/* RUTAS PRIVADAS (Envueltas en nuestro Guardia) */}
            <Route path="/" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
            <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
            <Route path="/prestamos" element={<RutaProtegida><Prestamos /></RutaProtegida>} />
            <Route path="/pagos" element={<RutaProtegida><Pagos /></RutaProtegida>} />
            <Route path="/documentos" element={<RutaProtegida><Documentos /></RutaProtegida>} />
            <Route path="/caja" element={<RutaProtegida><Caja /></RutaProtegida>} />
          </Routes>
        </main>
        
      </div>
    </Router>
  );
}

export default App;