import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClienteStore from './components/Cliente/ClienteStore';

const api = axios.create({ baseURL: '/api' });
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const obtenerEspecificaciones = (producto) => {
  const nombre = (producto.nombre || '').toLowerCase();
  const cat = (producto.categoria?.nombre || '').toLowerCase();
  if (nombre.includes('hyperx') || nombre.includes('sony') || nombre.includes('razer') || nombre.includes('airpods') || nombre.includes('jbl') || cat.includes('audio')) {
    return [
      { titulo: 'AUDIO ESPACIAL', valor: 'Sonido 3D de alta precisión.', icono: '🔊' },
      { titulo: 'MIC ULTRA CLARO', valor: 'Captura de voz cristalina.', icono: '🎙️' }
    ];
  }
  if (nombre.includes('teclado') || nombre.includes('corsair') || nombre.includes('redragon') || cat.includes('periférico')) {
    return [
      { titulo: 'SWITCH MECÁNICO', valor: 'Switches Red de alta respuesta.', icono: '⌨️' },
      { titulo: 'RGB CHROMA', valor: 'Retroiluminación configurable.', icono: '🌈' }
    ];
  }
  if (nombre.includes('notebook') || nombre.includes('laptop') || nombre.includes('portátil') || cat.includes('portátil')) {
    return [
      { titulo: 'PROCESADOR', valor: 'Alto rendimiento para gaming y trabajo.', icono: '💻' },
      { titulo: 'PANTALLA', valor: 'Display de alta resolución y refresco.', icono: '🖥️' }
    ];
  }
  if (nombre.includes('monitor') || cat.includes('monitor')) {
    return [
      { titulo: 'RESOLUCIÓN', valor: 'Imágenes nítidas y colores vibrantes.', icono: '🖥️' },
      { titulo: 'REFRESCO', valor: 'Experiencia suave sin cortes.', icono: '⚡' }
    ];
  }
  return [
    { titulo: 'DESPACHO RÁPIDO', valor: 'Envío prioritario en 24 horas.', icono: '🚚' },
    { titulo: 'GARANTÍA OFICIAL', valor: '12 meses con soporte directo.', icono: '🛡️' }
  ];
};

