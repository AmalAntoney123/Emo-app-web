import React from 'react';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

function Footer() {
  return (
    <footer id="download" className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-8">Download Emo Now</h2>
        <div className="flex justify-center space-x-4 mb-8">
          <a 
            href="#" 
            className="flex items-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            <FaApple className="mr-2 text-2xl" />
            <span>App Store</span>
          </a>
          <a 
            href="#" 
            className="flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-500 transition duration-300"
          >
            <FaGooglePlay className="mr-2 text-2xl" />
            <span>Google Play</span>
          </a>
        </div>
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Emo. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
