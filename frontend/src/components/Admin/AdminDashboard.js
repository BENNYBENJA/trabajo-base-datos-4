import React from 'react';

export default function AdminDashboard({
  productos,
  categorias,
  form,
  editingId,
  notice,
  error,
  loading,
  formatoCLP,
  manejarCambioFormulario,
  guardarProducto,
  limpiarFormulario,
  editarProducto,
  eliminarProducto,
  abrirModalReviews
}) {
  const totalProductos = productos.length;
  const productosConCategoria = productos.filter(producto => producto.categoria?.nombre).length;
  const valorTotal = productos.reduce((total, producto) => total + Number(producto.precio || 0), 0);

  return (
    <>
      <section className="kpi-grid">
        <article className="kpi-card">
          <span>Total productos</span>
          <strong>{totalProductos}</strong>
        </article>
        <article className="kpi-card">
          <span>Con categoría</span>
          <strong>{productosConCategoria}</strong>
        </article>
        <article className="kpi-card">
          <span>Valor total inventario</span>
          <strong>{formatoCLP.format(valorTotal)}</strong>
        </article>
      </section>

      {notice && <div className="state-box success" style={{ marginBottom: '20px' }}>{notice}</div>}
      {error && <div className="state-box error" style={{ marginBottom: '20px' }}>{error}</div>}

      <section className="crud-panel" style={{ marginBottom: '30px' }}>
        <div className="table-head">
          <h2>{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
          <p>{editingId ? `Editando ID: ${editingId}` : 'Completa el formulario para crear un nuevo producto en MongoDB.'}</p>
        </div>

        <form className="crud-form" onSubmit={guardarProducto}>
          <div className="filters-grid crud-grid">
            <label className="field">
              <span>ID</span>
              <input
                name="_id"
                value={form._id}
                onChange={manejarCambioFormulario}
                placeholder="PROD004"
                disabled={Boolean(editingId)}
                required
              />
            </label>

            <label className="field">
              <span>Nombre</span>
              <input
                name="nombre"
                value={form.nombre}
                onChange={manejarCambioFormulario}
                placeholder="Nombre del producto"
                required
              />
            </label>

            <label className="field">
              <span>Precio</span>
              <input
                type="number"
                name="precio"
                value={form.precio}
                onChange={manejarCambioFormulario}
                placeholder="0"
                min="0"
                required
              />
            </label>

            <label className="field">
              <span>Stock</span>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={manejarCambioFormulario}
                placeholder="0"
                min="0"
                required
              />
            </label>

            <label className="field field-wide">
              <span>Descripción</span>
              <input
                name="descripcion"
                value={form.descripcion}
                onChange={manejarCambioFormulario}
                placeholder="Descripción breve"
              />
            </label>

            <label className="field">
              <span>Categoría</span>
              <select name="categoriaId" value={form.categoriaId} onChange={manejarCambioFormulario}>
                <option value="">Sin categoría</option>
                {categorias.map(categoria => (
                  <option key={categoria._id} value={categoria._id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>URL imagen</span>
              <input
                name="imagen"
                value={form.imagen}
                onChange={manejarCambioFormulario}
                placeholder="https://.../imagen.jpg"
              />
            </label>
          </div>

          <div className="filters-actions">
            <button type="submit" className="primary-button">
              {editingId ? 'Guardar cambios' : 'Crear producto'}
            </button>
            <button type="button" className="secondary-button" onClick={limpiarFormulario}>
              Cancelar
            </button>
          </div>
        </form>
      </section>

      {loading && <div className="state-box">Cargando productos...</div>}

      {!loading && (
        <section className="table-wrap">
          <div className="table-head">
            <h2>Resultados del Inventario (MongoDB)</h2>
            <p>{totalProductos} registros devueltos por la agregación.</p>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Categoría</th>
                  <th>Calificación</th>
                  <th>Stock</th>
                  <th>ID</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(producto => (
                  <tr key={producto._id}>
                    <td>
                      {producto.imagen && (
                        <img src={producto.imagen} alt={producto.nombre} className="product-thumb" />
                      )}
                      <div className="product-name">{producto.nombre}</div>
                      {producto.descripcion && (
                        <div className="product-desc">{producto.descripcion}</div>
                      )}
                    </td>
                    <td className="price">{formatoCLP.format(Number(producto.precio || 0))}</td>
                    <td>
                      <span className={producto.categoria?.nombre ? 'category-pill' : 'category-pill muted'}>
                        {producto.categoria?.nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="rating-badge-button"
                        onClick={() => abrirModalReviews(producto)}
                        title="Ver comentarios y calificar"
                      >
                        {producto.totalReviews > 0 ? (
                          <span>⭐ {Number(producto.ratingPromedio).toFixed(1)} ({producto.totalReviews})</span>
                        ) : (
                          <span className="no-rating">☆ Calificar</span>
                        )}
                      </button>
                    </td>
                    <td>{producto.stock ?? 0}</td>
                    <td className="id-cell">{String(producto._id)}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="small-button" onClick={() => editarProducto(producto)}>
                          Editar
                        </button>
                        <button type="button" className="small-button danger" onClick={() => eliminarProducto(producto._id)}>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
