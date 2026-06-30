// scripts/fix-names-mongo.js
// Run: node scripts/fix-names-mongo.js
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = uri.includes('localhost') ? 'techstore_db' : undefined;

// Map of _id -> correct UTF-8 name
const corrections = {
  'PROD001': 'Audífonos Gamer HyperX',
  'PROD002': 'Teclado Mecánico Redragon',
  'PROD003': 'Mouse Logitech G Pro'
};

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const productos = db.collection('productos');

    for (const [id, nombre] of Object.entries(corrections)) {
      const res = await productos.updateOne({ _id: id }, { $set: { nombre } });
      if (res.matchedCount === 0) {
        console.warn('No encontrado:', id);
      } else {
        console.log('Nombre corregido', id, '->', nombre);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
