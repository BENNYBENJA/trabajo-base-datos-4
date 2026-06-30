import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClienteStore from './components/Cliente/ClienteStore';

const api = axios.create({
  baseURL: '/api'
});

const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

// Hero banners data
const heroBanners = [
  {
    id: 1,
    title: 'Gamer de Invierno',
    subtitle: 'Los mejores equipos gaming al mejor precio',
    badge: '¡Oferta especial!',
    color: 'from-indigo-900 to-purple-900',
    emoji: '🎮',
    bg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%)',
  },
  {
    id: 2,
    title: 'Audio Premium',
    subtitle: 'Audífonos y parlantes con la mejor calidad de sonido',
    badge: 'Nuevos arrivals',
    color: 'from-teal-900 to-cyan-900',
    emoji: '🎵',
    bg: 'linear-gradient(135deg, #042f2e 0%, #134e4a 50%, #0e7490 100%)',
  },
  {
    id: 3,
    title: 'Laptops & Mac',
    subtitle: 'Potencia y portabilidad en un solo lugar',
    badge: 'Top ventas',
    color: 'from-gray-900 to-slate-800',
    emoji: '💻',
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  }
];

function HeroBanner({ productos, onProductoClick }) {
  const [current, setCurrent] = useState(0);
  const featured = productos.slice(0, 3);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % heroBanners.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = heroBanners[current];

  return (
    <div className="hero-banner" style={{ background: banner.bg }}>
      <div className="hero-banner-left">
        <span className="hero-banner-badge">{banner.badge}</span>
        <h2 className="hero-banner-title">{banner.emoji} {banner.title}</h2>
        <p className="hero-banner-sub">{banner.subtitle}</p>
      </div>
      <div className="hero-banner-products">
        {featured.map(p => (
          <button key={p._id} className="hero-featured-card" onClick={() => onProductoClick(p)}>
            {p.imagen
              ? <img src={p.imagen} alt={p.nombre} className="hero-featured-img" />
              : <div className="hero-featured-no-img">📦</div>
            }
            <div className="hero-featured-info">
              <p className="hero-featured-name">{p.nombre}</p>
              <p className="hero-featured-price">{formatoCLP.format(Number(p.precio || 0))}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="hero-dots">
        {heroBanners.map((_, i) => (
          <button key={i} className={`hero-dot ${i === current ? 'active' : ''}`} onClick={() => setCurrent(i)} />
        ))}
      </div>
    </div>
  );
}

function Navbar({ usuario, esAdmin, totalItemsCarrito, onCartOpen, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="navbar-logo-icon">⚡</span>
          <span className="navbar-logo-text">TechStore</span>
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)} aria-label="Menú">
          <span /><span /><span />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <span className="navbar-user-greeting">
            Hola, <strong>{usuario?.nombre?.split(' ')[0]}</strong>
            <span className={`navbar-role-pill ${esAdmin ? 'admin' : 'cliente'}`}>
              {esAdmin ? 'Admin' : 'Cliente'}
            </span>
          </span>
          <button className="navbar-logout" onClick={logout}>Cerrar sesión</button>
        </div>

        {!esAdmin && (
          <button className="navbar-cart-btn" onClick={onCartOpen} aria-label="Carrito">
            🛒
            {totalItemsCarrito > 0 && (
              <span className="navbar-cart-badge">{totalItemsCarrito}</span>
            )}
          </button>
        )}
      </div>
    </nav>
  );
}

function Catalogo() {
  const { usuario, logout, esAdmin } = useAuth();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [aplicado, setAplicado] = useState({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState({
    _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: ''
  });

  const cargarCategorias = useCallback(() => {
    return api.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const cargarProductos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (aplicado.busqueda.trim()) params.set('q', aplicado.busqueda.trim());
    if (aplicado.categoriaFiltro) params.set('categoria', aplicado.categoriaFiltro);
    if (aplicado.precioMin) params.set('precioMin', aplicado.precioMin);
    if (aplicado.precioMax) params.set('precioMax', aplicado.precioMax);
    const url = params.toString() ? `/productos-con-categoria?${params.toString()}` : '/productos-con-categoria';
    api.get(url)
      .then(res => { setProductos(res.data); setError(''); setNotice(''); })
      .catch(() => setError('No se pudieron cargar los productos.'))
      .finally(() => setLoading(false));
  }, [aplicado]);

  useEffect(() => {
    Promise.all([cargarCategorias(), cargarProductos()]);
  }, [cargarCategorias, cargarProductos]);

  const limpiarFormulario = () => {
    setEditingId('');
    setForm({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' });
  };

  // Cart
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const totalItemsCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalCarrito = carrito.reduce((sum, item) => sum + Number(item.precio || 0) * item.cantidad, 0);

  const alAgregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item._id === producto._id);
    if (existe && existe.cantidad >= producto.stock) {
      setNotice(`⚠️ Stock máximo alcanzado para ${producto.nombre}.`); return;
    }
    setCarrito(prev => {
      const existeItem = prev.find(item => item._id === producto._id);
      if (existeItem) return prev.map(item => item._id === producto._id ? { ...item, cantidad: item.cantidad + 1 } : item);
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setNotice(`🛒 ¡${producto.nombre} agregado al carrito!`);
  };

  const alCambiarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) { setCarrito(prev => prev.filter(item => item._id !== productoId)); return; }
    setCarrito(prev => prev.map(item => item._id === productoId ? { ...item, cantidad: nuevaCantidad } : item));
  };

  const alEliminarDelCarrito = (productoId) => setCarrito(prev => prev.filter(item => item._id !== productoId));
  const vaciarCarrito = () => setCarrito([]);

  const alFinalizarCompra = async () => {
    if (carrito.length === 0) return;
    const verificado = window.confirm(`¿Deseas finalizar tu compra de ${totalItemsCarrito} producto(s) por ${formatoCLP.format(totalCarrito)}?`);
    if (verificado) {
      try {
        const items = carrito.map(item => ({ productoId: item._id, nombre: item.nombre, precio: Number(item.precio || 0), cantidad: item.cantidad }));
        await api.post('/compras', { usuarioId: usuario.id, usuarioNombre: usuario.nombre, usuarioEmail: usuario.email, items });
        setCarrito([]); setCarritoAbierto(false);
        setNotice('✅ ¡Compra realizada con éxito! El stock ha sido actualizado.');
        cargarProductos();
      } catch (err) { setError(err.response?.data?.message || 'Error al procesar la compra.'); }
    }
  };

  // Reviews
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [reviewError, setReviewError] = useState('');

  const abrirModalReviews = async (producto) => {
    setProductoSeleccionado(producto); setModalOpen(true); setReviewsLoading(true);
    setReviewError(''); setNuevaCalificacion(5); setNuevoComentario('');
    try { const res = await api.get(`/productos/${producto._id}/reviews`); setReviews(res.data); }
    catch (err) { console.error(err); setReviews([]); }
    finally { setReviewsLoading(false); }
  };

  const cerrarModalReviews = () => { setModalOpen(false); setProductoSeleccionado(null); setReviews([]); };

  const guardarReview = async (event) => {
    event.preventDefault();
    if (!productoSeleccionado) return;
    try {
      await api.post(`/productos/${productoSeleccionado._id}/reviews`, { usuarioId: usuario.id, usuarioNombre: usuario.nombre, calificacion: nuevaCalificacion, comentario: nuevoComentario });
      setNuevoComentario(''); setNuevaCalificacion(5); setReviewError('');
      const res = await api.get(`/productos/${productoSeleccionado._id}/reviews`); setReviews(res.data);
      cargarProductos();
    } catch (err) { setReviewError(err.response?.data?.message || 'No se pudo guardar la calificación.'); }
  };

  const aplicarFiltros = (event) => {
    event.preventDefault();
    setAplicado({ busqueda, categoriaFiltro, precioMin, precioMax });
  };

  const limpiarFiltros = () => {
    setBusqueda(''); setCategoriaFiltro(''); setPrecioMin(''); setPrecioMax('');
    setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
  };

  const manejarCambioFormulario = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const guardarProducto = async (event) => {
    event.preventDefault();
    try {
      if (editingId) { await api.put(`/productos/${editingId}`, form); setNotice('Producto actualizado correctamente.'); }
      else { await api.post('/productos', form); setNotice('Producto creado correctamente.'); }
      setError(''); limpiarFormulario(); cargarProductos(); cargarCategorias();
    } catch (saveError) { setError(saveError.response?.data?.message || 'No se pudo guardar el producto.'); }
  };

  const editarProducto = (producto) => {
    setEditingId(producto._id);
    setForm({ _id: producto._id, nombre: producto.nombre || '', precio: producto.precio ?? '', stock: producto.stock ?? '', descripcion: producto.descripcion || '', categoriaId: producto.categoria?._id || '', imagen: producto.imagen || '' });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try { await api.delete(`/productos/${id}`); setNotice('Producto eliminado correctamente.'); setError(''); cargarProductos(); }
    catch (deleteError) { setError(deleteError.response?.data?.message || 'No se pudo eliminar el producto.'); }
  };

  return (
    <div className="ecommerce-shell">
      {/* NAVBAR */}
      <Navbar
        usuario={usuario}
        esAdmin={esAdmin}
        totalItemsCarrito={totalItemsCarrito}
        onCartOpen={() => setCarritoAbierto(true)}
        logout={logout}
      />

      {/* NOTICE TOAST */}
      {notice && <div className="toast-notice">{notice}</div>}

      <main className="ecommerce-main">
        {esAdmin ? (
          /* ─── ADMIN PANEL ─── */
          <div className="admin-wrapper">
            <div className="admin-header-bar">
              <h1>⚙️ Panel de Administración</h1>
              <p>Gestión de catálogo de productos</p>
            </div>

            <form className="filters-panel" onSubmit={aplicarFiltros}>
              <div className="filters-grid">
                <label className="field">
                  <span>Buscar</span>
                  <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Nombre, descripción o categoría" />
                </label>
                <label className="field">
                  <span>Categoría</span>
                  <select value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="field">
                  <span>Precio mínimo</span>
                  <input type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)} placeholder="0" />
                </label>
                <label className="field">
                  <span>Precio máximo</span>
                  <input type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="999999" />
                </label>
              </div>
              <div className="filters-actions">
                <button type="submit" className="primary-button">Aplicar filtros</button>
                <button type="button" className="secondary-button" onClick={limpiarFiltros}>Limpiar</button>
              </div>
            </form>

            {notice && <div className="state-box success" style={{ marginBottom: '20px' }}>{notice}</div>}
            {loading && <div className="state-box">Cargando catálogo...</div>}
            {!loading && error && <div className="state-box error">{error}</div>}

            {!loading && !error && (
              <AdminDashboard
                productos={productos} categorias={categorias} form={form}
                editingId={editingId} notice={null} error={null} loading={loading}
                formatoCLP={formatoCLP} manejarCambioFormulario={manejarCambioFormulario}
                guardarProducto={guardarProducto} limpiarFormulario={limpiarFormulario}
                editarProducto={editarProducto} eliminarProducto={eliminarProducto}
                abrirModalReviews={abrirModalReviews}
              />
            )}
          </div>
        ) : (
          /* ─── CLIENTE STORE ─── */
          <div className="store-wrapper">
            {/* Hero Banner */}
            {!loading && productos.length > 0 && (
              <HeroBanner productos={productos} onProductoClick={abrirModalReviews} />
            )}

            {/* Search & Filter Bar */}
            <form className="search-filter-bar" onSubmit={aplicarFiltros}>
              <div className="search-bar-wrap">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  type="text"
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  placeholder="Busca aquí la tecnología para ti..."
                />
              </div>
              <select className="cat-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
              <button type="submit" className="search-btn">Buscar</button>
              {(aplicado.busqueda || aplicado.categoriaFiltro || aplicado.precioMin || aplicado.precioMax) && (
                <button type="button" className="search-clear-btn" onClick={limpiarFiltros}>✕ Limpiar</button>
              )}
            </form>

            {/* Price Filter Row */}
            <div className="price-filter-row">
              <span className="price-filter-label">Precio:</span>
              <input className="price-input" type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)} placeholder="Mín" />
              <span style={{ color: '#94a3b8' }}>—</span>
              <input className="price-input" type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="Máx" />
              <button className="price-apply-btn" onClick={aplicarFiltros}>Aplicar</button>
            </div>

            {/* Category Pills */}
            {categorias.length > 0 && (
              <div className="category-pills">
                <button className={`cat-pill ${!categoriaFiltro ? 'active' : ''}`} onClick={() => { setCategoriaFiltro(''); setAplicado(p => ({ ...p, categoriaFiltro: '' })); }}>
                  Todos
                </button>
                {categorias.map(c => (
                  <button key={c._id} className={`cat-pill ${categoriaFiltro === c._id ? 'active' : ''}`}
                    onClick={() => { setCategoriaFiltro(c._id); setAplicado(p => ({ ...p, categoriaFiltro: c._id })); }}>
                    {c.nombre}
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {error && <div className="state-box error">{error}</div>}
            {loading ? (
              <div className="loading-grid">
                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)}
              </div>
            ) : (
              <>
                <div className="section-heading">
                  <h2 className="section-heading-title">
                    {aplicado.busqueda || aplicado.categoriaFiltro ? '🔎 Resultados' : '⭐ Te recomendamos'}
                  </h2>
                  <span className="section-heading-count">{productos.length} productos</span>
                </div>
                <ClienteStore
                  productos={productos}
                  carrito={carrito}
                  alAgregarAlCarrito={alAgregarAlCarrito}
                  alAbrirReviews={abrirModalReviews}
                  formatoCLP={formatoCLP}
                />
              </>
            )}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      {!esAdmin && (
        <>
          <div className={`cart-drawer-backdrop ${carritoAbierto ? 'open' : ''}`} onClick={() => setCarritoAbierto(false)} />
          <aside className={`cart-drawer ${carritoAbierto ? 'open' : ''}`}>
            <div className="cart-drawer-header">
              <h2>🛒 Tu Carrito</h2>
              <button type="button" className="close-button" onClick={() => setCarritoAbierto(false)}>&times;</button>
            </div>

            <div className="cart-drawer-body">
              {carrito.length === 0 ? (
                <div className="cart-empty">
                  <span className="cart-empty-emoji">🛒</span>
                  <h4>Tu carrito está vacío</h4>
                  <p>Agrega productos desde el catálogo</p>
                </div>
              ) : (
                carrito.map(item => (
                  <div key={item._id} className="cart-item">
                    {item.imagen && <img src={item.imagen} alt={item.nombre} className="cart-item-img" />}
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.nombre}</h4>
                      <p className="cart-item-price">{formatoCLP.format(Number(item.precio || 0))}</p>
                      <div className="cart-item-qty">
                        <button type="button" onClick={() => alCambiarCantidad(item._id, item.cantidad - 1)}>−</button>
                        <span>{item.cantidad}</span>
                        <button type="button" onClick={() => alCambiarCantidad(item._id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
                      </div>
                    </div>
                    <button type="button" className="cart-item-remove" onClick={() => alEliminarDelCarrito(item._id)} title="Eliminar">🗑️</button>
                  </div>
                ))
              )}
            </div>

            {carrito.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total-row">
                  <span>Total ({totalItemsCarrito} items)</span>
                  <strong>{formatoCLP.format(totalCarrito)}</strong>
                </div>
                <button type="button" className="cart-checkout-btn" onClick={alFinalizarCompra}>💳 Finalizar Compra</button>
                <button type="button" className="cart-clear-btn" onClick={vaciarCarrito}>Vaciar carrito</button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Reviews Modal */}
      {modalOpen && productoSeleccionado && (
        <div className="modal-backdrop">
          <div className="reviews-modal">
            <div className="modal-header">
              <div>
                <span className="eyebrow" style={{ marginBottom: '4px', display: 'block' }}>Reseñas del Producto</span>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{productoSeleccionado.nombre}</h2>
              </div>
              <button type="button" className="close-button" onClick={cerrarModalReviews}>&times;</button>
            </div>

            <div className="modal-body">
              <section className="reviews-list-section">
                <h3 className="section-title">Calificaciones recibidas</h3>
                {reviewsLoading ? <p className="loading-text">Cargando comentarios...</p>
                  : reviews.length === 0 ? <p className="no-reviews-text">Este producto aún no tiene calificaciones. ¡Sé el primero en calificarlo!</p>
                    : (
                      <div className="reviews-scroll-list">
                        {reviews.map(r => (
                          <div key={r._id} className="review-card">
                            <div className="review-header">
                              <strong className="review-user">{r.usuarioNombre}</strong>
                              <span className="review-stars">{'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}</span>
                            </div>
                            <span className="review-date">
                              {new Date(r.fecha).toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {r.comentario && <p className="review-comment">{r.comentario}</p>}
                          </div>
                        ))}
                      </div>
                    )}
              </section>

              <section className="add-review-section">
                <h3 className="section-title">Añadir tu calificación</h3>
                <form onSubmit={guardarReview} className="review-form">
                  <div className="star-rating-selector">
                    <span>Tu valoración:</span>
                    <div className="stars-row">
                      {[1, 2, 3, 4, 5].map(val => (
                        <button key={val} type="button" className={`star-select-btn ${nuevaCalificacion >= val ? 'active' : ''}`} onClick={() => setNuevaCalificacion(val)}>★</button>
                      ))}
                    </div>
                  </div>
                  <label className="field field-wide">
                    <span>Tu comentario (opcional)</span>
                    <textarea value={nuevoComentario} onChange={(e) => setNuevoComentario(e.target.value)} placeholder="Escribe lo que opinas sobre este producto..." rows={3} className="review-textarea" />
                  </label>
                  {reviewError && <div className="state-box error" style={{ margin: '10px 0 0 0', padding: '10px', fontSize: '0.85rem' }}>{reviewError}</div>}
                  <div style={{ marginTop: '15px' }}>
                    <button type="submit" className="primary-button" style={{ width: '100%' }}>Enviar calificación</button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const { usuario } = useAuth();
  return usuario ? <Catalogo /> : <Login />;
}

export default function AppRoot() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}