import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import AppPreview from './components/AppPreview';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Login from './components/Login';
import AdminPanel from './components/admin/AdminPanel';
import Downloads from './pages/Downloads';



function MainContent() {
  return (
    <>
      <Hero />
      <About />
      <Features />
      <AppPreview />
      <Testimonials />
    </>
  );
}

function App() {
  return (
    <Router>
      <div className="bg-background text-text min-h-screen">
        <Helmet>
          <title>Emo App</title>
        </Helmet>
        <Routes>
          <Route path="/" element={<><Header /><MainContent /><Footer /></>} />
          <Route path="/login" element={<><Header /><Login /><Footer /></>} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/downloads" element={<Downloads />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
