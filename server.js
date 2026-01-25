const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.join(__dirname, 'data', 'items.json');

// 配置 multer 文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    if (allowedTypes.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只支持图片文件 (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// 读取数据
const readData = () => {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// 写入数据
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 直接访问 public 目录
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// 允许 CORS
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://chiengmai-activities.vercel.app',
    'https://*.vercel.app'
  ];

  const origin = req.headers.origin;

  // 允许的源
  if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API 路由
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// ========== 前端活动 API (/api/activities) ==========

// GET /api/activities - 获取活动列表（兼容前端）
app.get('/api/activities', (req, res) => {
  const items = readData();

  // 支持筛选参数
  const { category, search, priceMin, priceMax, status, page = 1, limit = 10, sortBy, sortOrder = 'asc' } = req.query;

  let filteredItems = [...items];

  // 状态筛选
  if (status) {
    filteredItems = filteredItems.filter(item => item.status === status);
  }

  // 分类筛选
  if (category && category !== '全部') {
    filteredItems = filteredItems.filter(item => item.category === category);
  }

  // 搜索筛选
  if (search) {
    const searchLower = search.toLowerCase();
    filteredItems = filteredItems.filter(item =>
      item.title?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower) ||
      item.location?.toLowerCase().includes(searchLower)
    );
  }

  // 价格筛选
  if (priceMin !== undefined) {
    filteredItems = filteredItems.filter(item => {
      const price = item.priceMin || 0;
      return price >= parseInt(priceMin);
    });
  }

  if (priceMax !== undefined) {
    filteredItems = filteredItems.filter(item => {
      const price = item.priceMax || 0;
      return price <= parseInt(priceMax);
    });
  }

  // 排序
  if (sortBy) {
    filteredItems.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'date') {
        comparison = new Date(a.date || 0) - new Date(b.date || 0);
      } else if (sortBy === 'price') {
        comparison = (a.priceMin || 0) - (b.priceMin || 0);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // 分页
  const totalItems = filteredItems.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedItems,
    pagination: {
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
      totalItems,
      totalPages: Math.ceil(totalItems / limit)
    }
  });
});

// GET /api/activities/:id - 获取单个活动
app.get('/api/activities/:id', (req, res) => {
  const items = readData();
  const item = items.find(i => i.id === req.params.id || i._id === req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: '活动不存在' });
  }

  res.json({ success: true, data: item });
});

// POST /api/activities - 创建新活动
app.post('/api/activities', (req, res) => {
  const {
    title, description, category,
    date, time, duration,
    location, address, latitude, longitude,
    price, priceMin, priceMax, currency,
    maxParticipants, currentParticipants,
    images, source,
    flexibleTime, bookingRequired,
    subCategory, language, tags
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: '标题和描述不能为空' });
  }

  const items = readData();
  const newItem = {
    id: Date.now().toString(),
    _id: Date.now().toString(), // MongoDB 兼容
    title,
    description,
    category: category || '其他',
    subCategory: subCategory || '',
    date: date || new Date().toISOString().split('T')[0],
    time: time || '',
    duration: duration || '',
    location: location || '',
    address: address || '',
    latitude: latitude || null,
    longitude: longitude || null,
    price: price || '',
    priceMin: priceMin || 0,
    priceMax: priceMax || 0,
    currency: currency || '฿',
    maxParticipants: maxParticipants || 0,
    currentParticipants: currentParticipants || 0,
    images: images || [],
    source: source || { name: '手动添加', url: '', type: 'manual', lastUpdated: new Date() },
    flexibleTime: flexibleTime || false,
    bookingRequired: bookingRequired !== undefined ? bookingRequired : true,
    language: language || 'Both',
    tags: tags || [],
    status: 'active',
    rating: { average: 0, count: 0 },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  items.push(newItem);
  writeData(items);

  res.json({ success: true, data: newItem, message: '创建成功' });
});