/* ──────────────────────────────────────────
   VIEW: PÁGINA DE INICIO DE SESIÓN / REGISTRO
────────────────────────────────────────── */
function PaginaLogin({ alIniciarSesion, irAPagina }) {
  const { login } = useAuth();
  const [vista, setVista] = useState('login'); // 'login' | 'registro'
  const [form, setForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({ nombre: '', correo: '', contrasena: '', confirmar: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/login', form);
      login(data.usuario);
      alIniciarSesion();
    } catch (err) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    setError('');
    if (regForm.contrasena !== regForm.confirmar) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (regForm.contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setCargando(true);
    try {
      await api.post('/usuarios/register', {
        nombre: regForm.nombre,
        correo: regForm.correo,
        contrasena: regForm.contrasena,
        id_rol: 2 // cliente
      });
      setRegistroExitoso(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  const handleGoogleLogin = () => {
    // Simula login con Google usando cuenta demo
    login({ id: 99, nombre: 'Usuario Google', email: 'google@demo.cl', rol: 'cliente' });
    alIniciarSesion();
  };

  return (
    <div className="login-screen-view">
      <button className="login-back-btn" onClick={() => irAPagina('tienda')}>← Volver a la tienda</button>

      <div className="login-screen-logo-wrap">
        <div className="login-screen-icon-box">
          <span className="processor-icon">⚡</span>
        </div>
        <h1 className="login-screen-title">TechStore</h1>
        <p className="login-screen-subtitle">EXPERIENCIA TECH PREMIUM</p>
      </div>

      {vista === 'login' ? (
        <>
          <form onSubmit={manejarSubmit} className="login-screen-form">
            <label className="ls-field">
              <span>CORREO ELECTRÓNICO</span>
              <div className="ls-input-wrap">
                <span className="ls-icon">@</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="dev@techstore.cl"
                  required
                  autoComplete="email"
                />
              </div>
            </label>

            <label className="ls-field">
              <div className="ls-field-header">
                <span>CONTRASEÑA</span>
                <button type="button" className="forgot-pass-btn">¿Olvidaste tu contraseña?</button>
              </div>
              <div className="ls-input-wrap">
                <span className="ls-icon">🔒</span>
                <input
                  type={mostrarPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="ls-eye-btn" onClick={() => setMostrarPass(!mostrarPass)}>
                  {mostrarPass ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </label>

            {error && <div className="ls-error">⚠️ {error}</div>}

            <button type="submit" className="ls-submit-btn" disabled={cargando}>
              {cargando ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="ls-divider">
            <span>O CONTINÚA CON</span>
          </div>

          <div className="ls-social-buttons">
            <button className="ls-social-btn google-btn" type="button" onClick={handleGoogleLogin}>
              <svg width="18" height="18" viewBox="0 0 18 18" style={{marginRight:'6px',flexShrink:0}}>
                <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.85 2.69-6.57z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.95v2.3C2.43 15.98 5.48 18 9 18z"/>
                <path fill="#FBBC05" d="M3.95 10.74c-.18-.54-.28-1.12-.28-1.74s.1-1.2.28-1.74V4.96H.95C.35 6.17 0 7.55 0 9s.35 2.83.95 4.04l3-2.3z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.4C13.46.97 11.41 0 9 0 5.48 0 2.43 2.02.95 4.96l3 2.3c.71-2.13 2.7-3.68 5.05-3.68z"/>
              </svg>
              Continuar con Google
            </button>
          </div>

          <p className="ls-footer-register">
            ¿No tienes cuenta? <span className="register-link" onClick={() => { setVista('registro'); setError(''); }}>Regístrate gratis</span>
          </p>

          <div className="ls-demo-credentials">
            <p>🔑 Admin: <code>admin@techstore.cl</code> / <code>admin123</code></p>
            <p>👤 Cliente: <code>juan@gmail.com</code> / <code>cliente123</code></p>
          </div>
        </>
      ) : (
        // VISTA DE REGISTRO
        registroExitoso ? (
          <div className="register-success">
            <div className="register-success-icon">✅</div>
            <h3>¡Cuenta creada exitosamente!</h3>
            <p>Ya puedes iniciar sesión con tu correo y contraseña.</p>
            <button className="ls-submit-btn" style={{marginTop:'20px'}} onClick={() => { setVista('login'); setRegistroExitoso(false); setRegForm({ nombre:'', correo:'', contrasena:'', confirmar:'' }); }}>
              Ir a Iniciar Sesión
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={manejarRegistro} className="login-screen-form">
              <label className="ls-field">
                <span>NOMBRE COMPLETO</span>
                <div className="ls-input-wrap">
                  <span className="ls-icon">👤</span>
                  <input type="text" value={regForm.nombre} onChange={e => setRegForm(p => ({...p, nombre: e.target.value}))} placeholder="Juan Pérez" required />
                </div>
              </label>
              <label className="ls-field">
                <span>CORREO ELECTRÓNICO</span>
                <div className="ls-input-wrap">
                  <span className="ls-icon">@</span>
                  <input type="email" value={regForm.correo} onChange={e => setRegForm(p => ({...p, correo: e.target.value}))} placeholder="juan@correo.cl" required />
                </div>
              </label>
              <label className="ls-field">
                <span>CONTRASEÑA</span>
                <div className="ls-input-wrap">
                  <span className="ls-icon">🔒</span>
                  <input type="password" value={regForm.contrasena} onChange={e => setRegForm(p => ({...p, contrasena: e.target.value}))} placeholder="Mínimo 6 caracteres" required />
                </div>
              </label>
              <label className="ls-field">
                <span>CONFIRMAR CONTRASEÑA</span>
                <div className="ls-input-wrap">
                  <span className="ls-icon">🔒</span>
                  <input type="password" value={regForm.confirmar} onChange={e => setRegForm(p => ({...p, confirmar: e.target.value}))} placeholder="Repite la contraseña" required />
                </div>
              </label>
              {error && <div className="ls-error">⚠️ {error}</div>}
              <button type="submit" className="ls-submit-btn" disabled={cargando}>
                {cargando ? 'Creando cuenta...' : 'Crear Cuenta Gratis'}
              </button>
            </form>
            <p className="ls-footer-register">
              ¿Ya tienes cuenta? <span className="register-link" onClick={() => { setVista('login'); setError(''); }}>Iniciar Sesión</span>
            </p>
          </>
        )
      )}
    </div>
  );
}

/* ──────────────────────────────────────────
   HEADER / BARRA DE NAVEGACIÓN
────────────────────────────────────────── */
function Header({ usuario, esAdmin, totalItemsCarrito, irAPagina, logout, busqueda, setBusqueda, alBuscar, categorias = [] }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [catMenuOpen, setCatMenuOpen] = useState(false);

  const manejarSubmitBusqueda = (e) => {
    e.preventDefault();
    alBuscar();
    setMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menú">
          <span /><span /><span />
        </button>

        <a href="/" className="navbar-logo" onClick={e => { e.preventDefault(); irAPagina('tienda'); }}>
          <span className="logo-lightning">⚡</span>
          <span className="logo-name">TechStore</span>
        </a>

        {/* Barra de búsqueda centrada */}
        <form className="navbar-search-form" onSubmit={manejarSubmitBusqueda}>
          <input
            type="text"
            className="navbar-search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar hardware premium..."
            aria-label="Buscar productos"
          />
          <button type="submit" className="navbar-search-icon" aria-label="Buscar">🔍</button>
        </form>

        {/* Links de navegación */}
        <nav className={`navbar-nav-links ${menuOpen ? 'open' : ''}`}>
          <div className="categories-dropdown-wrapper">
            <button onClick={() => setCatMenuOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              Categorías <span>{catMenuOpen ? '▲' : '▼'}</span>
            </button>
            {catMenuOpen && (
              <div className="categories-dropdown-menu">
                <button
                  className="categories-dropdown-item"
                  onClick={() => { irAPagina('tienda'); setCatMenuOpen(false); }}
                >
                  🏠 Todas las categorías
                </button>
                {categorias.map(c => (
                  <button
                    key={c._id}
                    className="categories-dropdown-item"
                    onClick={() => { irAPagina('tienda', c._id); setCatMenuOpen(false); }}
                  >
                    {c.nombre}
                  </button>
                ))}
                <button
                  className="categories-dropdown-item"
                  style={{ color: '#fbbf24' }}
                  onClick={() => { irAPagina('ofertas'); setCatMenuOpen(false); }}
                >
                  🏷️ Ofertas Especiales
                </button>
              </div>
            )}
          </div>
          {usuario && esAdmin && (
            <button className="nav-admin-link" onClick={() => { irAPagina('admin'); setMenuOpen(false); }}>⚙️ Admin</button>
          )}
        </nav>

        {/* Acciones (carrito y usuario) */}
        <div className="navbar-actions">
          {usuario ? (
            <>
              {!esAdmin && (
                <button className="navbar-action-btn-icon" onClick={() => irAPagina('carrito')} title="Ver Carrito" aria-label="Carrito">
                  🛒
                  {totalItemsCarrito > 0 && <span className="cart-badge">{totalItemsCarrito}</span>}
                </button>
              )}
              <button className="navbar-user-pill" onClick={logout} title="Cerrar Sesión">
                <span>👤</span>
                <span className="navbar-user-name">{usuario.nombre?.split(' ')[0] || 'Usuario'}</span>
              </button>
            </>
          ) : (
            <>
              <button className="navbar-login-btn" onClick={() => irAPagina('login')}>
                Iniciar Sesión
              </button>
              <button className="navbar-action-btn-icon" onClick={() => irAPagina('carrito')} title="Ver Carrito" aria-label="Carrito">
                🛒
                {totalItemsCarrito > 0 && <span className="cart-badge">{totalItemsCarrito}</span>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Menú móvil expandido */}
      {menuOpen && (
        <div className="navbar-mobile-menu">
          <button onClick={() => { irAPagina('tienda'); setMenuOpen(false); }}>🏠 Tienda</button>
          <button onClick={() => { irAPagina('tienda', 'CAT003'); setMenuOpen(false); }}>💻 Notebooks</button>
          <button onClick={() => { irAPagina('tienda', 'CAT007'); setMenuOpen(false); }}>🔧 Componentes</button>
          <button onClick={() => { irAPagina('tienda', 'CAT005'); setMenuOpen(false); }}>🎮 Gaming</button>
          <button onClick={() => { irAPagina('tienda', 'CAT002'); setMenuOpen(false); }}>🖱️ Periféricos</button>
          <button onClick={() => { irAPagina('ofertas'); setMenuOpen(false); }}>🏷️ Ofertas</button>
          {!usuario && <button className="mobile-login-link" onClick={() => { irAPagina('login'); setMenuOpen(false); }}>🔑 Iniciar Sesión</button>}
          {usuario && <button className="mobile-login-link" onClick={() => { logout(); setMenuOpen(false); }}>🚪 Cerrar Sesión ({usuario.nombre})</button>}
        </div>
      )}
    </header>
  );
}

/* ──────────────────────────────────────────
   BANNER HERO
────────────────────────────────────────── */
function BannerHero({ irADetalle, irAPagina }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-image-wrap">
        <img
          src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1400&q=80"
          alt="Setup Gamer Premium"
          className="hero-banner-image"
        />
        <div className="hero-image-overlay" />
      </div>
      <div className="hero-banner-content">
        <span className="hero-eyebrow">TEMPORADA DE INVIERNO 2024</span>
        <h1 className="hero-title">Gamer de<br /><span className="hero-highlight">Invierno</span></h1>
        <p className="hero-description">
          Equípate con lo último en tecnología térmica y hardware de alto rendimiento para las noches más frías.
        </p>
        <div className="hero-buttons">
          <button className="hero-btn-primary" onClick={() => irAPagina && irAPagina('tienda')}>
            Explorar Colección ➔
          </button>
          <button className="hero-btn-secondary" onClick={() => irAPagina && irAPagina('ofertas')}>
            Ver Ofertas
          </button>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   SECCIÓN "TE RECOMENDAMOS"
────────────────────────────────────────── */
function Recomendados({ productos, alAgregarAlCarrito, irADetalle, onAbrirLogin, usuario }) {
  const featured = productos.slice(0, 4);
  if (featured.length < 2) return null;

  return (
    <section className="recommended-section">
      <div className="recommended-header">
        <div>
          <span className="rec-eyebrow-small">SELECCIÓN TECH</span>
          <h2 className="section-main-title">Te recomendamos</h2>
        </div>
        <button className="view-all-link">Ver Todo</button>
      </div>

      <div className="recommended-scroll-container">
        {featured.map((p, i) => (
          <div key={p._id} className="rec-card" onClick={() => irADetalle(p._id)}>
            <button className="rec-heart-btn" onClick={e => e.stopPropagation()}>♥</button>
            <div className="rec-img-box">
              <img src={p.imagen} alt={p.nombre} />
            </div>
            <span className="rec-category">{p.categoria?.nombre?.toUpperCase() || 'TECH'}</span>
            <h3 className="rec-title">{p.nombre}</h3>
            <div className="rec-price-row">
              <span className="rec-price">{formatoCLP.format(p.precio)}</span>
              <button
                className="rec-add-button"
                onClick={e => { e.stopPropagation(); alAgregarAlCarrito(p); }}
                aria-label="Agregar al carrito"
              >+</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   TIENDA PRINCIPAL (STORE)
────────────────────────────────────────── */
function Store() {
  const { usuario, logout, esAdmin } = useAuth();

  const [pagina, setPagina] = useState('tienda');
  const [productoDetalleId, setProductoDetalleId] = useState(null);
  const [mostrarOfertas, setMostrarOfertas] = useState(false);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [aplicado, setAplicado] = useState({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });

  // Admin
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' });

  // Carrito
  const [carrito, setCarrito] = useState([]);
  const totalItemsCarrito = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const totalCarrito = carrito.reduce((sum, i) => sum + Number(i.precio || 0) * i.cantidad, 0);

  // Reseñas
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');

  // Acordeón specs
  const [specOpen, setSpecOpen] = useState(false);

  // Checkout invitado
  const [checkoutGuest, setCheckoutGuest] = useState({ nombre: '', email: '', telefono: '' });

  // Limpiar avisos automáticamente
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  const cargarCategorias = useCallback(() =>
    api.get('/categorias').then(r => setCategorias(r.data)).catch(() => setCategorias([]))
  , []);

  const cargarProductos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (aplicado.busqueda.trim()) params.set('q', aplicado.busqueda.trim());
    if (aplicado.categoriaFiltro) params.set('categoria', aplicado.categoriaFiltro);
    if (aplicado.precioMin) params.set('precioMin', aplicado.precioMin);
    if (aplicado.precioMax) params.set('precioMax', aplicado.precioMax);
    const url = params.toString() ? `/productos-con-categoria?${params}` : '/productos-con-categoria';
    api.get(url)
      .then(r => { setProductos(r.data); setError(''); })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, [aplicado]);

  useEffect(() => {
    cargarCategorias();
    cargarProductos();
  }, [cargarCategorias, cargarProductos]);

  // ── Gestión del botón "atrás" del navegador ──────────────────────────
  const pushHistoryState = (paginaNueva, detalleId = null, ofertas = false) => {
    window.history.pushState({ pagina: paginaNueva, productoDetalleId: detalleId, mostrarOfertas: ofertas }, '');
  };

  useEffect(() => {
    const manejarPopState = () => {
      const estado = window.history.state;
      if (estado && estado.pagina) {
        setPagina(estado.pagina);
        setProductoDetalleId(estado.productoDetalleId || null);
        setMostrarOfertas(estado.mostrarOfertas || false);
      } else {
        setPagina('tienda');
        setMostrarOfertas(false);
      }
    };
    window.addEventListener('popstate', manejarPopState);
    window.history.replaceState({ pagina: 'tienda', productoDetalleId: null, mostrarOfertas: false }, '');
    return () => window.removeEventListener('popstate', manejarPopState);
  }, []);
  // ────────────────────────────────────────────────────────────────────

  const navegarAPagina = (nombrePagina, catId = '') => {
    if (nombrePagina === 'ofertas') {
      pushHistoryState('tienda', null, true);
      setMostrarOfertas(true);
      setPagina('tienda');
      setCategoriaFiltro('');
      setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
      window.scrollTo(0, 0);
      return;
    }
    pushHistoryState(nombrePagina);
    setMostrarOfertas(false);
    setPagina(nombrePagina);
    if (nombrePagina === 'tienda') {
      setCategoriaFiltro(catId);
      setAplicado({ busqueda: '', categoriaFiltro: catId, precioMin: '', precioMax: '' });
      window.scrollTo(0, 0);
    }
  };

  const irADetalle = async (id) => {
    pushHistoryState('detalle', id);
    setProductoDetalleId(id);
    setPagina('detalle');
    setMostrarOfertas(false);
    setSpecOpen(false);
    window.scrollTo(0, 0);
    setReviewsLoading(true);
    setNuevaCalificacion(5);
    setNuevoComentario('');
    try {
      const r = await api.get(`/productos/${id}/reviews`);
      setReviews(r.data);
    } catch {
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const irAlCarrito = () => {
    pushHistoryState('carrito');
    setPagina('carrito');
    window.scrollTo(0, 0);
  };

  const irACheckout = (producto) => {
    if (producto) {
      // Comprar ahora: agregar el producto y abrir checkout
      const existe = carrito.find(i => i._id === producto._id);
      if (!existe) {
        setCarrito(prev => [...prev, { ...producto, cantidad: 1 }]);
      }
    }
    pushHistoryState('checkout');
    setPagina('checkout');
    window.scrollTo(0, 0);
  };

  const alAgregarAlCarrito = (producto) => {
    const existe = carrito.find(i => i._id === producto._id);
    if (existe && existe.cantidad >= producto.stock) {
      setNotice(`⚠️ Stock máximo alcanzado para ${producto.nombre}`);
      return;
    }
    setCarrito(prev => {
      const ex = prev.find(i => i._id === producto._id);
      if (ex) return prev.map(i => i._id === producto._id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setNotice(`🛒 ${producto.nombre} agregado al carrito`);
  };

  const alCambiarCantidad = (id, n) => {
    if (n <= 0) { setCarrito(prev => prev.filter(i => i._id !== id)); return; }
    setCarrito(prev => prev.map(i => i._id === id ? { ...i, cantidad: n } : i));
  };

  const alEliminarDelCarrito = id => setCarrito(prev => prev.filter(i => i._id !== id));

  const alFinalizarCompra = async (e) => {
    if (e) e.preventDefault();
    if (!carrito.length) return;
    try {
      const items = carrito.map(i => ({
        productoId: i._id,
        nombre: i.nombre,
        precio: Number(i.precio || 0),
        cantidad: i.cantidad
      }));
      await api.post('/compras', {
        usuarioId: usuario ? usuario.id : null,
        usuarioNombre: usuario ? usuario.nombre : checkoutGuest.nombre || 'Invitado',
        usuarioEmail: usuario ? usuario.email : checkoutGuest.email || 'invitado@techstore.cl',
        items
      });
      setCarrito([]);
      setPagina('tienda');
      setNotice('✅ ¡Compra realizada con éxito! Recibirás tu boleta al correo.');
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la compra.');
    }
  };

  const guardarReview = async (e) => {
    e.preventDefault();
    if (!productoDetalleId) return;
    try {
      await api.post(`/productos/${productoDetalleId}/reviews`, {
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        calificacion: nuevaCalificacion,
        comentario: nuevoComentario
      });
      setNuevoComentario('');
      setNuevaCalificacion(5);
      setNotice('⭐ ¡Gracias por tu reseña!');
      const r = await api.get(`/productos/${productoDetalleId}/reviews`);
      setReviews(r.data);
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar la reseña.');
    }
  };

  const aplicarFiltros = (e) => {
    if (e) e.preventDefault();
    setMostrarOfertas(false);
    setAplicado({ busqueda, categoriaFiltro, precioMin, precioMax });
    setPagina('tienda');
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('');
    setPrecioMin('');
    setPrecioMax('');
    setMostrarOfertas(false);
    setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
  };

  const manejarCambioFormulario = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const limpiarFormulario = () => {
    setEditingId('');
    setForm({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' });
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/productos/${editingId}`, form);
        setNotice('Producto actualizado.');
      } else {
        await api.post('/productos', form);
        setNotice('Producto creado.');
      }
      setError('');
      limpiarFormulario();
      cargarProductos();
      cargarCategorias();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo guardar.');
    }
  };

  const editarProducto = p => {
    setEditingId(p._id);
    setForm({
      _id: p._id,
      nombre: p.nombre || '',
      precio: p.precio ?? '',
      stock: p.stock ?? '',
      descripcion: p.descripcion || '',
      categoriaId: p.categoria?._id || '',
      imagen: p.imagen || ''
    });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await api.delete(`/productos/${id}`);
      setNotice('Producto eliminado.');
      setError('');
      cargarProductos();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo eliminar.');
    }
  };

  // Productos a mostrar (con o sin filtro de ofertas)
  const productosMostrar = mostrarOfertas
    ? productos.filter(p => p.descuento > 0)
    : productos;

  const prodDetalle = productos.find(p => p._id === productoDetalleId);
  const specs = prodDetalle ? obtenerEspecificaciones(prodDetalle) : [];
  const catDetalle = prodDetalle?.categoria?.nombre?.toUpperCase() || 'PRODUCTO';

  return (
    <div className="app-shell">
      {/* Header / Navbar */}
      <Header
        usuario={usuario}
        esAdmin={esAdmin}
        totalItemsCarrito={totalItemsCarrito}
        irAPagina={navegarAPagina}
        logout={logout}
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        alBuscar={aplicarFiltros}
        categorias={categorias}
      />

      {/* Toast de notificaciones */}
      {notice && <div className="toast">{notice}</div>}

      <main className="main-content">

        {/* ⚙️ VISTA: ADMIN */}
        {pagina === 'admin' && esAdmin && (
          <div className="admin-wrapper">
            <div className="admin-header-bar">
              <h1>⚙️ Panel de Administración</h1>
              <p>Gestión de catálogo — MongoDB + MySQL</p>
            </div>
            <form className="filters-panel" onSubmit={guardarProducto}>
              <div className="filters-grid">
                <label className="field"><span>Buscar</span>
                  <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..." />
                </label>
                <label className="field"><span>Categoría</span>
                  <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="field"><span>Precio mín.</span>
                  <input type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)} placeholder="0" />
                </label>
                <label className="field"><span>Precio máx.</span>
                  <input type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="9999999" />
                </label>
              </div>
              <div className="filters-actions">
                <button type="button" className="primary-button" onClick={aplicarFiltros}>Aplicar filtros</button>
                <button type="button" className="secondary-button" onClick={limpiarFiltros}>Limpiar</button>
              </div>
            </form>
            {loading ? <div className="state-box">Cargando...</div> : error ? <div className="state-box error">{error}</div> : (
              <AdminDashboard
                productos={productos} categorias={categorias} form={form} editingId={editingId}
                notice={null} error={null} loading={loading} formatoCLP={formatoCLP}
                manejarCambioFormulario={manejarCambioFormulario} guardarProducto={guardarProducto}
                limpiarFormulario={limpiarFormulario} editarProducto={editarProducto}
                eliminarProducto={eliminarProducto} abrirModalReviews={irADetalle}
              />
            )}
          </div>
        )}

        {/* 🔐 VISTA: INICIO DE SESIÓN */}
        {pagina === 'login' && (
          <PaginaLogin
            alIniciarSesion={() => setPagina('tienda')}
            irAPagina={navegarAPagina}
          />
        )}

        {/* 🏪 VISTA: TIENDA PRINCIPAL */}
        {pagina === 'tienda' && (
          <div className="store-wrapper">
            {/* Banner hero */}
            {!mostrarOfertas && <BannerHero irADetalle={irADetalle} irAPagina={navegarAPagina} />}

            {/* Cabecera si estamos en Ofertas */}
            {mostrarOfertas && (
              <div className="ofertas-hero-header">
                <span className="ofertas-eyebrow">🏷️ DESCUENTOS EXCLUSIVOS</span>
                <h1 className="ofertas-title">Ofertas de la Semana</h1>
                <p className="ofertas-subtitle">Los mejores precios en hardware seleccionado. ¡Solo por tiempo limitado!</p>
              </div>
            )}

            {/* Sección "Te recomendamos" */}
            {!mostrarOfertas && !loading && productos.length >= 2 && (
              <Recomendados
                productos={productos}
                alAgregarAlCarrito={alAgregarAlCarrito}
                irADetalle={irADetalle}
                onAbrirLogin={() => setPagina('login')}
                usuario={usuario}
              />
            )}

            {/* Encabezado del catálogo y filtros de categorías */}
            <div className="cat-header-pills-row">
              <div className="catalog-title-wrapper">
                <span className="cat-eyebrow-small">{mostrarOfertas ? 'PRODUCTOS EN REBAJA' : 'CATÁLOGO COMPLETO'}</span>
                <h2 className="catalog-title">{mostrarOfertas ? `${productosMostrar.length} productos en oferta` : 'Explora Componentes'}</h2>
              </div>
              {!mostrarOfertas && (
                <div className="cat-pills-row">
                  <button
                    className={`cat-pill ${!categoriaFiltro ? 'active' : ''}`}
                    onClick={() => { setCategoriaFiltro(''); setAplicado(p => ({ ...p, categoriaFiltro: '' })); }}
                  >Todo</button>
                  {categorias.map(c => (
                    <button key={c._id} className={`cat-pill ${categoriaFiltro === c._id ? 'active' : ''}`}
                      onClick={() => { setCategoriaFiltro(c._id); setAplicado(p => ({ ...p, categoriaFiltro: c._id })); }}>
                      {c.nombre}
                    </button>
                  ))}
                  <button className="cat-pill ofertas-pill" onClick={() => navegarAPagina('ofertas')}>🏷️ Ofertas</button>
                </div>
              )}
              {mostrarOfertas && (
                <button className="volver-tienda-btn" onClick={() => { setMostrarOfertas(false); limpiarFiltros(); }}>
                  ← Volver al catálogo
                </button>
              )}
            </div>

            {/* Grid de productos */}
            {error && <div className="state-box error">{error}</div>}
            {loading ? (
              <div className="skeleton-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
            ) : productosMostrar.length === 0 && mostrarOfertas ? (
              <div className="store-empty-state">
                <span className="store-empty-icon">🏷️</span>
                <h3>No hay ofertas disponibles en este momento</h3>
                <p>Vuelve pronto para ver los mejores descuentos.</p>
                <button className="primary-button" onClick={() => { setMostrarOfertas(false); limpiarFiltros(); }}>Ver todos los productos</button>
              </div>
            ) : (
              <div className="store-layout">
                <div className="store-main">
                  <ClienteStore
                    productos={productosMostrar}
                    carrito={carrito}
                    alAgregarAlCarrito={alAgregarAlCarrito}
                    alAbrirReviews={irADetalle}
                    irADetalle={irADetalle}
                    formatoCLP={formatoCLP}
                  />
                </div>

                {!mostrarOfertas && (
                  <aside className="store-sidebar">
                    <div className="promo-ad-card" onClick={() => irADetalle('PROD030')}>
                      <img src="https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80" alt="GPU NVIDIA" className="promo-ad-img" />
                      <div className="promo-ad-body">
                        <span className="promo-ad-badge">DESTACADO</span>
                        <h4 className="promo-ad-title">NVIDIA RTX 4070 Super 12GB</h4>
                        <p className="promo-ad-desc">Potencia tu setup con trazado de rayos de última generación y DLSS 3.5.</p>
                        <div className="promo-ad-price">{formatoCLP.format(699990)}</div>
                      </div>
                    </div>

                    <div className="promo-ad-card" onClick={() => irADetalle('PROD006')}>
                      <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&q=80" alt="ASUS ROG" className="promo-ad-img" />
                      <div className="promo-ad-body">
                        <span className="promo-ad-badge success">NUEVO</span>
                        <h4 className="promo-ad-title">ASUS ROG Strix G16</h4>
                        <p className="promo-ad-desc">Core i9 + RTX 4070 para el máximo rendimiento portátil.</p>
                        <div className="promo-ad-price">{formatoCLP.format(1399990)}</div>
                      </div>
                    </div>

                    <div className="promo-ad-card" onClick={() => irADetalle('PROD022')}>
                      <img src="https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&q=80" alt="PlayStation 5" className="promo-ad-img" />
                      <div className="promo-ad-body">
                        <span className="promo-ad-badge warning">HOT SALE</span>
                        <h4 className="promo-ad-title">PlayStation 5 Slim</h4>
                        <p className="promo-ad-desc">Disfruta de tiempos de carga mínimos y juegos exclusivos en 4K.</p>
                        <div className="promo-ad-price">{formatoCLP.format(699990)}</div>
                      </div>
                    </div>
                  </aside>
                )}
              </div>
            )}

            {/* Caja de ayuda */}
            {!mostrarOfertas && (
              <div className="help-box-card">
                <h3 className="help-title">¿Necesitas Ayuda?</h3>
                <p className="help-desc">Nuestros expertos técnicos están listos para asesorarte en tu próximo build.</p>
                <button className="help-support-btn">Contactar Soporte</button>
              </div>
            )}
          </div>
        )}

        {/* 📄 VISTA: DETALLE DE PRODUCTO */}
        {pagina === 'detalle' && prodDetalle && (
          <div className="product-detail-view">
            {/* Botón de retroceso para móvil */}
            <div className="detail-mobile-header">
              <button className="back-btn" onClick={() => setPagina('tienda')}>←</button>
              <span className="detail-header-title">TechStore</span>
              <div className="detail-header-actions">
                <button className="share-btn" aria-label="Compartir">🔗</button>
                <button className="cart-btn" onClick={() => setPagina('carrito')} aria-label="Ver carrito">
                  🛒
                  {totalItemsCarrito > 0 && <span className="cart-badge">{totalItemsCarrito}</span>}
                </button>
              </div>
            </div>

            {/* Migas de pan para escritorio */}
            <div className="breadcrumb">
              <button onClick={() => setPagina('tienda')}>Inicio</button> ➔
              <span>{prodDetalle.categoria?.nombre || 'Producto'}</span> ➔
              <span className="active">{prodDetalle.nombre}</span>
            </div>

            <div className="detail-main-layout">
              {/* Galería del producto */}
              <div className="detail-gallery-column">
                <div className="detail-image-main-wrap">
                  {prodDetalle.imagen ? (
                    <img src={prodDetalle.imagen} alt={prodDetalle.nombre} className="detail-main-img" />
                  ) : (
                    <div className="detail-no-img">📦</div>
                  )}
                  {/* Badge de rating superpuesto */}
                  <div className="detail-rating-pill-overlay">
                    ★ {Number(prodDetalle.ratingPromedio || 4.9).toFixed(1)}
                    <span className="rating-count-pill">({prodDetalle.totalReviews || '0'} reseñas)</span>
                  </div>
                  {prodDetalle.descuento > 0 && (
                    <div className="detail-discount-pill">-{prodDetalle.descuento}% OFF</div>
                  )}
                </div>
                {/* Indicador de puntos */}
                <div className="detail-dots-indicator">
                  <span className="dot active" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>

              {/* Columna de info y compra */}
              <div className="detail-info-column">
                <div className="detail-brand-info">
                  <span className="brand-badge">{catDetalle}</span>
                  {prodDetalle.stock > 0 ? (
                    <span className="stock-badge-green">✓ En stock ({prodDetalle.stock} disponibles)</span>
                  ) : (
                    <span className="stock-badge-red">✗ Agotado</span>
                  )}
                </div>

                <h1 className="detail-product-title">{prodDetalle.nombre}</h1>

                <div className="detail-pricing-box">
                  <div className="detail-price-row">
                    <span className="detail-price-amount">{formatoCLP.format(prodDetalle.precio)}</span>
                    {prodDetalle.descuento > 0 && (
                      <>
                        <span className="detail-price-original">
                          {formatoCLP.format(Math.round(prodDetalle.precio / (1 - prodDetalle.descuento / 100)))}
                        </span>
                        <span className="detail-discount-badge">{prodDetalle.descuento}% OFF</span>
                      </>
                    )}
                  </div>
                  <p className="detail-price-note">✓ Precio incluye IVA · Despacho gratis a Santiago</p>
                </div>

                {/* Cuadrícula de 2 specs destacadas */}
                <div className="detail-specs-summary-grid">
                  {specs.slice(0, 2).map((spec, idx) => (
                    <div key={idx} className="spec-summary-card">
                      <span className="spec-summary-icon">{spec.icono}</span>
                      <strong className="spec-summary-title">{spec.titulo}</strong>
                      <p className="spec-summary-text">{spec.valor}</p>
                    </div>
                  ))}
                </div>

                {/* Descripción */}
                <div className="detail-description-section">
                  <h3>DESCRIPCIÓN</h3>
                <p>{prodDetalle.descripcion || 'Producto de alta calidad con garantía oficial. Consulta con nuestros expertos para más información.'}</p>
                </div>

                {/* Acordeón de specs */}
                <div className="detail-accordion-item">
                  <div
                    className="accordion-header"
                    onClick={() => setSpecOpen(o => !o)}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    <span>ESPECIFICACIONES TÉCNICAS</span>
                    <span style={{ transition: 'transform 0.25s', display: 'inline-block', transform: specOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                  </div>
                  {specOpen && (
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {specs.map((spec, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{spec.icono}</span>
                          <div>
                            <div style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--accent-light)', marginBottom: '3px' }}>{spec.titulo}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{spec.valor}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Botones de acción en escritorio */}
                <div className="detail-desktop-actions">
                  <button
                    className="detail-add-cart-btn"
                    onClick={() => alAgregarAlCarrito(prodDetalle)}
                    disabled={prodDetalle.stock <= 0}
                  >
                    🛒 {prodDetalle.stock > 0 ? 'Agregar al Carrito' : 'Sin Stock'}
                  </button>
                  <button
                    className="detail-buy-now-btn"
                    onClick={() => irACheckout(prodDetalle)}
                    disabled={prodDetalle.stock <= 0}
                  >
                    Comprar Ahora ➞
                  </button>
                </div>

                {/* Sección de reseñas */}
                <div className="detail-reviews-section">
                  <h3 className="reviews-title">Reseñas de Clientes ({reviews.length})</h3>
                  {reviewsLoading ? (
                    <div className="state-box">Cargando reseñas...</div>
                  ) : reviews.length === 0 ? (
                    <p className="no-reviews-msg">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
                  ) : (
                    <div className="reviews-list">
                      {reviews.slice(0, 3).map((r, i) => (
                        <div key={i} className="review-card">
                          <div className="review-header">
                            <span className="review-author">👤 {r.usuarioNombre || 'Anónimo'}</span>
                            <span className="review-stars">{'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}</span>
                          </div>
                          <p className="review-text">{r.comentario}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {usuario && (
                    <form className="review-form" onSubmit={guardarReview}>
                      <h4>Deja tu reseña</h4>
                      <div className="star-rating-input">
                        {[5, 4, 3, 2, 1].map(n => (
                          <button
                            key={n}
                            type="button"
                            className={`star-btn ${nuevaCalificacion >= n ? 'active' : ''}`}
                            onClick={() => setNuevaCalificacion(n)}
                            aria-label={`${n} estrellas`}
                          >★</button>
                        ))}
                      </div>
                      <textarea
                        value={nuevoComentario}
                        onChange={e => setNuevoComentario(e.target.value)}
                        placeholder="Comparte tu experiencia con este producto..."
                        required
                        className="review-textarea"
                        rows={3}
                      />
                      <button type="submit" className="review-submit-btn">Publicar Reseña</button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* Barra inferior fija para móvil */}
            <div className="detail-mobile-sticky-bar">
              <button className="sticky-cart-icon-btn" onClick={() => alAgregarAlCarrito(prodDetalle)} disabled={prodDetalle.stock <= 0}>
                🛒
              </button>
              <button
                className="sticky-buy-now-btn"
                onClick={() => { alAgregarAlCarrito(prodDetalle); setPagina('carrito'); }}
                disabled={prodDetalle.stock <= 0}
              >
                Comprar Ahora ➔
              </button>
            </div>
          </div>
        )}

        {/* 🛒 VISTA: CARRITO DE COMPRAS */}
        {pagina === 'carrito' && (
          <div className="shopping-cart-page">
            <div className="cart-page-header">
              <h1 className="cart-page-title">🛒 Tu Carrito</h1>
              {totalItemsCarrito > 0 && (
                <span className="cart-items-count-badge">{totalItemsCarrito} {totalItemsCarrito === 1 ? 'PRODUCTO' : 'PRODUCTOS'}</span>
              )}
            </div>

            <div className="cart-page-layout">
              {/* Columna izquierda: lista de productos */}
              <div className="cart-items-column">
                {!carrito.length ? (
                  <div className="cart-empty-page">
                    <span className="cart-big-icon">🛒</span>
                    <h2>Tu carrito está vacío</h2>
                    <p>Agrega productos desde la tienda para comenzar tu compra.</p>
                    <button className="primary-button" onClick={() => setPagina('tienda')}>Volver a la Tienda</button>
                  </div>
                ) : (
                  <div className="cart-items-list-container">
                    {carrito.map(item => (
                      <div key={item._id} className="cart-page-item-row">
                        <div className="cart-item-img-wrap">
                          {item.imagen ? (
                            <img src={item.imagen} alt={item.nombre} className="cart-page-item-img" />
                          ) : (
                            <div className="cart-item-no-img">📦</div>
                          )}
                        </div>
                        <div className="cart-item-main-details">
                          <span className="cart-item-category-label">{item.categoria?.nombre?.toUpperCase() || 'TECNOLOGÍA'}</span>
                          <h3 className="cart-item-title-text">{item.nombre}</h3>
                          <p className="cart-item-unit-price">{formatoCLP.format(Number(item.precio || 0))} c/u</p>
                          <div className="cart-item-quantity-controls">
                            <button onClick={() => alCambiarCantidad(item._id, item.cantidad - 1)} aria-label="Reducir">−</button>
                            <span>{item.cantidad}</span>
                            <button onClick={() => alCambiarCantidad(item._id, item.cantidad + 1)} disabled={item.cantidad >= item.stock} aria-label="Aumentar">+</button>
                          </div>
                        </div>
                        <div className="cart-item-price-column">
                          <button className="cart-item-remove-btn" onClick={() => alEliminarDelCarrito(item._id)} aria-label="Eliminar">🗑️</button>
                          <div className="cart-item-final-price">
                            {formatoCLP.format(Number(item.precio || 0) * item.cantidad)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Columna derecha: resumen del pedido */}
              {carrito.length > 0 && (
                <div className="order-summary-column">
                  <h3 className="summary-title">Resumen del Pedido</h3>
                  <div className="summary-details-box">
                    <div className="summary-row">
                      <span>Subtotal ({totalItemsCarrito} {totalItemsCarrito === 1 ? 'producto' : 'productos'})</span>
                      <strong>{formatoCLP.format(totalCarrito)}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Despacho</span>
                      <strong className="free-label">GRATIS</strong>
                    </div>
                    <div className="summary-row">
                      <span>IVA (19%)</span>
                      <strong>{formatoCLP.format(Math.round(totalCarrito * 0.19))}</strong>
                    </div>
                  </div>

                  <div className="summary-total-row">
                    <span>Total</span>
                    <strong className="grand-total">{formatoCLP.format(totalCarrito)}</strong>
                  </div>

                  <button
                    className="proceed-to-checkout-btn"
                    onClick={() => irACheckout()}
                    disabled={!carrito.length}
                  >
                    Proceder al Pago ➔
                  </button>
                  <button className="continue-shopping-btn" onClick={() => setPagina('tienda')}>
                    ← Seguir Comprando
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 💳 VISTA: CHECKOUT (PAGO) */}
        {pagina === 'checkout' && (
          <div style={{ maxWidth: '600px', margin: '40px auto 80px', padding: '0 24px' }}>
            <button className="login-back-btn" onClick={() => setPagina('carrito')}>← Volver al carrito</button>
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '24px', letterSpacing: '-0.02em', background: 'linear-gradient(135deg, white, var(--accent-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Finalizar Compra
            </h2>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Total a pagar:</span>
                <strong style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white' }}>{formatoCLP.format(totalCarrito)}</strong>
              </div>

              <form onSubmit={alFinalizarCompra} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {usuario ? (
                  <div style={{ background: 'rgba(124, 58, 237, 0.08)', border: '1px dashed rgba(124, 58, 237, 0.3)', borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--accent-light)', letterSpacing: '0.1em' }}>SESIÓN ACTIVA</span>
                    <strong style={{ color: 'white', fontSize: '0.95rem' }}>{usuario.nombre}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{usuario.email}</span>
                  </div>
                ) : (
                  <>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                      ⚡ Compra rápido como invitado sin registrarte, o <span className="register-link" onClick={() => setPagina('login')}>inicia sesión aquí</span> para guardar tu historial.
                    </div>
                    
                    <label className="ls-field">
                      <span>NOMBRE COMPLETO</span>
                      <div className="ls-input-wrap">
                        <span className="ls-icon">👤</span>
                        <input
                          type="text"
                          value={checkoutGuest.nombre}
                          onChange={e => setCheckoutGuest(p => ({ ...p, nombre: e.target.value }))}
                          placeholder="Juan Pérez"
                          required
                        />
                      </div>
                    </label>

                    <label className="ls-field">
                      <span>CORREO ELECTRÓNICO</span>
                      <div className="ls-input-wrap">
                        <span className="ls-icon">@</span>
                        <input
                          type="email"
                          value={checkoutGuest.email}
                          onChange={e => setCheckoutGuest(p => ({ ...p, email: e.target.value }))}
                          placeholder="juan.perez@gmail.com"
                          required
                        />
                      </div>
                    </label>

                    <label className="ls-field">
                      <span>TELÉFONO DE CONTACTO</span>
                      <div className="ls-input-wrap">
                        <span className="ls-icon">📞</span>
                        <input
                          type="tel"
                          value={checkoutGuest.telefono}
                          onChange={e => setCheckoutGuest(p => ({ ...p, telefono: e.target.value }))}
                          placeholder="+56 9 1234 5678"
                          required
                        />
                      </div>
                    </label>
                  </>
                )}

                <div style={{ marginTop: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.3rem' }}>🚚</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <strong style={{ fontSize: '0.85rem', color: 'white' }}>Despacho Express Incluido</strong>
                    <span style={{ fontSize: '0.78rem', color: 'var(--success)' }}>Llega a tu domicilio gratis en 24 horas</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="ls-submit-btn"
                  style={{ marginTop: '12px' }}
                  disabled={!carrito.length}
                >
                  Confirmar y Pagar ➔
                </button>
              </form>
            </div>
          </div>
        )}


        {/* 🔍 VISTA: BÚSQUEDA/FILTROS EN MÓVIL */}
        {pagina === 'buscar' && (
          <div className="mobile-search-screen">
            <h2>Buscar Productos</h2>
            <form onSubmit={aplicarFiltros} className="mobile-search-form">
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Escribe lo que buscas..."
                className="search-input-field"
                autoFocus
              />
              <div className="search-filters-box">
                <label>
                  <span>Categoría</span>
                  <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                  </select>
                </label>
                <div className="price-inputs-row">
                  <input type="number" placeholder="Precio mín. CLP" value={precioMin} onChange={e => setPrecioMin(e.target.value)} />
                  <input type="number" placeholder="Precio máx. CLP" value={precioMax} onChange={e => setPrecioMax(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="search-action-btn">🔍 Buscar ahora</button>
              <button type="button" className="search-clear-btn" onClick={limpiarFiltros}>Limpiar Filtros</button>
            </form>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="main-footer">
        <div className="features-strip">
          <div className="feature-item">
            <span className="feature-icon">🚚</span>
            <div className="feature-text">
              <h3>Envío Express</h3>
              <p>Despacho en 24 horas para Santiago y regiones principales.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🛡️</span>
            <div className="feature-text">
              <h3>Garantía Oficial</h3>
              <p>Todos nuestros productos cuentan con respaldo directo de fábrica.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">☎️</span>
            <div className="feature-text">
              <h3>Soporte Experto</h3>
              <p>Asesoría técnica personalizada para tu próximo upgrade.</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔒</span>
            <div className="feature-text">
              <h3>Pago Seguro</h3>
              <p>Transacciones protegidas con cifrado SSL de 256 bits.</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <div className="footer-brand">
              <h2 className="footer-logo-title">⚡ TechStore</h2>
              <p className="copyright">© 2024 TechStore Chile. Tu destino tech de confianza.</p>
            </div>
            <div className="footer-links">
              <a href="#privacidad">Política de Privacidad</a>
              <a href="#terminos">Términos de Servicio</a>
              <a href="#soporte">Soporte</a>
              <a href="#contacto">Contacto</a>
              <a href="#despacho">Info de Despacho</a>
            </div>
          </div>
        </div>
      </footer>

      {/* BARRA DE NAVEGACIÓN INFERIOR PARA MÓVIL */}
      <div className="mobile-bottom-nav">
        <button
          className={`nav-tab-btn ${pagina === 'tienda' && !mostrarOfertas ? 'active' : ''}`}
          onClick={() => { setPagina('tienda'); setMostrarOfertas(false); }}
        >
          <span className="nav-tab-icon">🏠</span>
          <span className="nav-tab-text">Tienda</span>
        </button>
        <button
          className={`nav-tab-btn ${pagina === 'buscar' ? 'active' : ''}`}
          onClick={() => setPagina('buscar')}
        >
          <span className="nav-tab-icon">🔍</span>
          <span className="nav-tab-text">Buscar</span>
        </button>
        <button
          className={`nav-tab-btn ${mostrarOfertas ? 'active' : ''}`}
          onClick={() => navegarAPagina('ofertas')}
        >
          <span className="nav-tab-icon">🏷️</span>
          <span className="nav-tab-text">Ofertas</span>
        </button>
        <button
          className={`nav-tab-btn ${pagina === 'carrito' ? 'active' : ''}`}
          onClick={() => setPagina('carrito')}
        >
          <span className="nav-tab-icon">
            🛒
            {totalItemsCarrito > 0 && <span className="tab-badge">{totalItemsCarrito}</span>}
          </span>
          <span className="nav-tab-text">Carrito</span>
        </button>
        <button
          className={`nav-tab-btn ${pagina === 'login' || pagina === 'admin' ? 'active' : ''}`}
          onClick={() => setPagina(usuario ? (esAdmin ? 'admin' : 'tienda') : 'login')}
        >
          <span className="nav-tab-icon">👤</span>
          <span className="nav-tab-text">{usuario ? 'Perfil' : 'Ingresar'}</span>
        </button>
      </div>
    </div>
  );
}

export default function AppRoot() {
  return <AuthProvider><Store /></AuthProvider>;
}