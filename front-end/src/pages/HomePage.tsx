import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Calendar, CreditCard } from 'lucide-react';
import { useProviderStore } from '../store/providerStore';
import Button from '../components/ui/Button';
import ProviderCard from '../components/providers/ProviderCard';

const HomePage: React.FC = () => {
  const {
    providers,
    fetchProviders,
  } = useProviderStore();

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  // Get featured providers (first 3 providers)
  const featuredProviders = providers.slice(0, 3);

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background Image */}
      <section className="relative h-screen overflow-hidden"> {/* Added overflow-hidden to constrain image */}
        <div className="absolute inset-0">
          <motion.img 
            src="directory_background.png" 
            alt="Provider services"
            className="w-full h-full object-cover"
            initial={{ scale: 1 }}
            animate={{ 
              scale: 1.5, // Zoom to 1.5x for a noticeable effect
            }}
            transition={{ 
              duration: 10, // Slower zoom over 10 seconds
              ease: "linear", // Linear for smooth continuous motion
              repeat: Infinity, // Infinite loop
              repeatType: "loop", // Reset to initial scale after each cycle
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight">
              Built For Discovery,<br /> 
              <span className="text-primary-400">Diversity,</span> & Diaspora Connection
            </h1>
            <p className="mt-4 text-xl text-gray-200 max-w-2xl mx-auto">
              Find the best Listing deals, book appointments, and experience premium services.
            </p>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/explore">
                <Button size="lg" variant="primary">
                  Explore Offers
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="lg" variant="outline" className="bg-white">
                  Sign Up
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">How Sankofax Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Simple steps to find Listings of your next service
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Discover</h3>
              <p className="text-gray-600">
                Browse exclusive offers from top-rated Listings in your area and explore.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Book</h3>
              <p className="text-gray-600">
                Select your preferred date and time for your appointment at the comfort of your home.
              </p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-lg shadow-md text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-6">
                <CreditCard className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy</h3>
              <p className="text-gray-600">
                Pay online or in person, and enjoy premium services with savings.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Featured Listings</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Exclusive deals from our top-rated Listings
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProviders.map((provider) => (
              <motion.div
                key={provider.id}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <ProviderCard provider={provider} />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link to="/explore">
              <Button variant="outline">
                View All Listings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Discover Your Next Experience?
          </h2>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto mb-8">
            Sign up now to unlock exclusive deals and book your favorite services.
          </p>
          <Link to="/signup">
            <Button variant="secondary" size="lg">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
