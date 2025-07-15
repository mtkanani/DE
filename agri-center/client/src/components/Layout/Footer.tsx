import { Link } from 'react-router-dom'
import { GiWheat } from 'react-icons/gi'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <GiWheat className="h-8 w-8 text-primary-500" />
              <span className="text-xl font-bold">AgriCenter</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your trusted partner for all agricultural needs. Quality products, 
              expert advice, and support for farming communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <FaFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <FaTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <FaInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500">
                <FaYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-gray-300 hover:text-primary-500">Products</Link></li>
              <li><Link to="/crop-advisory" className="text-gray-300 hover:text-primary-500">Crop Advisory</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-primary-500">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-primary-500">Contact</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-primary-500">Blog</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li><Link to="/products?category=seeds" className="text-gray-300 hover:text-primary-500">Seeds</Link></li>
              <li><Link to="/products?category=fertilizers" className="text-gray-300 hover:text-primary-500">Fertilizers</Link></li>
              <li><Link to="/products?category=pesticides" className="text-gray-300 hover:text-primary-500">Pesticides</Link></li>
              <li><Link to="/products?category=tools" className="text-gray-300 hover:text-primary-500">Farm Tools</Link></li>
              <li><Link to="/products?category=irrigation" className="text-gray-300 hover:text-primary-500">Irrigation</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiPhone className="h-5 w-5 text-primary-500" />
                <span className="text-gray-300">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="h-5 w-5 text-primary-500" />
                <span className="text-gray-300">support@agri-center.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <FiMapPin className="h-5 w-5 text-primary-500 mt-1" />
                <span className="text-gray-300">
                  123 Agriculture Hub, <br />
                  Green Valley, Gujarat 380001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 AgriCenter. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-primary-500 text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-primary-500 text-sm">
              Terms of Service
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-primary-500 text-sm">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer