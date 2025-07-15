const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Helper function for validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/products
// @desc    Get products with filtering, search, and pagination
// @access  Public
router.get('/', 
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1-50'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be positive'),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be positive'),
    query('category').optional().isIn(['Seeds', 'Pesticides', 'Fertilizers', 'Pumps', 'Tools', 'Machinery', 'Organic']),
    query('sortBy').optional().isIn(['price', 'rating', 'popularity', 'newest', 'name']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  handleValidationErrors,
  optionalAuth,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        category,
        subcategory,
        brand,
        minPrice,
        maxPrice,
        isOrganic,
        isFeatured,
        crop,
        season,
        sortBy = 'popularity',
        sortOrder = 'desc',
        state,
        inStock = true
      } = req.query;

      // Build query
      const query = { isActive: true };

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Category filter
      if (category) query.category = category;
      if (subcategory) query.subcategory = subcategory;
      if (brand) query.brand = new RegExp(brand, 'i');

      // Price range
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = parseFloat(minPrice);
        if (maxPrice) query.price.$lte = parseFloat(maxPrice);
      }

      // Boolean filters
      if (isOrganic === 'true') query.isOrganic = true;
      if (isFeatured === 'true') query.isFeatured = true;
      if (inStock === 'true') query.stock = { $gt: 0 };

      // Crop filter
      if (crop) {
        query['usage.crops'] = new RegExp(crop, 'i');
      }

      // Season filter
      if (season) {
        query['seasonality.bestSeasons'] = season;
      }

      // Sorting
      let sortOptions = {};
      switch (sortBy) {
        case 'price':
          sortOptions.price = sortOrder === 'asc' ? 1 : -1;
          break;
        case 'rating':
          sortOptions['ratings.average'] = -1;
          break;
        case 'popularity':
          sortOptions['analytics.purchases'] = -1;
          sortOptions['ratings.average'] = -1;
          break;
        case 'newest':
          sortOptions.createdAt = -1;
          break;
        case 'name':
          sortOptions.name = sortOrder === 'asc' ? 1 : -1;
          break;
        default:
          sortOptions['analytics.purchases'] = -1;
      }

      // Add text score sorting if search query
      if (search) {
        sortOptions = { score: { $meta: 'textScore' }, ...sortOptions };
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const products = await Product.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('name description shortDescription category brand price discountPrice images ratings stock unit isOrganic isFeatured seo.slug analytics.purchases');

      // Get total count for pagination
      const total = await Product.countDocuments(query);

      // Get filter options for UI
      const filterOptions = await Product.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            categories: { $addToSet: '$category' },
            brands: { $addToSet: '$brand' },
            priceRange: {
              $push: {
                min: { $min: '$price' },
                max: { $max: '$price' }
              }
            }
          }
        }
      ]);

      // Track view analytics for user if authenticated
      if (req.user) {
        // Track user's product viewing behavior for recommendations
        // This can be implemented later with a separate analytics collection
      }

      res.json({
        success: true,
        data: {
          products,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            totalProducts: total,
            hasNext: skip + parseInt(limit) < total,
            hasPrev: parseInt(page) > 1
          },
          filters: filterOptions[0] || { categories: [], brands: [], priceRange: [] },
          appliedFilters: {
            search, category, subcategory, brand, minPrice, maxPrice,
            isOrganic, crop, season, sortBy, sortOrder
          }
        }
      });

    } catch (error) {
      console.error('Products fetch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch products'
      });
    }
  }
);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const { limit = 8, category } = req.query;
    
    const query = { 
      isActive: true, 
      isFeatured: true,
      stock: { $gt: 0 }
    };
    
    if (category) query.category = category;

    const products = await Product.find(query)
      .sort({ 'ratings.average': -1, 'analytics.purchases': -1 })
      .limit(parseInt(limit))
      .select('name price discountPrice images ratings category seo.slug');

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products'
    });
  }
});

// @route   GET /api/products/categories
// @desc    Get product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          featuredCount: {
            $sum: { $cond: ['$isFeatured', 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Category icons mapping
    const categoryIcons = {
      'Seeds': '🌱',
      'Pesticides': '🧴', 
      'Fertilizers': '🌿',
      'Pumps': '🚿',
      'Tools': '🔧',
      'Machinery': '🚜',
      'Organic': '🌾'
    };

    const categoriesWithIcons = categories.map(cat => ({
      ...cat,
      icon: categoryIcons[cat._id] || '📦',
      name: cat._id
    }));

    res.json({
      success: true,
      data: { categories: categoriesWithIcons }
    });

  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
});

