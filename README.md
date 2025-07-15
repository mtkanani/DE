# 🌾 AgriCenter - Agricultural E-commerce Platform

A comprehensive agricultural e-commerce platform built with MERN stack, designed specifically for farmers and agricultural businesses. Features crop advisory, smart recommendations, multi-language support, and integrated payment solutions.

## 🚀 Features

### 🌱 Core E-commerce Features
- **Product Catalog**: Browse seeds, pesticides, fertilizers, pumps, tools, and machinery
- **Smart Search & Filtering**: Advanced search with crop-specific filters
- **Shopping Cart & Checkout**: Seamless shopping experience with multiple payment options
- **Order Management**: Track orders from placement to delivery
- **User Reviews & Ratings**: Verified purchase reviews with image support

### 👨‍🌾 Farmer-Specific Features
- **Farmer Profile Dashboard**: Manage farm details, crops, and soil information
- **Crop Advisory System**: AI-powered recommendations based on season, location, and soil type
- **Weather Integration**: Real-time weather updates and farming alerts
- **Personalized Recommendations**: Products suggested based on farmer's crop profile
- **Multi-language Support**: Available in English, Hindi, Gujarati, Marathi, Tamil, Telugu, Kannada

### 💳 Business Features
- **Payment Integration**: Razorpay, Stripe, COD, UPI, and wallet payments
- **Coupon System**: Seasonal discounts and promotional offers
- **Inventory Management**: Real-time stock tracking with low stock alerts
- **Analytics Dashboard**: Sales, user behavior, and inventory analytics
- **Admin Panel**: Complete backend management system

### 📱 Advanced Features
- **Progressive Web App (PWA)**: Works offline and installable on mobile
- **WhatsApp/SMS Integration**: Order updates and notifications
- **Email Notifications**: Automated order confirmations and newsletters
- **Image Upload**: Cloudinary integration for product and profile images
- **SEO Optimized**: Meta tags, structured data, and sitemap generation

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email services
- **Multer** - File uploads
- **Razorpay/Stripe** - Payment processing

### Frontend
- **React.js** - UI library
- **React Router** - Navigation
- **React Query** - Data fetching
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **Axios** - HTTP client

### Additional Services
- **Cloudinary** - Image storage
- **Twilio** - SMS/WhatsApp
- **OpenWeather API** - Weather data
- **Google Maps** - Location services

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (v5.0 or higher)
- **npm** or **yarn**
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/agri-center.git
cd agri-center
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
npm run install-server

# Install client dependencies
npm run install-client
```

### 3. MongoDB Setup

#### Option A: Local MongoDB Installation

1. **Install MongoDB Community Edition**
   - **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **macOS**: `brew install mongodb-community`
   - **Ubuntu**: 
     ```bash
     wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
     echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
     sudo apt-get update
     sudo apt-get install -y mongodb-org
     ```

2. **Start MongoDB Service**
   ```bash
   # Windows (as Administrator)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Ubuntu
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

3. **Verify MongoDB Installation**
   ```bash
   mongosh
   # Should connect to MongoDB shell
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address
5. Get connection string from "Connect" button

### 4. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/agri-center

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/agri-center?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d

# Email Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@agricenter.com
FROM_NAME=AgriCenter

# Payment Gateway (Optional - for testing)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Weather API (Optional)
WEATHER_API_KEY=your-openweather-api-key

# Cloud Storage (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 5. Database Seeding (Optional)

To populate the database with sample data:

```bash
cd server
npm run seed
```

### 6. Start the Application

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start them separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🔧 MongoDB Connection Troubleshooting

### Common Issues and Solutions

1. **Connection Refused Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod  # Linux
   brew services list | grep mongodb  # macOS
   
   # Start MongoDB if not running
   sudo systemctl start mongod  # Linux
   brew services start mongodb-community  # macOS
   ```

2. **Authentication Failed**
   - Ensure username/password are correct in connection string
   - Check if user has proper database permissions

3. **Network Timeout (Atlas)**
   - Verify IP address is whitelisted
   - Check firewall settings
   - Try allowing access from anywhere (0.0.0.0/0) for testing

4. **Database Not Found**
   - MongoDB will automatically create the database on first connection
   - No manual database creation needed

### MongoDB Compass (GUI Tool)

For easier database management, install [MongoDB Compass](https://www.mongodb.com/products/compass):

1. Download and install MongoDB Compass
2. Connect using your connection string
3. Browse and manage your data visually

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Product Endpoints
- `GET /api/products` - Get products with filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/featured` - Get featured products
- `GET /api/products/categories` - Get product categories

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order

### Crop Advisory Endpoints
- `GET /api/advisory` - Get crop advisories
- `GET /api/advisory/:id` - Get single advisory
- `GET /api/advisory/recommendations` - Get personalized recommendations

## 🏗️ Project Structure

```
agri-center/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   └── hooks/          # Custom hooks
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── config/             # Database config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── .env                    # Environment variables
├── package.json            # Root package.json
└── README.md
```

## 🚀 Deployment

### Environment Setup for Production

1. **Update Environment Variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-strong-production-secret
   ```

2. **Build Frontend**
   ```bash
   npm run build
   ```

3. **Deploy Options**
   - **Heroku**: Use the included Procfile
   - **Digital Ocean**: Deploy using App Platform
   - **AWS**: Use Elastic Beanstalk or EC2
   - **Vercel**: For frontend, separate backend deployment needed

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-username/agri-center/issues) page
2. Create a new issue with detailed description
3. Contact support at: support@agricenter.com

## 🙏 Acknowledgments

- Farmers and agricultural experts who provided domain knowledge
- Open source community for amazing tools and libraries
- Contributors who helped improve this platform

---

**Happy Farming! 🌾**

For more information, visit our [documentation](https://docs.agricenter.com) or contact us at contact@agricenter.com.