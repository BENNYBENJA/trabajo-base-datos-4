// scripts/set-images-mongo.js
// Connects to MongoDB and sets `imagen` for products by _id.
// Edit the `updates` object and run: node scripts/set-images-mongo.js

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = uri.includes('localhost') ? 'techstore_db' : undefined;

const updates = {
  'PROD001': '/images/audifonos.png',
  'PROD002': '/images/teclado.png',
  'PROD003': '/images/mouse.png'
};

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const productos = db.collection('productos');

    for (const [id, url] of Object.entries(updates)) {
      const res = await productos.updateOne({ _id: id }, { $set: { imagen: url } });
      if (res.matchedCount === 0) {
        console.warn('No encontrado:', id);
      } else {
        console.log('Actualizado', id);
      }
    }

    const all = await productos.find({}).toArray();
    console.log('Productos actuales:');
    console.dir(all, { depth: 2 });
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
