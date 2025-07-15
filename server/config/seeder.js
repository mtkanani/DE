const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const CropAdvisory = require('../models/CropAdvisory');
const Coupon = require('../models/Coupon');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/agri-center';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🍃 MongoDB Connected for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample Users Data
const users = [
  {
    name: "Rajesh Kumar",
    email: "rajesh@example.com",
    password: "password123",
    phone: "9876543210",
    isAdmin: false,
    profile: {
      farmSize: 5,
      location: {
        state: "Punjab",
        district: "Ludhiana",
        village: "Khanna",
        pincode: "141401"
      },
      crops: [
        { name: "Wheat", area: 3, season: "Rabi" },
        { name: "Rice", area: 2, season: "Kharif" }
      ],
      soilType: "Alluvial",
      languagePreference: "Hindi"
    },
    isVerified: true
  },
  {
    name: "Priya Patel",
    email: "priya@example.com",
    password: "password123",
    phone: "9876543211",
    isAdmin: false,
    profile: {
      farmSize: 3,
      location: {
        state: "Gujarat",
        district: "Ahmedabad",
        village: "Sanand",
        pincode: "382110"
      },
      crops: [
        { name: "Cotton", area: 2, season: "Kharif" },
        { name: "Groundnut", area: 1, season: "Kharif" }
      ],
      soilType: "Black",
      languagePreference: "Gujarati"
    },
    isVerified: true
  },
  {
    name: "Admin User",
    email: "admin@agricenter.com",
    password: "admin123456",
    phone: "9999999999",
    isAdmin: true,
    profile: {
      languagePreference: "English"
    },
    isVerified: true
  }
];

