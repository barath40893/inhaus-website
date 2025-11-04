import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProductsPage from './pages/ProductsPage';
import SmartHomesPage from './pages/SmartHomesPage';
import SmartCommercialPage from './pages/SmartCommercialPage';
import SmartHospitalityPage from './pages/SmartHospitalityPage';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/smart-homes" element={<SmartHomesPage />} />
          <Route path="/smart-commercial" element={<SmartCommercialPage />} />
          <Route path="/smart-hospitality" element={<SmartHospitalityPage />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
