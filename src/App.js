import React from 'react';
import { animated } from 'react-spring';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import AppPreview from './components/AppPreview';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="bg-background text-text min-h-screen">
      <Header />
      <Hero />
      <About />
      <Features />
      <AppPreview />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
