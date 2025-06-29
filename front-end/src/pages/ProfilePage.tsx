import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../store/authStore';
import { useProviderStore } from '../store/providerStore';
import Card, { CardHeader, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { toast } from 'react-toastify';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingSuccess = location.state?.bookingSuccess || false;

  const { user, isAuthenticated, updateUser } = useAuthStore();
  const { userProviders, fetchUserProviders, deleteProvider, setFeaturedProvider } = useProviderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const paypalRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchUserProviders();
    if (user) {
      setEditUser({ name: user.name, email: user.email, phone: user.phone || '', avatar: user.avatar || '' });
    }
  }, [isAuthenticated, user, navigate, fetchUserProviders]);

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append('name', editUser.name);
    formData.append('email', editUser.email);
    if (editUser.phone) formData.append('phone', editUser.phone);
    if (avatarFile) formData.append('avatar', avatarFile);
    try {
      await updateUser(formData);
      setIsEditing(false);
      setAvatarFile(null);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update profile.');
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (confirm('Are you sure you want to delete this provider?')) {
      try {
        await deleteProvider(id);
        toast.success('Provider deleted successfully!');
      } catch (error) {
        console.error('Error deleting provider:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to delete provider.');
      }
    }
  };

  const handleFeatureProvider = async (id: string) => {
    if (!confirm('Pay to feature this provider? (Simulated payment with PayPal)')) return;
    if (!window.paypal) {
      toast.error('PayPal SDK not loaded. Please try again.');
      return;
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '10.00', currency_code: 'USD' },
            description: `Feature Provider ${id}`,
          }],
        });
      },
      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          await setFeaturedProvider(id, true);
          toast.success('Provider featured successfully!');
        } catch (error) {
          console.error('Payment failed:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to feature provider.');
        }
      },
      onError: (err) => {
        console.error('PayPal error:', err);
        toast.error('An error occurred during payment.');
      },
    }).render(paypalRef.current);
  };

  if (!user) return null;

  const createdAt = user.createdAt ? new Date(user.createdAt) : new Date();
  if (isNaN(createdAt.getTime())) {
    createdAt.setFullYear(2025);
    createdAt.setMonth(0);
    createdAt.setDate(1);
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Profile</h1>

        {bookingSuccess && (
          <div className="mb-8 bg-green-100 text-green-800 p-4 rounded-md">
            <div className="flex items-center">
              <span className="font-medium">Booking successful!</span>
            </div>
            <p className="mt-1">Your appointment has been booked successfully.</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      <label className="cursor-pointer relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center relative">
                          {avatarFile ? (
                            <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-24 h-24 rounded-full object-cover" />
                          ) : user.avatar ? (
                            <img src={`${import.meta.env.VITE_API_URL}/uploads${user.avatar}`} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                          ) : (
                            <User className="h-12 w-12 text-primary-600" />
                          )}
                          <Upload className="h-5 w-5 text-gray-500 absolute bottom-0 right-0 bg-white rounded-full p-1" />
                        </div>
                      </label>
                    </div>
                    <Input
                      label="Name"
                      value={editUser.name}
                      onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={editUser.email}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                    <Input
                      label="Phone"
                      value={editUser.phone}
                      onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    />
                    <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      {user.avatar ? (
                        <img src={`${import.meta.env.VITE_API_URL}/uploads${user.avatar}`} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-12 w-12 text-primary-600" />
                        </div>
                      )}
                      <h3 className="mt-4 text-xl font-medium text-gray-900">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Account Information</h4>
                        <div className="border-t border-gray-200 pt-2">
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">Member since</span>
                            <span className="font-medium">{format(createdAt, 'MMM yyyy')}</span>
                          </div>
                          {user.phone && (
                            <div className="flex justify-between py-2 border-t border-gray-100">
                              <span className="text-gray-600">Phone</span>
                              <span className="font-medium">{user.phone}</span>
                            </div>
                          )}
                          <div className="flex justify-between py-2 border-t border-gray-100">
                            <span className="text-gray-600">Role</span>
                            <span className="font-medium">{user.role}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900">Your Providers</h2>
                <Button variant="outline" size="sm" onClick={() => navigate('/profile/providers/new')}>
                  <Plus className="h-4 w-4 mr-1" /> Add Provider
                </Button>
              </CardHeader>
              <CardContent>
                {userProviders.length === 0 ? (
                  <p className="text-center text-gray-600">You haven't created any providers yet.</p>
                ) : (
                  <div className="space-y-4">
                    {userProviders.map((provider) => (
                      <div key={provider.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.city}</p>
                        </div>
                        <div className="flex flex-nowrap space-x-1 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/profile/providers/edit/${provider.id}`)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleDeleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {user.role === 'admin' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleFeatureProvider(provider.id)}
                            >
                              Feature
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div ref={paypalRef} className="hidden" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <script src="https://www.paypal.com/sdk/js?client-id=your-sandbox-client-id&currency=USD" data-sdk-integration-source="integrationbuilder"></script>
    </div>
  );
};

export default ProfilePage;
