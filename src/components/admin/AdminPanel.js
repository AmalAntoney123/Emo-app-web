import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import AdminHeader from './AdminHeader';
import Dashboard from './Dashboard';
import Users from './Users';
import Analytics from './Analytics';
import SupportGroups from './SupportGroups';
import SleepMusic from './SleepMusic';
import Reports from './Reports';
import PremiumManagement from './PremiumManagement';

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userRef = ref(db, `users/${user.uid}`);
          const snapshot = await get(userRef);
          if (snapshot.exists()) {
            const dbUserData = snapshot.val();
            setUserData({
              ...dbUserData,
              profilePicture: user.photoURL || dbUserData.profilePicture || null
            });
          } else {
            setUserData({
              name: user.displayName,
              profilePicture: user.photoURL || null,
              role: "User"
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: 'M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { id: 'users', label: 'Users', icon: 'M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' },
    { id: 'supportGroups', label: 'Support Groups', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { id: 'sleepMusic', label: 'Sleep Music', icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    // { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'premium', label: 'Emo Elevate', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  ];

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'users':
        return <Users />;
      case 'analytics':
        return <Analytics />;
      case 'supportGroups':
        return <SupportGroups />;
      case 'sleepMusic':
        return <SleepMusic />;
      case 'reports':
        return <Reports />;
      case 'premium':
        return <PremiumManagement />;
      default:
        return <Dashboard />;
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state

    return () => window.removeEventListener('resize', handleResize);
  }, [user]);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Updated with solid background */}
      <div
        className={`bg-surface min-h-screen w-full md:w-60 overflow-hidden transition-all duration-500 ease-in-out fixed 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:relative z-30 flex flex-col
          ${!isSidebarOpen ? 'invisible' : 'visible'}
          bg-white dark:bg-gray-900 shadow-xl
        `}
      >
        <div className="flex flex-col flex-grow items-center justify-center md:items-stretch md:justify-start">
          {/* Close button for mobile */}
          <button
            className="absolute top-4 right-4 p-2 md:hidden text-primary"
            onClick={() => setIsSidebarOpen(false)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="py-6">
            <h1 className="font-bold text-xl text-center">
              Admin<span className="text-primary">Panel</span>
            </h1>
          </div>

          {/* Profile section - centered on mobile */}
          <div id="profile" className="space-y-3 mb-6">
            {userData?.profilePicture && (
              <img
                src={userData.profilePicture}
                alt="Admin user"
                className="w-20 rounded-full mx-auto aspect-square object-cover"
              />
            )}
            <div>
              <h2 className="font-medium text-sm text-center text-primary">
                {userData?.name || user?.displayName || "Admin User"}
              </h2>
              <p className="text-xs text-disabled text-center">{userData?.role || "Administrator"}</p>
            </div>
          </div>

          {/* Menu - Updated for mobile */}
          <div id="menu" className="flex-grow space-y-4 w-full max-w-xs px-4 md:px-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`w-full text-lg md:text-sm font-medium text-text py-3 md:py-2 px-4 
                  hover:bg-primary hover:text-white rounded-md transition-all duration-300 ease-in-out
                  transform hover:scale-105 active:scale-95
                  ${activeTab === tab.id ? 'bg-primary text-white scale-105' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-center justify-center md:justify-start">
                  <svg
                    className="w-6 h-6 fill-current"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={tab.icon}></path>
                  </svg>
                  <span className="ml-3">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Updated hamburger button with higher z-index */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          className="p-2 bg-surface rounded-md shadow-md hover:bg-primary hover:text-white transition-colors duration-200"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Main content - Removed overlay blur */}
      <div className="flex-1 bg-background min-h-screen w-full md:w-[calc(100%-15rem)]">
        <AdminHeader />
        <div className="p-4">
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden transition-opacity duration-500"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          <div className="border-2 border-gray-200 border-dashed rounded-lg p-4">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
