const mongoose = require('mongoose');

const cropAdvisorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Advisory title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Advisory content is required'],
    maxlength: [5000, 'Content cannot exceed 5000 characters']
  },
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  type: {
    type: String,
    enum: ['crop-recommendation', 'pest-control', 'fertilizer-recommendation', 'irrigation', 'harvesting', 'general', 'weather-alert'],
    required: [true, 'Advisory type is required']
  },
  category: {
    type: String,
    enum: ['Seeds', 'Pesticides', 'Fertilizers', 'Irrigation', 'Harvesting', 'General'],
    required: [true, 'Category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  crops: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    scientificName: String,
    varieties: [String]
  }],
  seasonality: {
    seasons: [{
      type: String,
      enum: ['Kharif', 'Rabi', 'Zaid', 'Year-round']
    }],
    months: [Number], // 1-12
    growthStages: [{
      type: String,
      enum: ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvesting']
    }]
  },
  location: {
    states: [String],
    districts: [String],
    climateZones: [{
      type: String,
      enum: ['tropical', 'subtropical', 'temperate', 'arid', 'semi-arid']
    }],
    soilTypes: [{
      type: String,
      enum: ['Black', 'Red', 'Alluvial', 'Clay', 'Sandy', 'Loamy', 'Other']
    }]
  },
  conditions: {
    weather: {
      temperature: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        }
      },
      humidity: {
        min: Number,
        max: Number
      },
      rainfall: {
        min: Number,
        max: Number,
        unit: {
          type: String,
          enum: ['mm', 'inches'],
          default: 'mm'
        }
      }
    },
    soil: {
      ph: {
        min: Number,
        max: Number
      },
      organicMatter: {
        min: Number,
        max: Number
      },
      nutrients: {
        nitrogen: String,
        phosphorus: String,
        potassium: String
      }
    }
  },
  recommendations: {
    products: [{
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      },
      dosage: String,
      applicationMethod: String,
      timing: String,
      frequency: String,
      notes: String
    }],
    practices: [{
      title: String,
      description: String,
      timing: String,
      benefits: [String]
    }],
    alternatives: [{
      title: String,
      description: String,
      whenToUse: String
    }]
  },
  media: {
    images: [{
      url: String,
      caption: String,
      type: {
        type: String,
        enum: ['illustration', 'photo', 'diagram', 'chart']
      }
    }],
    videos: [{
      url: String,
      title: String,
      duration: Number, // in seconds
      thumbnail: String
    }],
    documents: [{
      url: String,
      title: String,
      type: {
        type: String,
        enum: ['pdf', 'doc', 'excel']
      }
    }]
  },
  validity: {
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    isEvergreen: {
      type: Boolean,
      default: false
    }
  },
  targeting: {
    farmSize: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        enum: ['acres', 'hectares'],
        default: 'acres'
      }
    },
    experienceLevel: [{
      type: String,
      enum: ['beginner', 'intermediate', 'expert']
    }],
    farmingType: [{
      type: String,
      enum: ['organic', 'conventional', 'mixed']
    }]
  },
  sources: [{
    type: {
      type: String,
      enum: ['research-paper', 'government-guideline', 'expert-opinion', 'field-trial', 'farmer-experience']
    },
    title: String,
    author: String,
    organization: String,
    url: String,
    publishedDate: Date
  }],
  engagement: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    downloads: {
      type: Number,
      default: 0
    },
    feedback: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      isHelpful: Boolean,
      implementationResult: {
        type: String,
        enum: ['successful', 'partially-successful', 'unsuccessful', 'not-implemented']
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  language: {
    primary: {
      type: String,
      enum: ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada'],
      default: 'English'
    },
    translations: [{
      language: {
        type: String,
        enum: ['Hindi', 'Gujarati', 'Marathi', 'Tamil', 'Telugu', 'Kannada']
      },
      title: String,
      content: String,
      summary: String
    }]
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalStatus: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected'],
    default: 'draft'
  },
  notifications: {
    sent: [{
      method: {
        type: String,
        enum: ['email', 'sms', 'push', 'whatsapp']
      },
      recipients: Number,
      sentAt: Date,
      campaign: String
    }]
  }
}, {
  timestamps: true
});

// Indexes for better performance
cropAdvisorySchema.index({ type: 1, category: 1 });
cropAdvisorySchema.index({ 'crops.name': 1 });
cropAdvisorySchema.index({ 'location.states': 1 });
cropAdvisorySchema.index({ 'seasonality.seasons': 1 });
cropAdvisorySchema.index({ isActive: 1, approvalStatus: 1 });
cropAdvisorySchema.index({ isFeatured: 1, priority: 1 });
cropAdvisorySchema.index({ createdAt: -1 });

// Text search index
cropAdvisorySchema.index({
  title: 'text',
  content: 'text',
  summary: 'text',
  tags: 'text'
});

// Virtual for checking if advisory is currently valid
cropAdvisorySchema.virtual('isCurrentlyValid').get(function() {
  if (this.validity.isEvergreen) return true;
  
  const now = new Date();
  if (this.validity.endDate) {
    return this.validity.startDate <= now && this.validity.endDate >= now;
  }
  
  return this.validity.startDate <= now;
});

