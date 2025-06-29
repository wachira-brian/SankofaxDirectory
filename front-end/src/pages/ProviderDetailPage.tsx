import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapPin, Phone, Mail, Globe, Clock, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProviderStore } from '../store/providerStore';
import OfferCard from '../components/offers/OfferCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

// Fallback image URL
const FALLBACK_IMAGE = '/assets/fallback-image.jpg';

const ProviderDetailPage: React.FC = () => {
  const { providerId } = useParams<{ providerId: string }>();
  const { getProviderById, getOffersByProviderId, fetchProviders, fetchOffers } = useProviderStore();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProviders();
    fetchOffers();
  }, [fetchProviders, fetchOffers]);
  
  const provider = getProviderById(providerId || '');
  const providerOffers = getOffersByProviderId(providerId || '');
  
  if (!provider) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
          <Link to="/explore">
            <Button variant="outline">Back to Explore</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Normalize images to ensure valid paths
  const images = Array.isArray(provider.images) && provider.images.length > 0 
    ? provider.images.map(img => img.startsWith('/Uploads') ? `${import.meta.env.VITE_API_URL}${img}` : `${import.meta.env.VITE_API_URL}/Uploads${img}`)
    : [FALLBACK_IMAGE];

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };
  
  // Format opening hours with error handling
  const formattedOpeningHours = (() => {
    try {
      const openingHours = provider.openingHours || {};
      return Object.entries(openingHours).map(([day, hours]) => ({
        day: day.charAt(0).toUpperCase() + day.slice(1),
        hours: `${hours.open || 'Closed'} - ${hours.close || 'Closed'}`
      }));
    } catch (error) {
      console.error('Error formatting opening hours:', error);
      return [];
    }
  })();

  // Parse location for map coordinates
  const parseLocation = (location: string | undefined): [number, number] | null => {
    if (!location) return null;
    const [lat, lng] = location.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) return null;
    return [lat, lng];
  };

  const mapCoordinates = parseLocation(provider.location);

  // Enhanced address formatting
  const getFormattedAddress = () => {
    if (provider.address) {
      return provider.address;
    } else if (provider.location) {
      const urlMatch = provider.location.match(/@(-?\d+\.\d+),(-?\d+\.\d+),(\d+\.?\d*)z\/data=(.*)/);
      if (urlMatch && urlMatch[4]) {
        return decodeURIComponent(urlMatch[4].replace(/\+/g, ' '));
      }
      return provider.location;
    }
    return 'Address not available';
  };

  // Geocode address for map
  const [geocodedCoordinates, setGeocodedCoordinates] = useState<[number, number] | null>(null);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    const geocodeAddress = async () => {
      const address = getFormattedAddress();
      if (!address || address === 'Address not available') {
        setGeocodedCoordinates(null);
        return;
      }

      setLoadingMap(true);
      setMapError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch geocoding data');
        }
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          setGeocodedCoordinates([parseFloat(lat), parseFloat(lon)]);
        } else {
          setGeocodedCoordinates(null);
          setMapError('Could not geocode address.');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        setGeocodedCoordinates(null);
        setMapError('Error fetching map data.');
        toast.error('Failed to load map location.');
      } finally {
        setLoadingMap(false);
      }
    };

    geocodeAddress();
  }, [provider.address, provider.location]);

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/explore" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Explore
        </Link>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          {/* Image Gallery */}
          <div className="relative h-96">
            <img 
              src={images[currentImageIndex]} 
              alt={provider.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
            
            {images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-white"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                  {images.map((_, index) => (
                    <button 
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`h-2 w-2 rounded-full ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Provider Info */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div className="md:w-2/3 md:pr-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{provider.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-400" fill="currentColor" />
                    <span className="ml-1 font-medium">{provider.rating || 'N/A'}</span>
                  </div>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-gray-600">{provider.reviewCount || 0} reviews</span>
                </div>
                
                <p className="text-gray-700 mb-6">{provider.description || 'No description available'}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Address</h4>
                      <p className="text-gray-600">
                        {provider.location && provider.location.includes('http') ? (
                          <a
                            href={provider.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {getFormattedAddress()}
                          </a>
                        ) : (
                          getFormattedAddress()
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Phone</h4>
                      <p className="text-gray-600">
                        {provider.phone ? (
                          <a
                            href={`tel:${provider.phone}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {provider.phone}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600">
                        {provider.email ? (
                          <a
                            href={`mailto:${provider.email}`}
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {provider.email}
                          </a>
                        ) : (
                          'N/A'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {provider.website && (
                    <div className="flex items-start">
                      <Globe className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900">Website</h4>
                        <a 
                          href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-800"
                        >
                          {provider.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/3 mt-6 md:mt-0">
                <Card>
                  <div className="p-4">
                    <div className="flex items-start mb-4">
                      <Clock className="h-5 w-5 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Opening Hours</h4>
                        <ul className="space-y-1">
                          {formattedOpeningHours.length > 0 ? (
                            formattedOpeningHours.map(({ day, hours }) => (
                              <li key={day} className="flex justify-between text-sm">
                                <span className="font-medium text-gray-700">{day}</span>
                                <span className="text-gray-600">{hours}</span>
                              </li>
                            ))
                          ) : (
                            <li className="text-sm text-gray-600">No opening hours available</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        {/* Community Connection */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Community Connection</h2>
          <p className="text-gray-600">
            {provider.communityNote || `Connect with ${provider.name}, a provider rooted in the diaspora community, offering services that celebrate diversity and cultural heritage. Join our network to engage with similar businesses.`}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/community')}>
            Join Our Community
          </Button>
        </div>
        
        {/* Location Map */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
          </div>
          <div className="h-96">
            {loadingMap ? (
              <div className="h-full flex items-center justify-center text-gray-600">
                Loading map...
              </div>
            ) : geocodedCoordinates || mapCoordinates ? (
              <MapContainer 
                center={geocodedCoordinates || mapCoordinates || [0, 0]} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={geocodedCoordinates || mapCoordinates || [0, 0]}>
                  <Popup>
                    <div className="p-2">
                      <h3 className="font-medium">{provider.name}</h3>
                      <p className="text-sm">
                        {provider.location && provider.location.includes('http') ? (
                          <a
                            href={provider.location}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800"
                          >
                            {getFormattedAddress()}
                          </a>
                        ) : (
                          getFormattedAddress()
                        )}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-600">
                {mapError || 'Location data not available for mapping.'}
              </div>
            )}
          </div>
        </div>
        
        {/* Provider Offers */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Special Offers</h2>
            
            {providerOffers.length === 0 ? (
              <p className="text-gray-600">No special offers available at the moment.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {providerOffers.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/explore">
            <Button variant="primary">Discover More Listings</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderDetailPage;
