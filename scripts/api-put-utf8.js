// scripts/api-put-utf8.js
// Usage:
//   node scripts/api-put-utf8.js <PRODUCT_ID> '<JSON_BODY>'
// Example:
//   node scripts/api-put-utf8.js PROD001 '{"nombre":"Audífonos Gamer HyperX","precio":45000}'

const [, , id, bodyRaw] = process.argv;

async function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => data += chunk);
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

if (!id) {
  console.error('Uso: node scripts/api-put-utf8.js <PRODUCT_ID> "<JSON_BODY>"  OR: echo "<JSON>" | node scripts/api-put-utf8.js <PRODUCT_ID>');
  process.exit(1);
}

async function getBody() {
  if (bodyRaw) {
    try { return JSON.parse(bodyRaw); } catch (err) { throw new Error('JSON inválido en argumento: ' + err.message); }
  }

  // read from stdin
  const stdin = await readStdin();
  if (!stdin || !stdin.trim()) throw new Error('No se recibió JSON por stdin');
  const cleaned = stdin.replace(/^\uFEFF/, '').trim();
  try { return JSON.parse(cleaned); } catch (err) { throw new Error('JSON inválido en stdin: ' + err.message); }
}

const url = `http://localhost:3000/api/productos/${encodeURIComponent(id)}`;

(async () => {
  try {
    const body = await getBody();
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    try {
      console.log('Response:', JSON.parse(text));
    } catch (e) {
      console.log('Response text:', text);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
