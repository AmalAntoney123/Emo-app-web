import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const closeMenu = (e) => {
      if (isMenuOpen && !e.target.closest('header')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [isMenuOpen]);

  // Add this function to determine which nav items to show
  const isHomePage = () => {
    return location.pathname === '/';
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="Emo Logo"
              className="w-16 h-16 cursor-pointer hover:opacity-80 transition-opacity duration-300"
            />
          </Link>
          
          {/* Hamburger menu for small screens */}
          <button
            className="md:hidden text-gray-200 focus:outline-none z-20"
            onClick={toggleMenu}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-primary">Home</Link>
            <Link to="/downloads" className="text-gray-600 hover:text-primary">Downloads</Link>
            {isHomePage() && (
              <>
                <a href="#about" className="text-gray-600 hover:text-primary">About</a>
                <a href="#features" className="text-gray-600 hover:text-primary">Features</a>
                <a href="#app-preview" className="text-gray-600 hover:text-primary">App Preview</a>
                <a href="#testimonials" className="text-gray-600 hover:text-primary">Testimonials</a>
              </>
            )}
            <Link 
              to="/login" 
              className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors duration-300"
            >
              Login
            </Link>
          </nav>

          {/* Mobile menu */}
          <nav className={`md:hidden fixed inset-0 bg-gray-800 z-10 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full justify-center items-center">
              <ul className="flex flex-col items-center space-y-8 text-center">
                <li><Link to="/" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Home</Link></li>
                <li><Link to="/downloads" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Downloads</Link></li>
                {isHomePage() && (
                  <>
                    <li><a href="#about" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>About</a></li>
                    <li><a href="#features" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Features</a></li>
                    <li><a href="#app-preview" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>App Preview</a></li>
                    <li><a href="#testimonials" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Testimonials</a></li>
                  </>
                )}
                <li>
                  <Link 
                    to="/login" 
                    className="px-8 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors duration-300"
                    onClick={toggleMenu}
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
