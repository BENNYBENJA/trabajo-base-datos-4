import React from 'react';

export default function ClienteStore({
  productos,
  carrito,
  alAgregarAlCarrito,
  alAbrirReviews,
  irADetalle,
  formatoCLP
}) {
  const cantidadEnCarrito = (productoId) => {
    const item = carrito.find(i => i._id === productoId);
    return item ? item.cantidad : 0;
  };

  if (productos.length === 0) {
    return (
      <div className="store-empty-state">
        <span className="store-empty-icon">🔍</span>
        <h3>No se encontraron productos</h3>
        <p>Intenta ajustar los filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <section className="store-section">
      <div className="store-grid">
        {productos.map(producto => {
          const qty = cantidadEnCarrito(producto._id);
          const stockRestante = producto.stock - qty;
          const tieneStock = producto.stock > 0;
          const puedeAgregar = stockRestante > 0;
          const tieneDescuento = producto.descuento > 0;
          const precioOriginal = tieneDescuento
            ? Math.round(Number(producto.precio) / (1 - producto.descuento / 100))
            : null;

          return (
            <article
              key={producto._id}
              className={`store-card ${!tieneStock ? 'sold-out' : ''}`}
              onClick={() => irADetalle && irADetalle(producto._id)}
            >
              <div className="store-card-img-wrap">
                {producto.imagen ? (
                  <img src={producto.imagen} alt={producto.nombre} className="store-card-img" />
                ) : (
                  <div className="store-card-no-img">📦</div>
                )}

                {producto.categoria?.nombre && (
                  <span className="store-card-cat">{producto.categoria.nombre}</span>
                )}

                {tieneDescuento && (
                  <span className="store-card-discount">-{producto.descuento}%</span>
                )}

                {!tieneStock && <div className="store-card-overlay">Agotado</div>}

                {tieneStock && stockRestante <= 3 && stockRestante > 0 && (
                  <span className="store-card-low-stock">¡Últimas {stockRestante}!</span>
                )}
              </div>

              <div className="store-card-body">
                <div className="store-card-top">
                  <h3 className="store-card-name">{producto.nombre}</h3>
                  <p className="store-card-desc">{producto.descripcion || 'Sin descripción.'}</p>

                  <button
                    type="button"
                    className="store-card-rating-btn"
                    onClick={(e) => { e.stopPropagation(); irADetalle && irADetalle(producto._id); }}
                    title="Ver reseñas"
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
                    {tieneDescuento ? (
                      <>
                        <span className="store-card-price-original">{formatoCLP.format(precioOriginal)}</span>
                        <span className="store-card-price">{formatoCLP.format(Number(producto.precio || 0))}</span>
                      </>
                    ) : (
                      <span className="store-card-price-normal">{formatoCLP.format(Number(producto.precio || 0))}</span>
                    )}
                  </div>

                  <div className="store-card-stock-row">
                    <span className={`store-card-stock-label ${stockRestante <= 0 ? 'out' : stockRestante <= 3 ? 'low' : ''}`}>
                      {stockRestante > 0 ? `${stockRestante} disponibles` : tieneStock ? 'Todo en carrito' : 'Sin stock'}
                    </span>
                  </div>

                  <button
                    type="button"
                    className={`store-add-btn ${qty > 0 ? 'in-cart' : ''}`}
                    onClick={(e) => { e.stopPropagation(); alAgregarAlCarrito(producto); }}
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
    </section>
  );
}
