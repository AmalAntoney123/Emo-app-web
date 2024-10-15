import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function AdminHeader() {
  const { logout } = useAuth();

  return (
    <header className="bg-white text-black p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold"> </h1>
        <nav>
          <ul className="flex items-center space-x-4">
            <li><Link to="/" className="hover:text-gray-300 px-4 py-2">Home</Link></li>
            <li><button onClick={logout} className="hover:text-gray-300 bg-primary text-white px-4 py-2 rounded-md">Logout</button></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default AdminHeader;
