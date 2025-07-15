const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please add a coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot be more than 20 characters']
  },
  
  name: {
    type: String,
    required: [true, 'Please add a coupon name'],
    trim: true,
    maxlength: [100, 'Coupon name cannot be more than 100 characters']
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  
  // Discount configuration
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed', 'buy-one-get-one', 'free-shipping']
  },
  
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Maximum discount for percentage type
  maxDiscountAmount: {
    type: Number,
    min: 0
  },
  
  // Minimum conditions
  minOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  minQuantity: {
    type: Number,
    default: 1,
    min: 1
  },
  
  // Usage limitations
  usageLimit: {
    total: { type: Number, default: null }, // null = unlimited
    perUser: { type: Number, default: 1 }
  },
  
  usageCount: {
    type: Number,
    default: 0
  },
  
  // Validity period
  validFrom: {
    type: Date,
    required: true
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  // Target audience
  applicableFor: {
    type: String,
    enum: ['all', 'new-users', 'existing-users', 'specific-users'],
    default: 'all'
  },
  
  specificUsers: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  
  // Product/Category restrictions
  applicableProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  
  applicableCategories: [String],
  
  excludedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  
  excludedCategories: [String],
  
  // Regional restrictions
  applicableRegions: [{
    state: String,
    districts: [String]
  }],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired', 'exhausted'],
    default: 'active'
  },
  
  // Auto-apply conditions
  autoApply: {
    type: Boolean,
    default: false
  },
  
  autoApplyConditions: {
    firstOrder: { type: Boolean, default: false },
    cartAmount: { type: Number },
    specificDay: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    season: { type: String, enum: ['kharif', 'rabi', 'zaid'] }
  },
  
  // Marketing
  promotionBanner: {
    title: String,
    subtitle: String,
    image: String,
    backgroundColor: String
  },
  
  // Analytics
  analytics: {
    views: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    successfulUses: { type: Number, default: 0 },
    totalSavings: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 }
  },
  
  // Creator
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
  
}, {
  timestamps: true
});

// Index for efficient queries
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1, status: 1 });
couponSchema.index({ applicableCategories: 1 });

// Virtual for checking if coupon is currently valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.usageLimit.total === null || this.usageCount < this.usageLimit.total);
});

// Virtual for days remaining
couponSchema.virtual('daysRemaining').get(function() {
  const now = new Date();
  const validUntil = new Date(this.validUntil);
  const diffTime = validUntil - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get applicable coupons for user and cart
couponSchema.statics.getApplicableCoupons = async function(userId, cartItems, cartTotal, userRegion) {
  const now = new Date();
  
  const query = {
    status: 'active',
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    minOrderAmount: { $lte: cartTotal },
    $or: [
      { 'usageLimit.total': null },
      { $expr: { $lt: ['$usageCount', '$usageLimit.total'] } }
    ]
  };
  
  // Check user eligibility
  const user = await mongoose.model('User').findById(userId);
  if (user) {
    query.$or = [
      { applicableFor: 'all' },
      { applicableFor: 'new-users', /* add logic for new user check */ },
      { applicableFor: 'existing-users', /* add logic for existing user check */ },
      { applicableFor: 'specific-users', specificUsers: userId }
    ];
  }
  
  const coupons = await this.find(query);
  
  // Filter based on products and regions
  return coupons.filter(coupon => {
    // Check product applicability
    if (coupon.applicableProducts.length > 0) {
      const productIds = cartItems.map(item => item.product.toString());
      const hasApplicableProduct = coupon.applicableProducts.some(
        pid => productIds.includes(pid.toString())
      );
      if (!hasApplicableProduct) return false;
    }
    
    // Check category applicability
    if (coupon.applicableCategories.length > 0) {
      // This would require populating product categories
      // Implementation depends on how cart items are structured
    }
    
    // Check regional restrictions
    if (coupon.applicableRegions.length > 0 && userRegion) {
      const regionMatch = coupon.applicableRegions.some(region => {
        if (region.state !== userRegion.state) return false;
        if (region.districts.length === 0) return true;
        return region.districts.includes(userRegion.district);
      });
      if (!regionMatch) return false;
    }
    
    return true;
  });
};

// Instance method to calculate discount for given order
couponSchema.methods.calculateDiscount = function(orderAmount, cartItems = []) {
  if (!this.isValid) return 0;
  
  let discount = 0;
  
  switch (this.discountType) {
    case 'percentage':
      discount = (orderAmount * this.discountValue) / 100;
      if (this.maxDiscountAmount) {
        discount = Math.min(discount, this.maxDiscountAmount);
      }
      break;
      
    case 'fixed':
      discount = Math.min(this.discountValue, orderAmount);
      break;
      
    case 'free-shipping':
      // This would be handled separately in shipping calculation
      discount = 0;
      break;
      
    case 'buy-one-get-one':
      // Complex logic for BOGO offers
      // Would require specific product and quantity analysis
      discount = 0;
      break;
  }
  
  return Math.round(discount * 100) / 100;
};

// Instance method to check if user can use this coupon
couponSchema.methods.canBeUsedBy = async function(userId) {
  if (!this.isValid) return false;
  
  // Check user-specific restrictions
  if (this.applicableFor === 'specific-users') {
    return this.specificUsers.includes(userId);
  }
  
  // Check usage limit per user
  const Order = mongoose.model('Order');
  const userUsageCount = await Order.countDocuments({
    user: userId,
    'coupon.code': this.code
  });
  
  return userUsageCount < this.usageLimit.perUser;
};

// Pre-save hook to update status
couponSchema.pre('save', function(next) {
  const now = new Date();
  
  if (now > this.validUntil) {
    this.status = 'expired';
  } else if (this.usageLimit.total && this.usageCount >= this.usageLimit.total) {
    this.status = 'exhausted';
  }
  
  next();
});

module.exports = mongoose.model('Coupon', couponSchema);