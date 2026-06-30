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
    _id: '',
    nombre: '',
    precio: '',
    stock: '',
    descripcion: '',
    categoriaId: '',
    imagen: ''
  });

  const cargarCategorias = useCallback(() => {
    return api.get('/categorias')
      .then(res => setCategorias(res.data))
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  const cargarProductos = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();

    if (aplicado.busqueda.trim()) params.set('q', aplicado.busqueda.trim());
    if (aplicado.categoriaFiltro) params.set('categoria', aplicado.categoriaFiltro);
    if (aplicado.precioMin) params.set('precioMin', aplicado.precioMin);
    if (aplicado.precioMax) params.set('precioMax', aplicado.precioMax);

    const url = params.toString()
      ? `/productos-con-categoria?${params.toString()}`
      : '/productos-con-categoria';

    api.get(url)
      .then(res => {
        setProductos(res.data);
        setError('');
        setNotice('');
      })
      .catch(() => {
        setError('No se pudieron cargar los productos. Verifica que el backend esté activo.');
      })
      .finally(() => setLoading(false));
  }, [aplicado]);

  useEffect(() => {
    Promise.all([cargarCategorias(), cargarProductos()]);
  }, [cargarCategorias, cargarProductos]);

  const limpiarFormulario = () => {
    setEditingId('');
    setForm({
      _id: '',
      nombre: '',
      precio: '',
      stock: '',
      descripcion: '',
      categoriaId: '',
      imagen: ''
    });
  };

  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  const totalItemsCarrito = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  const totalCarrito = carrito.reduce((sum, item) => sum + Number(item.precio || 0) * item.cantidad, 0);

  const alAgregarAlCarrito = (producto) => {
    const existe = carrito.find(item => item._id === producto._id);
    if (existe && existe.cantidad >= producto.stock) {
      setNotice(`⚠️ Stock máximo alcanzado para ${producto.nombre}.`);
      return;
    }
    setCarrito(prev => {
      const existeItem = prev.find(item => item._id === producto._id);
      if (existeItem) {
        return prev.map(item =>
          item._id === producto._id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
    setNotice(`🛒 ¡${producto.nombre} agregado al carrito!`);
  };

  const alCambiarCantidad = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setCarrito(prev => prev.filter(item => item._id !== productoId));
      return;
    }
    setCarrito(prev => prev.map(item =>
      item._id === productoId ? { ...item, cantidad: nuevaCantidad } : item
    ));
  };

  const alEliminarDelCarrito = (productoId) => {
    setCarrito(prev => prev.filter(item => item._id !== productoId));
  };

  const alFinalizarCompra = async () => {
    if (carrito.length === 0) return;
    const verificado = window.confirm(
      `¿Deseas finalizar tu compra de ${totalItemsCarrito} producto(s) por un total de ${formatoCLP.format(totalCarrito)}?`
    );
    if (verificado) {
      try {
        const items = carrito.map(item => ({
          productoId: item._id,
          nombre: item.nombre,
          precio: Number(item.precio || 0),
          cantidad: item.cantidad
        }));
        await api.post('/compras', {
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre,
          usuarioEmail: usuario.email,
          items
        });
        setCarrito([]);
        setCarritoAbierto(false);
        setNotice('✅ ¡Compra realizada con éxito! El stock ha sido actualizado.');
        cargarProductos();
      } catch (err) {
        setError(err.response?.data?.message || 'Error al procesar la compra.');
      }
    }
  };

  const vaciarCarrito = () => {
    setCarrito([]);
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [nuevaCalificacion, setNuevaCalificacion] = useState(5);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [reviewError, setReviewError] = useState('');

  const abrirModalReviews = async (producto) => {
    setProductoSeleccionado(producto);
    setModalOpen(true);
    setReviewsLoading(true);
    setReviewError('');
    setNuevaCalificacion(5);
    setNuevoComentario('');
    try {
      const res = await api.get(`/productos/${producto._id}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error(err);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const cerrarModalReviews = () => {
    setModalOpen(false);
    setProductoSeleccionado(null);
    setReviews([]);
  };

  const guardarReview = async (event) => {
    event.preventDefault();
    if (!productoSeleccionado) return;

    try {
      await api.post(`/productos/${productoSeleccionado._id}/reviews`, {
        usuarioId: usuario.id,
        usuarioNombre: usuario.nombre,
        calificacion: nuevaCalificacion,
        comentario: nuevoComentario
      });

      setNuevoComentario('');
      setNuevaCalificacion(5);
      setReviewError('');

      const res = await api.get(`/productos/${productoSeleccionado._id}/reviews`);
      setReviews(res.data);

      cargarProductos();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'No se pudo guardar la calificación.');
    }
  };



  const formatoCLP = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

  const aplicarFiltros = (event) => {
    event.preventDefault();
    setAplicado({
      busqueda,
      categoriaFiltro,
      precioMin,
      precioMax
    });
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaFiltro('');
    setPrecioMin('');
    setPrecioMax('');
    setAplicado({ busqueda: '', categoriaFiltro: '', precioMin: '', precioMax: '' });
  };

  const manejarCambioFormulario = (event) => {
    const { name, value } = event.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const guardarProducto = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await api.put(`/productos/${editingId}`, form);
        setNotice('Producto actualizado correctamente.');
      } else {
        await api.post('/productos', form);
        setNotice('Producto creado correctamente.');
      }

      setError('');

      limpiarFormulario();
      cargarProductos();
      cargarCategorias();
    } catch (saveError) {
      setError(saveError.response?.data?.message || 'No se pudo guardar el producto.');
    }
  };

  const editarProducto = (producto) => {
    setEditingId(producto._id);
    setForm({
      _id: producto._id,
      nombre: producto.nombre || '',
      precio: producto.precio ?? '',
      stock: producto.stock ?? '',
      descripcion: producto.descripcion || '',
      categoriaId: producto.categoria?._id || '',
      imagen: producto.imagen || ''
    });
  };

  const eliminarProducto = async (id) => {
    const confirmado = window.confirm('¿Seguro que quieres eliminar este producto?');

    if (!confirmado) {
      return;
    }

    try {
      await api.delete(`/productos/${id}`);
      setNotice('Producto eliminado correctamente.');
      setError('');
      cargarProductos();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'No se pudo eliminar el producto.');
    }
  };

  return (
    <div className="app-shell">
      <main className="report-card">
        <section className="hero">
          <div>
            <p className="eyebrow">{esAdmin ? 'Panel de Administración' : 'Bienvenido a TechStore'}</p>
            <h1>{esAdmin ? 'Catálogo de productos con categoría' : 'Tu tienda de tecnología'}</h1>
            <p className="hero-copy">
              {esAdmin
                ? <>Visualización construida con MongoDB y una agregación <span>$lookup</span> para unir productos y categorías.</>
                : 'Descubre los mejores productos tecnológicos con los mejores precios del mercado.'
              }
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div className="hero-badge">
              <span className="pulse" />
              API activa
            </div>
            <div className="user-badge">
              <span className={`role-pill ${esAdmin ? 'admin' : 'cliente'}`}>
                {esAdmin ? '🔑 Admin' : '👤 Cliente'}
              </span>
              <span className="user-name">{usuario.nombre}</span>

              {!esAdmin && (
                <button
                  type="button"
                  className="cart-toggle-btn"
                  onClick={() => setCarritoAbierto(prev => !prev)}
                  title="Ver carrito"
                >
                  🛒
                  {totalItemsCarrito > 0 && (
                    <span className="cart-count-badge">{totalItemsCarrito}</span>
                  )}
                </button>
              )}

              <button className="logout-button" onClick={logout}>Cerrar sesión</button>
            </div>
          </div>
        </section>

        <form className="filters-panel" onSubmit={aplicarFiltros}>
          <div className="filters-grid">
            <label className="field">
              <span>Buscar</span>
              <input
                type="text"
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Nombre, descripción o categoría"
              />
            </label>

            <label className="field">
              <span>Categoría</span>
              <select value={categoriaFiltro} onChange={(event) => setCategoriaFiltro(event.target.value)}>
                <option value="">Todas</option>
                {categorias.map(categoria => (
                  <option key={categoria._id} value={categoria._id}>{categoria.nombre}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Precio mínimo</span>
              <input
                type="number"
                value={precioMin}
                onChange={(event) => setPrecioMin(event.target.value)}
                placeholder="0"
              />
            </label>

            <label className="field">
              <span>Precio máximo</span>
              <input
                type="number"
                value={precioMax}
                onChange={(event) => setPrecioMax(event.target.value)}
                placeholder="999999"
              />
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
          esAdmin ? (
            <AdminDashboard
              productos={productos}
              categorias={categorias}
              form={form}
              editingId={editingId}
              notice={null}
              error={null}
              loading={loading}
              formatoCLP={formatoCLP}
              manejarCambioFormulario={manejarCambioFormulario}
              guardarProducto={guardarProducto}
              limpiarFormulario={limpiarFormulario}
              editarProducto={editarProducto}
              eliminarProducto={eliminarProducto}
              abrirModalReviews={abrirModalReviews}
            />
          ) : (
            <ClienteStore
              productos={productos}
              carrito={carrito}
              alAgregarAlCarrito={alAgregarAlCarrito}
              alAbrirReviews={abrirModalReviews}
              formatoCLP={formatoCLP}
            />
          )
        )}

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
                      <button type="button" className="cart-item-remove" onClick={() => alEliminarDelCarrito(item._id)} title="Eliminar del carrito">🗑️</button>
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

        {modalOpen && productoSeleccionado && (
          <div className="modal-backdrop">
            <div className="reviews-modal">
              <div className="modal-header">
                <div>
                  <span className="eyebrow" style={{ marginBottom: '4px', display: 'block' }}>Reseñas del Producto</span>
                  <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{productoSeleccionado.nombre}</h2>
                </div>
                <button type="button" className="close-button" onClick={cerrarModalReviews}>
                  &times;
                </button>
              </div>

              <div className="modal-body">
                <section className="reviews-list-section">
                  <h3 className="section-title">Calificaciones recibidas</h3>
                  {reviewsLoading ? (
                    <p className="loading-text">Cargando comentarios...</p>
                  ) : reviews.length === 0 ? (
                    <p className="no-reviews-text">Este producto aún no tiene calificaciones. ¡Sé el primero en calificarlo!</p>
                  ) : (
                    <div className="reviews-scroll-list">
                      {reviews.map(r => (
                        <div key={r._id} className="review-card">
                          <div className="review-header">
                            <strong className="review-user">{r.usuarioNombre}</strong>
                            <span className="review-stars">
                              {'★'.repeat(r.calificacion)}{'☆'.repeat(5 - r.calificacion)}
                            </span>
                          </div>
                          <span className="review-date">
                            {new Date(r.fecha).toLocaleDateString('es-CL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
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
                          <button
                            key={val}
                            type="button"
                            className={`star-select-btn ${nuevaCalificacion >= val ? 'active' : ''}`}
                            onClick={() => setNuevaCalificacion(val)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="field field-wide">
                      <span>Tu comentario (opcional)</span>
                      <textarea
                        value={nuevoComentario}
                        onChange={(e) => setNuevoComentario(e.target.value)}
                        placeholder="Escribe lo que opinas sobre este producto..."
                        rows={3}
                        className="review-textarea"
                      />
                    </label>

                    {reviewError && <div className="state-box error" style={{ margin: '10px 0 0 0', padding: '10px', fontSize: '0.85rem' }}>{reviewError}</div>}

                    <div style={{ marginTop: '15px' }}>
                      <button type="submit" className="primary-button" style={{ width: '100%' }}>
                        Enviar calificación
                      </button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
        )}
      </main>
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