// Virtual for urgency score
cropAdvisorySchema.virtual('urgencyScore').get(function() {
  const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
  let score = priorityScores[this.priority] || 2;
  
  // Increase score if it's weather alert
  if (this.type === 'weather-alert') score += 2;
  
  // Increase score if it's seasonal and current season
  const currentMonth = new Date().getMonth() + 1;
  if (this.seasonality.months.includes(currentMonth)) score += 1;
  
  return score;
});

// Method to check if advisory is relevant for user
cropAdvisorySchema.methods.isRelevantForUser = function(user) {
  // Check location relevance
  if (this.location.states.length > 0 && user.profile.location.state) {
    if (!this.location.states.includes(user.profile.location.state)) {
      return false;
    }
  }
  
  // Check crop relevance
  if (this.crops.length > 0 && user.profile.crops.length > 0) {
    const userCrops = user.profile.crops.map(c => c.name.toLowerCase());
    const advisoryCrops = this.crops.map(c => c.name.toLowerCase());
    
    const hasCommonCrop = advisoryCrops.some(crop => 
      userCrops.some(userCrop => userCrop.includes(crop) || crop.includes(userCrop))
    );
    
    if (!hasCommonCrop) return false;
  }
  
  // Check soil type relevance
  if (this.location.soilTypes.length > 0 && user.profile.soilType) {
    if (!this.location.soilTypes.includes(user.profile.soilType)) {
      return false;
    }
  }
  
  // Check farm size relevance
  if (this.targeting.farmSize.min || this.targeting.farmSize.max) {
    const userFarmSize = user.profile.farmSize;
    if (userFarmSize) {
      if (this.targeting.farmSize.min && userFarmSize < this.targeting.farmSize.min) return false;
      if (this.targeting.farmSize.max && userFarmSize > this.targeting.farmSize.max) return false;
    }
  }
  
  return true;
};

// Method to add feedback
cropAdvisorySchema.methods.addFeedback = function(userId, rating, comment, isHelpful = true, implementationResult = null) {
  this.engagement.feedback.push({
    user: userId,
    rating,
    comment,
    isHelpful,
    implementationResult
  });
  
  // Update average rating and engagement stats
  if (isHelpful) this.engagement.likes += 1;
  
  return this.save();
};

// Method to increment view count
cropAdvisorySchema.methods.incrementViews = function() {
  this.engagement.views += 1;
  return this.save();
};

// Static method to get seasonal advisories
cropAdvisorySchema.statics.getSeasonalAdvisories = function(season, state = null) {
  const query = {
    isActive: true,
    approvalStatus: 'approved',
    'seasonality.seasons': season
  };
  
  if (state) {
    query['location.states'] = state;
  }
  
  return this.find(query)
    .sort({ priority: -1, urgencyScore: -1, createdAt: -1 })
    .populate('recommendations.products.product', 'name price images')
    .populate('createdBy', 'name')
    .select('-engagement.feedback');
};

// Static method to get crop-specific advisories
cropAdvisorySchema.statics.getCropAdvisories = function(cropName, limit = 10) {
  return this.find({
    isActive: true,
    approvalStatus: 'approved',
    'crops.name': new RegExp(cropName, 'i')
  })
  .sort({ priority: -1, 'engagement.views': -1 })
  .limit(limit)
  .populate('recommendations.products.product', 'name price images')
  .select('-engagement.feedback');
};

// Static method to search advisories
cropAdvisorySchema.statics.searchAdvisories = function(searchTerm, filters = {}) {
  const query = {
    $text: { $search: searchTerm },
    isActive: true,
    approvalStatus: 'approved',
    ...filters
  };
  
  return this.find(query, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, priority: -1 })
    .populate('recommendations.products.product', 'name price images');
};

// Method to generate personalized recommendations
cropAdvisorySchema.statics.getPersonalizedRecommendations = async function(user, limit = 5) {
  const userCrops = user.profile.crops.map(c => c.name);
  const userState = user.profile.location.state;
  const userSoilType = user.profile.soilType;
  const currentMonth = new Date().getMonth() + 1;
  
  const query = {
    isActive: true,
    approvalStatus: 'approved',
    $or: [
      { 'crops.name': { $in: userCrops } },
      { 'location.states': userState },
      { 'location.soilTypes': userSoilType },
      { 'seasonality.months': currentMonth }
    ]
  };
  
  return this.find(query)
    .sort({ priority: -1, urgencyScore: -1, 'engagement.views': -1 })
    .limit(limit)
    .populate('recommendations.products.product', 'name price discountPrice images')
    .select('-engagement.feedback');
};

// Method to get analytics
cropAdvisorySchema.methods.getAnalytics = function() {
  const totalFeedback = this.engagement.feedback.length;
  const avgRating = totalFeedback > 0 ? 
    this.engagement.feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback : 0;
  
  return {
    views: this.engagement.views,
    likes: this.engagement.likes,
    shares: this.engagement.shares,
    downloads: this.engagement.downloads,
    avgRating: Math.round(avgRating * 10) / 10,
    totalFeedback,
    engagementRate: this.engagement.views > 0 ? 
      (this.engagement.likes + this.engagement.shares) / this.engagement.views : 0
  };
};

module.exports = mongoose.model('CropAdvisory', cropAdvisorySchema);