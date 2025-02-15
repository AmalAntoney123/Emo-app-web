import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  FaChartPie,
  FaUsers,
  FaCalendarAlt,
  FaClock,
  FaStickyNote,
  FaUserCircle,
  FaBars,
  FaSignOutAlt,
} from 'react-icons/fa';

function TherapistHeader({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  activeTab, 
  setActiveTab,
  therapistData 
}) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: FaChartPie },
    { id: 'clients', label: 'Clients', icon: FaUsers },
    { id: 'sessions', label: 'Sessions', icon: FaCalendarAlt },
    { id: 'schedule', label: 'Schedule', icon: FaClock },
    { id: 'notes', label: 'Notes', icon: FaStickyNote },
    { id: 'profile', label: 'Profile', icon: FaUserCircle },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-surface shadow-lg transition-all duration-300 z-10
        ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="flex items-center justify-between p-4">
          {isSidebarOpen && <h1 className="text-xl font-bold text-primary">Therapist Panel</h1>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-primaryLight text-primary"
          >
            <FaBars />
          </button>
        </div>

        <nav className="mt-8">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 hover:bg-primaryLight transition-colors
                ${activeTab === item.id ? 'bg-primaryLight text-primary' : 'text-text'}
                ${!isSidebarOpen ? 'justify-center' : ''}`}
            >
              <item.icon className={`${isSidebarOpen ? 'mr-3' : ''}`} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className={`absolute bottom-8 w-full flex items-center p-4 text-red-600 hover:bg-red-50
            ${!isSidebarOpen ? 'justify-center' : ''}`}
        >
          <FaSignOutAlt className={`${isSidebarOpen ? 'mr-3' : ''}`} />
          {isSidebarOpen && <span>Logout</span>}
        </button>
      </div>

      {/* Header */}
      <header className={`fixed top-0 right-0 h-16 bg-surface shadow-md z-5 transition-all duration-300
        ${isSidebarOpen ? 'left-64' : 'left-20'}`}>
        <div className="h-full px-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text capitalize">
            {activeTab}
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-text">{therapistData?.name}</span>
            {therapistData?.photoURL ? (
              <img
                src={therapistData.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <FaUserCircle className="w-10 h-10 text-gray-400" />
            )}
          </div>
        </div>
      </header>
    </>
  );
}

export default TherapistHeader; 