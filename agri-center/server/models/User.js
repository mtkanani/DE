const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^(\+91|91)?[6789]\d{9}$/, 'Please add a valid Indian phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'dealer'],
    default: 'farmer'
  },
  
  // Farmer-specific fields
  farmDetails: {
    farmSize: {
      type: Number, // in acres
      min: 0
    },
    location: {
      state: { type: String },
      district: { type: String },
      village: { type: String },
      pincode: { type: String },
      coordinates: {
        latitude: { type: Number },
        longitude: { type: Number }
      }
    },
    soilType: {
      type: String,
      enum: ['black', 'red', 'alluvial', 'laterite', 'sandy', 'clay', 'loamy']
    },
    primaryCrops: [String],
    farmingExperience: {
      type: Number, // in years
      min: 0
    }
  },
  
  // Preferences
  languagePreference: {
    type: String,
    enum: ['english', 'hindi', 'gujarati', 'marathi', 'tamil', 'telugu', 'kannada', 'punjabi'],
    default: 'english'
  },
  
  // Communication preferences
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    whatsapp: { type: Boolean, default: false },
    push: { type: Boolean, default: true }
  },
  
  // Profile and verification
  avatar: {
    type: String,
    default: 'default-avatar.jpg'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Addresses
  addresses: [{
    type: {
      type: String,
      enum: ['billing', 'shipping', 'farm'],
      required: true
    },
    name: String,
    phone: String,
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false }
  }],
  
  // Financial
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tracking
  lastLogin: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);