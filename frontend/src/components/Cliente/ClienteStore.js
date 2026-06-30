import React from 'react';

export default function ClienteStore({
  productos,
  carrito,
  alAgregarAlCarrito,
  alAbrirReviews,
  formatoCLP
}) {
  const cantidadEnCarrito = (productoId) => {
    const item = carrito.find(i => i._id === productoId);
    return item ? item.cantidad : 0;
  };

  return (
    <section className="store-section">
      <div className="store-banner">
        <div className="store-banner-content">
          <span className="store-banner-icon">🛍️</span>
          <div>
            <h2 className="store-banner-title">Catálogo de Compra</h2>
            <p className="store-banner-sub">Selecciona tus productos favoritos y agrégalos al carrito.</p>
          </div>
        </div>
        <div className="store-banner-stats">
          <div className="store-stat-chip"><span>{productos.length}</span> productos</div>
          <div className="store-stat-chip"><span>{productos.filter(p => p.stock > 0).length}</span> disponibles</div>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="store-empty-state">
          <span className="store-empty-icon">🔍</span>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros de búsqueda.</p>
        </div>
      ) : (
        <div className="store-grid">
          {productos.map(producto => {
            const qty = cantidadEnCarrito(producto._id);
            const stockRestante = producto.stock - qty;
            const tieneStock = producto.stock > 0;
            const puedeAgregar = stockRestante > 0;

            return (
              <article key={producto._id} className={`store-card ${!tieneStock ? 'sold-out' : ''}`}>
                <div className="store-card-img-wrap">
                  {producto.imagen ? (
                    <img src={producto.imagen} alt={producto.nombre} className="store-card-img" />
                  ) : (
                    <div className="store-card-no-img">📦</div>
                  )}
                  {producto.categoria?.nombre && (
                    <span className="store-card-cat">{producto.categoria.nombre}</span>
                  )}
                  {!tieneStock && <div className="store-card-overlay">Agotado</div>}
                  {tieneStock && stockRestante <= 3 && stockRestante > 0 && (
                    <span className="store-card-low-stock">¡Últimas {stockRestante} uds!</span>
                  )}
                </div>

                <div className="store-card-body">
                  <div className="store-card-top">
                    <h3 className="store-card-name">{producto.nombre}</h3>
                    <p className="store-card-desc">{producto.descripcion || 'Sin descripción disponible.'}</p>

                    <button
                      type="button"
                      className="store-card-rating-btn"
                      onClick={() => alAbrirReviews(producto)}
                      title="Ver comentarios y calificar"
                    >
                      {producto.totalReviews > 0 ? (
                        <>⭐ {Number(producto.ratingPromedio).toFixed(1)} <span className="rating-count">({producto.totalReviews})</span></>
                      ) : (
                        <span className="no-rating-label">☆ Sin reseñas</span>
                      )}
                    </button>
                  </div>

                  <div className="store-card-bottom">
                    <div className="store-card-price-row">
                      <span className="store-card-price">{formatoCLP.format(Number(producto.precio || 0))}</span>
                      <span className={`store-card-stock-label ${stockRestante <= 0 ? 'out' : stockRestante <= 3 ? 'low' : ''}`}>
                        {stockRestante > 0 ? `${stockRestante} disponibles` : tieneStock ? 'Todo en tu carrito' : 'Sin stock'}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`store-add-btn ${qty > 0 ? 'in-cart' : ''}`}
                      onClick={() => alAgregarAlCarrito(producto)}
                      disabled={!puedeAgregar}
                    >
                      {qty > 0
                        ? `✓ En carrito (${qty}) — Agregar otro`
                        : tieneStock
                          ? '🛒 Agregar al carrito'
                          : 'Agotado'
                      }
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
