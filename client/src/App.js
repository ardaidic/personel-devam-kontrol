import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PersonelList from './components/PersonelList';
import DevamKayitlari from './components/DevamKayitlari';
import MaasHesaplama from './components/MaasHesaplama';
import Vardiyalarim from './components/Vardiyalarim';
import Maasim from './components/Maasim';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="personel" element={<PersonelList />} />
        <Route path="devam-kayitlari" element={<DevamKayitlari />} />
        <Route path="maas-hesaplama" element={<MaasHesaplama />} />
        <Route path="vardiyalarim" element={<Vardiyalarim />} />
        <Route path="maasim" element={<Maasim />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App; 