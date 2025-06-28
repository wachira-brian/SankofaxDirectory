require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = process.env.JWT_SECRET;
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Middleware to verify token (non-admin)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to verify admin
const verifyAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT error:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        avatar TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const hashedPassword = await bcrypt.hash('Nairobi2026#', 10);
    await connection.query(
      `INSERT IGNORE INTO users (id, name, email, password, role, phone) 
       VALUES (?, ?, ?, ?, ?, ?),
              (?, ?, ?, ?, ?, ?)`,
      [
        'admin3', 'BRIAN WACHIRA', 'branzwacchy12@gmail.com', hashedPassword, 'admin', '+254795373563',
        'admin4', 'WANGUI MATHARU', 'wanguimatharu@gmail.com', hashedPassword, 'admin', '+12345678901'
      ]
    );

    await connection.query(`
      CREATE TABLE IF NOT EXISTS providers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        city VARCHAR(100) NOT NULL,
        zip_code VARCHAR(20),
        location VARCHAR(1000),
        phone VARCHAR(20),
        email VARCHAR(255),
        website VARCHAR(255),
        description TEXT,
        images JSON,
        opening_hours JSON,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(255) NOT NULL,
        address VARCHAR(1000),
        is_featured TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS offers (
        id VARCHAR(255) PRIMARY KEY,
        provider_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2) NOT NULL,
        duration INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        subcategory VARCHAR(255) NOT NULL,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES providers(id)
      );
    `);
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    connection.release();
  }
}

initializeDatabase().then(() => console.log('Database initialized'));

