import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Instagram, Twitter, Facebook } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center">
              <Sparkles className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold">sankofax</span>
            </div>
            <p className="mt-4 text-sm text-gray-300">
              Discover and connect with local providers offering special offers and services tailored to your needs. Join our community today!
            </p>
            <div className="flex mt-6 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Navigate</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/" className="text-base text-gray-300 hover:text-white">Home</Link></li>
              <li><Link to="/explore" className="text-base text-gray-300 hover:text-white">Explore</Link></li>
              <li><Link to="/signup" className="text-base text-gray-300 hover:text-white">Sign Up</Link></li>
              <li><Link to="/login" className="text-base text-gray-300 hover:text-white">Login</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Categories</h3>
            <ul className="mt-4 space-y-3">
              <li><Link to="/explore?category=services" className="text-base text-gray-300 hover:text-white">Services</Link></li>
              <li><Link to="/explore?category=products" className="text-base text-gray-300 hover:text-white">Products</Link></li>
              <li><Link to="/explore?category=education" className="text-base text-gray-300 hover:text-white">Education</Link></li>
              <li><Link to="/explore?category=health" className="text-base text-gray-300 hover:text-white">Health</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-3">
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
              <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8">
          <p className="text-base text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Sankofax. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;