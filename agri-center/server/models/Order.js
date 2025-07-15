const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Order items
  orderItems: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    price: {
      type: Number,
      required: true
    },
    discountPrice: Number,
    finalPrice: {
      type: Number,
      required: true
    }
  }],
  
  // Shipping address
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    landmark: String
  },
  
  // Billing address
  billingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  
  // Order summary
  itemsPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  
  taxAmount: {
    type: Number,
    required: true,
    default: 0.0
  },
  
  shippingPrice: {
    type: Number,
    required: true,
    default: 0.0
  },
  
  discountAmount: {
    type: Number,
    default: 0.0
  },
  
  totalAmount: {
    type: Number,
    required: true,
    default: 0.0
  },
  
  // Payment information
  paymentInfo: {
    method: {
      type: String,
      required: true,
      enum: ['razorpay', 'stripe', 'cod', 'wallet', 'upi']
    },
    transactionId: String,
    paymentId: String,
    razorpayOrderId: String,
    status: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
      default: 'pending'
    },
    paidAt: Date,
    refundId: String,
    refundAmount: Number,
    refundReason: String
  },
  
  // Order status and tracking
  orderStatus: {
    type: String,
    required: true,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out-for-delivery', 'delivered', 'cancelled', 'returned', 'refunded'],
    default: 'pending'
  },
  
  trackingInfo: {
    trackingNumber: String,
    carrier: String,
    trackingUrl: String,
    estimatedDelivery: Date
  },
  
  // Important dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Additional information
  orderNotes: String,
  adminNotes: String,
  
  // Coupon information
  coupon: {
    code: String,
    discountType: { type: String, enum: ['percentage', 'fixed'] },
    discountValue: Number,
    appliedAmount: Number
  },
  
  // Delivery preferences
  deliveryPreferences: {
    preferredDate: Date,
    preferredTimeSlot: String,
    specialInstructions: String
  },
  
  // Return/Exchange information
  returnInfo: {
    requested: { type: Boolean, default: false },
    reason: String,
    status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'] },
    requestedAt: Date,
    approvedAt: Date,
    completedAt: Date,
    refundAmount: Number
  },
  
  // Customer feedback
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    submittedAt: Date
  }
  
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `AGR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.orderDate) / (1000 * 60 * 60 * 24));
});

// Instance method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.orderStatus) && 
         this.paymentInfo.status !== 'paid';
};

// Instance method to check if order can be returned
orderSchema.methods.canBeReturned = function() {
  const deliveredDate = this.deliveredAt;
  const currentDate = new Date();
  const daysSinceDelivery = (currentDate - deliveredDate) / (1000 * 60 * 60 * 24);
  
  return this.orderStatus === 'delivered' && 
         daysSinceDelivery <= 7 && 
         !this.returnInfo.requested;
};

// Static method to get order statistics
orderSchema.statics.getOrderStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' }
      }
    }
  ]);
  
  return stats;
};

module.exports = mongoose.model('Order', orderSchema);