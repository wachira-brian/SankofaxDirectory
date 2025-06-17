import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [isHealthDropdownOpen, setIsHealthDropdownOpen] = useState(false);
  const [isProfessionalDropdownOpen, setIsProfessionalDropdownOpen] = useState(false);
  const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isMobileProductsOpen, setIsMobileProductsOpen] = useState(false);
  const [isMobileEducationOpen, setIsMobileEducationOpen] = useState(false);
  const [isMobileHealthOpen, setIsMobileHealthOpen] = useState(false);
  const [isMobileProfessionalOpen, setIsMobileProfessionalOpen] = useState(false);
  const [isMobileCommunityOpen, setIsMobileCommunityOpen] = useState(false);
  const [servicesTimeout, setServicesTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [productsTimeout, setProductsTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [educationTimeout, setEducationTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [healthTimeout, setHealthTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [professionalTimeout, setProfessionalTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [communityTimeout, setCommunityTimeout] = useState<ReturnType<typeof setTimeout> | undefined>(undefined);

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const toggleMobileServices = () => setIsMobileServicesOpen(!isMobileServicesOpen);
  const toggleMobileProducts = () => setIsMobileProductsOpen(!isMobileProductsOpen);
  const toggleMobileEducation = () => setIsMobileEducationOpen(!isMobileEducationOpen);
  const toggleMobileHealth = () => setIsMobileHealthOpen(!isMobileHealthOpen);
  const toggleMobileProfessional = () => setIsMobileProfessionalOpen(!isMobileProfessionalOpen);
  const toggleMobileCommunity = () => setIsMobileCommunityOpen(!isMobileCommunityOpen);

  const categories = {
    services: [
      { name: 'Home Services', slug: 'home-services' },
      { name: 'Transportation & Logistics', slug: 'transportation-logistics' },
      { name: 'Legal Services', slug: 'legal-services' },
      { name: 'Financial Services', slug: 'financial-services' },
      { name: 'Marketing & Branding', slug: 'marketing-branding' },
      { name: 'Health & Fitness', slug: 'health-fitness' },
      { name: 'Events & Entertainment', slug: 'events-entertainment' },
      { name: 'Travel & Tourism', slug: 'travel-tourism' },
      { name: 'Repair & Maintenance', slug: 'repair-maintenance' },
    ],
    products: [
      { name: 'Fashion & Apparel', slug: 'fashion-apparel' },
      { name: 'Beauty & Skincare', slug: 'beauty-skincare' },
      { name: 'Food & Beverage', slug: 'food-beverage' },
      { name: 'Art & Decor', slug: 'art-decor' },
      { name: 'Books & Media', slug: 'books-media' },
      { name: 'African Traditional Products', slug: 'african-traditional-products' },
      { name: 'Tech & Gadgets', slug: 'tech-gadgets' },
      { name: 'Jewelry & Handmade Items', slug: 'jewelry-handmade' },
    ],
    education: [
      { name: 'Language Classes', slug: 'language-classes' },
      { name: 'Skill Workshops', slug: 'skill-workshops' },
      { name: 'Online Courses', slug: 'online-courses' },
      { name: 'Tutoring & Mentorship', slug: 'tutoring-mentorship' },
      { name: 'Cultural Education', slug: 'cultural-education' },
    ],
    health: [
      { name: 'Fitness & Yoga', slug: 'fitness-yoga' },
      { name: 'Nutrition & Diet', slug: 'nutrition-diet' },
      { name: 'Mental Health', slug: 'mental-health' },
      { name: 'Alternative Medicine', slug: 'alternative-medicine' },
      { name: 'Spa & Relaxation', slug: 'spa-relaxation' },
    ],
    professional: [
      { name: 'Graphic Design', slug: 'graphic-design' },
      { name: 'Photography', slug: 'photography' },
      { name: 'Writing & Editing', slug: 'writing-editing' },
      { name: 'IT & Software', slug: 'it-software' },
      { name: 'Consulting', slug: 'consulting' },
    ],
    community: [
      { name: 'Local Events', slug: 'local-events' },
      { name: 'Cultural Festivals', slug: 'cultural-festivals' },
      { name: 'Art Exhibitions', slug: 'art-exhibitions' },
      { name: 'Volunteer Opportunities', slug: 'volunteer-opportunities' },
      { name: 'Community Groups', slug: 'community-groups' },
    ],
  };

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseEnter = (type: 'services' | 'products' | 'education' | 'health' | 'professional' | 'community') => {
    [servicesTimeout, productsTimeout, educationTimeout, healthTimeout, professionalTimeout, communityTimeout].forEach((timeout) => {
      if (timeout) clearTimeout(timeout);
    });
    setServicesTimeout(undefined);
    setProductsTimeout(undefined);
    setEducationTimeout(undefined);
    setHealthTimeout(undefined);
    setProfessionalTimeout(undefined);
    setCommunityTimeout(undefined);

    setIsServicesDropdownOpen(type === 'services');
    setIsProductsDropdownOpen(type === 'products');
    setIsEducationDropdownOpen(type === 'education');
    setIsHealthDropdownOpen(type === 'health');
    setIsProfessionalDropdownOpen(type === 'professional');
    setIsCommunityDropdownOpen(type === 'community');
  };

  const handleMouseLeave = (type: 'services' | 'products' | 'education' | 'health' | 'professional' | 'community') => {
    const timeoutId = setTimeout(() => {
      if (type === 'services') setIsServicesDropdownOpen(false);
      if (type === 'products') setIsProductsDropdownOpen(false);
      if (type === 'education') setIsEducationDropdownOpen(false);
      if (type === 'health') setIsHealthDropdownOpen(false);
      if (type === 'professional') setIsProfessionalDropdownOpen(false);
      if (type === 'community') setIsCommunityDropdownOpen(false);
    }, 200);
    if (type === 'services') setServicesTimeout(timeoutId);
    if (type === 'products') setProductsTimeout(timeoutId);
    if (type === 'education') setEducationTimeout(timeoutId);
    if (type === 'health') setHealthTimeout(timeoutId);
    if (type === 'professional') setProfessionalTimeout(timeoutId);
    if (type === 'community') setCommunityTimeout(timeoutId);
  };

  const navbarBgClass = isHomePage
    ? isScrolled
      ? 'bg-white shadow-md transition-all duration-300'
      : 'bg-transparent transition-all duration-300'
    : 'bg-white shadow-md';

  const textColorClass = isHomePage && !isScrolled ? 'text-white' : 'text-gray-800';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  const renderDropdown = (type: keyof typeof categories, isOpen: boolean, setIsOpen: (open: boolean) => void) => (
    <div
      className="relative"
      onMouseEnter={() => handleMouseEnter(type)}
      onMouseLeave={() => handleMouseLeave(type)}
    >
      <Link
        to={`/explore?category=${type}`}
        className={`${textColorClass} hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors flex items-center`}
      >
        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
        <ChevronDown className="ml-1 h-4 w-4" />
      </Link>
      {isOpen && (
        <div
          className="absolute left-0 top-full w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
          onMouseEnter={() => handleMouseEnter(type)}
          onMouseLeave={() => handleMouseLeave(type)}
        >
          <div className="py-1">
            {categories[type].map((subcategory) => (
              <Link
                key={subcategory.slug}
                to={`/explore?category=${type}&subcategory=${subcategory.slug}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {subcategory.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMobileCategory = (type: keyof typeof categories, isOpen: boolean, toggle: () => void) => (
    <div className="block">
      <button
        onClick={toggle}
        className="w-full flex justify-between items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
      >
        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pl-6 space-y-1">
          {categories[type].map((subcategory) => (
            <Link
              key={subcategory.slug}
              to={`/explore?category=${type}&subcategory=${subcategory.slug}`}
              className="block px-3 py-2 rounded-md text-sm text-gray-600 hover:text-primary-500 hover:bg-gray-50"
              onClick={toggleMenu}
            >
              {subcategory.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <nav className={`fixed w-full z-50 ${navbarBgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Sparkles className={`h-8 w-8 ${textColorClass}`} />
              <span className={`ml-6 text-xl font-semibold ${textColorClass}`}>Sankofax</span>
            </Link>
          </div>

          <div className="hidden lg-custom:flex lg-custom:items-center space-x-4">
            <Link
              to="/explore"
              className={`${textColorClass} hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors ml-8`}
            >
              Explore
            </Link>
            <Link
              to="/contacts"
              className={`${textColorClass} hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors`}
            >
              Contacts
            </Link>
            {renderDropdown('services', isServicesDropdownOpen, setIsServicesDropdownOpen)}
            {renderDropdown('products', isProductsDropdownOpen, setIsProductsDropdownOpen)}
            {renderDropdown('education', isEducationDropdownOpen, setIsEducationDropdownOpen)}
            {renderDropdown('health', isHealthDropdownOpen, setIsHealthDropdownOpen)}
            {renderDropdown('professional', isProfessionalDropdownOpen, setIsProfessionalDropdownOpen)}
            {renderDropdown('community', isCommunityDropdownOpen, setIsCommunityDropdownOpen)}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center max-w-xs text-sm rounded-full"
                >
                  <span className="sr-only">Open user menu</span>
                  {user?.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full"
                      src={`${user.avatar}`} alt={user.name}
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ${textColorClass}`}
                    >
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <span className={`ml-2 ${textColorClass}`}>{user?.name}</span>
                </button>
                {isProfileDropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`${textColorClass} hover:text-primary-500 px-3 py-2 text-sm font-medium transition-colors`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-500 text-white hover:bg-primary-600 px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <div className="flex lg-custom:hidden items-center">
            <button
              onClick={toggleMenu}
              className={`inline-flex items-center justify-center p-2 rounded-md ${textColorClass} hover:text-primary-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500`}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`${isMenuOpen ? 'block' : 'hidden'} lg-custom:hidden bg-white shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/explore"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
            onClick={toggleMenu}
          >
            Explore
          </Link>
          <Link
            to="/contacts"
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
            onClick={toggleMenu}
          >
            Contacts
          </Link>
          {renderMobileCategory('services', isMobileServicesOpen, toggleMobileServices)}
          {renderMobileCategory('products', isMobileProductsOpen, toggleMobileProducts)}
          {renderMobileCategory('education', isMobileEducationOpen, toggleMobileEducation)}
          {renderMobileCategory('health', isMobileHealthOpen, toggleMobileHealth)}
          {renderMobileCategory('professional', isMobileProfessionalOpen, toggleMobileProfessional)}
          {renderMobileCategory('community', isMobileCommunityOpen, toggleMobileCommunity)}
          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="flex w-full items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
              >
                <LogOut className="mr-2 h-5 w-5" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-500 hover:bg-gray-50"
                onClick={toggleMenu}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium bg-primary-500 text-white hover:bg-primary-600"
                onClick={toggleMenu}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
