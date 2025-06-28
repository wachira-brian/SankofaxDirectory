import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import { Provider } from '../../store/providerStore';
import Card from '../ui/Card';

// Fallback image URL (replace with your actual fallback image path)
const FALLBACK_IMAGE = 'https://eoimages.gsfc.nasa.gov/images/imagerecords/153000/153803/ISS069-E-37411-37415_lrg.jpg';

interface ProviderCardProps {
  provider: Provider;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider }) => {
  // Use the first image if available, otherwise use fallback
  const imageSrc = provider.images && provider.images.length > 0 ? provider.images[0] : FALLBACK_IMAGE;

  return (
    <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/provider/${provider.id}`} className="block h-full">
        <div className="relative">
          <img 
            src={imageSrc} 
            alt={provider.name}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE; // Fallback on error
            }}
          />
          {provider.diasporaTag && (
            <span className="absolute top-2 left-2 bg-primary-100 text-primary-600 text-xs font-medium px-2 py-1 rounded">
              {provider.diasporaTag}
            </span>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-1 text-gray-800">{provider.name}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-2">
            <MapPin className="h-4 w-4 mr-1 text-gray-400" />
            <span>{provider.city}</span>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400" fill="currentColor" />
              <span className="ml-1 text-sm font-medium">{provider.rating || 'N/A'}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{provider.reviewCount || 0} reviews</span>
          </div>
          
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{provider.description || 'No description available'}</p>
          
          <div 
            className="text-sm text-primary-600 font-medium hover:text-primary-800 transition-colors cursor-pointer"
          >
            View Listing details →
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default ProviderCard;
