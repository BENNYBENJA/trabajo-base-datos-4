import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClienteStore from './components/Cliente/ClienteStore';

const api = axios.create({ baseURL: '/api' });
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// Faux specs for products to show in details page
const obtenerEspecificaciones = (producto) => {
  const nombre = (producto.nombre || '').toLowerCase();
  if (nombre.includes('hyperx') || nombre.includes('sony') || nombre.includes('razer') || nombre.includes('airpods') || nombre.includes('jbl')) {
    return [
      { titulo: 'Transductor', valor: 'Dinámico de 53 mm con imanes de neodimio' },
      { titulo: 'Respuesta de frecuencia', valor: '10 Hz - 21 kHz' },
      { titulo: 'Conectividad', valor: 'Inalámbrica USB / Jack 3.5mm / Bluetooth' },
      { titulo: 'Micrófono', valor: 'Condensador electret unidireccional' },
      { titulo: 'Peso', valor: '308g (con micrófono)' },
      { titulo: 'Compatibilidad', valor: 'PC, PS5, Xbox, Switch, Móvil' }
    ];
  }
  if (nombre.includes('teclado') || nombre.includes('corsair') || nombre.includes('redragon')) {
    return [
      { titulo: 'Tipo de Switch', valor: 'Mecánico (Switches Red / Brown de alta respuesta)' },
      { titulo: 'Distribución', valor: 'Español (ISO) o TKL compacto' },
      { titulo: 'Retroiluminación', valor: 'RGB configurable tecla por tecla' },
      { titulo: 'Conexión', valor: 'Cable USB trenzado extraíble tipo C' },
      { titulo: 'Material', valor: 'Aluminio de grado aeroespacial' },
      { titulo: 'Anti-ghosting', valor: '100% teclas con Full Key Rollover' }
    ];
  }
  if (nombre.includes('mouse') || nombre.includes('logitech') || nombre.includes('steelseries')) {
    return [
      { titulo: 'Sensor', valor: 'Óptico de alta precisión 25.600 DPI' },
      { titulo: 'Velocidad máxima', valor: '400 IPS' },
      { titulo: 'Aceleración', valor: '40 G' },
      { titulo: 'Tasa de sondeo', valor: '1.000 Hz (1ms)' },
      { titulo: 'Peso', valor: '63g ultra liviano' },
      { titulo: 'Batería', valor: 'Hasta 70 horas de uso continuo' }
    ];
  }
  if (nombre.includes('monitor') || nombre.includes('samsung') || nombre.includes('lg') || nombre.includes('benq') || nombre.includes('art')) {
    return [
      { titulo: 'Tamaño de pantalla', valor: '27 pulgadas / 24 pulgadas' },
      { titulo: 'Resolución', valor: 'QHD 2560 x 1440 o Full HD 1080p' },
      { titulo: 'Tasa de refresco', valor: '144Hz / 165Hz ultra fluido' },
      { titulo: 'Tiempo de respuesta', valor: '1ms (GtG)' },
      { titulo: 'Tecnología de panel', valor: 'IPS / VA curvo 1000R' },
      { titulo: 'Sincronización', valor: 'FreeSync Premium & G-Sync Compatible' }
    ];
  }
  if (nombre.includes('rtx') || nombre.includes('gpu') || nombre.includes('componente') || nombre.includes('ryzen') || nombre.includes('cpu')) {
    return [
      { titulo: 'Arquitectura', valor: 'NVIDIA Ada Lovelace / AMD Zen 4' },
      { titulo: 'Memoria VRAM / Núcleos', valor: '12GB GDDR6X / 12 Núcleos 24 Hilos' },
      { titulo: 'Frecuencia de Reloj', valor: 'Boost Clock 2.47 GHz' },
      { titulo: 'Interfaz de Memoria', valor: '192-bit' },
      { titulo: 'Consumo (TDP)', valor: '220W / 120W recomendado' },
      { titulo: 'Soporte PCIe', valor: 'PCI Express 4.0 x16' }
    ];
  }
  // Default fallback
  return [
    { titulo: 'Garantía', valor: '12 meses directo con fabricante' },
    { titulo: 'Estado', valor: 'Nuevo en caja original sellada' },
    { titulo: 'Despacho', valor: 'Disponible para envío express 24h' },
    { titulo: 'Origen', valor: 'Importado de alta calidad' }
  ];
};

