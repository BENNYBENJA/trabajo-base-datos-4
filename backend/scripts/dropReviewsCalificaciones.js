require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');
(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const collectionName = 'reviews_calificaciones';
    const collections = await db.listCollections({ name: collectionName }).toArray();
    if (collections.length > 0) {
      await db.collection(collectionName).drop();
      console.log(`Collection '${collectionName}' dropped successfully.`);
    } else {
      console.log(`Collection '${collectionName}' does not exist.`);
    }
  } catch (err) {
    console.error('Error dropping collection:', err);
  } finally {
    await client.close();
  }
})();
