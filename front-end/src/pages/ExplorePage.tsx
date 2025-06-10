import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, X } from 'lucide-react';
import { useProviderStore } from '../store/providerStore';
import OfferCard from '../components/offers/OfferCard';
import ProviderCard from '../components/providers/ProviderCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const categories = [
  'Products',
  'Services',
  'Education & Learning',
  'Health & Wellness',
  'Professional & Creative',
  'Community & Culture',
];

const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'offers' | 'providers'>('providers');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const {
    filteredProviders,
    filteredOffers,
    fetchProviders,
    fetchOffers,
    setSearchTerm,
    setSelectedCategory,
    searchTerm,
    selectedCategory,
  } = useProviderStore();

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const tabParam = searchParams.get('tab');

    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }

    if (searchParam) {
      setSearchTerm(searchParam);
    }

    if (tabParam === 'providers') {
      setActiveTab('providers');
    }
  }, [searchParams, setSelectedCategory, setSearchTerm]);

  useEffect(() => {
    fetchProviders();
    fetchOffers();
  }, [fetchProviders, fetchOffers]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    if (searchTerm) {
      params.set('search', searchTerm);
    }

    if (activeTab === 'providers') {
      params.set('tab', 'providers');
    }

    setSearchParams(params);
  }, [selectedCategory, searchTerm, activeTab, setSearchParams]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchQuery = formData.get('search') as string;
    setSearchTerm(searchQuery);
  };

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Explore {activeTab === 'offers' ? 'Special Offers' : 'Providers'}
          </h1>

          {/* Tabs */}
          <div className="flex space-x-2 bg-white p-1 rounded-lg shadow-sm">
            <button
              onClick={() => setActiveTab('offers')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'offers'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Offers
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                activeTab === 'providers'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Listings
            </button>
          </div>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
          <form onSubmit={handleSearch} className="flex-1">
            <Input
              name="search"
              type="text"
              placeholder={`Search ${activeTab === 'offers' ? 'offers' : 'providers'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="h-5 w-5 text-gray-400" />}
            />
          </form>

          <div className="flex items-center space-x-4">
            {(searchTerm || selectedCategory) && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </button>
            )}

            <Button
              onClick={toggleMobileFilter}
              variant="outline"
              className="md:hidden"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Desktop Categories Filter */}
          <div className="hidden md:block w-64 mr-8">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-800 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Categories Filter */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
              <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleMobileFilter}></div>
              <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-medium text-gray-900">Filters</h3>
                  <button onClick={toggleMobileFilter}>
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto">
                  <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          handleCategoryClick(category);
                          toggleMobileFilter();
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded-md ${
                          selectedCategory === category
                            ? 'bg-primary-100 text-primary-800 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Grid */}
          <div className="flex-1">
            {activeTab === 'offers' ? (
              <>
                {filteredOffers?.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600 mb-4">No offers found matching your search criteria.</p>
                    <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredOffers
                      ?.filter((offer) => typeof offer.price === 'number')
                      .map((offer) => (
                        <OfferCard key={offer.id} offer={offer as import('../types').Offer} />
                      ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {filteredProviders?.length === 0 ? (
                  <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                    <p className="text-gray-600 mb-4">No providers found matching your search criteria.</p>
                    <Button variant="outline" onClick={clearFilters}>Clear filters</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders?.map((provider) => (
                      <ProviderCard key={provider.id} provider={provider} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;