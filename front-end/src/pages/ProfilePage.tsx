import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "../stores/auth";
import { useProviderStore } from "../stores/provider";
import Card from "../components/Card";
import { CardHeader, CardContent from "../components/CardContent";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "react-toastify";

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingSuccess = location.state?.bookingSuccess || false;

  const { user, isAuthenticated, updateUser } = useAuth();
  const {
    providers,
    fetchProviders,
    createProvider,
    updateProvider,
    deleteProvider,
    setFeaturedProvider,
  } = useProviderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editUser, setEditUser] = useState({ name: "", email: "", phone: "", avatar: "" });
  const [newProvider, setNewProvider] = useState({
    id: "",
    name: "",
    username: "",
    description: "",
    email: "",
    phone: "",
    city: "",
    zip_code: "",
    address: "",
    location: "",
    opening_hours: "",
    category: "Products",
    subcategory: "Fashion & Apparel",
    website: [],
    images: [],
  });
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [editProvider, setEditProvider] = useState({
    id: "",
    name: "",
    username: "",
    description: "",
    email: "",
    phone: "",
    city: "",
    zip_code: "",
    address: "",
    location: "",
    opening_hours: "",
    category: "Products",
    subcategory: "Fashion & Apparel",
    website: "",
    images: [],
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [editImages, setEditImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const paypalRef = useRef(null);

  // Category and Subcategory Mapping from SankofaX Directory Structure
  const categorySubcategories = {
    Products: [
      "Fashion & Apparel",
      "Beauty & Skincare",
      "Food & Beverage",
      "Art & Decor",
      "Books & Media",
      "African Traditional Products",
      "Tech & Gadgets",
      "Jewelry & Handmade Items",
    ],
    Services: [
      "Home Services",
      "Transportation & Logistics",
      "Legal Services",
      "Financial Services",
      "Marketing & Branding",
      "Health & Fitness",
      "Events & Entertainment",
      "Travel & Tourism",
      "Repair & Maintenance",
    ],
    "Education & Learning": [
      "Online Courses & Training",
      "Tutors & Coaching",
      "Schools & Institutions",
      "Workshops & Seminars",
      "Language Learning",
      "Youth Development Programs",
      "Study Abroad Programs",
      "Cultural & Heritage Education",
    ],
    "Health & Wellness": [
      "Holistic & Traditional Healing",
      "Clinics & Health Professionals",
      "Herbal Products & Remedies",
      "Mental Health Services",
      "Maternity & Birth",
      "Fitness Centers",
      "Spiritual Guidance / Faith-Based Services",
      "Nutritionists & Wellness Coaches",
    ],
    "Professional & Creative": [
      "Graphic & Web Design",
      "Content Creators / Influencers",
      "Writers & Editors",
      "IT & Developers",
      "Consultants",
      "Photographers & Videographers",
      "Architects & Engineers",
      "Virtual Assistants / Admin",
    ],
    "Community & Culture": [
      "Nonprofits & NGOs",
      "Cultural Centers",
      "Diaspora Groups",
      "Youth Programs",
      "Women's Networks",
      "Pan-African Forums",
      "Podcasts & Media Channels",
      "Churches / Faith Communities",
    ],
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchProviders();
    if (user) {
      setEditUser({ name: user.name, email: user.email, phone: user.phone || "", avatar: user.avatar || "" });
    }
  }, [isAuthenticated, user, navigate, fetchProviders]);

  const handleSaveProfile = async () => {
    const formData = new FormData();
    formData.append("name", editUser.name);
    formData.append("email", editUser.email);
    if (editUser.phone) formData.append("phone", editUser.phone);
    if (avatarFile) formData.append("avatar", avatarFile);
    try {
      await updateUser(formData);
      setIsEditing(false);
      setAvatarFile(null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile.");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const files = Array.from(e.target.files || []);
    if (isEdit) {
      setEditImages([...editImages, ...files]);
    } else {
      setNewImages([...newImages, ...files]);
    }
  };

  const handleRemoveImage = (index: number, isEdit: boolean, isExisting: boolean = false) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else if (isEdit) {
      setEditImages(editImages.filter((_, i) => i !== index));
    } else {
      setNewImages(newImages.filter((_, i) => i !== index));
    }
  };

  const handleCreateProvider = async () => {
    const formData = new FormData();
    formData.append("id", crypto.randomUUID());
    Object.entries(newProvider).forEach(([key, value]) => {
      if (value && key !== "images") {
        formData.append(key, value);
      }
    });
    newImages.forEach((image) => formData.append("images", image));
    try {
      await createProvider(formData);
      setNewProvider({
        id: "",
        name: "",
        username: "",
        description: "",
        email: "",
        phone: "",
        city: "",
        zip_code: "",
        address: "",
        location: "",
        opening_hours: "",
        category: "Products",
        subcategory: "Fashion & Apparel",
        website: "",
        images: [],
      });
      setNewImages([]);
      toast.success("Provider created successfully!");
    } catch (error) {
      toast.error("Failed to create provider.");
    }
  };

  const handleEditProvider = async () => {
    if (!selectedProviderId) return;
    const formData = new FormData();
    Object.entries(editProvider).forEach(([key, value]) => {
      if (value && key !== "images") {
        formData.append(key, value);
      }
    });
    editImages.forEach((image) => formData.append("images", image));
    formData.append("existingImages", JSON.stringify(existingImages));
    try {
      await updateProvider(selectedProviderId, formData);
      setSelectedProviderId(null);
      setEditImages([]);
      setExistingImages([]);
      toast.success("Provider updated successfully!");
    } catch (error) {
      toast.error("Failed to update provider.");
    }
  };

  const handleDeleteProvider = async (id: string) => {
    if (confirm("Are you sure you want to delete this provider?")) {
      try {
        await deleteProvider(id);
        toast.success("Provider deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete provider.");
      }
    }
  };

  const handleFeatureProvider = async (id: string) => {
    if (!confirm("Pay to feature this provider? (Simulated payment with PayPal)")) return;
    if (!window.paypal) {
      toast.error("PayPal SDK not loaded. Please try again.");
      return;
    }
    window.paypal.Buttons({
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: { value: "10.00", currency_code: "USD" },
            description: `Feature Provider ${id}`,
          }],
        });
      },
      onApprove: async (data, actions) => {
        try {
          const order = await actions.order.capture();
          await setFeaturedProvider(id, true);
          toast.success("Provider featured successfully!");
        } catch (error) {
          console.error("Payment failed:", error);
          toast.error("Failed to feature provider.");
        }
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        toast.error("An error occurred during payment.");
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
                  {isEditing ? "Cancel" : "Edit Profile"}
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
                            <img src={`${import.meta.env.VITE_API_URL}${user.avatar}`} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
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
                        <img src={`${user.avatar}`} alt={user.name} className="w-24 h-24 rounded-full object-cover" />
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
                            <span className="font-medium">{format(createdAt, "MMM yyyy")}</span>
                          </div>
                          {user.phone && (
                            <div className="flex justify-between py-2 border-t border-gray-100">
                              <span className="text-gray-600">Phone</span>
                              <span className="font-medium">{user.phone}</span>
                            </div>
                          )}
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
                <Button variant="outline" size="sm" onClick={() => setSelectedProviderId("new")}>
                  <Plus className="h-4 w-4 mr-1" /> Add Provider
                </Button>
              </CardHeader>
              <CardContent>
                {providers.length === 0 ? (
                  <p className="text-center text-gray-600">You haven't created any providers yet.</p>
                ) : (
                  <div className="space-y-4">
                    {providers.map((provider) => (
                      <div key={provider.id} className="border border-gray-200 rounded-md p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{provider.name}</h3>
                          <p className="text-sm text-gray-600">{provider.city}</p>
                        </div>
                        <div className="flex flex-nowrap space-x-1 sm:space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedProviderId(provider.id);
                              setEditProvider({
                                ...provider,
                                description: provider.description || "",
                                email: provider.email || "",
                                phone: provider.phone || "",
                                zip_code: provider.zip_code || "",
                                location: provider.location || "",
                                opening_hours: provider.opening_hours ? JSON.stringify(provider.opening_hours) : "",
                                website: provider.website || "",
                                subcategory: provider.subcategory || categorySubcategories[provider.category]?.[0] || "",
                              });
                              setExistingImages(provider.images || []);
                              setEditImages([]);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProvider(provider.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleFeatureProvider(provider.id)}
                          >
                            Feature
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedProviderId && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {selectedProviderId === "new" ? "Add New Provider" : "Edit Provider"}
                    </h3>
                    <div className="space-y-4">
                      <Input
                        label="Name"
                        placeholder="Provider Name"
                        value={selectedProviderId === "new" ? newProvider.name : editProvider.name}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, name: e.target.value })
                            : setEditProvider({ ...editProvider, name: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Username"
                        placeholder="Unique username"
                        value={selectedProviderId === "new" ? newProvider.username : editProvider.username}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, username: e.target.value })
                            : setEditProvider({ ...editProvider, username: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Description"
                        placeholder="Provider description"
                        value={selectedProviderId === "new" ? newProvider.description : editProvider.description}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, description: e.target.value })
                            : setEditProvider({ ...editProvider, description: e.target.value })
                        }
                      />
                      <Input
                        label="Email"
                        type="email"
                        placeholder="Provider contact email"
                        value={selectedProviderId === "new" ? newProvider.email : editProvider.email}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, email: e.target.value })
                            : setEditProvider({ ...editProvider, email: e.target.value })
                        }
                      />
                      <Input
                        label="Phone"
                        placeholder="Provider contact phone"
                        value={selectedProviderId === "new" ? newProvider.phone : editProvider.phone}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, phone: e.target.value })
                            : setEditProvider({ ...editProvider, phone: e.target.value })
                        }
                      />
                      <Input
                        label="City"
                        placeholder="City"
                        value={selectedProviderId === "new" ? newProvider.city : editProvider.city}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, city: e.target.value })
                            : setEditProvider({ ...editProvider, city: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Zip Code"
                        placeholder="Zip or postal code"
                        value={selectedProviderId === "new" ? newProvider.zip_code : editProvider.zip_code}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, zip_code: e.target.value })
                            : setEditProvider({ ...editProvider, zip_code: e.target.value })
                        }
                      />
                      <Input
                        label="Address"
                        placeholder="Full address"
                        value={selectedProviderId === "new" ? newProvider.address : editProvider.address}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, address: e.target.value })
                            : setEditProvider({ ...editProvider, address: e.target.value })
                        }
                        required
                      />
                      <Input
                        label="Location"
                        placeholder="Location details (e.g., neighborhood, landmarks)"
                        value={selectedProviderId === "new" ? newProvider.location : editProvider.location}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, location: e.target.value })
                            : setEditProvider({ ...editProvider, location: e.target.value })
                        }
                      />
                      <Input
                        label="Opening Hours"
                        placeholder='JSON format, e.g., {"monday": "9AM-5PM", "tuesday": "9AM-5PM"}'
                        value={selectedProviderId === "new" ? newProvider.opening_hours : editProvider.opening_hours}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, opening_hours: e.target.value })
                            : setEditProvider({ ...editProvider, opening_hours: e.target.value })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                          value={selectedProviderId === "new" ? newProvider.category : editProvider.category}
                          onChange={(e) => {
                            const newCategory = e.target.value;
                            const newSubcategory = categorySubcategories[newCategory][0];
                            if (selectedProviderId === "new") {
                              setNewProvider({ ...newProvider, category: newCategory, subcategory: newSubcategory });
                            } else {
                              setEditProvider({ ...editProvider, category: newCategory, subcategory: newSubcategory });
                            }
                          }}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                          {Object.keys(categorySubcategories).map((category) => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                        <select
                          value={selectedProviderId === "new" ? newProvider.subcategory : editProvider.subcategory}
                          onChange={(e) =>
                            selectedProviderId === "new"
                              ? setNewProvider({ ...newProvider, subcategory: e.target.value })
                              : setEditProvider({ ...editProvider, subcategory: e.target.value })
                          }
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        >
                          {categorySubcategories[
                            selectedProviderId === "new" ? newProvider.category : editProvider.category
                          ].map((subcat) => (
                            <option key={subcat} value={subcat}>{subcat}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="Website"
                        placeholder="https://example.com"
                        type="url"
                        value={selectedProviderId === "new" ? newProvider.website : editProvider.website}
                        onChange={(e) =>
                          selectedProviderId === "new"
                            ? setNewProvider({ ...newProvider, website: e.target.value })
                            : setEditProvider({ ...editProvider, website: e.target.value })
                        }
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Images</label>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handleImageChange(e, selectedProviderId !== "new")}
                          className="w-full p-2 border border-gray-300 rounded-md"
                        />
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          {selectedProviderId !== "new" &&
                            existingImages.map((img, index) => (
                              <div key={`existing-${index}`} className="relative">
                                <img
                                  src={`${import.meta.env.VITE_API_URL}${img}`}
                                  alt="Existing"
                                  className="w-full h-24 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(index, true, true)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          {(selectedProviderId === "new" ? newImages : editImages).map((img, index) => (
                            <div key={`new-${index}`} className="relative">
                              <img
                                src={URL.createObjectURL(img)}
                                alt="Preview"
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index, selectedProviderId !== "new")}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="primary"
                          onClick={selectedProviderId === "new" ? handleCreateProvider : handleEditProvider}
                        >
                          {selectedProviderId === "new" ? "Create" : "Save"}
                        </Button>
                        <Button variant="outline" onClick={() => setSelectedProviderId(null)}>Cancel</Button>
                      </div>
                    </div>
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