// PUT /api/activities/:id - 更新活动
app.put('/api/activities/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(i => i.id === req.params.id || i._id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '活动不存在' });
  }

  // 允许部分更新
  const updateData = { ...req.body };
  delete updateData.id;
  delete updateData._id;
  delete updateData.createdAt;

  items[index] = {
    ...items[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  writeData(items);

  res.json({ success: true, data: items[index], message: '更新成功' });
});

// DELETE /api/activities/:id - 删除活动
app.delete('/api/activities/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(i => i.id === req.params.id || i._id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '活动不存在' });
  }

  items.splice(index, 1);
  writeData(items);

  res.json({ success: true, message: '删除成功' });
});

// GET /api/activities/stats/categories - 分类统计
app.get('/api/activities/stats/categories', (req, res) => {
  const items = readData();
  // 统计非草稿的活动（包括：待开始、进行中、已过期）
  const activeItems = items.filter(item => item.status !== 'draft');

  const stats = activeItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  res.json({ success: true, data: stats });
});

// ========== 后台管理 API (/api/items) - 保持兼容 ==========

// GET /api/items - 获取所有数据
app.get('/api/items', (req, res) => {
  const items = readData();
  res.json({ success: true, data: items });
});

// GET /api/items/:id - 获取单条数据
app.get('/api/items/:id', (req, res) => {
  const items = readData();
  const item = items.find(i => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ success: false, message: '数据不存在' });
  }

  res.json({ success: true, data: item });
});

// POST /api/items - 创建新数据
app.post('/api/items', (req, res) => {
  const data = req.body;

  if (!data.title || !data.description) {
    return res.status(400).json({ success: false, message: '标题和描述不能为空' });
  }

  const items = readData();
  const newItem = {
    id: Date.now().toString(),
    _id: Date.now().toString(),
    ...data,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  items.push(newItem);
  writeData(items);

  res.json({ success: true, data: newItem, message: '创建成功' });
});

// PUT /api/items/:id - 更新数据
app.put('/api/items/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '数据不存在' });
  }

  const updateData = { ...req.body };
  delete updateData.id;
  delete updateData._id;
  delete updateData.createdAt;

  items[index] = {
    ...items[index],
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  writeData(items);

  res.json({ success: true, data: items[index], message: '更新成功' });
});

// DELETE /api/items/:id - 删除数据
app.delete('/api/items/:id', (req, res) => {
  const items = readData();
  const index = items.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: '数据不存在' });
  }

  items.splice(index, 1);
  writeData(items);

  res.json({ success: true, message: '删除成功' });
});

// ========== 文件上传 API ==========

// POST /api/upload - 上传单个图片
app.post('/api/upload', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: '上传成功',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
      }
    });
  } catch (error) {
    console.error('上传失败:', error);
    res.status(500).json({ success: false, message: '上传失败: ' + error.message });
  }
});

// DELETE /api/upload/:filename - 删除上传的图片
app.delete('/api/upload/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: '删除成功' });
    } else {
      res.status(404).json({ success: false, message: '文件不存在' });
    }
  } catch (error) {
    console.error('删除失败:', error);
    res.status(500).json({ success: false, message: '删除失败' });
  }
});

// 根路由 - 项目信息
app.get('/', (req, res) => {
  res.json({
    name: 'Chiengmai Activities',
    version: '2.0.0',
    description: '清迈活动管理平台 - 整合版',
    links: {
      frontend: 'http://localhost:5173',
      admin: 'http://localhost:3000/admin',
      api: 'http://localhost:3000/api'
    }
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║   🏝️ Chiengmai Activities Platform v2.0                  ║
╠════════════════════════════════════════════════════════════╣
║   🚀 Server: http://localhost:${PORT}                          ║
║   🎨 Frontend (React): http://localhost:5173               ║
║   ⚙️  Admin Panel: http://localhost:${PORT}/admin              ║
║   🔌 API: http://localhost:${PORT}/api                       ║
╚════════════════════════════════════════════════════════════╝
  `);
});
