import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [credenciales, setCredenciales] = useState({ usuario: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    setCredenciales({ ...credenciales, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const res = await fetch('https://bankcarl.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });
      
      const data = await res.json();

      if (data.éxito) {
        localStorage.setItem('auth_token', data.token);
        window.location.href = '/'; 
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <ShieldCheck size={56} color="#38bdf8" />
          <h2>BankCarl</h2>
          <p>Portal Administrativo Seguro</p>
        </div>
        
        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <input 
              type="text" 
              name="usuario" 
              value={credenciales.usuario} 
              onChange={handleChange} 
              required 
              className="form-input" 
              placeholder="Ingresá tu usuario"
            />
          </div>

          <div className="form-group" style={{ marginBottom: '25px' }}>
            <label>Contraseña</label>
            <input 
              type="password" 
              name="password" 
              value={credenciales.password} 
              onChange={handleChange} 
              required 
              className="form-input" 
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-submit login-btn" disabled={cargando}>
            {cargando ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div className="login-footer">
          <p>Acceso restringido. Solo personal autorizado.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;