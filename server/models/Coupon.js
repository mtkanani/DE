const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters'],
    match: [/^[A-Z0-9]+$/, 'Coupon code should contain only uppercase letters and numbers']
  },
  name: {
    type: String,
    required: [true, 'Coupon name is required'],
    trim: true,
    maxlength: [100, 'Coupon name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free-shipping', 'buy-x-get-y'],
    required: [true, 'Coupon type is required']
  },
  value: {
    type: Number,
    required: [true, 'Coupon value is required'],
    min: [0, 'Coupon value cannot be negative']
  },
  maxDiscount: {
    type: Number,
    min: [0, 'Maximum discount cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order value cannot be negative']
  },
  usageLimit: {
    total: {
      type: Number,
      default: null // null means unlimited
    },
    perUser: {
      type: Number,
      default: 1,
      min: [1, 'Per user limit must be at least 1']
    }
  },
  usageCount: {
    total: {
      type: Number,
      default: 0
    },
    users: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      },
      orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
      }]
    }]
  },
  validity: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function(v) {
          return v > this.validity.startDate;
        },
        message: 'End date must be after start date'
      }
    }
  },
  applicability: {
    userTypes: [{
      type: String,
      enum: ['all', 'new', 'existing', 'premium']
    }],
    categories: [{
      type: String,
      enum: ['Seeds', 'Pesticides', 'Fertilizers', 'Pumps', 'Tools', 'Machinery', 'Organic']
    }],
    products: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    brands: [String],
    locations: [{
      state: String,
      districts: [String],
      pincodes: [String]
    }],
    seasons: [{
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round']
    }],
    crops: [String]
  },
  conditions: {
    firstTimeUser: {
      type: Boolean,
      default: false
    },
    bulkOrder: {
      minQuantity: Number,
      categories: [String]
    },
    seasonal: {
      season: {
        type: String,
        enum: ['Kharif', 'Rabi', 'Zaid']
      },
      months: [Number] // 1-12
    },
    combinable: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  analytics: {
    totalSavings: {
      type: Number,
      default: 0
    },
    totalOrders: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    popularProducts: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      count: Number
    }]
  },
  marketing: {
    campaign: String,
    source: String,
    medium: String,
    autoApply: {
      type: Boolean,
      default: false
    },
    displayOnHomepage: {
      type: Boolean,
      default: false
    },
    bannerImage: String,
    priority: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, 'validity.startDate': 1, 'validity.endDate': 1 });
couponSchema.index({ 'applicability.categories': 1 });
couponSchema.index({ 'marketing.displayOnHomepage': 1, 'marketing.priority': -1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isCurrentlyValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validity.startDate <= now && 
         this.validity.endDate >= now;
});

// Virtual for checking if usage limit reached
couponSchema.virtual('isUsageLimitReached').get(function() {
  if (!this.usageLimit.total) return false;
  return this.usageCount.total >= this.usageLimit.total;
});

// Method to check if coupon is applicable for user
couponSchema.methods.isApplicableForUser = function(user, orderDetails = {}) {
  // Check if coupon is currently valid
  if (!this.isCurrentlyValid || this.isUsageLimitReached) {
    return { valid: false, reason: 'Coupon is not active or usage limit reached' };
  }

  // Check user type eligibility
  if (this.applicability.userTypes.length > 0) {
    const userType = user.isNewUser ? 'new' : 'existing';
    if (!this.applicability.userTypes.includes('all') && 
        !this.applicability.userTypes.includes(userType)) {
      return { valid: false, reason: 'Not applicable for your user type' };
    }
  }

  // Check per user usage limit
  const userUsage = this.usageCount.users.find(u => u.user.toString() === user._id.toString());
  if (userUsage && userUsage.count >= this.usageLimit.perUser) {
    return { valid: false, reason: 'You have reached the usage limit for this coupon' };
  }

  // Check minimum order value
  if (orderDetails.total && orderDetails.total < this.minOrderValue) {
    return { valid: false, reason: `Minimum order value is ₹${this.minOrderValue}` };
  }

  // Check location eligibility
  if (this.applicability.locations.length > 0 && user.profile.location) {
    const userLocation = user.profile.location;
    const isLocationValid = this.applicability.locations.some(loc => {
      if (loc.state && loc.state !== userLocation.state) return false;
      if (loc.districts.length > 0 && !loc.districts.includes(userLocation.district)) return false;
      if (loc.pincodes.length > 0 && !loc.pincodes.includes(userLocation.pincode)) return false;
      return true;
    });
    
    if (!isLocationValid) {
      return { valid: false, reason: 'Not applicable for your location' };
    }
  }

  // Check first time user condition
  if (this.conditions.firstTimeUser && !user.isNewUser) {
    return { valid: false, reason: 'Only for first-time users' };
  }

  return { valid: true };
};

// Method to calculate discount
couponSchema.methods.calculateDiscount = function(orderDetails) {
  const { subtotal, products } = orderDetails;
  let discount = 0;

  switch (this.type) {
    case 'percentage':
      discount = (subtotal * this.value) / 100;
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      break;
    
    case 'fixed':
      discount = Math.min(this.value, subtotal);
      break;
    
    case 'free-shipping':
      discount = orderDetails.shipping || 0;
      break;
    
    case 'buy-x-get-y':
      // Implement buy X get Y logic based on products
      // This would need more complex logic based on specific requirements
      break;
  }

  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon to order
couponSchema.methods.applyToOrder = function(userId, orderId) {
  // Update usage count
  this.usageCount.total += 1;
  
  // Update user usage count
  let userUsage = this.usageCount.users.find(u => u.user.toString() === userId.toString());
  if (userUsage) {
    userUsage.count += 1;
    userUsage.orders.push(orderId);
  } else {
    this.usageCount.users.push({
      user: userId,
      count: 1,
      orders: [orderId]
    });
  }
  
  return this.save();
};

// Static method to get active coupons for homepage
couponSchema.statics.getActiveCoupons = function(limit = 10) {
  const now = new Date();
  return this.find({
    isActive: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now },
    'marketing.displayOnHomepage': true
  })
  .sort({ 'marketing.priority': -1, createdAt: -1 })
  .limit(limit)
  .select('code name description type value maxDiscount minOrderValue marketing');
};

// Static method to get seasonal coupons
couponSchema.statics.getSeasonalCoupons = function(season) {
  const now = new Date();
  return this.find({
    isActive: true,
    'validity.startDate': { $lte: now },
    'validity.endDate': { $gte: now },
    'applicability.seasons': season
  })
  .sort({ value: -1 })
  .select('code name description type value maxDiscount minOrderValue');
};

// Method to generate analytics report
couponSchema.methods.getAnalytics = function() {
  return {
    code: this.code,
    name: this.name,
    totalUsage: this.usageCount.total,
    totalSavings: this.analytics.totalSavings,
    totalOrders: this.analytics.totalOrders,
    conversionRate: this.analytics.conversionRate,
    averageDiscount: this.analytics.totalOrders > 0 ? 
      this.analytics.totalSavings / this.analytics.totalOrders : 0,
    usageRate: this.usageLimit.total ? 
      (this.usageCount.total / this.usageLimit.total) * 100 : 0
  };
};

module.exports = mongoose.model('Coupon', couponSchema);