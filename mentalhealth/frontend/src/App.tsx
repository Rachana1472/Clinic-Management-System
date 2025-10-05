import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import TherapistDashboard from './pages/therapist/TherapistDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatbotPage from './pages/chatbot/ChatbotPage';

// Import Components
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Protected Routes */}
        <Route 
          path="/user" 
          element={
            <PrivateRoute roles={['user']}>
              <MainLayout>
                <UserDashboard />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/therapist" 
          element={
            <PrivateRoute roles={['therapist']}>
              <MainLayout>
                <TherapistDashboard />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute roles={['admin']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/chatbot" 
          element={
            <PrivateRoute roles={['user', 'therapist', 'admin']}>
              <MainLayout>
                <ChatbotPage />
              </MainLayout>
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
