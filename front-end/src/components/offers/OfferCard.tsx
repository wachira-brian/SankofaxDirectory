import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Tag } from 'lucide-react';
import { Offer } from '../../types';
import Card from '../ui/Card';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const formattedDuration = () => {
    const hours = Math.floor(offer.duration / 60);
    const minutes = offer.duration % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  };

  const formatPrice = (price: number) => {
    return `${price.toFixed(3)} OMR`;
  };

  return (
    <Card className="h-full transition-transform duration-300 hover:shadow-lg hover:-translate-y-1">
      <Link to={`/booking/${offer.id}`} className="block h-full">
        <div className="relative">
          <img 
            src={offer.image || 'https://images.pexels.com/photos/3997305/pexels-photo-3997305.jpeg'} 
            alt={offer.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-md text-sm font-bold">
            {offer.discountPercentage}% OFF
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">
            {offer.category}
          </div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800">{offer.title}</h3>
          
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <Clock className="h-4 w-4 mr-1" />
            <span>{formattedDuration()}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{offer.description}</p>
          
          <div className="flex justify-between items-center">
            <div>
              <span className="text-gray-500 line-through text-sm mr-2">{formatPrice(offer.originalPrice)}</span>
              <span className="text-primary-600 font-bold text-lg">{formatPrice(offer.discountedPrice)}</span>
            </div>
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              Until {new Date(offer.validUntil).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export default OfferCard;