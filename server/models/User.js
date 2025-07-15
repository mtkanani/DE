const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profile: {
    farmSize: {
      type: Number,
      min: [0, 'Farm size cannot be negative']
    },
    location: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      village: { type: String, trim: true },
      pincode: { type: String, match: [/^[0-9]{6}$/, 'Please enter a valid pincode'] },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    crops: [{
      name: { type: String, trim: true },
      area: { type: Number, min: 0 },
      season: { type: String, enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round'] }
    }],
    soilType: {
      type: String,
      enum: ['Black', 'Red', 'Alluvial', 'Clay', 'Sandy', 'Loamy', 'Other']
    },
    languagePreference: {
      type: String,
      enum: ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada'],
      default: 'English'
    },
    avatar: {
      type: String,
      default: 'default-avatar.png'
    }
  },
  wallet: {
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Wallet balance cannot be negative']
    },
    transactions: [{
      type: {
        type: String,
        enum: ['credit', 'debit', 'refund', 'cashback']
      },
      amount: Number,
      description: String,
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: true },
      whatsapp: { type: Boolean, default: false }
    },
    weatherAlerts: { type: Boolean, default: true },
    cropAdvisory: { type: Boolean, default: true },
    promotionalOffers: { type: Boolean, default: true }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'profile.location.pincode': 1 });
userSchema.index({ 'profile.location.state': 1 });

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours

  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Add to wallet
userSchema.methods.addToWallet = function(amount, type, description, orderId = null) {
  this.wallet.balance += amount;
  this.wallet.transactions.push({
    type,
    amount,
    description,
    orderId
  });
  return this.save();
};

// Get crop recommendations based on profile
userSchema.methods.getCropRecommendations = function() {
  const recommendations = [];
  const { soilType, location } = this.profile;
  
  // Simple rule-based recommendations
  if (soilType === 'Black') {
    recommendations.push('Cotton', 'Groundnut', 'Soybean');
  } else if (soilType === 'Red') {
    recommendations.push('Millets', 'Groundnut', 'Castor');
  } else if (soilType === 'Alluvial') {
    recommendations.push('Rice', 'Wheat', 'Sugarcane');
  }
  
  return recommendations;
};

module.exports = mongoose.model('User', userSchema);