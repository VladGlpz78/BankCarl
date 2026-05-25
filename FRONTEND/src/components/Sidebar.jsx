import { NavLink } from 'react-router-dom';
import { Home, Users, DollarSign, CreditCard, FileText, Calculator, LogOut, Archive } from 'lucide-react';
import '../styles/Sidebar.css';
const Sidebar = () => {

  // Función para cerrar sesión
  const handleLogout = () => {
    const confirmar = window.confirm('¿Estás seguro que querés salir del sistema?');
    if (confirmar) {
      // 1. Borramos el token de la memoria del navegador
      localStorage.removeItem('auth_token');
      // 2. Redirigimos al usuario a la pantalla de Login forzando la recarga
      window.location.href = '/login';
    }
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h2>BankCarl</h2>
      </div>
      
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Home size={20} />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/clientes" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Users size={20} />
            <span>Clientes</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/prestamos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <DollarSign size={20} />
            <span>Préstamos</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/pagos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <CreditCard size={20} />
            <span>Cobros</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/documentos" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FileText size={20} />
            <span>Documentos</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/simulador" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Calculator size={20} />
            <span>Simulador Público</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/caja" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Archive size={20} />
            <span>Historial Caja</span>
          </NavLink>
        </li>
      </ul>

      {/* --- NUEVO: Botón de Cerrar Sesión al fondo --- */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="btn-logout" title="Cerrar Sesión">
          <LogOut size={20} />
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;