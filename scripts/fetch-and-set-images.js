// scripts/fetch-and-set-images.js
// Fetch product pages, extract an image URL (og:image or first <img>), and update MongoDB 'productos.imagen'.
// Edit the `pages` map if needed, then run:
//   node scripts/fetch-and-set-images.js

require('dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {}

const { MongoClient } = require('mongodb');
const fetch = global.fetch || require('node-fetch');
const { URL } = require('url');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = uri.includes('localhost') ? 'techstore_db' : undefined;

const pages = {
  'PROD001': 'https://www.centec.cl/products/audifonos-gamer-hyperx-cloud-alpha-3-5-mm-pc-ps4-xbox-one?srsltid=AfmBOoo9Wyyasbt7cH-sDhLcBnbdB-1mTOkK_FFHvZ-80rhRLk5cmVgZ',
  'PROD002': 'https://redragon.es/content/uploads/2023/07/K552RGB_PNGWEB_1.png',
  'PROD003': 'https://mybox.cl/teclados-mouse/4913-mouse-logitech-g-pro-wireless-black-.html?srsltid=AfmBOorL6sSft-C_nOPy4arAHAfG7DcTlJyGh151JciNi-0_BYhetkCZ'
};

function extractImageFromHtml(html, baseUrl) {
  // Try og:image
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (ogMatch && ogMatch[1]) return new URL(ogMatch[1], baseUrl).toString();

  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  if (twitterMatch && twitterMatch[1]) return new URL(twitterMatch[1], baseUrl).toString();

  // image_src
  const imgSrcMatch = html.match(/<link[^>]+rel=["']image_src["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  if (imgSrcMatch && imgSrcMatch[1]) return new URL(imgSrcMatch[1], baseUrl).toString();

  // fallback: first <img src=...> with image extension
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+\.(?:png|jpg|jpeg|gif|webp))["'][^>]*>/i);
  if (imgMatch && imgMatch[1]) return new URL(imgMatch[1], baseUrl).toString();

  return null;
}

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const productos = db.collection('productos');

    for (const [id, pageUrl] of Object.entries(pages)) {
      try {
        // If the page URL already looks like an image, use it directly
        if (/\.(png|jpe?g|gif|webp)(\?|$)/i.test(pageUrl)) {
          await productos.updateOne({ _id: id }, { $set: { imagen: pageUrl } });
          console.log('Set direct image URL for', id);
          continue;
        }

        const res = await fetch(pageUrl, { headers: { 'User-Agent': 'fetch-and-set-images/1.0 (+https://localhost)' } });
        if (!res.ok) {
          console.warn('Failed to fetch', pageUrl, res.status);
          continue;
        }

        const html = await res.text();
        const image = extractImageFromHtml(html, pageUrl);
        if (!image) {
          console.warn('No image found on page for', id, pageUrl);
          continue;
        }

        await productos.updateOne({ _id: id }, { $set: { imagen: image } });
        console.log('Updated', id, '->', image);
      } catch (err) {
        console.error('Error processing', id, err.message || err);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

main();