// @route   GET /api/products/search-suggestions
// @desc    Get search suggestions
// @access  Public
router.get('/search-suggestions', 
  [query('q').isLength({ min: 2 }).withMessage('Query must be at least 2 characters')],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { q } = req.query;

      // Get product name suggestions
      const productSuggestions = await Product.find({
        isActive: true,
        name: new RegExp(q, 'i')
      })
      .limit(5)
      .select('name category seo.slug');

      // Get brand suggestions
      const brandSuggestions = await Product.distinct('brand', {
        isActive: true,
        brand: new RegExp(q, 'i')
      }).limit(3);

      // Get category suggestions
      const categorySuggestions = await Product.distinct('category', {
        isActive: true,
        category: new RegExp(q, 'i')
      });

      res.json({
        success: true,
        data: {
          products: productSuggestions,
          brands: brandSuggestions,
          categories: categorySuggestions,
          query: q
        }
      });

    } catch (error) {
      console.error('Search suggestions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch search suggestions'
      });
    }
  }
);

// @route   GET /api/products/:id
// @desc    Get single product details
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('relatedProducts', 'name price discountPrice images ratings seo.slug')
      .populate('reviews.user', 'name profile.avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (!product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not available'
      });
    }

    // Increment view count
    await product.incrementViews();

    // Get similar products if no related products
    let similarProducts = product.relatedProducts;
    if (similarProducts.length === 0) {
      similarProducts = await product.getSimilarProducts(4);
    }

    // Check if user has purchased this product (for verified reviews)
    let hasPurchased = false;
    if (req.user) {
      const Order = require('../models/Order');
      const userOrder = await Order.findOne({
        user: req.user._id,
        'products.product': product._id,
        status: 'delivered'
      });
      hasPurchased = !!userOrder;
    }

    // Get crop suitability if user has crops in profile
    let cropSuitability = null;
    if (req.user && req.user.profile.crops.length > 0) {
      const userCrops = req.user.profile.crops.map(c => c.name);
      cropSuitability = userCrops.filter(crop => 
        product.isSuitableForCrop(crop)
      );
    }

    res.json({
      success: true,
      data: {
        product,
        similarProducts,
        userContext: req.user ? {
          hasPurchased,
          cropSuitability,
          canReview: hasPurchased
        } : null
      }
    });

  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product details'
    });
  }
});

// @route   POST /api/products/:id/review
// @desc    Add product review
// @access  Private
router.post('/:id/review',
  authenticateToken,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1-5'),
    body('comment').optional().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { rating, comment, images = [] } = req.body;

      const product = await Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user has purchased this product
      const Order = require('../models/Order');
      const userOrder = await Order.findOne({
        user: req.user._id,
        'products.product': product._id,
        status: 'delivered'
      });

      if (!userOrder) {
        return res.status(400).json({
          success: false,
          message: 'You can only review products you have purchased'
        });
      }

      await product.addReview(req.user._id, rating, comment, images);

      res.json({
        success: true,
        message: 'Review added successfully'
      });

    } catch (error) {
      console.error('Add review error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add review'
      });
    }
  }
);

// @route   POST /api/products
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/',
  authenticateToken,
  requireAdmin,
  [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('category').isIn(['Seeds', 'Pesticides', 'Fertilizers', 'Pumps', 'Tools', 'Machinery', 'Organic']),
    body('brand').trim().isLength({ min: 1 }).withMessage('Brand is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be positive'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be non-negative'),
    body('unit').isIn(['kg', 'gm', 'ltr', 'ml', 'packet', 'piece', 'bag', 'bottle'])
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const productData = req.body;

      // Set default images if not provided
      if (!productData.images || productData.images.length === 0) {
        productData.images = [
          {
            url: '/images/default-product.jpg',
            alt: productData.name,
            isPrimary: true
          }
        ];
      }

      const product = new Product(productData);
      await product.save();

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: { product }
      });

    } catch (error) {
      console.error('Product creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create product'
      });
    }
  }
);

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.json({
        success: true,
        message: 'Product updated successfully',
        data: { product }
      });

    } catch (error) {
      console.error('Product update error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update product'
      });
    }
  }
);

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Soft delete - mark as inactive instead of removing
      product.isActive = false;
      await product.save();

      res.json({
        success: true,
        message: 'Product deleted successfully'
      });

    } catch (error) {
      console.error('Product deletion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete product'
      });
    }
  }
);

// @route   GET /api/products/:id/recommendations
// @desc    Get personalized product recommendations
// @access  Private
router.get('/:id/recommendations', authenticateToken, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get recommendations based on user's crop profile
    const userCrops = req.user.profile.crops.map(c => c.name);
    const recommendations = await Product.find({
      isActive: true,
      _id: { $ne: product._id },
      $or: [
        { 'usage.crops': { $in: userCrops } },
        { category: product.category },
        { brand: product.brand }
      ]
    })
    .sort({ 'ratings.average': -1 })
    .limit(6)
    .select('name price discountPrice images ratings category seo.slug');

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recommendations'
    });
  }
});

module.exports = router;