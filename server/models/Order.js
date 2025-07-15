const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    discountPrice: Number,
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    discount: {
      amount: {
        type: Number,
        default: 0
      },
      couponCode: String,
      type: {
        type: String,
        enum: ['percentage', 'fixed', 'wallet'],
        default: 'fixed'
      }
    },
    shipping: {
      amount: {
        type: Number,
        default: 0
      },
      method: {
        type: String,
        enum: ['standard', 'express', 'same-day'],
        default: 'standard'
      },
      isFree: {
        type: Boolean,
        default: false
      }
    },
    tax: {
      amount: {
        type: Number,
        default: 0
      },
      rate: {
        type: Number,
        default: 0
      }
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    }
  },
  shippingAddress: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    village: String,
    district: String,
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true,
      match: [/^[0-9]{6}$/, 'Please enter a valid pincode']
    },
    landmark: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod', 'wallet', 'upi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partial-refund'],
      default: 'pending'
    },
    transactionId: String,
    gateway: {
      paymentId: String,
      orderId: String,
      signature: String
    },
    paidAt: Date,
    refunds: [{
      amount: Number,
      reason: String,
      status: {
        type: String,
        enum: ['pending', 'completed', 'failed']
      },
      refundId: String,
      processedAt: Date
    }]
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'packed',
      'shipped',
      'out-for-delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded'
    ],
    default: 'pending'
  },
  tracking: {
    trackingNumber: String,
    carrier: String,
    updates: [{
      status: String,
      location: String,
      timestamp: Date,
      description: String
    }],
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    customer: String,
    admin: String,
    delivery: String
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    deliveryRating: {
      type: Number,
      min: 1,
      max: 5
    },
    submittedAt: Date
  },
  cancellation: {
    reason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  },
  returnRequest: {
    reason: String,
    description: String,
    images: [String],
    requestedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed']
    },
    approvedAt: Date,
    returnShipping: {
      trackingNumber: String,
      carrier: String
    }
  },
  agricultural: {
    farmLocation: {
      state: String,
      district: String,
      village: String
    },
    cropType: String,
    farmSize: Number,
    seasonType: {
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid']
    },
    urgency: {
      type: String,
      enum: ['immediate', 'within-week', 'flexible'],
      default: 'flexible'
    }
  },
  communications: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'whatsapp', 'call']
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'failed']
    },
    content: String,
    sentAt: Date,
    template: String
  }],
  analytics: {
    source: String, // 'web', 'mobile', 'whatsapp', etc.
    campaign: String,
    referrer: String,
    device: String
  }
}, {
  timestamps: true
});

// Indexes for better performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'shippingAddress.pincode': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `AG${timestamp}${random}`;
  }
  next();
});

// Add status update to timeline
orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = null) {
  this.status = newStatus;
  this.timeline.push({
    status: newStatus,
    note,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

// Calculate total from products
orderSchema.methods.calculateTotal = function() {
  const subtotal = this.products.reduce((sum, item) => {
    return sum + (item.discountPrice || item.price) * item.quantity;
  }, 0);
  
  this.pricing.subtotal = subtotal;
  
  let total = subtotal;
  total -= this.pricing.discount.amount || 0;
  total += this.pricing.shipping.amount || 0;
  total += this.pricing.tax.amount || 0;
  
  this.pricing.total = Math.max(0, total);
  
  return this.pricing.total;
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  const cancellableStatuses = ['pending', 'confirmed', 'processing'];
  return cancellableStatuses.includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (this.status !== 'delivered') return false;
  
  const deliveredDate = this.tracking.actualDelivery || this.updatedAt;
  const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  return (Date.now() - deliveredDate.getTime()) <= returnWindow;
};

// Get estimated delivery date
orderSchema.methods.getEstimatedDelivery = function() {
  if (this.tracking.estimatedDelivery) {
    return this.tracking.estimatedDelivery;
  }
  
  // Calculate based on shipping method and location
  let deliveryDays = 3; // default
  
  switch (this.pricing.shipping.method) {
    case 'express':
      deliveryDays = 1;
      break;
    case 'same-day':
      deliveryDays = 0;
      break;
    default:
      deliveryDays = 3;
  }
  
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);
  
  return estimatedDate;
};

// Send notification
orderSchema.methods.sendNotification = async function(type, template) {
  // This will be implemented in the notification service
  this.communications.push({
    type,
    status: 'sent',
    template,
    sentAt: new Date()
  });
  
  return this.save();
};

// Get order summary for farmer dashboard
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    status: this.status,
    total: this.pricing.total,
    itemCount: this.products.length,
    estimatedDelivery: this.getEstimatedDelivery(),
    canCancel: this.canBeCancelled(),
    canReturn: this.canBeReturned(),
    createdAt: this.createdAt
  };
};

// Static method to get order statistics
orderSchema.statics.getStatistics = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$pricing.total' },
        averageOrderValue: { $avg: '$pricing.total' },
        ordersByStatus: {
          $push: '$status'
        }
      }
    }
  ];
  
  return this.aggregate(pipeline);
};

module.exports = mongoose.model('Order', orderSchema);