import { Link } from 'react-router-dom'
import { FiShoppingCart, FiStar, FiTruck, FiShield } from 'react-icons/fi'
import { GiPlantSeed, GiChemicalDrop, GiFarmTractor } from 'react-icons/gi'

const Home = () => {
  const features = [
    {
      icon: <FiShoppingCart className="h-8 w-8" />,
      title: "Easy Shopping",
      description: "Browse and buy agricultural products with just a few clicks"
    },
    {
      icon: <FiTruck className="h-8 w-8" />,
      title: "Fast Delivery",
      description: "Quick delivery to your farm, ensuring fresh products reach you on time"
    },
    {
      icon: <FiShield className="h-8 w-8" />,
      title: "Quality Assured",
      description: "All products are verified for quality and authenticity"
    },
    {
      icon: <FiStar className="h-8 w-8" />,
      title: "Expert Advice",
      description: "Get crop advisory and farming tips from agricultural experts"
    }
  ]

  const categories = [
    {
      icon: <GiPlantSeed className="h-12 w-12" />,
      title: "Seeds",
      description: "High-quality seeds for all seasons",
      link: "/products?category=seeds"
    },
    {
      icon: <GiChemicalDrop className="h-12 w-12" />,
      title: "Fertilizers",
      description: "Organic and chemical fertilizers",
      link: "/products?category=fertilizers"
    },
    {
      icon: <GiFarmTractor className="h-12 w-12" />,
      title: "Equipment",
      description: "Modern farming tools and machinery",
      link: "/products?category=equipment"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to AgriCenter
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Your one-stop destination for all agricultural needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/crop-advisory"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Get Crop Advice
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AgriCenter?
            </h2>
            <p className="text-lg text-gray-600">
              We provide the best agricultural solutions for modern farmers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-primary-600 mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find everything you need for successful farming
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center group"
              >
                <div className="text-primary-600 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Agricultural Journey?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of farmers who trust AgriCenter for their farming needs
          </p>
          <Link
            to="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home