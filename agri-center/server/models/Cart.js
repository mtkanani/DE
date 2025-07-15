const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: Number,
    addedAt: {
      type: Date,
      default: Date.now
    },
    // Special offers or bundles
    specialOffer: {
      type: String,
      enum: ['buy-2-get-1', 'bulk-discount', 'combo-offer']
    }
  }],
  
  // Applied coupon
  appliedCoupon: {
    code: String,
    discountAmount: Number,
    couponId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Coupon'
    }
  },
  
  // Saved for later items
  savedItems: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    originalPrice: Number
  }],
  
  // Cart totals (calculated fields)
  subtotal: {
    type: Number,
    default: 0
  },
  
  discountAmount: {
    type: Number,
    default: 0
  },
  
  taxAmount: {
    type: Number,
    default: 0
  },
  
  shippingAmount: {
    type: Number,
    default: 0
  },
  
  total: {
    type: Number,
    default: 0
  },
  
  // Cart metadata
  lastModified: {
    type: Date,
    default: Date.now
  },
  
  // Session tracking for guest users (if implemented)
  sessionId: String,
  
  // Cart status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted', 'expired'],
    default: 'active'
  }
  
}, {
  timestamps: true
});

// Index for efficient queries
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1, updatedAt: 1 });

// Virtual for total items count
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for unique products count
cartSchema.virtual('uniqueProducts').get(function() {
  return this.items.length;
});

// Pre-save middleware to update totals
cartSchema.pre('save', function(next) {
  this.calculateTotals();
  this.lastModified = new Date();
  next();
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);
  
  // Apply coupon discount
  this.discountAmount = this.appliedCoupon?.discountAmount || 0;
  
  // Calculate tax (18% GST for agricultural products - adjust as needed)
  const taxableAmount = this.subtotal - this.discountAmount;
  this.taxAmount = Math.round(taxableAmount * 0.18 * 100) / 100;
  
  // Calculate shipping (can be made more complex based on weight, location, etc.)
  this.shippingAmount = this.calculateShipping();
  
  // Calculate final total
  this.total = this.subtotal - this.discountAmount + this.taxAmount + this.shippingAmount;
  this.total = Math.round(this.total * 100) / 100;
};

// Method to calculate shipping
cartSchema.methods.calculateShipping = function() {
  // Free shipping for orders above ₹500
  if (this.subtotal >= 500) {
    return 0;
  }
  
  // Standard shipping rate
  return 50;
};

// Method to add item to cart
cartSchema.methods.addItem = async function(productId, quantity = 1, price) {
  const existingItem = this.items.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    this.items.push({
      product: productId,
      quantity,
      price
    });
  }
  
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = async function(productId, quantity) {
  const item = this.items.find(
    item => item.product.toString() === productId.toString()
  );
  
  if (!item) {
    throw new Error('Item not found in cart');
  }
  
  if (quantity <= 0) {
    this.items = this.items.filter(
      item => item.product.toString() !== productId.toString()
    );
  } else {
    item.quantity = quantity;
  }
  
  return this.save();
};

// Method to remove item from cart
cartSchema.methods.removeItem = async function(productId) {
  this.items = this.items.filter(
    item => item.product.toString() !== productId.toString()
  );
  
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = async function() {
  this.items = [];
  this.appliedCoupon = undefined;
  return this.save();
};

// Method to apply coupon
cartSchema.methods.applyCoupon = async function(couponCode) {
  const Coupon = mongoose.model('Coupon');
  const coupon = await Coupon.findOne({ 
    code: couponCode.toUpperCase(),
    status: 'active'
  });
  
  if (!coupon) {
    throw new Error('Invalid or expired coupon');
  }
  
  // Check if coupon is valid for this user
  const canUse = await coupon.canBeUsedBy(this.user);
  if (!canUse) {
    throw new Error('Coupon cannot be used by this user');
  }
  
  // Calculate discount
  const discountAmount = coupon.calculateDiscount(this.subtotal, this.items);
  
  if (discountAmount === 0) {
    throw new Error('Coupon is not applicable for current cart');
  }
  
  this.appliedCoupon = {
    code: coupon.code,
    discountAmount,
    couponId: coupon._id
  };
  
  return this.save();
};

// Method to remove coupon
cartSchema.methods.removeCoupon = async function() {
  this.appliedCoupon = undefined;
  return this.save();
};

// Method to move item to saved for later
cartSchema.methods.saveForLater = async function(productId) {
  const itemIndex = this.items.findIndex(
    item => item.product.toString() === productId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  const item = this.items[itemIndex];
  
  // Check if already in saved items
  const alreadySaved = this.savedItems.find(
    saved => saved.product.toString() === productId.toString()
  );
  
  if (!alreadySaved) {
    this.savedItems.push({
      product: item.product,
      originalPrice: item.price
    });
  }
  
  // Remove from cart items
  this.items.splice(itemIndex, 1);
  
  return this.save();
};

// Method to move item back to cart from saved
cartSchema.methods.moveToCart = async function(productId) {
  const savedIndex = this.savedItems.findIndex(
    saved => saved.product.toString() === productId.toString()
  );
  
  if (savedIndex === -1) {
    throw new Error('Item not found in saved items');
  }
  
  const savedItem = this.savedItems[savedIndex];
  
  // Add to cart items
  this.items.push({
    product: savedItem.product,
    quantity: 1,
    price: savedItem.originalPrice
  });
  
  // Remove from saved items
  this.savedItems.splice(savedIndex, 1);
  
  return this.save();
};

// Static method to find or create cart for user
cartSchema.statics.findOrCreateForUser = async function(userId) {
  let cart = await this.findOne({ user: userId });
  
  if (!cart) {
    cart = new this({ user: userId });
    await cart.save();
  }
  
  return cart;
};

// Static method to clean up abandoned carts (older than 30 days)
cartSchema.statics.cleanupAbandonedCarts = async function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.deleteMany({
    updatedAt: { $lt: thirtyDaysAgo },
    status: 'active'
  });
};

module.exports = mongoose.model('Cart', cartSchema);