// scripts/test-aggregate.js
require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const pipeline = [
    { $lookup: { from: 'categorias', localField: 'categoriaId', foreignField: '_id', as: 'categoria' } },
    { $unwind: { path: '$categoria', preserveNullAndEmptyArrays: true } },
    { $project: { nombre:1, precio:1, stock:1, descripcion:1, imagen:1, categoria: { _id: '$categoria._id', nombre: '$categoria.nombre' } } }
  ];

  const productos = await db.collection('productos').aggregate(pipeline).toArray();
  console.log(JSON.stringify(productos, null, 2));
  await client.close();
}

main().catch(err=>{console.error(err); process.exit(1);});
