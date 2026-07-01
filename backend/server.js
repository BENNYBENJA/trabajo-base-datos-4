require('dotenv').config();
const dns = require('dns');

// Configurar DNS personalizado para resolver problemas de conexión en redes locales
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log("ℹ️ Servidores DNS configurados a Google DNS");
} catch (e) {
    console.warn("⚠️ No se pudo establecer los servidores DNS:", e.message);
}

const express = require('express');
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

let dbSql, dbMongo;

const categoriasDemo = [
    { _id: 'CAT001', nombre: 'Audio', keywords: ['audífonos', 'auriculares', 'headset', 'parlante', 'jbl', 'sony', 'airpods', 'sennheiser', 'barra de sonido', 'soundbar', 'micrófono', 'blue yeti', 'snowball'] },
    { _id: 'CAT002', nombre: 'Periféricos', keywords: ['teclado', 'mouse', 'ratón', 'webcam', 'mousepad', 'silla gamer', 'keychron', 'logitech mx', 'alfombrilla', 'hub usb', 'anker', 'dxracer', 'silla'] },
    { _id: 'CAT003', nombre: 'Portátiles', keywords: ['laptop', 'portátil', 'notebook', 'macbook', 'mac', 'dell', 'hp pavilion', 'asus zenbook', 'lenovo', 'acer nitro', 'asus vivobook', 'ideapad', 'thinkpad'] },
    { _id: 'CAT004', nombre: 'Monitores', keywords: ['monitor', 'pantalla'] },
    { _id: 'CAT005', nombre: 'Gaming', keywords: ['ps5', 'playstation', 'xbox', 'nintendo', 'switch', 'gamer asus rog', 'control', 'mando', 'dualsense'] },
    { _id: 'CAT006', nombre: 'Smartphones', keywords: ['iphone', 'samsung galaxy', 'xiaomi', 'redmi', 'motorola', 'teléfono', 'celular', 'pixel', 'google pixel', 'galaxy a'] },
    { _id: 'CAT007', nombre: 'Componentes', keywords: ['rtx', 'rx', 'gpu', 'cpu', 'ryzen', 'intel', 'ram', 'ssd', 'disco', 'fuente', 'ddr', 'nvme', 'placa madre', 'gabinete', 'cooler', 'noctua', 'seasonic', 'crucial', 'core i', 'procesador', 'motherboard', 'disipador'] }
];

function detectarCategoria(producto) {
    const nombre = String(producto.nombre || '').toLowerCase();
    const categoriaEncontrada = categoriasDemo.find(categoria =>
        categoria.keywords.some(keyword => nombre.includes(keyword))
    );
    return categoriaEncontrada ? categoriaEncontrada._id : null;
}

