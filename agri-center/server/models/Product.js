const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  
  slug: {
    type: String,
    unique: true
  },
  
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot be more than 500 characters']
  },
  
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'seeds',
      'pesticides',
      'fertilizers',
      'herbicides',
      'fungicides',
      'insecticides',
      'growth-promoters',
      'irrigation-equipment',
      'farm-tools',
      'machinery',
      'organic-products',
      'livestock-feed',
      'soil-conditioners'
    ]
  },
  
  subCategory: {
    type: String,
    required: true
  },
  
  brand: {
    type: String,
    required: [true, 'Please add a brand name']
  },
  
  // Pricing
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0
  },
  
  discountPrice: {
    type: Number,
    min: 0
  },
  
  unit: {
    type: String,
    required: [true, 'Please add a unit'],
    enum: ['kg', 'g', 'l', 'ml', 'pieces', 'packet', 'bag', 'bottle', 'can', 'box']
  },
  
  packSize: {
    type: String,
    required: [true, 'Please add pack size']
  },
  
  // Inventory
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: 0,
    default: 0
  },
  
  lowStockAlert: {
    type: Number,
    default: 10
  },
  
  // Images
  images: [{
    public_id: String,
    url: String,
    alt: String
  }],
  
  // Product specifications
  specifications: {
    composition: String,
    activeIngredient: String,
    concentration: String,
    formulation: String,
    cropSuitability: [String],
    soilType: [String],
    season: {
      type: String,
      enum: ['kharif', 'rabi', 'zaid', 'all-season']
    }
  },
  
  // Usage instructions
  usage: {
    dosage: String,
    applicationMethod: String,
    frequency: String,
    dilutionRatio: String,
    safetyPrecautions: [String],
    storageInstructions: String
  },
  
  // Benefits and features
  benefits: [String],
  features: [String],
  
  // Videos and documents
  videos: [{
    title: String,
    url: String,
    thumbnail: String,
    type: { type: String, enum: ['youtube', 'vimeo', 'direct'] }
  }],
  
  documents: [{
    title: String,
    url: String,
    type: { type: String, enum: ['pdf', 'doc', 'image'] }
  }],
  
  // SEO and marketing
  tags: [String],
  metaTitle: String,
  metaDescription: String,
  
  // Ratings and reviews
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  
  // Product status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out-of-stock', 'discontinued'],
    default: 'active'
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Shipping and availability
  shipping: {
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    shippingClass: {
      type: String,
      enum: ['standard', 'heavy', 'fragile', 'liquid', 'hazardous']
    },
    freeShipping: { type: Boolean, default: false }
  },
  
  // Regional availability
  availableRegions: [{
    state: String,
    districts: [String]
  }],
  
  // Regulatory information
  regulatory: {
    licenseNumber: String,
    manufacturingLicense: String,
    expiryDate: Date,
    batchNumber: String,
    isOrganic: { type: Boolean, default: false },
    certifications: [String]
  },
  
  // Related products
  relatedProducts: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Product'
  }],
  
  // Analytics
  views: { type: Number, default: 0 },
  sales: { type: Number, default: 0 }
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create product slug from name
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  }
  next();
});

// Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.discountPrice && this.price) {
    return Math.round(((this.price - this.discountPrice) / this.price) * 100);
  }
  return 0;
});

// Get final price
productSchema.virtual('finalPrice').get(function() {
  return this.discountPrice || this.price;
});

// Check if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Static method to get products by category
productSchema.statics.getByCategory = function(category) {
  return this.find({ category, status: 'active' });
};

// Instance method to check low stock
productSchema.methods.isLowStock = function() {
  return this.stock <= this.lowStockAlert;
};

module.exports = mongoose.model('Product', productSchema);