// Sample Products Data
const products = [
  {
    name: "Premium Wheat Seeds (HD-2967)",
    description: "High-yielding wheat variety suitable for irrigated conditions. Disease resistant with excellent grain quality.",
    shortDescription: "High-yielding wheat seeds for better harvest",
    category: "Seeds",
    subcategory: "Wheat Seeds",
    brand: "Indo-US Seeds",
    price: 850,
    discountPrice: 750,
    stock: 100,
    unit: "kg",
    weight: { value: 50, unit: "kg" },
    images: [
      {
        url: "/images/wheat-seeds.jpg",
        alt: "Premium Wheat Seeds",
        isPrimary: true
      }
    ],
    specifications: {
      composition: ["High quality wheat seeds"],
      manufacturer: "Indo-US Seeds Pvt Ltd",
      batchNumber: "WS2024001"
    },
    usage: {
      crops: ["Wheat"],
      dosage: "50-60 kg per acre",
      applicationMethod: "Direct sowing",
      frequency: "Once per season",
      precautions: ["Store in dry place", "Use within 2 years"],
      benefits: ["High yield", "Disease resistant", "Good grain quality"]
    },
    tags: ["wheat", "seeds", "high-yield", "disease-resistant"],
    isOrganic: false,
    isFeatured: true,
    seasonality: {
      bestSeasons: ["Rabi"],
      climateZones: ["subtropical", "temperate"]
    },
    faqs: [
      {
        question: "What is the best time to sow these seeds?",
        answer: "Best sowing time is November to December for Rabi season."
      }
    ]
  },
  {
    name: "Neem-based Organic Pesticide",
    description: "100% organic neem-based pesticide effective against various pests. Safe for beneficial insects and environment.",
    shortDescription: "Organic neem pesticide for pest control",
    category: "Pesticides",
    subcategory: "Organic Pesticides",
    brand: "BioNeem",
    price: 420,
    discountPrice: 380,
    stock: 75,
    unit: "ltr",
    weight: { value: 1, unit: "ltr" },
    images: [
      {
        url: "/images/neem-pesticide.jpg",
        alt: "Neem Organic Pesticide",
        isPrimary: true
      }
    ],
    specifications: {
      composition: ["Neem extract 1500 ppm"],
      activeIngredient: "Azadirachtin",
      concentration: "1500 ppm",
      formulation: "Emulsifiable Concentrate",
      manufacturer: "BioNeem Industries"
    },
    usage: {
      crops: ["Cotton", "Rice", "Vegetables", "Fruits"],
      dosage: "2-3 ml per liter of water",
      applicationMethod: "Foliar spray",
      frequency: "7-10 days interval",
      precautions: ["Avoid during flowering", "Use protective equipment"],
      benefits: ["Organic", "Safe for environment", "Systemic action"]
    },
    tags: ["neem", "organic", "pesticide", "eco-friendly"],
    isOrganic: true,
    isFeatured: true,
    seasonality: {
      bestSeasons: ["Kharif", "Rabi", "Year-round"]
    }
  },
  {
    name: "NPK 19:19:19 Water Soluble Fertilizer",
    description: "Balanced water-soluble fertilizer with equal amounts of Nitrogen, Phosphorus, and Potassium for all crops.",
    shortDescription: "Balanced NPK fertilizer for healthy plant growth",
    category: "Fertilizers",
    subcategory: "NPK Fertilizers",
    brand: "Yara",
    price: 650,
    stock: 200,
    unit: "kg",
    weight: { value: 25, unit: "kg" },
    images: [
      {
        url: "/images/npk-fertilizer.jpg",
        alt: "NPK 19:19:19 Fertilizer",
        isPrimary: true
      }
    ],
    specifications: {
      composition: ["Nitrogen 19%", "Phosphorus 19%", "Potassium 19%"],
      formulation: "Water Soluble Powder",
      manufacturer: "Yara International"
    },
    usage: {
      crops: ["All crops"],
      dosage: "2-3 kg per acre in 200L water",
      applicationMethod: "Foliar spray or drip irrigation",
      frequency: "15-20 days interval",
      benefits: ["Quick absorption", "Balanced nutrition", "Increases yield"]
    },
    tags: ["npk", "fertilizer", "water-soluble", "balanced"],
    isOrganic: false,
    isFeatured: false,
    seasonality: {
      bestSeasons: ["Kharif", "Rabi", "Year-round"]
    }
  },
  {
    name: "1 HP Submersible Water Pump",
    description: "Heavy-duty 1 HP submersible pump suitable for agricultural irrigation. High efficiency and long-lasting.",
    shortDescription: "1 HP submersible pump for irrigation",
    category: "Pumps",
    subcategory: "Submersible Pumps",
    brand: "Kirloskar",
    price: 12500,
    discountPrice: 11500,
    stock: 25,
    unit: "piece",
    images: [
      {
        url: "/images/submersible-pump.jpg",
        alt: "1 HP Submersible Pump",
        isPrimary: true
      }
    ],
    specifications: {
      manufacturer: "Kirloskar Brothers Limited",
      powerRating: "1 HP",
      voltage: "220V Single Phase",
      headRange: "25-45 meters",
      dischargeRange: "1800-3600 LPH"
    },
    usage: {
      crops: ["All crops requiring irrigation"],
      benefits: ["High efficiency", "Corrosion resistant", "Low maintenance"]
    },
    tags: ["pump", "irrigation", "submersible", "1hp"],
    isOrganic: false,
    isFeatured: true,
    shipping: {
      weight: 15,
      shippingClass: "heavy"
    }
  },
  {
    name: "Solar Powered Sprinkler System",
    description: "Eco-friendly solar-powered sprinkler system for efficient water distribution. Covers up to 2 acres.",
    shortDescription: "Solar sprinkler system for water-efficient irrigation",
    category: "Machinery",
    subcategory: "Irrigation Equipment",
    brand: "SolarAgri",
    price: 25000,
    discountPrice: 22000,
    stock: 15,
    unit: "piece",
    images: [
      {
        url: "/images/solar-sprinkler.jpg",
        alt: "Solar Sprinkler System",
        isPrimary: true
      }
    ],
    specifications: {
      manufacturer: "SolarAgri Technologies",
      powerSource: "Solar Panel (100W)",
      coverage: "2 acres",
      waterPressure: "2-4 bar"
    },
    usage: {
      crops: ["Vegetables", "Fruits", "Field crops"],
      benefits: ["Solar powered", "Water efficient", "Automated", "Eco-friendly"]
    },
    tags: ["solar", "sprinkler", "irrigation", "eco-friendly"],
    isOrganic: false,
    isFeatured: true,
    shipping: {
      shippingClass: "heavy"
    }
  }
];

