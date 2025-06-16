import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import SalonDetailPage from './pages/ProviderDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminPage from './pages/AdminPage'; // Named import as fixed previously
import NotFoundPage from './pages/NotFoundPage';
import ErrorBoundary from './components/ErrorBoundary';
import ProviderDetailPage from './pages/ProviderDetailPage';

const API_BASE_URL = import.meta.env.VITE_API_URL;

function App() {
  const fetchAPI = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/providers`);
      console.log('Providers:', response.data.providers);
    } catch (error: any) {
      console.error('API fetch error:', error.message);
    }
  };

  useEffect(() => {
    fetchAPI();
  }, []);

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="/provider/:providerId" element={<ProviderDetailPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="admin" element={<ErrorBoundary><AdminPage /></ErrorBoundary>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AnimatePresence>
    </Router>
  );
}

export default App;
