# 🌾 AgriCenter - Agriculture E-commerce Platform

A comprehensive MERN stack e-commerce platform specifically designed for agricultural products, featuring advanced crop advisory systems, weather integration, and farmer-focused features.

## 🚀 Features

### Core E-commerce Features
- **Product Catalog** with advanced filtering and search
- **Shopping Cart** with persistent storage
- **Order Management** with real-time tracking
- **Payment Integration** (Razorpay & Stripe)
- **User Authentication & Authorization**
- **Multi-level Admin Panel**

### Agriculture-Specific Features
- **Crop Advisory System** with AI/rule-based recommendations
- **Weather Integration** for farming decisions
- **Seasonal Product Recommendations**
- **Soil Type & Location-based Filtering**
- **Multi-language Support** (Hindi, Gujarati, etc.)
- **WhatsApp/SMS Integration** for order updates
- **Farmer Profile Management**

### Advanced Features
- **Coupon & Discount System**
- **Product Reviews & Ratings**
- **Email Notifications**
- **Progressive Web App (PWA)** support
- **Location-based Services**
- **Inventory Management**
- **Analytics Dashboard**

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Multer & Cloudinary** - File uploads

### Frontend (Coming Soon)
- **React.js** - Frontend framework
- **Redux** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client

### External Integrations
- **Razorpay/Stripe** - Payment processing
- **OpenWeatherMap** - Weather data
- **Twilio** - SMS services
- **Cloudinary** - Image storage

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**
- **Git**

## 🔧 Installation & Setup

### 1. Clone the Repository
\`\`\`bash
git clone <repository-url>
cd agri-center
\`\`\`

### 2. Install Dependencies
\`\`\`bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies (when frontend is added)
npm run install-client
\`\`\`

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
   \`\`\`bash
   mongod
   \`\`\`
3. Create database: \`agri-center\`

#### Option B: MongoDB Atlas (Recommended)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string
4. Update \`.env\` file with your connection string

### 4. Environment Configuration

Create a \`.env\` file in the root directory and update with your values:

\`\`\`env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/agri-center
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/agri-center

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRE=30d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@agri-center.com

# Payment Gateways
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Weather API
WEATHER_API_KEY=your-openweathermap-api-key
WEATHER_API_URL=https://api.openweathermap.org/data/2.5

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Frontend URL
CLIENT_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@agri-center.com
ADMIN_PASSWORD=admin123
\`\`\`

### 5. Start the Application

\`\`\`bash
# Start development server (backend only for now)
npm run server

# Or start both frontend and backend when frontend is ready
npm run dev
\`\`\`

The server will start on \`http://localhost:5000\`

## 📖 API Documentation

### Base URL
\`\`\`
http://localhost:5000/api
\`\`\`

### Authentication Endpoints
- \`POST /auth/register\` - Register new user
- \`POST /auth/login\` - Login user
- \`GET /auth/me\` - Get current user
- \`PUT /auth/profile\` - Update profile
- \`POST /auth/logout\` - Logout user

### Product Endpoints
- \`GET /products\` - Get all products (with filters)
- \`GET /products/:id\` - Get single product
- \`POST /products\` - Create product (Admin only)
- \`PUT /products/:id\` - Update product (Admin only)
- \`DELETE /products/:id\` - Delete product (Admin only)

### Example API Calls

#### Register User
\`\`\`bash
curl -X POST http://localhost:5000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "phone": "9876543210",
    "password": "password123",
    "farmDetails": {
      "farmSize": 5,
      "location": {
        "state": "Gujarat",
        "district": "Ahmedabad",
        "village": "Gandhinagar"
      },
      "soilType": "black",
      "primaryCrops": ["cotton", "wheat"]
    }
  }'
\`\`\`

#### Get Products
\`\`\`bash
curl -X GET "http://localhost:5000/api/products?category=seeds&page=1&limit=10"
\`\`\`

## 🗂️ Project Structure

\`\`\`
agri-center/
├── client/                 # Frontend (React) - Coming Soon
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.js
├── server/                 # Backend (Node.js/Express)
│   ├── config/
│   │   └── database.js     # MongoDB connection
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js         # Authentication middleware
│   │   └── errorHandler.js # Error handling
│   ├── models/             # Mongoose models
│   │   ├── User.js         # User schema
│   │   ├── Product.js      # Product schema
│   │   ├── Order.js        # Order schema
│   │   ├── Cart.js         # Cart schema
│   │   ├── Review.js       # Review schema
│   │   ├── Coupon.js       # Coupon schema
│   │   └── CropAdvisory.js # Crop advisory schema
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication routes
│   │   ├── products.js     # Product routes
│   │   ├── orders.js       # Order routes
│   │   ├── cart.js         # Cart routes
│   │   └── ...
│   ├── utils/              # Utility functions
│   └── index.js            # Server entry point
├── .env                    # Environment variables
├── package.json            # Dependencies and scripts
└── README.md              # This file
\`\`\`

## 🔑 Key Features Implementation

### MongoDB Connection
The application uses Mongoose for MongoDB integration with proper error handling and connection management.

### Authentication System
- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization (farmer, admin, dealer)
- Password reset functionality

### Product Management
- Comprehensive product schema with agricultural-specific fields
- Category-based filtering
- Price range and search functionality
- Inventory management

### Crop Advisory System
- Location-based recommendations
- Seasonal advice
- Soil type considerations
- Weather-dependent suggestions

## 🚧 Development Status

### ✅ Completed Features
- Database models and schemas
- Authentication system
- Product management API
- Error handling middleware
- Rate limiting and security

### 🔄 In Progress
- Frontend React application
- Payment integration
- Email notification system
- Admin dashboard

### 📋 Coming Soon
- Weather API integration
- SMS notifications
- Progressive Web App features
- Advanced analytics

## 🧪 Testing

\`\`\`bash
# Test API endpoints
npm test

# Test specific routes
npm run test:auth
npm run test:products
\`\`\`

## 🚀 Deployment

### Environment Setup
1. Set \`NODE_ENV=production\` in your environment
2. Use MongoDB Atlas for production database
3. Configure proper CORS settings
4. Set up SSL certificates

### Deployment Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **AWS EC2** - Full control over server configuration
- **DigitalOcean** - Cost-effective option
- **Vercel** - For full-stack deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit your changes: \`git commit -m 'Add amazing feature'\`
4. Push to the branch: \`git push origin feature/amazing-feature\`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Email: support@agri-center.com
- GitHub Issues: [Create an issue](https://github.com/your-repo/agri-center/issues)

## 🙏 Acknowledgments

- MongoDB for excellent documentation
- Express.js community
- Agricultural technology pioneers
- Open source contributors

---

**Built with ❤️ for farmers and agricultural communities**