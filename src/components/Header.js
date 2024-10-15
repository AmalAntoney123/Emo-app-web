import React from 'react';

function Header() {
  return (
    <header className="py-4 bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <img
          src="/assets/logo.png"
          alt="Emo Logo"
          className="w-16 h-16"
        />
        
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#about" className="text-gray-200 hover:text-primary">About</a></li>
            <li><a href="#features" className="text-gray-200 hover:text-primary">Features</a></li>
            <li><a href="#app-preview" className="text-gray-200 hover:text-primary">App Preview</a></li>
            <li><a href="#testimonials" className="text-gray-200 hover:text-primary">Testimonials</a></li>
            <li><a href="#download" className="text-gray-200 hover:text-primary">Download</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
