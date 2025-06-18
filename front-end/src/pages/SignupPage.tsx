import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, CheckCircle, Phone } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  }>({});

  const navigate = useNavigate();
  const { signup, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      phone?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (phone && !/^\+?\d{10,15}$/.test(phone)) {
      newErrors.phone = 'Phone number is invalid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await signup(name, email, password, phone || undefined, avatar || undefined);
      setShowSuccessToast(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      // Error handling is managed by the store
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Successfully signed up! Redirecting to your profile...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-gray-600">Join Sankofax to add yor products and services for Listing</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                icon={<User className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <div>
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <div>
              <Input
                label="Phone (Optional)"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                icon={<Phone className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <Input
                label="Avatar URL (Optional)"
                type="url"
                placeholder="Enter your avatar URL"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                icon={<User className="h-5 w-5 text-gray-400" />}
              />
            </div>

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  icon={<Lock className="h-5 w-5 text-gray-400" />}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
                required
              />
            </div>

            <Button type="submit" fullWidth isLoading={isLoading}>
              Create Account
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignupPage;