/* ──────────────────────────────────────────
   LOGIN MODAL (Glassmorphic)
────────────────────────────────────────── */
function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const { data } = await api.post('/login', form);
      login(data.usuario);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Email o contraseña incorrectos');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={onClose}>✕</button>
        <div className="login-modal-logo">
          <span className="logo-bolt">⚡</span>
          <span className="logo-name">TechStore</span>
        </div>
        <h2 className="login-modal-title">Iniciar sesión</h2>
        <p className="login-modal-sub">Ingresa tus credenciales para continuar</p>

        <form onSubmit={manejarSubmit} className="login-modal-form">
          <label className="lm-field">
            <span>Email</span>
            <input type="email" name="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="tu@email.cl" required autoFocus />
          </label>
          <label className="lm-field">
            <span>Contraseña</span>
            <input type="password" name="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" required />
          </label>
          {error && <div className="lm-error">{error}</div>}
          <button type="submit" className="lm-submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <div className="login-modal-hint">
          <p>🔑 Admin: <code>admin@techstore.cl</code> / <code>admin123</code></p>
          <p>👤 Cliente: <code>juan@gmail.com</code> / <code>cliente123</code></p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   MAIN NAVIGATION & HEADER (Matches mockups)
────────────────────────────────────────── */
function Header({ usuario, esAdmin, totalItemsCarrito, irAPagina, onLoginOpen, logout, busqueda, setBusqueda, alBuscar }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const manejarSubmitBusqueda = (e) => {
    e.preventDefault();
    alBuscar();
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" onClick={e => { e.preventDefault(); irAPagina('tienda'); }}>
          <span className="logo-bolt">⚡</span>
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
              <div className="navbar-user-menu">
                <button className="navbar-action-btn-icon" onClick={logout} title="Cerrar Sesión">
                  👤
                </button>
                <span className="navbar-user-tooltip">Salir ({usuario.nombre?.split(' ')[0]})</span>
              </div>
            </>
          ) : (
            <>
              <button className="navbar-action-btn-icon" onClick={onLoginOpen} title="Iniciar Sesión">
                👤
              </button>
              <button className="navbar-action-btn-icon" onClick={onLoginOpen} title="Ver Carrito">
                🛒
              </button>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

/* ──────────────────────────────────────────
   OFERTAS HERO BANNER (Matches Image 1/5)
────────────────────────────────────────── */
function HeroBanner({ irADetalle }) {
  return (
    <section className="hero-banner">
      <div className="hero-banner-content">
        <span className="hero-eyebrow">TEMPORADA DE INVIERNO 2024</span>
        <h1 className="hero-title">Gamer de <br /><span className="highlight">Invierno</span></h1>
        <p className="hero-description">
          Equípate con lo último en tecnología térmica y hardware de alto rendimiento para las noches más frías. Descubre setups inmersivos diseñados para la victoria.
        </p>
        <div className="hero-actions-row">
          <button className="hero-btn-primary" onClick={() => irADetalle('PROD001')}>COMPRAR AHORA</button>
          <button className="hero-btn-secondary">VER CAMPAÑA</button>
        </div>
      </div>
      <div className="hero-banner-image-wrap">
        <img 
          src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80" 
          alt="Premium Gaming Setup" 
          className="hero-banner-image"
        />
        <div className="hero-image-overlay" />
      </div>
      <div className="hero-dots-indicator">
        <span className="dot active" />
        <span className="dot" />
        <span className="dot" />
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   TE RECOMENDAMOS (Matches Image 1)
────────────────────────────────────────── */
function Recomendados({ productos, alAgregarAlCarrito, irADetalle, onLoginOpen, usuario }) {
  // Let's find specific recommended items or fallback to first items
  const principal = productos.find(p => p._id === 'PROD001') || productos[0];
  const sec1 = productos.find(p => p._id === 'PROD003') || productos[1];
  const sec2 = productos.find(p => p._id === 'PROD002') || productos[2];

  if (!principal || !sec1 || !sec2) return null;

  return (
    <section className="recommended-section">
      <div className="recommended-header">
        <div>
          <h2 className="section-main-title">Te recomendamos</h2>
          <p className="section-sub-title">Hardware seleccionado por nuestros expertos</p>
        </div>
        <button className="view-all-link">VER TODO ➔</button>
      </div>

      <div className="recommended-grid">
        {/* Left Column: Huge featured card */}
        <div className="rec-featured-card" onClick={() => irADetalle(principal._id)}>
          <div className="rec-featured-img-wrap">
            <img src={principal.imagen} alt={principal.nombre} className="rec-featured-img" />
            <div className="rec-featured-glow" />
          </div>
          <div className="rec-featured-body">
            <div className="rec-badges-row">
              <span className="rec-badge premium">PREMIUM</span>
              <span className="rec-badge oferta">OFERTA</span>
            </div>
            <h3 className="rec-featured-title">{principal.nombre}</h3>
            <p className="rec-featured-price">{formatoCLP.format(principal.precio)} CLP</p>
          </div>
        </div>

        {/* Right Column: Stacked list */}
        <div className="rec-stacked-column">
          {/* Card 1 */}
          <div className="rec-mini-card" onClick={() => irADetalle(sec1._id)}>
            <div className="rec-mini-body">
              <span className="rec-mini-category">{sec1.categoria?.nombre || 'PERIFÉRICOS'}</span>
              <h4 className="rec-mini-title">{sec1.nombre}</h4>
              <p className="rec-mini-price">{formatoCLP.format(sec1.precio)} CLP</p>
              <span className="rec-mini-action">VER DETALLES ➔</span>
            </div>
            <div className="rec-mini-img-wrap">
              <img src={sec1.imagen} alt={sec1.nombre} className="rec-mini-img" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="rec-two-cols-row">
            {/* Redragon keyboard item */}
            <div className="rec-submini-card" onClick={() => irADetalle(sec2._id)}>
              <span className="rec-mini-category">TECLADOS</span>
              <h4 className="rec-mini-title">{sec2.nombre}</h4>
              <div className="rec-submini-bottom">
                <p className="rec-mini-price">{formatoCLP.format(sec2.precio)} CLP</p>
                <button 
                  className="rec-cart-mini-btn" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    usuario ? alAgregarAlCarrito(sec2) : onLoginOpen(); 
                  }}
                >
                  🛒
                </button>
              </div>
            </div>

            {/* Promo Card */}
            <div className="rec-promo-card">
              <span className="rec-mini-category">PROMOCIÓN</span>
              <h4 className="rec-mini-title">Gift Cards</h4>
              <p className="rec-promo-desc">Regala Tecnología</p>
              <span className="rec-promo-icon">🎁</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────
   MAIN COMPONENT
────────────────────────────────────────── */
function Store() {
  const { usuario, logout, esAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
  
  // Navigation states: 'tienda' | 'detalle' | 'carrito' | 'admin'
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
  const [reviewError, setReviewError] = useState('');

  // Handle auto-clearing alerts/notices
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
      // Scroll to top
      window.scrollTo(0, 0);
    }
  };

  const irADetalle = async (id) => {
    setProductoDetalleId(id);
    setPagina('detalle');
    window.scrollTo(0, 0);
    setReviewsLoading(true);
    setReviewError('');
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
    if (!usuario) { setLoginOpen(true); return; }
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
      setReviewError('');
      setNotice('⭐ ¡Gracias por tu reseña!');
      const r = await api.get(`/productos/${productoDetalleId}/reviews`); 
      setReviews(r.data);
      cargarProductos();
    } catch (err) { 
      setReviewError(err.response?.data?.message || 'No se pudo guardar.'); 
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

  // Admin form management
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
      {/* Login Modal */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* Header / Navbar */}
      <Header
        usuario={usuario} 
        esAdmin={esAdmin}
        totalItemsCarrito={totalItemsCarrito}
        irAPagina={navegarAPagina}
        onLoginOpen={() => setLoginOpen(true)}
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

        {/* 👤 VIEW: TIENDA HOME */}
        {pagina === 'tienda' && (
          <div className="store-wrapper">
            {/* Hero / Promo slider */}
            <HeroBanner irADetalle={irADetalle} />

            {/* "Te Recomendamos" Grid section */}
            {!loading && productos.length >= 3 && (
              <Recomendados
                productos={productos}
                alAgregarAlCarrito={alAgregarAlCarrito}
                irADetalle={irADetalle}
                onLoginOpen={() => setLoginOpen(true)}
                usuario={usuario}
              />
            )}

            {/* Catalog header & filter pills */}
            <div className="cat-header-pills-row">
              <h2 className="catalog-title">Catálogo de Compra</h2>
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

            {/* Login CTA for guests */}
            {!usuario && !loading && (
              <div className="guest-cta">
                <p>🛒 ¿Te gusta lo que ves? <button onClick={() => setLoginOpen(true)}>Inicia sesión</button> para agregar productos al carrito y realizar compras.</p>
              </div>
            )}
          </div>
        )}

        {/* 📄 VIEW: PRODUCT DETAIL (Matches Image 2) */}
        {pagina === 'detalle' && prodDetalle && (
          <div className="product-detail-view">
            {/* Breadcrumb navigation */}
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
                </div>
                {/* Thumbnails grid simulation */}
                <div className="detail-thumbnails-row">
                  <div className="thumbnail-box active"><img src={prodDetalle.imagen || ''} alt="view 1" /></div>
                  <div className="thumbnail-box"><img src={prodDetalle.imagen || ''} alt="view 2" /></div>
                  <div className="thumbnail-box"><img src={prodDetalle.imagen || ''} alt="view 3" /></div>
                  <div className="thumbnail-box"><img src={prodDetalle.imagen || ''} alt="view 4" /></div>
                </div>
              </div>

              {/* Product Info & Purchase Column */}
              <div className="detail-info-column">
                <div className="detail-brand-info">
                  <span className="brand-badge">HYPERX PREMIUM AUDIO</span>
                  <div className="detail-stars">
                    {'★'.repeat(Math.round(prodDetalle.ratingPromedio || 5))}
                    {'☆'.repeat(5 - Math.round(prodDetalle.ratingPromedio || 5))}
                    <span className="rating-text"> {Number(prodDetalle.ratingPromedio || 5).toFixed(1)}/5 ({prodDetalle.totalReviews || 125} Reseñas)</span>
                  </div>
                </div>

                <h1 className="detail-product-title">{prodDetalle.nombre}</h1>

                <div className="detail-pricing-box">
                  <span className="detail-price-amount">{formatoCLP.format(prodDetalle.precio)} <span className="currency-label">CLP</span></span>
                  <div className="stock-badges-row">
                    <span className="stock-badge in-stock">⚡ EN STOCK</span>
                    <span className="delivery-badge">Despacho en 24 horas</span>
                  </div>
                </div>

                <div className="detail-features-highlights">
                  <h3>Características principales</h3>
                  <ul>
                    <li>Audio Espacial DTS® Headphone:X®</li>
                    <li>Controladores de 53 mm afinados para juegos</li>
                    <li>Comodidad y durabilidad exclusivas de HyperX</li>
                  </ul>
                </div>

                {/* Purchase actions */}
                <div className="detail-actions-box">
                  <div className="detail-qty-picker">
                    <button onClick={() => alAgregarAlCarrito(prodDetalle)}>Añadir al carrito</button>
                  </div>
                  <button className="detail-buy-now-btn" onClick={() => { alAgregarAlCarrito(prodDetalle); navegarAPagina('carrito'); }}>
                    Comprar ahora
                  </button>
                </div>

                <div className="detail-delivery-banner">
                  <span className="delivery-icon">🚚</span>
                  <div className="delivery-text">
                    <strong>Envío prioritario disponible</strong>
                    <p>Recibe mañana si compras antes de las 14:00.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Technical Specifications specs grid (Image 2 specs layout) */}
            <section className="detail-specs-section">
              <h2 className="specs-section-title">Especificaciones Técnicas</h2>
              <div className="specs-grid">
                {specs.map((spec, i) => (
                  <div key={i} className="spec-card">
                    <span className="spec-title">{spec.titulo}</span>
                    <p className="spec-value">{spec.valor}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section inside details page */}
            <section className="detail-reviews-section">
              <div className="reviews-section-layout">
                <div className="reviews-list-column">
                  <h3 className="section-title">Opiniones de clientes</h3>
                  {reviewsLoading ? <p className="muted-text">Cargando opiniones...</p>
                    : !reviews.length ? <p className="muted-text">Aún no hay opiniones de este producto. ¡Sé el primero en calificar!</p>
                      : <div className="detail-reviews-list">
                        {reviews.map(r => (
                          <div key={r._id} className="detail-review-card">
                            <div className="review-header">
                              <strong>{r.usuarioNombre}</strong>
                              <span className="stars">{'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}</span>
                            </div>
                            <span className="review-date">{new Date(r.fecha).toLocaleDateString('es-CL')}</span>
                            {r.comentario && <p className="review-comment-body">{r.comentario}</p>}
                          </div>
                        ))}
                      </div>
                  }
                </div>

                <div className="reviews-form-column">
                  <h3 className="section-title">Calificar producto</h3>
                  {usuario ? (
                    <form onSubmit={guardarReview} className="detail-review-form">
                      <div className="detail-star-selector">
                        <span>Tu calificación:</span>
                        <div className="stars-row">
                          {[1,2,3,4,5].map(v => (
                            <button key={v} type="button" className={`star-btn ${nuevaCalificacion >= v ? 'active' : ''}`} onClick={() => setNuevaCalificacion(v)}>★</button>
                          ))}
                        </div>
                      </div>
                      <label className="field field-wide">
                        <span>Tu comentario</span>
                        <textarea value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} rows={3} placeholder="Cuéntanos tu experiencia con este producto..." className="review-textarea" required />
                      </label>
                      {reviewError && <div className="state-box error">{reviewError}</div>}
                      <button type="submit" className="primary-button">Enviar calificación</button>
                    </form>
                  ) : (
                    <div className="review-login-required">
                      <p>Debes <button onClick={() => setLoginOpen(true)}>iniciar sesión</button> para calificar este producto.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 🛒 VIEW: FULL SHOPPING CART PAGE (Matches Image 3) */}
        {pagina === 'carrito' && (
          <div className="shopping-cart-page">
            <h1 className="cart-page-title">Carrito de Compras</h1>
            <span className="cart-items-count-badge">{totalItemsCarrito} PRODUCTOS</span>

            <div className="cart-page-layout">
              {/* Left Column: Items List */}
              <div className="cart-items-column">
                {!carrito.length ? (
                  <div className="cart-empty-page">
                    <span className="cart-big-icon">🛒</span>
                    <h2>Tu carrito está vacío</h2>
                    <button className="primary-button" onClick={() => navegarAPagina('tienda')}>Volver a la tienda</button>
                  </div>
                ) : (
                  <div className="cart-items-list-container">
                    {carrito.map(item => (
                      <div key={item._id} className="cart-page-item-row">
                        <div className="cart-item-img-wrap">
                          <img src={item.imagen} alt={item.nombre} className="cart-page-item-img" />
                        </div>
                        <div className="cart-item-main-details">
                          <h3 className="cart-item-title-text">{item.nombre}</h3>
                          <span className="cart-item-sku">SKU: {item._id}</span>
                          <button className="cart-item-remove-btn" onClick={() => alEliminarDelCarrito(item._id)}>✕ ELIMINAR</button>
                        </div>
                        <div className="cart-item-quantity-controls">
                          <button onClick={() => alCambiarCantidad(item._id, item.cantidad - 1)}>−</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => alCambiarCantidad(item._id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
                        </div>
                        <div className="cart-item-final-price">
                          {formatoCLP.format(Number(item.precio || 0) * item.cantidad)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Accepted Payment methods strip from mockup */}
                <div className="accepted-payment-strip">
                  <span className="payment-label">MÉTODOS DE PAGO ACEPTADOS</span>
                  <div className="payment-badges">
                    <span className="payment-badge">VISA</span>
                    <span className="payment-badge">MC</span>
                    <span className="payment-badge">AMEX</span>
                    <span className="payment-badge">PAYPAL</span>
                    <span className="payment-badge">APPLE</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary (Matches Mockup Image 3 exactly) */}
              <div className="order-summary-column">
                <h2 className="summary-title">Resumen del Pedido</h2>
                
                <div className="summary-details-box">
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <strong>{formatoCLP.format(totalCarrito)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Envío Estimado</span>
                    <strong className="free-label">GRATIS</strong>
                  </div>
                  <div className="summary-row">
                    <span>Impuestos (Calculado al finalizar)</span>
                    <strong>$0</strong>
                  </div>
                </div>

                <div className="promo-code-input-wrap">
                  <span className="promo-label">CÓDIGO PROMOCIONAL</span>
                  <div className="promo-form-row">
                    <input type="text" placeholder="Ingresa tu código" />
                    <button type="button">APLICAR</button>
                  </div>
                </div>

                <div className="summary-total-row">
                  <span>Total</span>
                  <strong className="grand-total">{formatoCLP.format(totalCarrito)}</strong>
                </div>

                <button className="proceed-to-checkout-btn" onClick={alFinalizarCompra} disabled={!carrito.length}>
                  PROCEDER AL PAGO
                </button>
              </div>
            </div>
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
            <div className="footer-social-icons">
              <button className="social-btn">🔗</button>
              <button className="social-btn">🌐</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AppRoot() {
  return <AuthProvider><Store /></AuthProvider>;
}