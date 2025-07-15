const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Seeds', 'Pesticides', 'Fertilizers', 'Pumps', 'Tools', 'Machinery', 'Organic'],
      message: '{VALUE} is not a valid category'
    }
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(v) {
        return !v || v < this.price;
      },
      message: 'Discount price should be less than original price'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['kg', 'gm', 'ltr', 'ml', 'packet', 'piece', 'bag', 'bottle']
  },
  weight: {
    value: Number,
    unit: {
      type: String,
      enum: ['kg', 'gm', 'ltr', 'ml']
    }
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    title: String,
    description: String,
    type: {
      type: String,
      enum: ['demo', 'tutorial', 'usage'],
      default: 'demo'
    }
  }],
  specifications: {
    composition: [String],
    activeIngredient: String,
    concentration: String,
    formulation: String,
    manufacturer: String,
    manufacturingDate: Date,
    expiryDate: Date,
    batchNumber: String
  },
  usage: {
    crops: [String],
    dosage: String,
    applicationMethod: String,
    frequency: String,
    precautions: [String],
    benefits: [String]
  },
  tags: [String],
  isOrganic: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    images: [String],
    isVerified: {
      type: Boolean,
      default: false
    },
    helpful: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String],
    slug: {
      type: String,
      unique: true,
      sparse: true
    }
  },
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'heavy', 'fragile', 'liquid'],
      default: 'standard'
    },
    isFreeShipping: {
      type: Boolean,
      default: false
    }
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    purchases: {
      type: Number,
      default: 0
    },
    wishlistAdds: {
      type: Number,
      default: 0
    },
    cartAdds: {
      type: Number,
      default: 0
    }
  },
  seasonality: {
    bestSeasons: [{
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round']
    }],
    climateZones: [String]
  },
  certifications: [{
    name: String,
    certifyingBody: String,
    certificateNumber: String,
    validUntil: Date
  }],
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  faqs: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, subcategory: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ 'seo.slug': 1 });
productSchema.index({ brand: 1 });

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price > this.discountPrice) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Virtual for effective price
productSchema.virtual('effectivePrice').get(function() {
  return this.discountPrice || this.price;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stock === 0) return 'out-of-stock';
  if (this.stock <= 5) return 'low-stock';
  return 'in-stock';
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') || !this.seo.slug) {
    this.seo.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

// Update ratings when review is added
productSchema.methods.updateRatings = function() {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings.average = totalRating / this.reviews.length;
    this.ratings.count = this.reviews.length;
  } else {
    this.ratings.average = 0;
    this.ratings.count = 0;
  }
  return this.save();
};

// Add review method
productSchema.methods.addReview = function(userId, rating, comment, images = []) {
  // Check if user has already reviewed
  const existingReview = this.reviews.find(review => 
    review.user.toString() === userId.toString()
  );
  
  if (existingReview) {
    // Update existing review
    existingReview.rating = rating;
    existingReview.comment = comment;
    existingReview.images = images;
    existingReview.createdAt = new Date();
  } else {
    // Add new review
    this.reviews.push({
      user: userId,
      rating,
      comment,
      images
    });
  }
  
  return this.updateRatings();
};

// Get similar products
productSchema.methods.getSimilarProducts = async function(limit = 5) {
  return this.constructor.find({
    _id: { $ne: this._id },
    category: this.category,
    isActive: true
  })
  .sort({ 'ratings.average': -1, 'analytics.purchases': -1 })
  .limit(limit)
  .select('name price discountPrice images ratings');
};

// Increment view count
productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

// Check if product is suitable for crop
productSchema.methods.isSuitableForCrop = function(cropName) {
  return this.usage.crops.some(crop => 
    crop.toLowerCase().includes(cropName.toLowerCase())
  );
};

module.exports = mongoose.model('Product', productSchema);