// Sample Crop Advisories
const advisories = [
  {
    title: "Wheat Sowing Guidelines for Rabi Season 2024",
    content: "Optimal sowing time for wheat in North India is from November 15 to December 15. Ensure soil moisture and proper seed bed preparation for better germination.",
    summary: "Best practices for wheat sowing in Rabi season",
    type: "crop-recommendation",
    category: "Seeds",
    priority: "high",
    crops: [
      { name: "Wheat", scientificName: "Triticum aestivum" }
    ],
    seasonality: {
      seasons: ["Rabi"],
      months: [11, 12],
      growthStages: ["sowing"]
    },
    location: {
      states: ["Punjab", "Haryana", "Uttar Pradesh", "Rajasthan"],
      climateZones: ["subtropical", "temperate"],
      soilTypes: ["Alluvial", "Loamy"]
    },
    recommendations: {
      practices: [
        {
          title: "Soil Preparation",
          description: "Deep ploughing followed by 2-3 cross harrowings",
          timing: "2 weeks before sowing",
          benefits: ["Better root development", "Improved water retention"]
        }
      ]
    },
    language: {
      primary: "English",
      translations: [
        {
          language: "Hindi",
          title: "रबी सीजन 2024 के लिए गेहूं बुवाई दिशानिर्देश",
          summary: "रबी सीजन में गेहूं की बुवाई के लिए सर्वोत्तम प्रथाएं"
        }
      ]
    },
    tags: ["wheat", "sowing", "rabi", "guidelines"],
    isActive: true,
    isFeatured: true,
    approvalStatus: "approved",
    createdBy: null // Will be set to admin user ID
  },
  {
    title: "Pest Management in Cotton Crops",
    content: "Integrated pest management approach for cotton crops including bollworm control, aphid management, and beneficial insect conservation.",
    summary: "Comprehensive pest control strategies for cotton farming",
    type: "pest-control",
    category: "Pesticides",
    priority: "high",
    crops: [
      { name: "Cotton", scientificName: "Gossypium hirsutum" }
    ],
    seasonality: {
      seasons: ["Kharif"],
      months: [6, 7, 8, 9],
      growthStages: ["vegetative", "flowering", "fruiting"]
    },
    location: {
      states: ["Gujarat", "Maharashtra", "Andhra Pradesh", "Karnataka"],
      climateZones: ["tropical", "subtropical"],
      soilTypes: ["Black", "Red"]
    },
    recommendations: {
      practices: [
        {
          title: "Monitoring",
          description: "Regular field monitoring for early pest detection",
          timing: "Weekly during growing season",
          benefits: ["Early intervention", "Reduced pesticide use"]
        }
      ]
    },
    tags: ["cotton", "pest-control", "ipm", "bollworm"],
    isActive: true,
    isFeatured: true,
    approvalStatus: "approved",
    createdBy: null
  }
];

// Sample Coupons
const coupons = [
  {
    code: "WELCOME10",
    name: "Welcome Discount",
    description: "10% discount for new farmers",
    type: "percentage",
    value: 10,
    maxDiscount: 500,
    minOrderValue: 1000,
    usageLimit: {
      total: 1000,
      perUser: 1
    },
    validity: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    },
    applicability: {
      userTypes: ["new"],
      categories: ["Seeds", "Fertilizers", "Pesticides"]
    },
    conditions: {
      firstTimeUser: true
    },
    isActive: true,
    marketing: {
      displayOnHomepage: true,
      priority: 1
    },
    createdBy: null
  },
  {
    code: "KHARIF25",
    name: "Kharif Season Special",
    description: "25% off on Kharif season products",
    type: "percentage",
    value: 25,
    maxDiscount: 1000,
    minOrderValue: 2000,
    usageLimit: {
      total: 500,
      perUser: 2
    },
    validity: {
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
    },
    applicability: {
      userTypes: ["all"],
      seasons: ["Kharif"]
    },
    conditions: {
      seasonal: {
        season: "Kharif",
        months: [6, 7, 8, 9]
      }
    },
    isActive: true,
    marketing: {
      displayOnHomepage: true,
      priority: 2
    },
    createdBy: null
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await CropAdvisory.deleteMany({});
    await Coupon.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`👥 Created ${createdUsers.length} users`);

    // Find admin user
    const adminUser = createdUsers.find(user => user.isAdmin);

    // Create products
    const createdProducts = await Product.insertMany(products);
    console.log(`📦 Created ${createdProducts.length} products`);

    // Update advisories and coupons with admin user ID
    const advisoriesWithCreator = advisories.map(advisory => ({
      ...advisory,
      createdBy: adminUser._id
    }));

    const couponsWithCreator = coupons.map(coupon => ({
      ...coupon,
      createdBy: adminUser._id
    }));

    // Create crop advisories
    const createdAdvisories = await CropAdvisory.insertMany(advisoriesWithCreator);
    console.log(`🌾 Created ${createdAdvisories.length} crop advisories`);

    // Create coupons
    const createdCoupons = await Coupon.insertMany(couponsWithCreator);
    console.log(`🎫 Created ${createdCoupons.length} coupons`);

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📋 Sample Data Created:');
    console.log(`   • Users: ${createdUsers.length} (including 1 admin)`);
    console.log(`   • Products: ${createdProducts.length}`);
    console.log(`   • Crop Advisories: ${createdAdvisories.length}`);
    console.log(`   • Coupons: ${createdCoupons.length}`);
    
    console.log('\n👤 Sample Login Credentials:');
    console.log('   📧 Farmer: rajesh@example.com | 🔑 password123');
    console.log('   📧 Admin: admin@agricenter.com | 🔑 admin123456');
    
    console.log('\n🌐 You can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Check if script is run directly
if (require.main === module) {
  connectDB().then(() => {
    seedDatabase();
  });
}

module.exports = { seedDatabase, connectDB };