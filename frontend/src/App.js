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
   VIEW: PÁGINA DE INICIO DE SESIÓN
────────────────────────────────────────── */
function PaginaLogin({ alIniciarSesion, irAPagina }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);

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
        <button className="ls-social-btn google-btn" type="button">
          <span className="social-icon">🌐</span> Google
        </button>
        <button className="ls-social-btn apple-btn" type="button">
          <span className="social-icon">🍎</span> Apple
        </button>
      </div>

      <p className="ls-footer-register">
        ¿No tienes cuenta? <span className="register-link">Regístrate gratis</span>
      </p>

      <div className="ls-demo-credentials">
        <p>🔑 Admin: <code>admin@techstore.cl</code> / <code>admin123</code></p>
        <p>👤 Cliente: <code>juan@gmail.com</code> / <code>cliente123</code></p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   HEADER / BARRA DE NAVEGACIÓN
────────────────────────────────────────── */
function Header({ usuario, esAdmin, totalItemsCarrito, irAPagina, logout, busqueda, setBusqueda, alBuscar }) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <button onClick={() => { irAPagina('tienda', 'CAT003'); setMenuOpen(false); }}>Notebooks</button>
          <button onClick={() => { irAPagina('tienda', 'CAT007'); setMenuOpen(false); }}>Componentes</button>
          <button onClick={() => { irAPagina('tienda', 'CAT005'); setMenuOpen(false); }}>Gaming</button>
          <button onClick={() => { irAPagina('tienda', 'CAT002'); setMenuOpen(false); }}>Periféricos</button>
          <button onClick={() => { irAPagina('ofertas'); setMenuOpen(false); }}>Ofertas</button>
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
              <button className="navbar-action-btn-icon" onClick={() => irAPagina('login')} title="Ver Carrito" aria-label="Carrito">
                🛒
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
function BannerHero({ irADetalle }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-image-wrap">
        <img
          src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80"
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
          <button className="hero-btn-primary" onClick={() => irADetalle('PROD001')}>
            Explorar Colección ➔
          </button>
          <button className="hero-btn-secondary">
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
                onClick={e => { e.stopPropagation(); usuario ? alAgregarAlCarrito(p) : onAbrirLogin(); }}
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

  const navegarAPagina = (nombrePagina, catId = '') => {
    // Manejar la vista de ofertas especialmente
    if (nombrePagina === 'ofertas') {
      setMostrarOfertas(true);
      setPagina('tienda');
      setCategoriaFiltro('');
      setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
      window.scrollTo(0, 0);
      return;
    }
    setMostrarOfertas(false);
    setPagina(nombrePagina);
    if (nombrePagina === 'tienda') {
      setCategoriaFiltro(catId);
      setAplicado({ busqueda: '', categoriaFiltro: catId, precioMin: '', precioMax: '' });
      window.scrollTo(0, 0);
    }
  };

  const irADetalle = async (id) => {
    setProductoDetalleId(id);
    setPagina('detalle');
    setMostrarOfertas(false);
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

  const alAgregarAlCarrito = (producto) => {
    if (!usuario) { setPagina('login'); return; }
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

  const alFinalizarCompra = async () => {
    if (!carrito.length) return;
    try {
      const items = carrito.map(i => ({
        productoId: i._id,
        nombre: i.nombre,
        precio: Number(i.precio || 0),
        cantidad: i.cantidad
      }));
      await api.post('/compras', {
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        usuarioEmail: usuario.email,
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
            {!mostrarOfertas && <BannerHero irADetalle={irADetalle} />}

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
              <ClienteStore
                productos={productosMostrar}
                carrito={carrito}
                alAgregarAlCarrito={alAgregarAlCarrito}
                alAbrirReviews={irADetalle}
                formatoCLP={formatoCLP}
              />
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
                  <div className="accordion-header">
                    <span>ESPECIFICACIONES TÉCNICAS</span>
                    <span>▼</span>
                  </div>
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
                    onClick={() => { alAgregarAlCarrito(prodDetalle); setPagina('carrito'); }}
                    disabled={prodDetalle.stock <= 0}
                  >
                    Comprar Ahora ➔
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
                    onClick={alFinalizarCompra}
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