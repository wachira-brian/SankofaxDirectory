import React, { useEffect, useState, ChangeEvent } from 'react';
import { useAdminStore } from '../store/adminStore';
import { Provider, Offer } from '../store/providerStore';
import { Search, X, Filter, Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card, { CardHeader, CardContent } from '../components/ui/Card';

const categories = [
  'Products',
  'Services',
  'Education & Learning',
  'Health & Wellness',
  'Professional & Creative',
  'Community & Culture',
];

const subcategories: Record<string, string[]> = {
  Products: [
    'Fashion & Apparel',
    'Beauty & Skincare',
    'Food & Beverage',
    'Art & Decor',
    'Books & Media',
    'African Traditional Products',
    'Tech & Gadgets',
    'Jewelry & Handmade Items',
  ],
  Services: [
    'Home Services',
    'Transportation & Logistics',
    'Legal Services',
    'Financial Services',
    'Marketing & Branding',
    'Health & Fitness',
    'Events & Entertainment',
    'Travel & Tourism',
    'Repair & Maintenance',
  ],
  'Education & Learning': [
    'Online Courses & Training',
    'Tutors & Coaching',
    'Schools & Institutions',
    'Workshops & Seminars',
    'Language Learning',
    'Youth Development Programs',
    'Study Abroad Programs',
    'Cultural & Heritage Education',
  ],
  'Health & Wellness': [
    'Holistic & Traditional Healing',
    'Clinics & Health Professionals',
    'Herbal Products & Remedies',
    'Mental Health Services',
    'Maternity & Birth',
    'Fitness Centers',
    'Spiritual Guidance / Faith-Based Services',
    'Nutritionists & Wellness Coaches',
  ],
  'Professional & Creative': [
    'Graphic & Web Design',
    'Content Creators / Influencers',
    'Writers & Editors',
    'IT & Developers',
    'Consultants',
    'Photographers & Videographers',
    'Architects & Engineers',
    'Virtual Assistants / Admin',
  ],
  'Community & Culture': [
    'Nonprofits & NGOs',
    'Cultural Centers',
    'Diaspora Groups',
    'Youth Programs',
    "Women's Networks",
    'Pan-African Forums',
    'Podcasts & Media Channels',
    'Churches / Faith Communities',
  ],
};

const timeSlots = [
  'Closed',
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00',
];

const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const dayMap: Record<string, string> = {
  mon: 'monday',
  tue: 'tuesday',
  wed: 'wednesday',
  thu: 'thursday',
  fri: 'friday',
  sat: 'saturday',
  sun: 'sunday',
};

const AdminPage: React.FC = () => {
  const {
    providers,
    offers,
    userCount,
    admins,
    fetchProviders,
    fetchOffers,
    fetchUserCount,
    fetchAdmins,
    createProvider,
    updateProvider,
    deleteProvider,
    createOffer,
    updateOffer,
    deleteOffer,
    setFeaturedProvider,
  } = useAdminStore();

  const [showProviderForm, setShowProviderForm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [providerForm, setProviderForm] = useState<Partial<Provider>>({});
  const [providerId, setProviderId] = useState('');
  const [offerForm, setOfferForm] = useState<Partial<Offer>>({});
  const [offerId, setOfferId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [openingHours, setOpeningHours] = useState<Record<string, { open: string; close: string }>>({
    monday: { open: 'Closed', close: 'Closed' },
    tuesday: { open: 'Closed', close: 'Closed' },
    wednesday: { open: 'Closed', close: 'Closed' },
    thursday: { open: 'Closed', close: 'Closed' },
    friday: { open: 'Closed', close: 'Closed' },
    saturday: { open: 'Closed', close: 'Closed' },
    sunday: { open: 'Closed', close: 'Closed' },
  });

  useEffect(() => {
    fetchProviders();
    fetchOffers();
    fetchUserCount();
    fetchAdmins();
  }, [fetchProviders, fetchOffers, fetchUserCount, fetchAdmins]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImageFiles([...imageFiles, ...files]);
  };

  const handleRemoveImage = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      setImageFiles(imageFiles.filter((_, i) => i !== index));
    }
  };

  const handleOpeningHoursChange = (day: string, type: 'open' | 'close', value: string) => {
    const fullDay = dayMap[day];
    setOpeningHours((prev) => ({
      ...prev,
      [fullDay]: { ...prev[fullDay], [type]: value },
    }));
  };

  const generateProviderId = () => {
    const maxId = providers.reduce((max, p) => {
      const match = p.id.match(/^provider(\d+)$/);
      if (match) {
        return Math.max(max, parseInt(match[1]));
      }
      return max;
    }, 0);
    return `provider${maxId + 1}`;
  };

  const handleProviderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append('images', file));
      formData.append('existingImages', JSON.stringify(existingImages));
      formData.append('username', providerForm.username || '');
      formData.append('name', providerForm.name || '');
      formData.append('city', providerForm.city || '');
      formData.append('zip_code', providerForm.zip_code || '');
      formData.append('phone', providerForm.phone || '');
      formData.append('email', providerForm.email || '');
      formData.append('website', providerForm.website || '');
      formData.append('description', providerForm.description || '');
      formData.append('category', providerForm.category || '');
      formData.append('subcategory', providerForm.subcategory || '');
      formData.append('opening_hours', JSON.stringify(openingHours));
      formData.append('location', providerForm.location || '');
      formData.append('address', providerForm.address || '');
      if (!providerId) {
        formData.append('id', generateProviderId());
      }

      if (providerId) {
        await updateProvider(providerId, formData);
      } else {
        await createProvider(formData);
      }
      setProviderForm({});
      setProviderId('');
      setImageFiles([]);
      setExistingImages([]);
      setOpeningHours({
        monday: { open: 'Closed', close: 'Closed' },
        tuesday: { open: 'Closed', close: 'Closed' },
        wednesday: { open: 'Closed', close: 'Closed' },
        thursday: { open: 'Closed', close: 'Closed' },
        friday: { open: 'Closed', close: 'Closed' },
        saturday: { open: 'Closed', close: 'Closed' },
        sunday: { open: 'Closed', close: 'Closed' },
      });
      setShowProviderForm(false);
      fetchProviders();
    } catch (error) {
      console.error('Error submitting provider:', error);
    }
  };

  const handleEditProvider = (provider: Provider) => {
    setProviderId(provider.id);
    setProviderForm({
      ...provider,
      location: provider.location || '',
      address: provider.address || '',
      zip_code: provider.zip_code || '',
    });
    setOpeningHours(provider.opening_hours || {
      monday: { open: 'Closed', close: 'Closed' },
      tuesday: { open: 'Closed', close: 'Closed' },
      wednesday: { open: 'Closed', close: 'Closed' },
      thursday: { open: 'Closed', close: 'Closed' },
      friday: { open: 'Closed', close: 'Closed' },
      saturday: { open: 'Closed', close: 'Closed' },
      sunday: { open: 'Closed', close: 'Closed' },
    });
    setExistingImages(provider.images || []);
    setImageFiles([]);
    setShowProviderForm(true);
  };

  const handleDeleteProvider = async (id: string) => {
    try {
      await deleteProvider(id);
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
    }
  };

  const handleSetFeatured = async (id: string, featured: boolean) => {
    try {
      await setFeaturedProvider(id, featured);
      fetchProviders();
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (offerId) {
        await updateOffer(offerId, offerForm);
      } else {
        await createOffer({ ...offerForm, id: crypto.randomUUID() });
      }
      setOfferForm({});
      setOfferId('');
      setShowOfferForm(false);
      fetchOffers();
    } catch (error) {
      console.error('Error submitting offer:', error);
    }
  };

  const handleEditOffer = (offer: Offer) => {
    setOfferId(offer.id);
    setOfferForm({
      ...offer,
      providerId: offer.providerId || '',
      name: offer.name || '',
      price: offer.price || 0,
      originalPrice: offer.originalPrice || 0,
      discountedPrice: offer.discountedPrice || 0,
      duration: offer.duration || 0,
      category: offer.category || '',
      subcategory: offer.subcategory || '',
    });
    setShowOfferForm(true);
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      await deleteOffer(id);
      fetchOffers();
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSearchTerm(formData.get('search') as string);
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
  };

  const filteredProviders = providers.filter(
    (p) =>
      (!selectedCategory || p.category === selectedCategory) &&
      (!searchTerm ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false))
  );

  const filteredOffers = offers.filter(
    (o) =>
      (!selectedCategory || o.category === selectedCategory) &&
      (!searchTerm ||
        o.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.description && o.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary-600">{userCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Admin Users</h3>
            </CardHeader>
            <CardContent>
              {admins.length === 0 ? (
                <p className="text-gray-600">No admin users found.</p>
              ) : (
                <ul className="space-y-2">
                  {admins.map((admin) => (
                    <li key={admin.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{admin.name}</p>
                        <p className="text-sm text-gray-600">{admin.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Manage Providers</h2>
              <Button onClick={() => {
                setShowProviderForm(!showProviderForm);
                setProviderForm({});
                setProviderId('');
                setImageFiles([]);
                setExistingImages([]);
                setOpeningHours({
                  monday: { open: 'Closed', close: 'Closed' },
                  tuesday: { open: 'Closed', close: 'Closed' },
                  wednesday: { open: 'Closed', close: 'Closed' },
                  thursday: { open: 'Closed', close: 'Closed' },
                  friday: { open: 'Closed', close: 'Closed' },
                  saturday: { open: 'Closed', close: 'Closed' },
                  sunday: { open: 'Closed', close: 'Closed' },
                });
              }}>
                <Plus className="h-5 w-5 mr-2" />
                {showProviderForm ? 'Cancel' : 'Add Provider'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showProviderForm && (
              <form onSubmit={handleProviderSubmit} className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
                <Input
                  label="Username"
                  value={providerForm.username || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, username: e.target.value })}
                  required
                />
                <Input
                  label="Name"
                  value={providerForm.name || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                  required
                />
                <Input
                  label="City"
                  value={providerForm.city || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, city: e.target.value })}
                  required
                />
                <Input
                  label="Zip Code"
                  value={providerForm.zip_code || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, zip_code: e.target.value })}
                />
                <Input
                  label="Phone"
                  value={providerForm.phone || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                />
                <Input
                  label="Email"
                  type="email"
                  value={providerForm.email || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                />
                <Input
                  label="Website"
                  value={providerForm.website || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, website: e.target.value })}
                />
                <Input
                  label="Description"
                  value={providerForm.description || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, description: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="border rounded-md p-2 w-full"
                  />
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {existingImages.map((img, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={`${import.meta.env.VITE_API_URL}${img}`}
                          alt="Existing"
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index, true)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {imageFiles.map((file, index) => (
                      <div key={`new-${index}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Preview"
                          className="w-full h-24 object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center space-x-2 mb-2">
                      <span className="w-16 capitalize">{day}</span>
                      <select
                        value={openingHours[dayMap[day]].open}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="border rounded-md p-2 flex-1"
                      >
                        {timeSlots.map((time) => (
                          <option key={`${day}-open-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                      <span>to</span>
                      <select
                        value={openingHours[dayMap[day]].close}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="border rounded-md p-2 flex-1"
                      >
                        {timeSlots.map((time) => (
                          <option key={`${day}-close-${time}`} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={providerForm.category || ''}
                    onChange={(e) => setProviderForm({ ...providerForm, category: e.target.value, subcategory: subcategories[e.target.value]?.[0] || '' })}
                    className="border rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    value={providerForm.subcategory || ''}
                    onChange={(e) => setProviderForm({ ...providerForm, subcategory: e.target.value })}
                    className="border rounded-md p-2 w-full"
                    disabled={!providerForm.category}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {providerForm.category &&
                      subcategories[providerForm.category]?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                  </select>
                </div>
                <Input
                  label="Location (Google Maps Link)"
                  value={providerForm.location || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, location: e.target.value })}
                />
                <Input
                  label="Address"
                  value={providerForm.address || ''}
                  onChange={(e) => setProviderForm({ ...providerForm, address: e.target.value })}
                />
                <div className="flex space-x-4">
                  <Button type="submit">{providerId ? 'Update' : 'Create'} Provider</Button>
                  <Button variant="outline" onClick={() => {
                    setShowProviderForm(false);
                    setProviderForm({});
                    setProviderId('');
                    setImageFiles([]);
                    setExistingImages([]);
                  }}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1">
                <Input
                  name="search"
                  type="text"
                  placeholder="Search providers..."
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
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  variant="outline"
                  className="md:hidden"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {isMobileFilterOpen && (
              <div className="fixed inset-0 z-40 md:hidden">
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFilterOpen(false)}></div>
                <div className="absolute right-0 top-0 h-full w-3/4 max-w-xs bg-white shadow-xl flex flex-col">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-medium text-gray-900">Filters</h3>
                    <button onClick={() => setIsMobileFilterOpen(false)}>
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
                            setIsMobileFilterOpen(false);
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

            <div className="flex flex-col md:flex-row">
              <div className="hidden md:block w-64 mr-8">
                <Card>
                  <CardHeader>
                    <h3 className="font-medium text-gray-900">Categories</h3>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1">
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredProviders.length === 0 ? (
                      <p className="text-gray-600">No providers found.</p>
                    ) : (
                      filteredProviders.map((provider) => (
                        <div key={provider.id} className="border p-4 rounded-md">
                          <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.city}</p>
                          <p className="text-sm text-gray-600">{provider.category} - {provider.subcategory}</p>
                          {provider.description && (
                            <p className="text-sm text-gray-600 mt-1">{provider.description}</p>
                          )}
                          <div className="flex space-x-2 mt-2">
                            <Button
                              variant="outline"
                              onClick={() => handleEditProvider(provider)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteProvider(provider.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant={provider.isFeatured ? 'primary' : 'outline'}
                              onClick={() => handleSetFeatured(provider.id, !provider.isFeatured)}
                            >
                              {provider.isFeatured ? 'Unfeature' : 'Feature'}
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">Manage Offers</h2>
              <Button onClick={() => {
                setShowOfferForm(!showOfferForm);
                setOfferForm({});
                setOfferId('');
              }}>
                <Plus className="h-5 w-5 mr-2" />
                {showOfferForm ? 'Cancel' : 'Add Offer'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showOfferForm && (
              <form onSubmit={handleOfferSubmit} className="space-y-4 mb-6 p-4 border rounded-md bg-gray-50">
                <Input
                  label="Offer ID (for update/delete)"
                  value={offerId}
                  onChange={(e) => setOfferId(e.target.value)}
                />
                <Input
                  label="Provider ID"
                  value={offerForm.providerId || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, providerId: e.target.value })}
                  required
                />
                <Input
                  label="Name"
                  value={offerForm.name || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, name: e.target.value })}
                  required
                />
                <Input
                  label="Price"
                  type="number"
                  value={offerForm.price || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, price: parseFloat(e.target.value) })}
                />
                <Input
                  label="Original Price"
                  type="number"
                  value={offerForm.originalPrice || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, originalPrice: parseFloat(e.target.value) })}
                />
                <Input
                  label="Discounted Price"
                  type="number"
                  value={offerForm.discountedPrice || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, discountedPrice: parseFloat(e.target.value) })}
                />
                <Input
                  label="Duration"
                  type="number"
                  value={offerForm.duration || ''}
                  onChange={(e) => setOfferForm({ ...offerForm, duration: parseInt(e.target.value) })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={offerForm.category || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, category: e.target.value, subcategory: subcategories[e.target.value]?.[0] || '' })}
                    className="border rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    value={offerForm.subcategory || ''}
                    onChange={(e) => setOfferForm({ ...offerForm, subcategory: e.target.value })}
                    className="border rounded-md p-2 w-full"
                    disabled={!offerForm.category}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {offerForm.category &&
                      subcategories[offerForm.category]?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                  </select>
                </div>
                <div className="flex space-x-4">
                  <Button type="submit">{offerId ? 'Update' : 'Create'} Offer</Button>
                  <Button variant="outline" onClick={() => {
                    setShowOfferForm(false);
                    setOfferForm({});
                    setOfferId('');
                  }}>Cancel</Button>
                </div>
              </form>
            )}

            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1">
                <Input
                  name="search"
                  type="text"
                  placeholder="Search offers..."
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
                  onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                  variant="outline"
                  className="md:hidden"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              <div className="hidden md:block w-64 mr-8">
                <Card>
                  <CardHeader>
                    <h3 className="font-medium text-gray-900">Categories</h3>
                  </CardHeader>
                  <CardContent>
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
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1">
                <div className="max-h-[600px] overflow-y-auto">
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOffers.length === 0 ? (
                      <p className="text-gray-600">No offers found.</p>
                    ) : (
                      filteredOffers.map((offer) => (
                        <div key={offer.id} className="border p-4 rounded-md flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div className="mb-2 sm:mb-0">
                            <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
                            <p className="text-sm text-gray-600">{offer.category} - {offer.subcategory}</p>
                            {offer.description && (
                              <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              onClick={() => handleEditOffer(offer)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleDeleteOffer(offer.id)}
                            >
                              Delete
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setOfferId('');
                                setOfferForm({});
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