app.post('/api/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || undefined,
        phone: user.phone || undefined,
        createdAt: user.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/signup', [
  body('name').notEmpty().isString().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('phone').optional().isString(),
  body('avatar').optional().isURL(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, phone, avatar } = req.body;

  try {
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const userId = `user${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, name, email, password, role, phone, avatar) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name, email, hashedPassword, 'user', phone || null, avatar || null]
    );

    const [users] = await pool.query('SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?', [userId]);
    const user = users[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || undefined,
        avatar: user.avatar || undefined,
        createdAt: user.created_at.toISOString(),
      },
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/users/count', verifyAdmin, async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as count FROM users');
    res.status(200).json({ count: result[0].count });
  } catch (error) {
    console.error('Error fetching user count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/admins', verifyAdmin, async (req, res) => {
  try {
    const [admins] = await pool.query('SELECT id, name, email, role, phone, created_at FROM users WHERE role = ?', ['admin']);
    const formattedAdmins = admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      phone: admin.phone || undefined,
      createdAt: admin.created_at.toISOString(),
    }));
    res.status(200).json({ admins: formattedAdmins });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/providers', verifyAdmin, async (req, res) => {
  try {
    const [providers] = await pool.query('SELECT * FROM providers');
    const formattedProviders = providers.map((p) => {
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(p.images || '[]');
        if (!Array.isArray(parsedImages)) {
          console.warn(`Invalid images format for provider ${p.id}, returning empty array`);
          parsedImages = [];
        }
      } catch (e) {
        console.error(`Error parsing images JSON for provider ${p.id}:`, e.message);
        parsedImages = [];
      }
      let parsedOpeningHours = {};
      try {
        parsedOpeningHours = JSON.parse(p.opening_hours || '{}');
        if (typeof parsedOpeningHours !== 'object' || Array.isArray(parsedOpeningHours)) {
          console.warn(`Invalid opening_hours format for provider ${p.id}, returning empty object`);
          parsedOpeningHours = {};
        }
      } catch (e) {
        console.error(`Error parsing opening_hours JSON for provider ${p.id}:`, e.message);
        parsedOpeningHours = {};
      }
      return {
        id: p.id,
        name: p.name,
        username: p.username,
        city: p.city,
        zipCode: p.zip_code || undefined,
        location: p.location || undefined,
        phone: p.phone || undefined,
        email: p.email || undefined,
        website: p.website || undefined,
        description: p.description || undefined,
        images: parsedImages,
        openingHours: parsedOpeningHours,
        category: p.category,
        subcategory: p.subcategory,
        address: p.address || undefined,
        isFeatured: !!p.is_featured,
        createdAt: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        updatedAt: p.updated_at ? p.updated_at.toISOString() : new Date().toISOString(),
      };
    });
    res.status(200).json({ providers: formattedProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/providers', verifyAdmin, upload.array('images'), [
  body('id').optional().isString(),
  body('name').notEmpty().isString(),
  body('username').notEmpty().isString(),
  body('city').notEmpty().isString(),
  body('category').notEmpty().isString(),
  body('subcategory').notEmpty().isString(),
  body('location').optional().isString(),
  body('address').optional().isString(),
  body('zip_code').optional().isString(),
  body('openingHours').optional().isString(),
  body('existingImages').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id, name, username, city, zip_code, phone, email, website, description, category, subcategory, openingHours, location, address, existingImages } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  console.log('Received existingImages for POST:', existingImages);

  let updatedImages = [];
  if (existingImages) {
    try {
      updatedImages = JSON.parse(existingImages);
      if (!Array.isArray(updatedImages)) {
        throw new Error('existingImages must be an array');
      }
    } catch (e) {
      console.error('Error parsing existingImages:', { error: e.message, existingImages });
      return res.status(400).json({ error: 'Invalid existingImages format' });
    }
  }
  if (images.length > 0) {
    updatedImages = [...updatedImages, ...images];
  }

  let parsedOpeningHours = {};
  if (openingHours) {
    try {
      parsedOpeningHours = JSON.parse(openingHours);
      if (typeof parsedOpeningHours !== 'object' || Array.isArray(parsedOpeningHours)) {
        throw new Error('openingHours must be an object');
      }
    } catch (e) {
      console.error('Error parsing openingHours:', { error: e.message, openingHours });
      return res.status(400).json({ error: 'Invalid openingHours format' });
    }
  }

  try {
    await pool.query(
      `INSERT INTO providers (id, name, username, city, zip_code, location, phone, email, website, description, images, opening_hours, category, subcategory, address, is_featured, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id || null, name, username, city, zip_code || null, location || null,
        phone || null, email || null, website || null, description || null,
        JSON.stringify(updatedImages), JSON.stringify(parsedOpeningHours),
        category, subcategory, address || null, 0,
      ]
    );
    res.status(201).json({ message: 'Provider created successfully' });
  } catch (error) {
    console.error('Error creating provider:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.put('/api/admin/providers/:id', verifyAdmin, upload.array('images'), [
  body('name').notEmpty().isString(),
  body('username').notEmpty().isString(),
  body('city').notEmpty().isString(),
  body('category').notEmpty().isString(),
  body('subcategory').notEmpty().isString(),
  body('location').optional().isString(),
  body('address').optional().isString(),
  body('zip_code').optional().isString(),
  body('openingHours').optional().isString(),
  body('existingImages').optional().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const { name, username, city, zip_code, phone, email, website, description, category, subcategory, openingHours, location, address, existingImages } = req.body;
  const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  console.log('Received existingImages for PUT:', existingImages);

  try {
    const [existingProvider] = await pool.query('SELECT images, opening_hours FROM providers WHERE id = ?', [id]);
    if (!existingProvider[0]) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    let currentImages = [];
    try {
      // Log raw images field for debugging
      console.log(`Raw images field for provider ${id}:`, existingProvider[0].images);
      currentImages = JSON.parse(existingProvider[0].images || '[]');
      if (!Array.isArray(currentImages)) {
        console.warn(`Invalid images format for provider ${id}, resetting to empty array`);
        currentImages = [];
      }
    } catch (e) {
      console.error('Error parsing database images:', {
        error: e.message,
        providerId: id,
        rawImages: existingProvider[0].images,
      });
      // Instead of failing, continue with empty array
      currentImages = [];
    }

    let updatedImages = currentImages;
    if (existingImages) {
      try {
        updatedImages = JSON.parse(existingImages);
        if (!Array.isArray(updatedImages)) {
          throw new Error('existingImages must be an array');
        }
      } catch (e) {
        console.error('Error parsing existingImages:', { error: e.message, existingImages });
        return res.status(400).json({ error: 'Invalid existingImages format' });
      }
    }
    if (images.length > 0) {
      updatedImages = [...updatedImages, ...images];
    }

    let updatedOpeningHours = {};
    try {
      // Log raw opening_hours field for debugging
      console.log(`Raw opening_hours field for provider ${id}:`, existingProvider[0].opening_hours);
      updatedOpeningHours = JSON.parse(existingProvider[0].opening_hours || '{}');
      if (typeof updatedOpeningHours !== 'object' || Array.isArray(updatedOpeningHours)) {
        console.warn(`Invalid opening_hours format for provider ${id}, resetting to empty object`);
        updatedOpeningHours = {};
      }
    } catch (e) {
      console.error('Error parsing database opening_hours:', {
        error: e.message,
        providerId: id,
        rawOpeningHours: existingProvider[0].opening_hours,
      });
      updatedOpeningHours = {};
    }
    if (openingHours) {
      try {
        updatedOpeningHours = JSON.parse(openingHours);
        if (typeof updatedOpeningHours !== 'object' || Array.isArray(updatedOpeningHours)) {
          throw new Error('openingHours must be an object');
        }
      } catch (e) {
        console.error('Error parsing request openingHours:', { error: e.message, openingHours });
        return res.status(400).json({ error: 'Invalid openingHours format' });
      }
    }

    const [result] = await pool.query(
      `UPDATE providers SET name = ?, username = ?, city = ?, zip_code = ?, phone = ?, email = ?, 
       website = ?, description = ?, images = ?, opening_hours = ?, category = ?, subcategory = ?, address = ?, location = ?, updated_at = NOW() WHERE id = ?`,
      [
        name, username, city, zip_code || null, phone || null, email || null,
        website || null, description || null, JSON.stringify(updatedImages),
        JSON.stringify(updatedOpeningHours), category, subcategory, address || null, location || null, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider updated successfully' });
  } catch (error) {
    console.error('Error updating provider:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files,
    });
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.put('/api/admin/providers/:id/featured', verifyAdmin, [
  body('isFeatured').isBoolean(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const { isFeatured } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE providers SET is_featured = ? WHERE id = ?`,
      [isFeatured, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.status(200).json({ message: 'Featured status updated successfully' });
  } catch (error) {
    console.error('Error updating featured status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/providers/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM providers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    res.status(200).json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Error deleting provider:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/offers', verifyAdmin, async (req, res) => {
  try {
    const [offers] = await pool.query('SELECT * FROM offers');
    const formattedOffers = offers.map((o) => ({
      id: o.id,
      providerId: o.provider_id,
      name: o.name,
      description: o.description || undefined,
      price: parseFloat(o.price),
      originalPrice: parseFloat(o.original_price),
      discountedPrice: parseFloat(o.discounted_price),
      duration: o.duration,
      category: o.category,
      subcategory: o.subcategory,
      image: o.image || undefined,
      createdAt: o.created_at.toISOString(),
    }));
    res.status(200).json({ offers: formattedOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/offers', verifyAdmin, [
  body('id').notEmpty().isString(),
  body('providerId').notEmpty().isString(),
  body('name').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('originalPrice').isFloat({ min: 0 }),
  body('discountedPrice').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1 }),
  body('category').notEmpty().isString(),
  body('subcategory').notEmpty().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {
    id, providerId, name, description, price, originalPrice, discountedPrice,
    duration, category, subcategory, image,
  } = req.body;
  try {
    const [providers] = await pool.query('SELECT id FROM providers WHERE id = ?', [providerId]);
    if (providers.length === 0) {
      return res.status(400).json({ error: 'Invalid providerId' });
    }
    await pool.query(
      `INSERT INTO offers (id, provider_id, name, description, price, original_price, discounted_price, duration, category, subcategory, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, providerId, name, description, price, originalPrice, discountedPrice,
        duration, category, subcategory, image,
      ]
    );
    res.status(201).json({ message: 'Offer created successfully' });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/offers/:id', verifyAdmin, [
  body('providerId').notEmpty().isString(),
  body('name').notEmpty().isString(),
  body('price').isFloat({ min: 0 }),
  body('originalPrice').isFloat({ min: 0 }),
  body('discountedPrice').isFloat({ min: 0 }),
  body('duration').isInt({ min: 1 }),
  body('category').notEmpty().isString(),
  body('subcategory').notEmpty().isString(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const {
    providerId, name, description, price, originalPrice, discountedPrice,
    duration, category, subcategory, image,
  } = req.body;
  try {
    const [providers] = await pool.query('SELECT id FROM providers WHERE id = ?', [providerId]);
    if (providers.length === 0) {
      return res.status(400).json({ error: 'Invalid providerId' });
    }
    const [result] = await pool.query(
      `UPDATE offers SET provider_id = ?, name = ?, description = ?, price = ?, original_price = ?, 
       discounted_price = ?, duration = ?, category = ?, subcategory = ?, image = ? WHERE id = ?`,
      [
        providerId, name, description, price, originalPrice,
        discountedPrice, duration, category, subcategory, image, id,
      ]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.status(200).json({ message: 'Offer updated successfully' });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/offers/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM offers WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Offer not found' });
    }
    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/providers', async (req, res) => {
  const { category, subcategory, search } = req.query;
  try {
    let query = 'SELECT * FROM providers';
    const params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    if (subcategory) {
      query += (category ? ' AND' : ' WHERE') + ' subcategory = ?';
      params.push(subcategory);
    }
    if (search) {
      query += (category || subcategory ? ' AND' : ' WHERE') + ' (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [providers] = await pool.query(query, params);
    const formattedProviders = providers.map((p) => {
      let parsedImages = [];
      try {
        parsedImages = JSON.parse(p.images || '[]');
        if (!Array.isArray(parsedImages)) {
          console.warn(`Invalid images format for provider ${p.id}, returning empty array`);
          parsedImages = [];
        }
      } catch (e) {
        console.error(`Error parsing images JSON for provider ${p.id}:`, e.message);
        parsedImages = [];
      }
      let parsedOpeningHours = {};
      try {
        parsedOpeningHours = JSON.parse(p.opening_hours || '{}');
        if (typeof parsedOpeningHours !== 'object' || Array.isArray(parsedOpeningHours)) {
          console.warn(`Invalid opening_hours format for provider ${p.id}, returning empty object`);
          parsedOpeningHours = {};
        }
      } catch (e) {
        console.error(`Error parsing opening_hours JSON for provider ${p.id}:`, e.message);
        parsedOpeningHours = {};
      }
      return {
        id: p.id,
        name: p.name,
        username: p.username,
        city: p.city,
        zipCode: p.zip_code || undefined,
        location: p.location || undefined,
        phone: p.phone || undefined,
        email: p.email || undefined,
        website: p.website || undefined,
        description: p.description || undefined,
        images: parsedImages,
        openingHours: parsedOpeningHours,
        category: p.category,
        subcategory: p.subcategory,
        address: p.address || undefined,
        isFeatured: !!p.is_featured,
        createdAt: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        updatedAt: p.updated_at ? p.updated_at.toISOString() : new Date().toISOString(),
      };
    });
    res.status(200).json({ providers: formattedProviders });
  } catch (error) {
    console.error('Error fetching providers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/offers', async (req, res) => {
  const { category, subcategory, search } = req.query;
  try {
    let query = 'SELECT * FROM offers';
    const params = [];
    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    if (subcategory) {
      query += (category ? ' AND' : ' WHERE') + ' subcategory = ?';
      params.push(subcategory);
    }
    if (search) {
      query += (category || subcategory ? ' AND' : ' WHERE') + ' (name LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    const [offers] = await pool.query(query, params);
    const formattedOffers = offers.map((o) => ({
      id: o.id,
      providerId: o.provider_id,
      name: o.name,
      description: o.description || undefined,
      price: parseFloat(o.price),
      originalPrice: parseFloat(o.original_price),
      discountedPrice: parseFloat(o.discounted_price),
      duration: o.duration,
      category: o.category,
      subcategory: o.subcategory,
      image: o.image || undefined,
      createdAt: o.created_at.toISOString(),
    }));
    res.status(200).json({ offers: formattedOffers });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/user', verifyToken, upload.single('avatar'), [
  body('name').notEmpty().isString(),
  body('email').notEmpty().isEmail().normalizeEmail(),
  body('phone').optional().isString(),
], async (req, res) => {
  console.log('Received PUT /api/user request with body:', req.body, 'and file:', req.file);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, phone } = req.body;
  const userId = req.user.id;

  const [currentUser] = await pool.query('SELECT avatar FROM users WHERE id = ?', [userId]);
  const oldAvatar = currentUser[0]?.avatar || null;
  let newAvatar = oldAvatar;

  if (req.file) {
    newAvatar = `/uploads/${req.file.filename}`;
    if (oldAvatar && oldAvatar !== newAvatar) {
      try {
        await fs.unlink(`.${oldAvatar}`);
        console.log(`Deleted old avatar: ${oldAvatar}`);
      } catch (err) {
        console.error('Error deleting old avatar:', err);
      }
    }
  }

  try {
    const [result] = await pool.query(
      `UPDATE users SET name = ?, email = ?, phone = ?, avatar = ? WHERE id = ?`,
      [name, email, phone || null, newAvatar, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const [updatedUser] = await pool.query('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?', [userId]);
    console.log('Updated user:', updatedUser[0]);
    res.status(200).json({ user: updatedUser[0] });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user', verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [users] = await pool.query('SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = users[0];
    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || undefined,
        phone: user.phone || undefined,
        createdAt: user.created_at.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 8088;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
