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
  if (nombre.includes('hyperx') || nombre.includes('sony') || nombre.includes('razer') || nombre.includes('airpods') || nombre.includes('jbl')) {
    return [
      { titulo: 'SPATIAL AUDIO', valor: 'Precise 3D soundstage.' },
      { titulo: 'CLEAR MIC', valor: 'Ultra-clear voice capture.' }
    ];
  }
  if (nombre.includes('teclado') || nombre.includes('corsair') || nombre.includes('redragon')) {
    return [
      { titulo: 'SWITCH MECÁNICO', valor: 'Switches Red de alta respuesta.' },
      { titulo: 'RGB CHROMA', valor: 'Retroiluminación configurable.' }
    ];
  }
  return [
    { titulo: 'DESPACHO RÁPIDO', valor: 'Envío prioritario en 24 horas.' },
    { titulo: 'GARANTÍA OFICIAL', valor: '12 meses con soporte directo.' }
  ];
};

/* ──────────────────────────────────────────
   VIEW: FULLSCREEN LOGIN PAGE / VIEW (Image 3)
────────────────────────────────────────── */
function LoginPage({ onLoginSuccess, irAPagina }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/login', form);
      login(data.usuario);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-screen-view">
      <div className="login-screen-logo-wrap">
        <div className="login-screen-icon-box">
          <span className="processor-icon">⚙️</span>
        </div>
        <h1 className="login-screen-title">TechStore</h1>
        <p className="login-screen-subtitle">LUMINOUS TECH EXPERIENCE</p>
      </div>

      <form onSubmit={manejarSubmit} className="login-screen-form">
        <label className="ls-field">
          <span>EMAIL ADDRESS</span>
          <div className="ls-input-wrap">
            <span className="ls-icon">@</span>
            <input 
              type="email" 
              value={form.email} 
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} 
              placeholder="dev@techstore.com" 
              required 
            />
          </div>
        </label>

        <label className="ls-field">
          <div className="ls-field-header">
            <span>PASSWORD</span>
            <button type="button" className="forgot-pass-btn">Forgot password?</button>
          </div>
          <div className="ls-input-wrap">
            <span className="ls-icon">🔒</span>
            <input 
              type={showPass ? "text" : "password"} 
              value={form.password} 
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} 
              placeholder="••••••••" 
              required 
            />
            <button type="button" className="ls-eye-btn" onClick={() => setShowPass(!showPass)}>
              {showPass ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </label>

        {error && <div className="ls-error">{error}</div>}

        <button type="submit" className="ls-submit-btn" disabled={cargando}>
          {cargando ? 'Ingresando...' : 'Entrar'}
        </button>
      </form>

      <div className="ls-divider">
        <span>OR CONTINUE WITH</span>
      </div>

      <div className="ls-social-buttons">
        <button className="ls-social-btn google-btn">
          <span className="social-icon">🌐</span> Google
        </button>
        <button className="ls-social-btn apple-btn">
          <span className="social-icon">🍎</span> Apple
        </button>
      </div>

      <p className="ls-footer-register">
        Don't have an account? <span className="register-link">Register</span>
      </p>

      <div className="ls-demo-credentials">
        <p>🔑 Admin: <code>admin@techstore.cl</code> / <code>admin123</code></p>
        <p>👤 Cliente: <code>juan@gmail.com</code> / <code>cliente123</code></p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   HEADER / NAVBAR
────────────────────────────────────────── */
function Header({ usuario, esAdmin, totalItemsCarrito, irAPagina, logout, busqueda, setBusqueda, alBuscar }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const manejarSubmitBusqueda = (e) => {
    e.preventDefault();
    alBuscar();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Menu burger on left (matches mobile mockup) */}
        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)}>
          <span /><span /><span />
        </button>

        <a href="/" className="navbar-logo" onClick={e => { e.preventDefault(); irAPagina('tienda'); }}>
          <span className="logo-name">TechStore</span>
        </a>

        {/* Centered Search Bar */}
        <form className="navbar-search-form" onSubmit={manejarSubmitBusqueda}>
          <input
            type="text"
            className="navbar-search-input"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar hardware premium..."
          />
          <span className="navbar-search-icon">🔍</span>
        </form>

        {/* Navigation links matching mockup */}
        <nav className={`navbar-nav-links ${menuOpen ? 'open' : ''}`}>
          <button onClick={() => irAPagina('tienda', 'CAT003')}>Notebooks</button>
          <button onClick={() => irAPagina('tienda', 'CAT007')}>Componentes</button>
          <button onClick={() => irAPagina('tienda', 'CAT005')}>Gaming</button>
          <button onClick={() => irAPagina('tienda', 'CAT002')}>Periféricos</button>
          <button onClick={() => irAPagina('tienda', 'ofertas')}>Ofertas</button>
          {usuario && esAdmin && (
            <button className="nav-admin-link" onClick={() => irAPagina('admin')}>⚙️ Panel Admin</button>
          )}
        </nav>

        {/* Actions (Cart and User) */}
        <div className="navbar-actions">
          {usuario ? (
            <>
              {!esAdmin && (
                <button className="navbar-action-btn-icon" onClick={() => irAPagina('carrito')} title="Ver Carrito">
                  🛒
                  {totalItemsCarrito > 0 && <span className="cart-badge">{totalItemsCarrito}</span>}
                </button>
              )}
              <button className="navbar-action-btn-icon" onClick={logout} title="Cerrar Sesión">
                👤
              </button>
            </>
          ) : (
            <>
              <button className="navbar-action-btn-icon" onClick={() => irAPagina('login')} title="Iniciar Sesión">
                👤
              </button>
              <button className="navbar-action-btn-icon" onClick={() => irAPagina('login')} title="Ver Carrito">
                🛒
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────
   OFERTAS HERO BANNER (Matches Mobile Banner)
────────────────────────────────────────── */
function HeroBanner({ irADetalle }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-image-wrap">
        <img 
          src="https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800&q=80" 
          alt="Premium Notebook Setup" 
          className="hero-banner-image"
        />
        <div className="hero-image-overlay" />
      </div>
      <div className="hero-banner-content">
        <span className="hero-eyebrow">EDICIÓN ESPECIAL</span>
        <h1 className="hero-title">Gamer de Invierno</h1>
        <p className="hero-description">
          Potencia gélida para tus partidas más calientes.
        </p>
        <button className="hero-btn-primary" onClick={() => irADetalle('PROD001')}>
          Explorar Colección ➔
        </button>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   TE RECOMENDAMOS (Matches Mobile Grid/Scroll)
────────────────────────────────────────── */
function Recomendados({ productos, alAgregarAlCarrito, irADetalle, onLoginOpen, usuario }) {
  // Take recommended items
  const principal = productos.find(p => p._id === 'PROD001') || productos[0];
  const sec1 = productos.find(p => p._id === 'PROD003') || productos[1];
  const sec2 = productos.find(p => p._id === 'PROD002') || productos[2];

  if (!principal || !sec1 || !sec2) return null;

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
        {/* Card 1 */}
        <div className="rec-card" onClick={() => irADetalle(principal._id)}>
          <button className="rec-heart-btn">♥</button>
          <div className="rec-img-box">
            <img src={principal.imagen} alt={principal.nombre} />
          </div>
          <span className="rec-category">AUDIO PRO</span>
          <h3 className="rec-title">{principal.nombre}</h3>
          <div className="rec-price-row">
            <span className="rec-price">{formatoCLP.format(principal.precio)}</span>
            <button className="rec-add-button" onClick={(e) => { e.stopPropagation(); usuario ? alAgregarAlCarrito(principal) : onLoginOpen(); }}>+</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rec-card" onClick={() => irADetalle(sec1._id)}>
          <button className="rec-heart-btn">♥</button>
          <div className="rec-img-box">
            <img src={sec1.imagen} alt={sec1.nombre} />
          </div>
          <span className="rec-category">GAMING</span>
          <h3 className="rec-title">{sec1.nombre}</h3>
          <div className="rec-price-row">
            <span className="rec-price">{formatoCLP.format(sec1.precio)}</span>
            <button className="rec-add-button" onClick={(e) => { e.stopPropagation(); usuario ? alAgregarAlCarrito(sec1) : onLoginOpen(); }}>+</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rec-card" onClick={() => irADetalle(sec2._id)}>
          <button className="rec-heart-btn">♥</button>
          <div className="rec-img-box">
            <img src={sec2.imagen} alt={sec2.nombre} />
          </div>
          <span className="rec-category">PERIFÉRICOS</span>
          <h3 className="rec-title">{sec2.nombre}</h3>
          <div className="rec-price-row">
            <span className="rec-price">{formatoCLP.format(sec2.precio)}</span>
            <button className="rec-add-button" onClick={(e) => { e.stopPropagation(); usuario ? alAgregarAlCarrito(sec2) : onLoginOpen(); }}>+</button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   MAIN STORE
────────────────────────────────────────── */
function Store() {
  const { usuario, logout, esAdmin } = useAuth();
  
  // Navigation states: 'tienda' | 'detalle' | 'carrito' | 'admin' | 'login' | 'buscar'
  const [pagina, setPagina] = useState('tienda');
  const [productoDetalleId, setProductoDetalleId] = useState(null);

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  
  // Filters
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [aplicado, setAplicado] = useState({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
  
  // Admin form
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' });

  // Cart
  const [carrito, setCarrito] = useState([]);
  const totalItemsCarrito = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const totalCarrito = carrito.reduce((sum, i) => sum + Number(i.precio || 0) * i.cantidad, 0);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');

  // Auto-clear notices
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
    setPagina(nombrePagina);
    if (nombrePagina === 'tienda') {
      setCategoriaFiltro(catId === 'ofertas' ? '' : catId);
      setAplicado({
        busqueda: '',
        categoriaFiltro: catId === 'ofertas' ? '' : catId,
        precioMin: '',
        precioMax: ''
      });
      window.scrollTo(0, 0);
    }
  };

  const irADetalle = async (id) => {
    setProductoDetalleId(id);
    setPagina('detalle');
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
    if (n <= 0) { 
      setCarrito(prev => prev.filter(i => i._id !== id)); 
      return; 
    }
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
      setNotice('✅ ¡Compra realizada con éxito! Recibirás tu boleta pronto.');
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
      setError(err.response?.data?.message || 'No se pudo guardar.'); 
    }
  };

  const aplicarFiltros = (e) => { 
    if (e) e.preventDefault(); 
    setAplicado({ busqueda, categoriaFiltro, precioMin, precioMax }); 
    setPagina('tienda');
  };

  const limpiarFiltros = () => { 
    setBusqueda(''); 
    setCategoriaFiltro(''); 
    setPrecioMin(''); 
    setPrecioMax(''); 
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

  const hayFiltros = aplicado.busqueda || aplicado.categoriaFiltro || aplicado.precioMin || aplicado.precioMax;
  const prodDetalle = productos.find(p => p._id === productoDetalleId);
  const specs = prodDetalle ? obtenerEspecificaciones(prodDetalle) : [];

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

      {/* Flashing Toast Notifications */}
      {notice && <div className="toast">{notice}</div>}

      <main className="main-content">
        
        {/* ⚙️ VIEW: ADMIN */}
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

        {/* ⚙️ VIEW: LOGIN PAGE (Image 3) */}
        {pagina === 'login' && (
          <LoginPage 
            onLoginSuccess={() => setPagina('tienda')} 
            irAPagina={navegarAPagina} 
          />
        )}

        {/* 👤 VIEW: TIENDA HOME */}
        {pagina === 'tienda' && (
          <div className="store-wrapper">
            {/* Hero / Promo banner */}
            <HeroBanner irADetalle={irADetalle} />

            {/* "Te Recomendamos" Grid/Scroll section */}
            {!loading && productos.length >= 3 && (
              <Recomendados
                productos={productos}
                alAgregarAlCarrito={alAgregarAlCarrito}
                irADetalle={irADetalle}
                onLoginOpen={() => setPagina('login')}
                usuario={usuario}
              />
            )}

            {/* Catalog header & filter pills */}
            <div className="cat-header-pills-row">
              <div className="catalog-title-wrapper">
                <span className="cat-eyebrow-small">CATÁLOGO COMPLETO</span>
                <h2 className="catalog-title">Explora Componentes</h2>
              </div>
              <div className="cat-pills-row">
                <button className={`cat-pill ${!categoriaFiltro ? 'active' : ''}`} onClick={() => { setCategoriaFiltro(''); setAplicado(p => ({ ...p, categoriaFiltro: '' })); }}>Todo</button>
                {categorias.map(c => (
                  <button key={c._id} className={`cat-pill ${categoriaFiltro === c._id ? 'active' : ''}`}
                    onClick={() => { setCategoriaFiltro(c._id); setAplicado(p => ({ ...p, categoriaFiltro: c._id })); }}>
                    {c.nombre}
                  </button>
                ))}
              </div>
            </div>

            {/* Catalog Grid */}
            {error && <div className="state-box error">{error}</div>}
            {loading ? (
              <div className="skeleton-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
            ) : (
              <>
                <ClienteStore 
                  productos={productos} 
                  carrito={carrito} 
                  alAgregarAlCarrito={alAgregarAlCarrito} 
                  alAbrirReviews={irADetalle} 
                  formatoCLP={formatoCLP} 
                />
              </>
            )}

            {/* Purple Help card matching mockup bottom */}
            <div className="help-box-card">
              <h3 className="help-title">¿Necesitas Ayuda?</h3>
              <p className="help-desc">Nuestros expertos técnicos están listos para asesorarte en tu próximo build.</p>
              <button className="help-support-btn">Contactar Soporte</button>
            </div>
          </div>
        )}

        {/* 📄 VIEW: PRODUCT DETAIL (Matches Image 2) */}
        {pagina === 'detalle' && prodDetalle && (
          <div className="product-detail-view">
            {/* Header back button for mobile */}
            <div className="detail-mobile-header">
              <button className="back-btn" onClick={() => setPagina('tienda')}>←</button>
              <span className="detail-header-title">TechStore</span>
              <div className="detail-header-actions">
                <button className="share-btn">🔗</button>
                <button className="cart-btn" onClick={() => setPagina('carrito')}>🛒</button>
              </div>
            </div>

            {/* Breadcrumb for desktop */}
            <div className="breadcrumb">
              <button onClick={() => setPagina('tienda')}>Home</button> ➔ 
              <span>{prodDetalle.categoria?.nombre || 'Producto'}</span> ➔ 
              <span className="active">{prodDetalle.nombre}</span>
            </div>

            <div className="detail-main-layout">
              {/* Product Gallery */}
              <div className="detail-gallery-column">
                <div className="detail-image-main-wrap">
                  {prodDetalle.imagen ? (
                    <img src={prodDetalle.imagen} alt={prodDetalle.nombre} className="detail-main-img" />
                  ) : (
                    <div className="detail-no-img">📦</div>
                  )}
                  {/* Rating Badge Overlay (Matches mockup top right) */}
                  <div className="detail-rating-pill-overlay">
                    ★ {Number(prodDetalle.ratingPromedio || 4.9).toFixed(1)} ({prodDetalle.totalReviews || '1.2k'})
                  </div>
                </div>
                {/* Dots indicator simulation */}
                <div className="detail-dots-indicator">
                  <span className="dot active" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>

              {/* Product Info & Purchase Column */}
              <div className="detail-info-column">
                <div className="detail-brand-info">
                  <span className="brand-badge">PREMIUM AUDIO</span>
                </div>

                <h1 className="detail-product-title">{prodDetalle.nombre}</h1>

                <div className="detail-pricing-box">
                  <div className="detail-price-row">
                    <span className="detail-price-amount">{formatoCLP.format(prodDetalle.precio)}</span>
                    {prodDetalle.descuento > 0 && (
                      <>
                        <span className="detail-price-original">{formatoCLP.format(Math.round(prodDetalle.precio / (1 - prodDetalle.descuento / 100)))}</span>
                        <span className="detail-discount-badge">{prodDetalle.descuento}% OFF</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Grid of Two Highlight Specs (Image 2 style) */}
                <div className="detail-specs-summary-grid">
                  {specs.slice(0, 2).map((spec, idx) => (
                    <div key={idx} className="spec-summary-card">
                      <span className="spec-summary-icon">{idx === 0 ? '🔊' : '🎙️'}</span>
                      <strong className="spec-summary-title">{spec.titulo}</strong>
                      <p className="spec-summary-text">{spec.valor}</p>
                    </div>
                  ))}
                </div>

                <div className="detail-description-section">
                  <h3>DESCRIPCIÓN</h3>
                  <p>{prodDetalle.descripcion || 'Experimenta el pináculo del audio gaming con los Cloud III. Diseñados para sesiones maratónicas con espumas viscoelásticas de alta calidad y una estructura metálica ligera pero indestructible.'}</p>
                </div>

                {/* Specs Accordion */}
                <div className="detail-accordion-item">
                  <div className="accordion-header">
                    <span>ESPECIFICACIONES TÉCNICAS</span>
                    <span>▼</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom sticky purchase row for mobile details (Matches Image 2 bottom bar) */}
            <div className="detail-mobile-sticky-bar">
              <button className="sticky-cart-icon-btn" onClick={() => alAgregarAlCarrito(prodDetalle)}>
                🛒
              </button>
              <button className="sticky-buy-now-btn" onClick={() => { alAgregarAlCarrito(prodDetalle); setPagina('carrito'); }}>
                Buy Now ➔
              </button>
            </div>
          </div>
        )}

        {/* 🛒 VIEW: FULL SHOPPING CART PAGE (Matches Image 4) */}
        {pagina === 'carrito' && (
          <div className="shopping-cart-page">
            <h1 className="cart-page-title">Your Cart</h1>
            <span className="cart-items-count-badge">{totalItemsCarrito} ITEMS</span>

            <div className="cart-page-layout">
              {/* Left Column: Items List */}
              <div className="cart-items-column">
                {!carrito.length ? (
                  <div className="cart-empty-page">
                    <span className="cart-big-icon">🛒</span>
                    <h2>Tu carrito está vacío</h2>
                    <button className="primary-button" onClick={() => setPagina('tienda')}>Volver a la tienda</button>
                  </div>
                ) : (
                  <div className="cart-items-list-container">
                    {carrito.map(item => (
                      <div key={item._id} className="cart-page-item-row">
                        <div className="cart-item-img-wrap">
                          <img src={item.imagen} alt={item.nombre} className="cart-page-item-img" />
                        </div>
                        <div className="cart-item-main-details">
                          <span className="cart-item-category-label">PERIPHERALS</span>
                          <h3 className="cart-item-title-text">{item.nombre}</h3>
                          <div className="cart-item-quantity-controls">
                            <button onClick={() => alCambiarCantidad(item._id, item.cantidad - 1)}>−</button>
                            <span>{item.cantidad}</span>
                            <button onClick={() => alCambiarCantidad(item._id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
                          </div>
                        </div>
                        <div className="cart-item-price-column">
                          <button className="cart-item-remove-btn" onClick={() => alEliminarDelCarrito(item._id)}>🗑️</button>
                          <div className="cart-item-final-price">
                            {formatoCLP.format(Number(item.precio || 0) * item.cantidad)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Order Summary (Matches Mockup Image 4 exactly) */}
              <div className="order-summary-column">
                <div className="summary-details-box">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>{formatoCLP.format(totalCarrito)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Shipping</span>
                    <strong className="free-label">FREE</strong>
                  </div>
                </div>

                <div className="summary-total-row">
                  <span>Total</span>
                  <strong className="grand-total">{formatoCLP.format(totalCarrito)}</strong>
                </div>

                <button className="proceed-to-checkout-btn" onClick={alFinalizarCompra} disabled={!carrito.length}>
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 🔍 VIEW: BUSQUEDA/FILTROS EN MOVIL */}
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
              />
              <div className="search-filters-box">
                <label>
                  <span>Categoría</span>
                  <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                  </select>
                </label>
                <div className="price-inputs-row">
                  <input type="number" placeholder="Min CLP" value={precioMin} onChange={e => setPrecioMin(e.target.value)} />
                  <input type="number" placeholder="Max CLP" value={precioMax} onChange={e => setPrecioMax(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="search-action-btn">Buscar ahora</button>
              <button type="button" className="search-clear-btn" onClick={limpiarFiltros}>Limpiar Filtros</button>
            </form>
          </div>
        )}
      </main>

      {/* Footer features strip matching mockup footer strip */}
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
        </div>

        <div className="footer-bottom-bar">
          <div className="footer-bottom-inner">
            <div className="footer-brand">
              <h2 className="footer-logo-title">TechStore</h2>
              <p className="copyright">© 2026 TechStore. Aggressive Sophistication in Hardware.</p>
            </div>
            <div className="footer-links">
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#support">Support</a>
              <a href="#contact">Contact Us</a>
              <a href="#shipping">Shipping Info</a>
            </div>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVIGATION TAB BAR FOR MOBILE (Matches Mockup bottom navigation) */}
      <div className="mobile-bottom-nav">
        <button className={`nav-tab-btn ${pagina === 'tienda' ? 'active' : ''}`} onClick={() => setPagina('tienda')}>
          <span className="nav-tab-icon">🏠</span>
          <span className="nav-tab-text">Shop</span>
        </button>
        <button className={`nav-tab-btn ${pagina === 'buscar' ? 'active' : ''}`} onClick={() => setPagina('buscar')}>
          <span className="nav-tab-icon">🔍</span>
          <span className="nav-tab-text">Search</span>
        </button>
        <button className={`nav-tab-btn ${pagina === 'carrito' ? 'active' : ''}`} onClick={() => setPagina('carrito')}>
          <span className="nav-tab-icon">🛒
            {totalItemsCarrito > 0 && <span className="tab-badge">{totalItemsCarrito}</span>}
          </span>
          <span className="nav-tab-text">Cart</span>
        </button>
        <button className={`nav-tab-btn ${pagina === 'login' || pagina === 'admin' ? 'active' : ''}`} onClick={() => setPagina(usuario ? (esAdmin ? 'admin' : 'tienda') : 'login')}>
          <span className="nav-tab-icon">👤</span>
          <span className="nav-tab-text">Profile</span>
        </button>
      </div>
    </div>
  );
}

export default function AppRoot() {
  return <AuthProvider><Store /></AuthProvider>;
}