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
    { _id: 'CAT001', nombre: 'Audio', keywords: ['audífonos', 'auriculares', 'headset', 'parlante', 'jbl', 'sony'] },
    { _id: 'CAT002', nombre: 'Periféricos', keywords: ['teclado', 'mouse', 'ratón'] },
    { _id: 'CAT003', nombre: 'Portátiles', keywords: ['laptop', 'portátil', 'notebook', 'macbook', 'mac'] },
    { _id: 'CAT004', nombre: 'Monitores', keywords: ['monitor', 'pantalla'] }
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
        {
            _id: 'PROD001',
            nombre: 'Audífonos Gamer HyperX',
            precio: 45000,
            stock: 15,
            descripcion: 'Audífonos con sonido envolvente 7.1 y cancelación de ruido.',
            imagen: '/images/audifonos.png'
        },
        {
            _id: 'PROD002',
            nombre: 'Teclado Mecánico Redragon',
            precio: 35000,
            stock: 8,
            descripcion: 'Teclado mecánico retroiluminado RGB con switches red.',
            imagen: '/images/teclado.png'
        },
        {
            _id: 'PROD003',
            nombre: 'Mouse Logitech G Pro',
            precio: 85000,
            stock: 20,
            descripcion: 'Mouse profesional para gaming ultra liviano.',
            imagen: '/images/mouse.png'
        },
        {
            _id: 'PROD004',
            nombre: 'Audífonos Sony WH-1000XM4',
            precio: 249000,
            stock: 10,
            descripcion: 'Audífonos inalámbricos premium con cancelación de ruido activa líder de la industria.',
            imagen: '/images/sony_wh1000xm4.png'
        },
        {
            _id: 'PROD005',
            nombre: 'Parlante Bluetooth JBL Flip 6',
            precio: 99000,
            stock: 14,
            descripcion: 'Parlante inalámbrico portátil resistente al agua y polvo con sonido potente.',
            imagen: '/images/jbl_flip6.png'
        },
        {
            _id: 'PROD006',
            nombre: 'Laptop Gamer ASUS ROG',
            precio: 1249000,
            stock: 5,
            descripcion: 'Intel Core i7, 16GB RAM, RTX 4060, pantalla 144Hz para un juego fluido.',
            imagen: '/images/laptop_asus.png'
        },
        {
            _id: 'PROD007',
            nombre: 'MacBook Air M2 Apple',
            precio: 1099000,
            stock: 6,
            descripcion: 'Procesador M2, 8GB RAM unificada, 256GB SSD, pantalla Liquid Retina.',
            imagen: '/images/macbook_air.png'
        },
        {
            _id: 'PROD008',
            nombre: 'Monitor Curvo Samsung 27"',
            precio: 189000,
            stock: 12,
            descripcion: 'Monitor Curvo Odyssey G5 con resolución WQHD y tasa de refresco de 144Hz.',
            imagen: '/images/monitor_samsung.png'
        },
        {
            _id: 'PROD009',
            nombre: 'Monitor Gaming LG 24"',
            precio: 129000,
            stock: 18,
            descripcion: 'Monitor Full HD con panel IPS, 1ms de respuesta y compatible con FreeSync.',
            imagen: '/images/monitor_lg.png'
        }
    ];

    // Seed the 9 products via upsert
    for (const p of demoProducts) {
        await productosCollection.updateOne(
            { _id: p._id },
            { $set: p },
            { upsert: true }
        );
    }

    // Assign categories to all products dynamically
    const todosProductos = await productosCollection.find({}).toArray();
    const operaciones = todosProductos
        .map(producto => {
            const categoriaId = detectarCategoria(producto);

            if (!categoriaId || producto.categoriaId === categoriaId) {
                return null;
            }

            return {
                updateOne: {
                    filter: { _id: producto._id },
                    update: { $set: { categoriaId } }
                }
            };
        })
        .filter(Boolean);

    if (operaciones.length > 0) {
        await productosCollection.bulkWrite(operaciones);
    }
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