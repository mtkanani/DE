# 🗄️ MongoDB Setup Guide for AgriCenter

This guide will help you set up MongoDB for the AgriCenter project. You have several options to choose from based on your needs and preferences.

## 🎯 Quick Setup Options

### Option 1: MongoDB Atlas (Cloud - Recommended for beginners)
### Option 2: Local MongoDB Installation
### Option 3: Docker MongoDB

---

## 🌐 Option 1: MongoDB Atlas (Cloud Database)

**Pros:** Easy setup, no maintenance, automatic backups, scalable
**Cons:** Requires internet connection, has usage limits on free tier

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### Step 2: Create a Cluster
1. After login, click "Create a New Cluster"
2. Choose "Shared" (Free tier)
3. Select your preferred cloud provider and region
4. Click "Create Cluster" (takes 1-3 minutes)

### Step 3: Create Database User
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username (e.g., `agri-admin`) and generate a secure password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production, add only your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Clusters" and click "Connect" on your cluster
2. Choose "Connect your application"
3. Select "Node.js" and version "3.6 or later"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `agri-center`

**Example Connection String:**
\`\`\`
mongodb+srv://agri-admin:yourpassword@cluster0.abcde.mongodb.net/agri-center?retryWrites=true&w=majority
\`\`\`

### Step 6: Update Environment Variables
Update your `.env` file:
\`\`\`env
MONGODB_URI=mongodb+srv://agri-admin:yourpassword@cluster0.abcde.mongodb.net/agri-center?retryWrites=true&w=majority
\`\`\`

---

## 💻 Option 2: Local MongoDB Installation

**Pros:** No internet required, full control, no usage limits
**Cons:** Requires setup and maintenance, no automatic backups

### For Windows:

1. **Download MongoDB:**
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" and download the MSI file

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - Install as a Windows Service
   - Install MongoDB Compass (optional GUI)

3. **Verify Installation:**
   \`\`\`bash
   mongod --version
   mongo --version
   \`\`\`

4. **Start MongoDB:**
   - MongoDB should start automatically as a service
   - Or manually: \`net start MongoDB\`

### For macOS:

1. **Using Homebrew (Recommended):**
   \`\`\`bash
   # Install Homebrew if not installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community
   \`\`\`

2. **Start MongoDB:**
   \`\`\`bash
   # Start as service
   brew services start mongodb/brew/mongodb-community
   
   # Or run manually
   mongod --config /usr/local/etc/mongod.conf
   \`\`\`

### For Linux (Ubuntu/Debian):

1. **Install MongoDB:**
   \`\`\`bash
   # Import public key
   wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
   
   # Add MongoDB repository
   echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
   
   # Update package list
   sudo apt-get update
   
   # Install MongoDB
   sudo apt-get install -y mongodb-org
   \`\`\`

2. **Start MongoDB:**
   \`\`\`bash
   # Start service
   sudo systemctl start mongod
   
   # Enable auto-start
   sudo systemctl enable mongod
   
   # Check status
   sudo systemctl status mongod
   \`\`\`

### Environment Configuration for Local MongoDB:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/agri-center
\`\`\`

---

## 🐳 Option 3: Docker MongoDB

**Pros:** Isolated environment, easy cleanup, consistent across systems
**Cons:** Requires Docker knowledge, additional resource usage

### Prerequisites:
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Step 1: Run MongoDB Container
\`\`\`bash
# Pull and run MongoDB
docker run -d \\
  --name agri-mongodb \\
  -p 27017:27017 \\
  -e MONGO_INITDB_ROOT_USERNAME=admin \\
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \\
  -e MONGO_INITDB_DATABASE=agri-center \\
  -v mongodb_data:/data/db \\
  mongo:latest
\`\`\`

### Step 2: Environment Configuration
\`\`\`env
MONGODB_URI=mongodb://admin:password123@localhost:27017/agri-center?authSource=admin
\`\`\`

### Step 3: Useful Docker Commands
\`\`\`bash
# Stop MongoDB
docker stop agri-mongodb

# Start MongoDB
docker start agri-mongodb

# View logs
docker logs agri-mongodb

# Access MongoDB shell
docker exec -it agri-mongodb mongo
\`\`\`

---

## 🔧 Testing Your MongoDB Connection

### Test with the Application:
1. Start your AgriCenter server:
   \`\`\`bash
   cd agri-center
   npm run server
   \`\`\`

2. Look for this message:
   \`\`\`
   MongoDB Connected: <your-connection-host>
   \`\`\`

### Test with MongoDB Compass (GUI):
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Use your connection string to connect
3. You should see the `agri-center` database after running the app

### Test with Command Line:
\`\`\`bash
# For local MongoDB
mongo mongodb://localhost:27017/agri-center

# For Atlas (replace with your connection string)
mongo "mongodb+srv://cluster0.abcde.mongodb.net/agri-center" --username yourusername
\`\`\`

---

## 📊 Database Structure

Once connected, AgriCenter will automatically create these collections:

- **users** - User accounts and farmer profiles
- **products** - Agricultural products catalog
- **orders** - Purchase orders and tracking
- **carts** - User shopping carts
- **reviews** - Product reviews and ratings
- **coupons** - Discount codes and promotions
- **cropadvisories** - Farming advice and recommendations

---

## 🚨 Troubleshooting

### Common Issues:

**1. Connection Timeout**
- Check your internet connection (for Atlas)
- Verify MongoDB service is running (for local)
- Check firewall settings

**2. Authentication Failed**
- Verify username and password
- Check if user has proper permissions
- Ensure database name is correct

**3. Network Error**
- For Atlas: Check if your IP is whitelisted
- For local: Ensure MongoDB is running on port 27017
- Check if port is blocked by firewall

**4. Database Not Found**
- MongoDB creates databases automatically when first document is inserted
- The database will appear after you create your first user or product

### Debug Connection:
Add this to your server code temporarily:
\`\`\`javascript
mongoose.set('debug', true);
\`\`\`

### Environment Variables Check:
\`\`\`bash
# In your project directory
echo $MONGODB_URI

# Or on Windows
echo %MONGODB_URI%
\`\`\`

---

## 🔐 Security Best Practices

### For Development:
- Use strong passwords
- Don't commit credentials to version control
- Use environment variables for sensitive data

### For Production:
- Enable authentication
- Use SSL/TLS connections
- Restrict network access
- Regular backups
- Monitor database activity
- Use least privilege principle

---

## 📝 Sample Data

Want to test with sample data? You can create a seed script:

\`\`\`javascript
// utils/seedData.js
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');

// Run: node utils/seedData.js
\`\`\`

---

## 🆘 Need Help?

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Community Forum](https://community.mongodb.com/)

---

**🎉 Congratulations!** You now have MongoDB set up for AgriCenter. Choose the option that best fits your needs and start building amazing agricultural solutions!