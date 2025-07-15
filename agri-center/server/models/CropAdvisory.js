const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  
  content: {
    type: String,
    required: [true, 'Please add content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'crop-recommendation',
      'pest-management',
      'soil-health',
      'weather-advisory',
      'irrigation-tips',
      'fertilizer-advice',
      'harvesting-tips',
      'post-harvest',
      'market-prices',
      'government-schemes'
    ]
  },
  
  // Target audience
  targetCrops: [String],
  
  season: {
    type: String,
    enum: ['kharif', 'rabi', 'zaid', 'all-season'],
    required: true
  },
  
  // Location-based targeting
  targetRegions: [{
    state: String,
    districts: [String]
  }],
  
  soilTypes: [{
    type: String,
    enum: ['black', 'red', 'alluvial', 'laterite', 'sandy', 'clay', 'loamy']
  }],
  
  // Advisory details
  recommendations: [{
    type: String,
    required: true
  }],
  
  products: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product'
    },
    dosage: String,
    applicationMethod: String,
    timing: String
  }],
  
  // Weather conditions
  weatherConditions: {
    temperature: {
      min: Number,
      max: Number
    },
    humidity: {
      min: Number,
      max: Number
    },
    rainfall: String,
    conditions: [String]
  },
  
  // Timing information
  validFrom: {
    type: Date,
    required: true
  },
  
  validUntil: {
    type: Date,
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Status and publication
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Engagement metrics
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  
  // Media attachments
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  
  videos: [{
    title: String,
    url: String,
    thumbnail: String,
    duration: Number
  }],
  
  // Tags for better searchability
  tags: [String],
  
  // Language support
  language: {
    type: String,
    enum: ['english', 'hindi', 'gujarati', 'marathi', 'tamil', 'telugu', 'kannada', 'punjabi'],
    default: 'english'
  },
  
  // Notification settings
  sendNotification: {
    type: Boolean,
    default: false
  },
  
  notificationSent: {
    type: Boolean,
    default: false
  },
  
  sentAt: Date
  
}, {
  timestamps: true
});

// Index for efficient queries
cropAdvisorySchema.index({ season: 1, category: 1, status: 1 });
cropAdvisorySchema.index({ validFrom: 1, validUntil: 1 });
cropAdvisorySchema.index({ 'targetRegions.state': 1 });

// Virtual for checking if advisory is currently valid
cropAdvisorySchema.virtual('isValid').get(function() {
  const now = new Date();
  return now >= this.validFrom && now <= this.validUntil;
});

// Static method to get current advisories for a region
cropAdvisorySchema.statics.getCurrentAdvisories = function(state, district, crops = []) {
  const now = new Date();
  
  const query = {
    status: 'published',
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { 'targetRegions.state': state },
      { 'targetRegions': { $size: 0 } } // Global advisories
    ]
  };
  
  if (district) {
    query.$or[0]['targetRegions.districts'] = district;
  }
  
  if (crops.length > 0) {
    query.$or.push({ targetCrops: { $in: crops } });
  }
  
  return this.find(query).sort({ priority: -1, createdAt: -1 });
};

// Instance method to check if user should receive this advisory
cropAdvisorySchema.methods.isRelevantForUser = function(user) {
  // Check location match
  if (this.targetRegions.length > 0) {
    const userState = user.farmDetails?.location?.state;
    const userDistrict = user.farmDetails?.location?.district;
    
    const regionMatch = this.targetRegions.some(region => {
      if (region.state !== userState) return false;
      if (region.districts.length === 0) return true;
      return region.districts.includes(userDistrict);
    });
    
    if (!regionMatch) return false;
  }
  
  // Check crop match
  if (this.targetCrops.length > 0) {
    const userCrops = user.farmDetails?.primaryCrops || [];
    const cropMatch = this.targetCrops.some(crop => 
      userCrops.includes(crop)
    );
    
    if (!cropMatch) return false;
  }
  
  // Check soil type match
  if (this.soilTypes.length > 0) {
    const userSoilType = user.farmDetails?.soilType;
    if (!this.soilTypes.includes(userSoilType)) return false;
  }
  
  return true;
};

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);