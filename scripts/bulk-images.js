// scripts/bulk-images.js
// Usage: edit the `updates` map with productId -> imageUrl then run:
//   node scripts/bulk-images.js

const BASE = 'http://localhost:3000/api';

// Edit these IDs and URLs to match your products
const updates = {
  'PROD001': 'https://i.imgur.com/your-image1.jpg',
  'PROD002': 'https://i.imgur.com/your-image2.jpg',
  'PROD003': 'https://i.imgur.com/your-image3.jpg'
};

async function main() {
  if (typeof fetch === 'undefined') {
    console.error('This script requires Node 18+ (fetch).');
    process.exit(1);
  }

  try {
    const listRes = await fetch(`${BASE}/productos`);
    if (!listRes.ok) throw new Error(`GET /productos failed: ${listRes.status}`);
    const productos = await listRes.json();

    for (const [id, url] of Object.entries(updates)) {
      const producto = productos.find(p => String(p._id) === String(id));
      if (!producto) {
        console.warn('Producto no encontrado:', id);
        continue;
      }

      const payload = {
        nombre: producto.nombre,
        precio: producto.precio ?? 0,
        stock: producto.stock ?? 0,
        descripcion: producto.descripcion ?? '',
        categoriaId: producto.categoriaId ?? producto.categoriaId ?? null,
        imagen: url
      };

      const putRes = await fetch(`${BASE}/productos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!putRes.ok) {
        const text = await putRes.text();
        console.error('Error actualizando', id, putRes.status, text);
      } else {
        console.log('Actualizado', id);
      }
    }

    console.log('Terminado. Refresca la app en http://localhost:3000');
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();
