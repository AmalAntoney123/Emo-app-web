import React, { useState, useEffect } from 'react';

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <header className="py-4 bg-gray-800 shadow-md relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <img
            src="/assets/logo.png"
            alt="Emo Logo"
            className="w-16 h-16"
          />
          
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
          <nav className="hidden md:block">
            <ul className="flex space-x-4">
              <li><a href="#about" className="text-gray-200 hover:text-primary">About</a></li>
              <li><a href="#features" className="text-gray-200 hover:text-primary">Features</a></li>
              <li><a href="#app-preview" className="text-gray-200 hover:text-primary">App Preview</a></li>
              <li><a href="#testimonials" className="text-gray-200 hover:text-primary">Testimonials</a></li>
              <li><a href="#download" className="text-gray-200 hover:text-primary">Download</a></li>
            </ul>
          </nav>
        </div>

        {/* Mobile menu */}
        <nav className={`md:hidden fixed inset-0 bg-gray-800 z-10 transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full justify-center items-center">
            <ul className="flex flex-col space-y-6 text-center">
              <li><a href="#about" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>About</a></li>
              <li><a href="#features" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Features</a></li>
              <li><a href="#app-preview" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>App Preview</a></li>
              <li><a href="#testimonials" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Testimonials</a></li>
              <li><a href="#download" className="text-2xl text-gray-200 hover:text-primary" onClick={toggleMenu}>Download</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;
