const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  product: {
    type: mongoose.Schema.ObjectId,
    ref: 'Product',
    required: true
  },
  
  order: {
    type: mongoose.Schema.ObjectId,
    ref: 'Order',
    required: true
  },
  
  rating: {
    type: Number,
    required: [true, 'Please add a rating'],
    min: 1,
    max: 5
  },
  
  title: {
    type: String,
    required: [true, 'Please add a review title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  
  // Review categories
  aspects: {
    quality: { type: Number, min: 1, max: 5 },
    effectiveness: { type: Number, min: 1, max: 5 },
    packaging: { type: Number, min: 1, max: 5 },
    valueForMoney: { type: Number, min: 1, max: 5 },
    delivery: { type: Number, min: 1, max: 5 }
  },
  
  // Review images
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  
  // Review status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Moderation
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  
  moderatedAt: Date,
  
  moderationNotes: String,
  
  // Helpfulness tracking
  helpful: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 }
  },
  
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['yes', 'no']
    }
  }],
  
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  
  // Response from seller/admin
  response: {
    content: String,
    respondedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  
  // Reporting
  reported: {
    type: Boolean,
    default: false
  },
  
  reports: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      enum: ['spam', 'inappropriate', 'fake', 'offensive', 'other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }]
  
}, {
  timestamps: true
});

// Compound index to ensure one review per user per product per order
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

// Index for efficient queries
reviewSchema.index({ product: 1, status: 1, rating: -1 });
reviewSchema.index({ user: 1, status: 1 });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const total = this.helpful.yes + this.helpful.no;
  if (total === 0) return 0;
  return (this.helpful.yes / total) * 100;
});

// Static method to calculate product rating
reviewSchema.statics.calculateProductRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { 
        product: mongoose.Types.ObjectId(productId),
        status: 'approved'
      }
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);
  
  if (stats.length > 0) {
    const result = stats[0];
    
    // Calculate rating distribution
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result.ratingDistribution.forEach(rating => {
      distribution[rating]++;
    });
    
    return {
      average: Math.round(result.averageRating * 10) / 10,
      count: result.totalReviews,
      distribution
    };
  }
  
  return { average: 0, count: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
};

// Instance method to check if user can modify review
reviewSchema.methods.canModify = function(userId) {
  return this.user.toString() === userId.toString() && 
         this.status === 'pending';
};

// Instance method to mark as helpful
reviewSchema.methods.markHelpful = async function(userId, vote) {
  // Remove existing vote
  this.helpfulVotes = this.helpfulVotes.filter(
    v => v.user.toString() !== userId.toString()
  );
  
  // Add new vote
  this.helpfulVotes.push({ user: userId, vote });
  
  // Recalculate helpful counts
  this.helpful.yes = this.helpfulVotes.filter(v => v.vote === 'yes').length;
  this.helpful.no = this.helpfulVotes.filter(v => v.vote === 'no').length;
  
  return this.save();
};

module.exports = mongoose.model('Review', reviewSchema);