async function sembrarCategoriasYProductosDemo() {
    const categoriasCollection = dbMongo.collection('categorias');
    const productosCollection = dbMongo.collection('productos');

    for (const categoria of categoriasDemo) {
        await categoriasCollection.updateOne(
            { _id: categoria._id },
            { $setOnInsert: { _id: categoria._id, nombre: categoria.nombre } },
            { upsert: true }
        );
    }

    const demoProducts = [
        // ── AUDIO ──────────────────────────────────────────────────
        { _id: 'PROD001', nombre: 'Audífonos Gamer HyperX Cloud II', precio: 59990, stock: 15, descuento: 20, descripcion: 'Sonido envolvente 7.1 y cancelación de ruido activa.', imagen: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80' },
        { _id: 'PROD004', nombre: 'Audífonos Sony WH-1000XM5', precio: 329990, stock: 8, descuento: 15, descripcion: 'Cancelación de ruido líder de la industria, 30h de batería.', imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
        { _id: 'PROD005', nombre: 'Parlante Bluetooth JBL Flip 6', precio: 89990, stock: 14, descuento: 0, descripcion: 'Resistente al agua IP67, sonido potente y portátil.', imagen: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' },
        { _id: 'PROD010', nombre: 'AirPods Pro 2da Generación', precio: 299990, stock: 12, descuento: 10, descripcion: 'Cancelación activa de ruido, audio espacial personalizado.', imagen: 'https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=500&q=80' },
        { _id: 'PROD011', nombre: 'Audífonos Razer BlackShark V2', precio: 79990, stock: 6, descuento: 25, descripcion: 'THX Spatial Audio, micrófono desmontable cardioide.', imagen: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500&q=80' },
        { _id: 'PROD012', nombre: 'Parlante JBL Xtreme 3', precio: 199990, stock: 5, descuento: 18, descripcion: 'IP67, 15h de batería, sonido JBL Pro Sound 360°.', imagen: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' },
        { _id: 'PROD051', nombre: 'Barra de Sonido Samsung HW-Q60C 3.1', precio: 249990, stock: 6, descuento: 12, descripcion: '340W, Dolby Atmos, DTS:X, subwoofer inalámbrico incluido.', imagen: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&q=80' },
        { _id: 'PROD052', nombre: 'Parlante JBL Charge 5', precio: 119990, stock: 9, descuento: 0, descripcion: 'IP67, 20h batería, carga PowerBank, bass boost.', imagen: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80' },
        { _id: 'PROD053', nombre: 'Audífonos Sennheiser HD 560S', precio: 149990, stock: 7, descuento: 20, descripcion: 'Respuesta 6Hz–38kHz, diadema abierta, bajo distorsión armónica.', imagen: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80' },
        { _id: 'PROD054', nombre: 'Micrófono Blue Snowball iCE USB', precio: 49990, stock: 15, descuento: 0, descripcion: 'Condensador USB plug-and-play, patrón cardioide, ideal para streaming.', imagen: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80' },

        // ── PERIFÉRICOS ────────────────────────────────────────────
        { _id: 'PROD002', nombre: 'Teclado Mecánico Redragon K552', precio: 35990, stock: 20, descuento: 0, descripcion: 'Switches red, retroiluminado RGB, compacto TKL.', imagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80' },
        { _id: 'PROD003', nombre: 'Mouse Logitech G Pro X Superlight', precio: 99990, stock: 18, descuento: 12, descripcion: 'Ultra liviano 61g, sensor HERO 25K, hasta 70h.', imagen: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80' },
        { _id: 'PROD013', nombre: 'Webcam Logitech C920 HD Pro', precio: 69990, stock: 10, descuento: 0, descripcion: 'Full HD 1080p, enfoque automático, ideal para streaming.', imagen: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500&q=80' },
        { _id: 'PROD014', nombre: 'Teclado Corsair K70 RGB MK.2', precio: 129990, stock: 7, descuento: 22, descripcion: 'Switches Cherry MX Red, marco de aluminio anodizado.', imagen: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500&q=80' },
        { _id: 'PROD015', nombre: 'Mouse SteelSeries Rival 600', precio: 79990, stock: 9, descuento: 30, descripcion: 'Doble sensor óptico, 12.000 CPI, pesos ajustables.', imagen: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80' },
        { _id: 'PROD016', nombre: 'Mousepad Logitech G240 XL', precio: 24990, stock: 25, descuento: 0, descripcion: 'Superficie de tela, 460×400mm, base antideslizante.', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
        { _id: 'PROD045', nombre: 'Silla Gamer DXRacer Formula Series', precio: 299990, stock: 5, descuento: 10, descripcion: 'Respaldo reclinable 135°, apoyabrazos 3D, tapizado en cuero PU premium.', imagen: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80' },
        { _id: 'PROD046', nombre: 'Micrófono Blue Yeti USB Pro', precio: 139990, stock: 8, descuento: 15, descripcion: 'Condensador multi-patrón, 192kHz/24bit, headphone monitoring.', imagen: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&q=80' },
        { _id: 'PROD047', nombre: 'Hub USB-C 7 en 1 Anker 555', precio: 49990, stock: 20, descuento: 0, descripcion: '4K HDMI, 2× USB-A 3.0, USB-C 85W PD, lector SD/microSD.', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
        { _id: 'PROD048', nombre: 'Alfombrilla XL SteelSeries QcK Heavy', precio: 39990, stock: 18, descuento: 0, descripcion: '900×300mm, base de goma antideslizante, superficie micro-texturizada.', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
        { _id: 'PROD049', nombre: 'Teclado Mecánico Keychron K8 Pro', precio: 89990, stock: 10, descuento: 18, descripcion: 'Hot-swap, Bluetooth 5.1, RGB, switches Gateron G Pro Red.', imagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80' },
        { _id: 'PROD050', nombre: 'Mouse Inalámbrico Logitech MX Master 3S', precio: 119990, stock: 12, descuento: 0, descripcion: '8000 DPI, receptor MagSpeed, carga USB-C, 70 días autonomía.', imagen: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80' },

        // ── PORTÁTILES ─────────────────────────────────────────────
        { _id: 'PROD006', nombre: 'Laptop Gamer ASUS ROG Strix G16', precio: 1399990, stock: 4, descuento: 8, descripcion: 'Intel i9-13980HX, 32GB DDR5, RTX 4070, pantalla 240Hz.', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
        { _id: 'PROD007', nombre: 'MacBook Air M3 Apple', precio: 1199990, stock: 6, descuento: 0, descripcion: 'Chip M3, 8GB RAM unificada, 256GB SSD, pantalla Liquid Retina 13.6".', imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },
        { _id: 'PROD017', nombre: 'HP Pavilion 15 Ryzen 5', precio: 599990, stock: 8, descuento: 14, descripcion: 'AMD Ryzen 5 7530U, 16GB RAM, 512GB SSD, panel FHD IPS.', imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
        { _id: 'PROD018', nombre: 'Dell XPS 15 OLED', precio: 1799990, stock: 3, descuento: 0, descripcion: 'Intel Core i7-13700H, 32GB, 1TB NVMe, pantalla OLED 3.5K.', imagen: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&q=80' },
        { _id: 'PROD019', nombre: 'ASUS ZenBook 14 OLED', precio: 849990, stock: 5, descuento: 20, descripcion: 'Core Ultra 7, 16GB LPDDR5, 512GB SSD, pantalla OLED 2.8K.', imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
        { _id: 'PROD058', nombre: 'Lenovo IdeaPad 5 Ryzen 7 16"', precio: 699990, stock: 7, descuento: 15, descripcion: 'AMD Ryzen 7 7730U, 16GB DDR4, 512GB SSD, pantalla 2K IPS 60Hz.', imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
        { _id: 'PROD059', nombre: 'Acer Nitro 5 RTX 4060 15.6"', precio: 999990, stock: 5, descuento: 12, descripcion: 'Intel Core i7-13700H, 16GB DDR5, RTX 4060 8GB, pantalla 144Hz FHD.', imagen: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=500&q=80' },
        { _id: 'PROD060', nombre: 'ASUS VivoBook 15 Core i5', precio: 449990, stock: 10, descuento: 8, descripcion: 'Intel Core i5-1235U, 8GB RAM, 256GB SSD, pantalla FHD IPS, Windows 11.', imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
        { _id: 'PROD061', nombre: 'MacBook Pro M3 14"', precio: 1799990, stock: 3, descuento: 0, descripcion: 'Chip M3 Pro, 18GB RAM unificada, 512GB SSD, pantalla Liquid Retina XDR.', imagen: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80' },

        // ── MONITORES ──────────────────────────────────────────────
        { _id: 'PROD008', nombre: 'Monitor Curvo Samsung Odyssey G5 27"', precio: 219990, stock: 10, descuento: 13, descripcion: 'WQHD 2560×1440, 144Hz, 1ms, FreeSync Premium.', imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80' },
        { _id: 'PROD009', nombre: 'Monitor Gaming LG UltraGear 24"', precio: 149990, stock: 16, descuento: 0, descripcion: 'Full HD IPS, 165Hz, 1ms GtG, compatible G-Sync.', imagen: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80' },
        { _id: 'PROD020', nombre: 'Monitor ASUS ProArt 4K 32"', precio: 599990, stock: 4, descuento: 0, descripcion: 'IPS 4K UHD 3840×2160, 100% sRGB, Thunderbolt 4, 60Hz.', imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80' },
        { _id: 'PROD021', nombre: 'Monitor Benq EW2880U 28" 4K', precio: 449990, stock: 6, descuento: 17, descripcion: '4K UHD HDRi, altavoces integrados, USB-C 60W, Eye-Care+.', imagen: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500&q=80' },
        { _id: 'PROD062', nombre: 'Monitor Samsung Odyssey G9 49" Ultra-Wide', precio: 1199990, stock: 2, descuento: 10, descripcion: 'DQHD 5120×1440, 240Hz, 1ms, HDR1000, curvatura 1000R.', imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80' },

        // ── GAMING ─────────────────────────────────────────────────
        { _id: 'PROD022', nombre: 'PlayStation 5 Slim + Mando DualSense', precio: 699990, stock: 3, descuento: 0, descripcion: 'Consola de nueva generación, 1TB SSD, ray tracing, 4K 120fps.', imagen: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=500&q=80' },
        { _id: 'PROD023', nombre: 'Xbox Series X 1TB', precio: 649990, stock: 5, descuento: 10, descripcion: '12 teraflops, SSD NVMe 1TB, Xbox Game Pass Ultimate compatible.', imagen: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80' },
        { _id: 'PROD024', nombre: 'Nintendo Switch OLED', precio: 399990, stock: 8, descuento: 0, descripcion: 'Pantalla OLED 7", 64GB, modo portátil, sobremesa y TV.', imagen: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&q=80' },
        { _id: 'PROD025', nombre: 'Control DualSense Edge PS5', precio: 149990, stock: 11, descuento: 12, descripcion: 'Control inalámbrico pro, perfiles, gatillos y sticks reemplazables.', imagen: 'https://images.unsplash.com/photo-1606318801954-d46d46d3360a?w=500&q=80' },

        // ── SMARTPHONES ────────────────────────────────────────────
        { _id: 'PROD026', nombre: 'iPhone 15 Pro 256GB', precio: 1099990, stock: 7, descuento: 0, descripcion: 'Chip A17 Pro, titanio, cámara 48MP, botón acción, USB-C.', imagen: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80' },
        { _id: 'PROD027', nombre: 'Samsung Galaxy S24 Ultra 256GB', precio: 999990, stock: 6, descuento: 15, descripcion: 'Galaxy AI, S Pen, cámara 200MP, Snapdragon 8 Gen 3, 5000mAh.', imagen: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&q=80' },
        { _id: 'PROD028', nombre: 'Xiaomi Redmi Note 13 Pro+ 256GB', precio: 349990, stock: 14, descuento: 25, descripcion: '200MP, carga 120W HyperCharge, AMOLED 120Hz, IP68.', imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80' },
        { _id: 'PROD029', nombre: 'Motorola Edge 40 Neo 256GB', precio: 299990, stock: 9, descuento: 20, descripcion: '144Hz pOLED, cámara 50MP OIS, 5000mAh, IP68.', imagen: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500&q=80' },
        { _id: 'PROD055', nombre: 'Google Pixel 8 Pro 256GB', precio: 799990, stock: 5, descuento: 0, descripcion: 'Google AI, cámara 50MP Ultra-Wide, pantalla LTPO OLED 120Hz.', imagen: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80' },
        { _id: 'PROD056', nombre: 'Samsung Galaxy A54 5G 256GB', precio: 399990, stock: 12, descuento: 20, descripcion: 'AMOLED 120Hz, triple cámara 50MP, batería 5000mAh, IP67.', imagen: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=500&q=80' },
        { _id: 'PROD057', nombre: 'iPhone 15 128GB', precio: 849990, stock: 9, descuento: 0, descripcion: 'Chip A16 Bionic, Dynamic Island, cámara 48MP, USB-C, iOS 17.', imagen: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=500&q=80' },

        // ── COMPONENTES ────────────────────────────────────────────
        { _id: 'PROD030', nombre: 'GPU NVIDIA RTX 4070 Super 12GB', precio: 699990, stock: 4, descuento: 0, descripcion: '12GB GDDR6X, DLSS 3.5, Ada Lovelace, ray tracing avanzado.', imagen: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80' },
        { _id: 'PROD031', nombre: 'CPU AMD Ryzen 9 7900X Procesador', precio: 349990, stock: 5, descuento: 22, descripcion: '12 núcleos / 24 hilos, 5.6GHz boost, AM5, 76MB caché total.', imagen: 'https://images.unsplash.com/photo-1591489083244-6b29d1bbbf6c?w=500&q=80' },
        { _id: 'PROD032', nombre: 'RAM Corsair Vengeance DDR5 32GB 6000MHz', precio: 129990, stock: 12, descuento: 18, descripcion: 'Kit 2×16GB DDR5, XMP 3.0, latencia CL36, disipador aluminio.', imagen: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80' },
        { _id: 'PROD033', nombre: 'SSD Samsung 990 Pro 2TB NVMe', precio: 149990, stock: 10, descuento: 0, descripcion: 'M.2 PCIe 4.0, 7450/6900 MB/s, optimizado para PS5 y PC.', imagen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80' },
        { _id: 'PROD034', nombre: 'Fuente 80+ Gold Corsair RM850x', precio: 119990, stock: 7, descuento: 10, descripcion: '850W 80 PLUS Gold, totalmente modular, cero ruido en cargas bajas.', imagen: 'https://images.unsplash.com/photo-1587202372442-7756f0c2c19e?w=500&q=80' },
        { _id: 'PROD035', nombre: 'CPU Intel Core i9-14900K Procesador', precio: 549990, stock: 4, descuento: 0, descripcion: '24 núcleos (8P+16E), 6.0GHz Turbo, LGA1700, 125W TDP base.', imagen: 'https://images.unsplash.com/photo-1591489083244-6b29d1bbbf6c?w=500&q=80' },
        { _id: 'PROD036', nombre: 'CPU AMD Ryzen 5 7600X Procesador', precio: 229990, stock: 8, descuento: 15, descripcion: '6 núcleos / 12 hilos, 5.3GHz boost, AM5, 38MB caché, 105W.', imagen: 'https://images.unsplash.com/photo-1591489083244-6b29d1bbbf6c?w=500&q=80' },
        { _id: 'PROD037', nombre: 'GPU AMD RX 7800 XT 16GB', precio: 499990, stock: 5, descuento: 8, descripcion: '16GB GDDR6, arquitectura RDNA 3, FSR 3.0, ray tracing.', imagen: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80' },
        { _id: 'PROD038', nombre: 'RAM G.Skill Trident Z5 DDR5 64GB 6000MHz', precio: 249990, stock: 6, descuento: 0, descripcion: 'Kit 2×32GB DDR5-6000 CL30, RGB Trident Z5, Intel XMP 3.0.', imagen: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80' },
        { _id: 'PROD039', nombre: 'SSD Crucial P3 Plus 4TB NVMe M.2', precio: 179990, stock: 8, descuento: 20, descripcion: 'PCIe Gen4, 5000/4200 MB/s lectura/escritura, formato 2280.', imagen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80' },
        { _id: 'PROD040', nombre: 'Disipador Noctua NH-D15 Chromax', precio: 99990, stock: 9, descuento: 0, descripcion: 'Dual torre, 2× ventiladores 140mm NF-A15, TDP 250W+, silencioso.', imagen: 'https://images.unsplash.com/photo-1616348436168-de43ad0dbbf7?w=500&q=80' },
        { _id: 'PROD041', nombre: 'Placa Madre ASUS ROG STRIX B650E-F', precio: 389990, stock: 4, descuento: 0, descripcion: 'AM5 DDR5, PCIe 5.0, 2× M.2 PCIe 5.0, WiFi 6E, Bluetooth 5.3.', imagen: 'https://images.unsplash.com/photo-1555617766-c94804975da7?w=500&q=80' },
        { _id: 'PROD042', nombre: 'Gabinete Lian Li PC-O11 Dynamic EVO', precio: 169990, stock: 6, descuento: 14, descripcion: 'Mid-tower, vidrio templado doble cara, soporte 360mm radiador.', imagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80' },
        { _id: 'PROD043', nombre: 'Fuente Seasonic Focus GX-1000 80+ Gold', precio: 179990, stock: 5, descuento: 0, descripcion: '1000W, 80 PLUS Gold, 100% modular, ventilador de 135mm híbrido.', imagen: 'https://images.unsplash.com/photo-1587202372442-7756f0c2c19e?w=500&q=80' },
        { _id: 'PROD044', nombre: 'GPU NVIDIA RTX 4090 24GB', precio: 1899990, stock: 2, descuento: 0, descripcion: 'GPU flagship Ada Lovelace, 24GB GDDR6X, DLSS 3, ray tracing nativo.', imagen: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80' },
        { _id: 'PROD063', nombre: 'RAM Kingston Fury Beast DDR4 16GB 3600MHz', precio: 59990, stock: 20, descuento: 25, descripcion: 'Kit 2×8GB DDR4-3600 CL17, AMD EXPO e Intel XMP, disipador negro.', imagen: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=500&q=80' },
        { _id: 'PROD064', nombre: 'SSD WD Black SN850X 1TB NVMe', precio: 99990, stock: 14, descuento: 18, descripcion: 'PCIe Gen4, 7300/6600 MB/s, caché 3D NAND, optimizado para gaming.', imagen: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&q=80' },
        { _id: 'PROD065', nombre: 'Gabinete Fractal Design North XL Mesh', precio: 129990, stock: 7, descuento: 0, descripcion: 'Mid-tower, panel frontal de madera, malla de acero, soporte ATX.', imagen: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=500&q=80' },
        { _id: 'PROD066', nombre: 'Cooler Líquido NZXT Kraken 360 RGB', precio: 149990, stock: 5, descuento: 10, descripcion: 'AIO 360mm, bomba ARGB, 3× ventiladores 120mm F120 RGB, LGA1700/AM5.', imagen: 'https://images.unsplash.com/photo-1600541519468-4a185934af24?w=500&q=80' }
    ];

    for (const p of demoProducts) {
        await productosCollection.updateOne(
            { _id: p._id },
            { $set: p },
            { upsert: true }
        );
    }

    // Assign categories automatically
    const todosProductos = await productosCollection.find({}).toArray();
    const operaciones = todosProductos
        .map(producto => {
            const categoriaId = detectarCategoria(producto);
            if (!categoriaId || producto.categoriaId === categoriaId) return null;
            return { updateOne: { filter: { _id: producto._id }, update: { $set: { categoriaId } } } };
        })
        .filter(Boolean);

    if (operaciones.length > 0) {
        await productosCollection.bulkWrite(operaciones);
    }
    console.log(`✅ Catálogo sembrado: ${demoProducts.length} productos, ${categoriasDemo.length} categorías.`);
}



async function conectarBases() {
    try {
        dbSql = await mysql.createConnection({ 
            host: process.env.MYSQL_HOST || 'localhost', 
            user: process.env.MYSQL_USER || 'root', 
            password: process.env.MYSQL_PASSWORD || '', 
            database: process.env.MYSQL_DATABASE || 'techstore' 
        });
        console.log("✅ Conectado a MySQL");
    } catch (error) {
        console.error("⚠️ No se pudo conectar a MySQL:", error.message);
    }
    
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
        const client = new MongoClient(mongoUri);
        await client.connect();
        
        // Si la URI tiene una base de datos (ej. Atlas), usa esa; si no, por defecto a 'techstore_db'
        dbMongo = client.db();
        console.log(`✅ Conectado a MongoDB (base de datos: ${dbMongo.databaseName})`);
        
        await sembrarCategoriasYProductosDemo();
    } catch (error) {
        console.error("❌ Error crítico: No se pudo conectar a MongoDB:", error.message);
        throw error;
    }
}

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await dbMongo.collection('productos').find().toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

app.get('/api/categorias', async (req, res) => {
    try {
        const categorias = await dbMongo.collection('categorias').find({}).sort({ nombre: 1 }).toArray();
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías' });
    }
});

app.get('/api/productos-con-categoria', async (req, res) => {
    try {
        const { q, categoria, precioMin, precioMax } = req.query;

        const pipeline = [];

        // 1. Join with categorias collection
        pipeline.push({
            $lookup: {
                from: 'categorias',
                localField: 'categoriaId',
                foreignField: '_id',
                as: 'categoriaInfo'
            }
        });

        // 2. Unwind the category array to get an object, keeping product if no category matches
        pipeline.push({
            $unwind: {
                path: '$categoriaInfo',
                preserveNullAndEmptyArrays: true
            }
        });

        // 3. Join with reviews collection to get stats
        pipeline.push({
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'productoId',
                as: 'reviewsInfo'
            }
        });

        // 4. Project fields including computed rating metrics
        pipeline.push({
            $project: {
                _id: 1,
                nombre: 1,
                precio: 1,
                stock: 1,
                descripcion: { $ifNull: ['$descripcion', ''] },
                imagen: { $ifNull: ['$imagen', null] },
                categoriaId: 1,
                categoria: {
                    $cond: {
                        if: '$categoriaInfo',
                        then: { _id: '$categoriaInfo._id', nombre: '$categoriaInfo.nombre' },
                        else: null
                    }
                },
                ratingPromedio: { $ifNull: [{ $avg: '$reviewsInfo.calificacion' }, 0] },
                totalReviews: { $size: '$reviewsInfo' }
            }
        });

        // 4. Construct match stage dynamically
        const match = {};

        if (q && q.trim()) {
            const searchRegex = new RegExp(q.trim(), 'i');
            match.$or = [
                { nombre: searchRegex },
                { descripcion: searchRegex },
                { 'categoria.nombre': searchRegex }
            ];
        }

        if (categoria && categoria.trim()) {
            match.categoriaId = categoria.trim();
        }

        if (precioMin !== undefined && precioMin !== '') {
            match.precio = match.precio || {};
            match.precio.$gte = Number(precioMin);
        }

        if (precioMax !== undefined && precioMax !== '') {
            match.precio = match.precio || {};
            match.precio.$lte = Number(precioMax);
        }

        if (Object.keys(match).length > 0) {
            pipeline.push({ $match: match });
        }

        const productos = await dbMongo.collection('productos').aggregate(pipeline).toArray();
        res.json(productos);
    } catch (error) {
        console.error('Error en /api/productos-con-categoria:', error);
        res.status(500).json({ message: 'Error al obtener productos con categoría' });
    }
});

app.post('/api/productos', async (req, res) => {
    try {
        const { _id, nombre, precio, stock, descripcion, categoriaId } = req.body;

        if (!_id || !nombre) {
            return res.status(400).json({ message: 'El ID y el nombre son obligatorios' });
        }

        const productoExistente = await dbMongo.collection('productos').findOne({ _id });

        if (productoExistente) {
            return res.status(409).json({ message: 'Ya existe un producto con ese ID' });
        }

        await dbMongo.collection('productos').insertOne({
            _id,
            nombre,
            precio: Number(precio || 0),
            stock: Number(stock || 0),
            descripcion: descripcion || '',
            categoriaId: categoriaId || null,
            imagen: req.body.imagen || null
        });

        res.status(201).json({ message: 'Producto creado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

app.put('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, stock, descripcion, categoriaId } = req.body;

        const resultado = await dbMongo.collection('productos').updateOne(
            { _id: id },
            {
                $set: {
                    nombre,
                    precio: Number(precio || 0),
                    stock: Number(stock || 0),
                    descripcion: descripcion || '',
                    categoriaId: categoriaId || null,
                    imagen: req.body.imagen || null
                }
            }
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
});

app.delete('/api/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await dbMongo.collection('productos').deleteOne({ _id: id });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

// ──────────────────────────────────────────────
// MÓDULO: Reviews / Calificaciones (MongoDB)
// ──────────────────────────────────────────────

app.get('/api/productos/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await dbMongo.collection('reviews')
            .find({ productoId: id })
            .sort({ fecha: -1 })
            .toArray();
        res.json(reviews);
    } catch (error) {
        console.error('Error al obtener reviews:', error);
        res.status(500).json({ message: 'Error al obtener calificaciones' });
    }
});

app.post('/api/productos/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuarioId, usuarioNombre, calificacion, comentario } = req.body;

        if (!calificacion || !usuarioNombre) {
            return res.status(400).json({ message: 'Calificación y nombre del usuario son obligatorios' });
        }

        const valorCalificacion = Number(calificacion);
        if (valorCalificacion < 1 || valorCalificacion > 5) {
            return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
        }

        const nuevaReview = {
            productoId: id,
            usuarioId: usuarioId ? Number(usuarioId) : null,
            usuarioNombre,
            calificacion: valorCalificacion,
            comentario: comentario || '',
            fecha: new Date()
        };

        await dbMongo.collection('reviews').insertOne(nuevaReview);
        res.status(201).json({ message: 'Calificación guardada correctamente', review: nuevaReview });
    } catch (error) {
        console.error('Error al guardar review:', error);
        res.status(500).json({ message: 'Error al guardar la calificación' });
    }
});

// ──────────────────────────────────────────────
// MÓDULO: Compras / Gestión de Stock (MongoDB)
// ──────────────────────────────────────────────

app.post('/api/compras', async (req, res) => {
    try {
        const { usuarioId, usuarioNombre, usuarioEmail, items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'El carrito está vacío' });
        }

        const productosCollection = dbMongo.collection('productos');

        // Verify stock for all items first
        for (const item of items) {
            const producto = await productosCollection.findOne({ _id: item.productoId });
            if (!producto) {
                return res.status(404).json({ message: `Producto ${item.productoId} no encontrado` });
            }
            if (producto.stock < item.cantidad) {
                return res.status(400).json({
                    message: `Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`
                });
            }
        }

        // Decrement stock atomically for each item
        for (const item of items) {
            await productosCollection.updateOne(
                { _id: item.productoId },
                { $inc: { stock: -item.cantidad } }
            );
        }

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

        // Save order in the 'ordenes' collection
        const orden = {
            usuarioId: usuarioId ? Number(usuarioId) : null,
            usuarioNombre: usuarioNombre || 'Anónimo',
            usuarioEmail: usuarioEmail || '',
            items: items.map(item => ({
                productoId: item.productoId,
                nombre: item.nombre,
                precio: item.precio,
                cantidad: item.cantidad,
                subtotal: item.precio * item.cantidad
            })),
            total,
            fecha: new Date(),
            estado: 'completada'
        };

        const resultado = await dbMongo.collection('ordenes').insertOne(orden);

        res.json({
            message: 'Compra realizada con éxito. Stock actualizado.',
            ordenId: resultado.insertedId
        });
    } catch (error) {
        console.error('Error en /api/compras:', error);
        res.status(500).json({ message: 'Error al procesar la compra' });
    }
});

app.get('/api/ordenes', async (req, res) => {
    try {
        const { usuarioId } = req.query;
        const filtro = usuarioId ? { usuarioId: Number(usuarioId) } : {};
        const ordenes = await dbMongo.collection('ordenes')
            .find(filtro)
            .sort({ fecha: -1 })
            .toArray();
        res.json(ordenes);
    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        res.status(500).json({ message: 'Error al obtener las órdenes de compra' });
    }
});

// ──────────────────────────────────────────────
// MÓDULO: Usuarios y Roles (MySQL)
// ──────────────────────────────────────────────

app.get('/api/roles', async (req, res) => {
    try {
        if (!dbSql) return res.status(503).json({ message: 'MySQL no disponible' });
        const [rows] = await dbSql.execute('SELECT id_rol AS id, nombre_rol AS nombre FROM roles ORDER BY id_rol');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener roles' });
    }
});

app.post('/api/usuarios/register', async (req, res) => {
    try {
        if (!dbSql) return res.status(503).json({ message: 'MySQL no disponible' });
        const { nombre, correo, contrasena, id_rol } = req.body;

        if (!nombre || !correo || !contrasena || !id_rol) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios' });
        }

        const [existing] = await dbSql.execute('SELECT id_usuario FROM usuarios WHERE correo = ?', [correo]);
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Ya existe un usuario con ese correo' });
        }

        await dbSql.execute(
            'INSERT INTO usuarios (nombre, correo, contrasena, id_rol) VALUES (?, ?, ?, ?)',
            [nombre, correo, contrasena, id_rol]
        );

        res.status(201).json({ message: 'Usuario registrado correctamente' });
    } catch (error) {
        console.error('Error en register:', error);
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        if (!dbSql) return res.status(503).json({ message: 'MySQL no disponible' });
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email y contrase\u00f1a son obligatorios' });
        }

        const [rows] = await dbSql.execute(
            `SELECT u.id_usuario AS id, u.nombre, u.correo AS email, r.nombre_rol AS rol
             FROM usuarios u
             INNER JOIN roles r ON u.id_rol = r.id_rol
             WHERE u.correo = ? AND u.contrasena = ?`,
            [email, password]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Email o contrase\u00f1a incorrectos' });
        }

        const dbUser = rows[0];
        const normalizedRol = dbUser.rol === 'Administrador' ? 'admin' : 'cliente';

        const usuarioResponse = {
            id: dbUser.id,
            nombre: dbUser.nombre,
            email: dbUser.email,
            rol: normalizedRol
        };

        res.json({ message: 'Login exitoso', usuario: usuarioResponse });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ message: 'Error al iniciar sesi\u00f3n' });
    }
});

const frontendBuildPath = path.join(__dirname, '../frontend/build');

app.use(express.static(frontendBuildPath));

app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
conectarBases().then(() => {
    app.listen(PORT, () => console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`));
});