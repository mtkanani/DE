const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const userRoutes = require('./routes/users');
const couponRoutes = require('./routes/coupons');
const reviewRoutes = require('./routes/reviews');
const cropAdvisoryRoutes = require('./routes/cropAdvisory');
const paymentRoutes = require('./routes/payment');
const weatherRoutes = require('./routes/weather');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      'http://localhost:3000',
      'http://localhost:3001'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'AgriCenter API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', authMiddleware, orderRoutes);
app.use('/api/cart', authMiddleware, cartRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/crop-advisory', cropAdvisoryRoutes);
app.use('/api/payment', authMiddleware, paymentRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/admin', authMiddleware, adminRoutes);
app.use('/api/email', emailRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to AgriCenter API',
    version: '1.0.0',
    documentation: {
      auth: '/api/auth - Authentication endpoints',
      products: '/api/products - Product management',
      orders: '/api/orders - Order management',
      cart: '/api/cart - Shopping cart',
      users: '/api/users - User management',
      coupons: '/api/coupons - Coupon management',
      reviews: '/api/reviews - Product reviews',
      cropAdvisory: '/api/crop-advisory - Farming advice',
      payment: '/api/payment - Payment processing',
      weather: '/api/weather - Weather information',
      admin: '/api/admin - Admin operations',
      email: '/api/email - Email services'
    },
    features: [
      'User Authentication & Authorization',
      'Product Catalog with Advanced Filtering',
      'Shopping Cart & Checkout',
      'Order Management & Tracking',
      'Payment Integration (Razorpay/Stripe)',
      'Coupon & Discount System',
      'Product Reviews & Ratings',
      'Crop Advisory System',
      'Weather Integration',
      'Email Notifications',
      'Multi-language Support',
      'Location-based Services',
      'Admin Dashboard',
      'Analytics & Reporting'
    ]
  });
});

// Handle 404 errors
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = () => {
  console.log('Received shutdown signal. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 AgriCenter Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📱 API Documentation available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check available at http://localhost:${PORT}/api/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

module.exports = app;