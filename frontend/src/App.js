import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import AdminDashboard from './components/Admin/AdminDashboard';
import ClienteStore from './components/Cliente/ClienteStore';

const api = axios.create({ baseURL: '/api' });
const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

/* ──────────────────────────────────────────
   LOGIN MODAL
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
   NAVBAR
────────────────────────────────────────── */
function Navbar({ usuario, esAdmin, totalItemsCarrito, onCartOpen, onLoginOpen, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="/" className="navbar-logo" onClick={e => e.preventDefault()}>
          <span className="logo-bolt">⚡</span>
          <span className="logo-name">TechStore</span>
        </a>

        <div className="navbar-tagline">La tecnología que necesitas al mejor precio</div>

        <div className={`navbar-actions ${menuOpen ? 'open' : ''}`}>
          {usuario ? (
            <>
              <span className="navbar-greeting">
                Hola, <strong>{usuario.nombre?.split(' ')[0]}</strong>
                <span className={`nav-role ${esAdmin ? 'admin' : 'cliente'}`}>{esAdmin ? 'Admin' : 'Cliente'}</span>
              </span>
              {!esAdmin && (
                <button className="navbar-cart-btn" onClick={onCartOpen}>
                  🛒
                  {totalItemsCarrito > 0 && <span className="cart-badge">{totalItemsCarrito}</span>}
                  <span className="cart-label">Carrito</span>
                </button>
              )}
              <button className="navbar-logout-btn" onClick={logout}>Cerrar sesión</button>
            </>
          ) : (
            <>
              <button className="navbar-login-btn" onClick={onLoginOpen}>
                👤 Iniciar sesión
              </button>
              <button className="navbar-cart-btn disabled-cart" onClick={onLoginOpen}>
                🛒 <span className="cart-label">Carrito</span>
              </button>
            </>
          )}
        </div>

        <button className="navbar-hamburger" onClick={() => setMenuOpen(m => !m)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────
   OFFERTAS HERO BANNER
────────────────────────────────────────── */
function OfertasBanner({ productos, formatoCLP, onProductoClick, onLoginOpen, usuario }) {
  const [slide, setSlide] = useState(0);
  const ofertas = productos.filter(p => p.descuento > 0).slice(0, 8);
  const maxSlide = Math.max(0, ofertas.length - 3);

  useEffect(() => {
    if (ofertas.length <= 3) return;
    const t = setInterval(() => setSlide(s => (s >= maxSlide ? 0 : s + 1)), 4000);
    return () => clearInterval(t);
  }, [ofertas.length, maxSlide]);

  if (ofertas.length === 0) return null;

  const visibles = ofertas.slice(slide, slide + 3);

  return (
    <div className="offers-section">
      <div className="offers-header">
        <div className="offers-title-wrap">
          <span className="offers-fire">🔥</span>
          <h2 className="offers-title">Ofertas del día</h2>
          <span className="offers-badge">HASTA -{Math.max(...ofertas.map(p => p.descuento))}%</span>
        </div>
        <div className="offers-nav">
          <button onClick={() => setSlide(s => Math.max(0, s - 1))} disabled={slide === 0}>‹</button>
          <button onClick={() => setSlide(s => Math.min(maxSlide, s + 1))} disabled={slide >= maxSlide}>›</button>
        </div>
      </div>

      <div className="offers-grid">
        {visibles.map(p => {
          const precioOriginal = Math.round(p.precio / (1 - p.descuento / 100));
          return (
            <div key={p._id} className="offer-card" onClick={() => usuario ? onProductoClick(p) : onLoginOpen()}>
              <div className="offer-discount-badge">-{p.descuento}%</div>
              <div className="offer-img-wrap">
                {p.imagen
                  ? <img src={p.imagen} alt={p.nombre} className="offer-img" />
                  : <div className="offer-no-img">📦</div>
                }
              </div>
              <div className="offer-info">
                {p.categoria?.nombre && <span className="offer-cat">{p.categoria.nombre}</span>}
                <p className="offer-name">{p.nombre}</p>
                <p className="offer-original">{formatoCLP.format(precioOriginal)}</p>
                <p className="offer-price">{formatoCLP.format(p.precio)}</p>
                <button className="offer-add-btn" onClick={(e) => { e.stopPropagation(); usuario ? onProductoClick(p) : onLoginOpen(); }}>
                  🛒 Ver producto
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="offers-dots">
        {Array.from({ length: maxSlide + 1 }).map((_, i) => (
          <button key={i} className={`offer-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────
   MAIN APP STORE
────────────────────────────────────────── */
function Store() {
  const { usuario, logout, esAdmin } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);
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
  const [form, setForm] = useState({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' });

  // Cart
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const totalItemsCarrito = carrito.reduce((sum, i) => sum + i.cantidad, 0);
  const totalCarrito = carrito.reduce((sum, i) => sum + Number(i.precio || 0) * i.cantidad, 0);

  // Reviews
  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [reviewError, setReviewError] = useState('');

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

  useEffect(() => { cargarCategorias(); cargarProductos(); }, [cargarCategorias, cargarProductos]);

  const alAgregarAlCarrito = (producto) => {
    if (!usuario) { setLoginOpen(true); return; }
    const existe = carrito.find(i => i._id === producto._id);
    if (existe && existe.cantidad >= producto.stock) { setNotice(`⚠️ Stock máximo para ${producto.nombre}`); return; }
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
    if (!window.confirm(`¿Finalizar compra de ${totalItemsCarrito} productos por ${formatoCLP.format(totalCarrito)}?`)) return;
    try {
      const items = carrito.map(i => ({ productoId: i._id, nombre: i.nombre, precio: Number(i.precio || 0), cantidad: i.cantidad }));
      await api.post('/compras', { usuarioId: usuario.id, usuarioNombre: usuario.nombre, usuarioEmail: usuario.email, items });
      setCarrito([]); setCarritoAbierto(false);
      setNotice('✅ ¡Compra realizada con éxito!');
      cargarProductos();
    } catch (err) { setError(err.response?.data?.message || 'Error al procesar la compra.'); }
  };

  const abrirModalReviews = async (producto) => {
    if (!usuario) { setLoginOpen(true); return; }
    setProductoSeleccionado(producto); setModalOpen(true); setReviewsLoading(true); setReviewError('');
    setNuevaCalificacion(5); setNuevoComentario('');
    try { const r = await api.get(`/productos/${producto._id}/reviews`); setReviews(r.data); }
    catch { setReviews([]); }
    finally { setReviewsLoading(false); }
  };

  const cerrarModalReviews = () => { setModalOpen(false); setProductoSeleccionado(null); setReviews([]); };

  const guardarReview = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado) return;
    try {
      await api.post(`/productos/${productoSeleccionado._id}/reviews`, { usuarioId: usuario.id, usuarioNombre: usuario.nombre, calificacion: nuevaCalificacion, comentario: nuevoComentario });
      setNuevoComentario(''); setNuevaCalificacion(5); setReviewError('');
      const r = await api.get(`/productos/${productoSeleccionado._id}/reviews`); setReviews(r.data);
      cargarProductos();
    } catch (err) { setReviewError(err.response?.data?.message || 'No se pudo guardar.'); }
  };

  const aplicarFiltros = (e) => { if (e) e.preventDefault(); setAplicado({ busqueda, categoriaFiltro, precioMin, precioMax }); };
  const limpiarFiltros = () => { setBusqueda(''); setCategoriaFiltro(''); setPrecioMin(''); setPrecioMax(''); setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' }); };

  const manejarCambioFormulario = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })); };
  const limpiarFormulario = () => { setEditingId(''); setForm({ _id: '', nombre: '', precio: '', stock: '', descripcion: '', categoriaId: '', imagen: '' }); };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/productos/${editingId}`, form); setNotice('Producto actualizado.'); }
      else { await api.post('/productos', form); setNotice('Producto creado.'); }
      setError(''); limpiarFormulario(); cargarProductos(); cargarCategorias();
    } catch (err) { setError(err.response?.data?.message || 'No se pudo guardar.'); }
  };

  const editarProducto = p => {
    setEditingId(p._id);
    setForm({ _id: p._id, nombre: p.nombre || '', precio: p.precio ?? '', stock: p.stock ?? '', descripcion: p.descripcion || '', categoriaId: p.categoria?._id || '', imagen: p.imagen || '' });
  };

  const eliminarProducto = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try { await api.delete(`/productos/${id}`); setNotice('Producto eliminado.'); setError(''); cargarProductos(); }
    catch (err) { setError(err.response?.data?.message || 'No se pudo eliminar.'); }
  };

  const hayFiltros = aplicado.busqueda || aplicado.categoriaFiltro || aplicado.precioMin || aplicado.precioMax;

  return (
    <div className="app-shell">
      {/* Login Modal */}
      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}

      {/* Navbar */}
      <Navbar
        usuario={usuario} esAdmin={esAdmin}
        totalItemsCarrito={totalItemsCarrito}
        onCartOpen={() => setCarritoAbierto(true)}
        onLoginOpen={() => setLoginOpen(true)}
        logout={logout}
      />

      {/* Toast */}
      {notice && <div className="toast">{notice}</div>}

      <main className="main-content">
        {esAdmin ? (
          /* ─── ADMIN ─── */
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
                eliminarProducto={eliminarProducto} abrirModalReviews={abrirModalReviews}
              />
            )}
          </div>
        ) : (
          /* ─── TIENDA CLIENTE ─── */
          <div className="store-wrapper">

            {/* Ofertas Banner */}
            {!loading && (
              <OfertasBanner
                productos={productos} formatoCLP={formatoCLP}
                onProductoClick={abrirModalReviews}
                onLoginOpen={() => setLoginOpen(true)}
                usuario={usuario}
              />
            )}

            {/* Search + Filters */}
            <form className="search-bar-row" onSubmit={aplicarFiltros}>
              <div className="search-input-wrap">
                <span className="search-icon-inner">🔍</span>
                <input className="search-main-input" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Busca aquí la tecnología para ti..." />
              </div>
              <select className="search-cat-select" value={categoriaFiltro} onChange={e => setCategoriaFiltro(e.target.value)}>
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}
              </select>
              <input className="search-price-input" type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)} placeholder="Precio mín." />
              <input className="search-price-input" type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="Precio máx." />
              <button type="submit" className="search-submit-btn">Buscar</button>
              {hayFiltros && <button type="button" className="search-clear-btn" onClick={limpiarFiltros}>✕</button>}
            </form>

            {/* Category Pills */}
            <div className="cat-pills-row">
              <button className={`cat-pill ${!categoriaFiltro ? 'active' : ''}`} onClick={() => { setCategoriaFiltro(''); setAplicado(p => ({ ...p, categoriaFiltro: '' })); }}>Todo</button>
              {categorias.map(c => (
                <button key={c._id} className={`cat-pill ${categoriaFiltro === c._id ? 'active' : ''}`}
                  onClick={() => { setCategoriaFiltro(c._id); setAplicado(p => ({ ...p, categoriaFiltro: c._id })); }}>
                  {c.nombre}
                </button>
              ))}
            </div>

            {/* Products */}
            {error && <div className="state-box error">{error}</div>}
            {loading ? (
              <div className="skeleton-grid">{[...Array(8)].map((_, i) => <div key={i} className="skeleton-card" />)}</div>
            ) : (
              <>
                <div className="products-heading">
                  <h2>{hayFiltros ? '🔎 Resultados de búsqueda' : '⭐ Todos los productos'}</h2>
                  <span>{productos.length} productos</span>
                </div>
                <ClienteStore productos={productos} carrito={carrito} alAgregarAlCarrito={alAgregarAlCarrito} alAbrirReviews={abrirModalReviews} formatoCLP={formatoCLP} />
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
      </main>

      {/* Cart Drawer */}
      {usuario && !esAdmin && (
        <>
          <div className={`cart-backdrop ${carritoAbierto ? 'open' : ''}`} onClick={() => setCarritoAbierto(false)} />
          <aside className={`cart-drawer ${carritoAbierto ? 'open' : ''}`}>
            <div className="cart-drawer-header">
              <h2>🛒 Tu Carrito</h2>
              <button className="close-btn" onClick={() => setCarritoAbierto(false)}>✕</button>
            </div>
            <div className="cart-drawer-body">
              {!carrito.length ? (
                <div className="cart-empty"><span>🛒</span><p>Tu carrito está vacío</p></div>
              ) : carrito.map(item => (
                <div key={item._id} className="cart-item">
                  {item.imagen && <img src={item.imagen} alt={item.nombre} className="cart-item-img" />}
                  <div className="cart-item-info">
                    <p className="cart-item-name">{item.nombre}</p>
                    <p className="cart-item-price">{formatoCLP.format(Number(item.precio || 0))}</p>
                    <div className="cart-item-qty">
                      <button onClick={() => alCambiarCantidad(item._id, item.cantidad - 1)}>−</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => alCambiarCantidad(item._id, item.cantidad + 1)} disabled={item.cantidad >= item.stock}>+</button>
                    </div>
                  </div>
                  <button className="cart-item-remove" onClick={() => alEliminarDelCarrito(item._id)}>🗑️</button>
                </div>
              ))}
            </div>
            {carrito.length > 0 && (
              <div className="cart-drawer-footer">
                <div className="cart-total"><span>Total ({totalItemsCarrito})</span><strong>{formatoCLP.format(totalCarrito)}</strong></div>
                <button className="cart-checkout-btn" onClick={alFinalizarCompra}>💳 Finalizar Compra</button>
                <button className="cart-clear-btn" onClick={() => setCarrito([])}>Vaciar carrito</button>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Reviews Modal */}
      {modalOpen && productoSeleccionado && (
        <div className="modal-backdrop" onClick={cerrarModalReviews}>
          <div className="reviews-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div><span className="eyebrow">Reseñas</span><h2>{productoSeleccionado.nombre}</h2></div>
              <button className="close-btn" onClick={cerrarModalReviews}>✕</button>
            </div>
            <div className="modal-body">
              <section>
                <h3 className="section-title">Calificaciones</h3>
                {reviewsLoading ? <p className="muted-text">Cargando...</p>
                  : !reviews.length ? <p className="muted-text">Sin reseñas aún. ¡Sé el primero!</p>
                    : <div className="reviews-list">
                      {reviews.map(r => (
                        <div key={r._id} className="review-card">
                          <div className="review-top">
                            <strong>{r.usuarioNombre}</strong>
                            <span className="stars">{'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}</span>
                          </div>
                          <span className="review-date">{new Date(r.fecha).toLocaleDateString('es-CL')}</span>
                          {r.comentario && <p>{r.comentario}</p>}
                        </div>
                      ))}
                    </div>}
              </section>
              <section>
                <h3 className="section-title">Tu calificación</h3>
                <form onSubmit={guardarReview} className="review-form">
                  <div className="star-selector">
                    <span>Valoración:</span>
                    <div className="stars-row">
                      {[1,2,3,4,5].map(v => (
                        <button key={v} type="button" className={`star-btn ${nuevaCalificacion >= v ? 'active' : ''}`} onClick={() => setNuevaCalificacion(v)}>★</button>
                      ))}
                    </div>
                  </div>
                  <label className="field field-wide">
                    <span>Comentario (opcional)</span>
                    <textarea value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)} rows={3} placeholder="Escribe tu opinión..." className="review-textarea" />
                  </label>
                  {reviewError && <div className="state-box error">{reviewError}</div>}
                  <button type="submit" className="primary-button" style={{ width: '100%', marginTop: 12 }}>Enviar calificación</button>
                </form>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppRoot() {
  return <AuthProvider><Store /></AuthProvider>;
}