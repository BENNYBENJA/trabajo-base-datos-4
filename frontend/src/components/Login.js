import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const api = axios.create({ baseURL: '/api' });

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarCambio = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/login', form);
      login(data.usuario);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-header">
          <p className="login-eyebrow">TechStore</p>
          <h1 className="login-title">Iniciar sesión</h1>
          <p className="login-subtitle">Ingresa tus credenciales para continuar</p>
        </div>

        <form className="login-form" onSubmit={manejarSubmit}>
          <label className="login-field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={manejarCambio}
              placeholder="admin@techstore.cl"
              required
              autoComplete="email"
            />
          </label>

          <label className="login-field">
            <span>Contraseña</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={manejarCambio}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-button" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-hint">
          <p>Demo — <strong>Admin:</strong> admin@techstore.cl / admin123</p>
          <p>Demo — <strong>Cliente:</strong> juan@gmail.com / cliente123</p>
        </div>
      </div>
    </div>
  );
}
