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
    { id: 'analytics', label: 'Analytics', icon: 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z' },
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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`bg-surface h-screen shadow-xl px-3 w-60 overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        <div className="space-y-6 md:space-y-10 mt-10">
          <h1 className="hidden md:block font-bold text-sm md:text-xl text-center">
            Admin<span className="text-primary">Panel</span>
          </h1>
          <div id="profile" className="space-y-3">
            {userData?.profilePicture && (
              <img
                src={userData.profilePicture}
                alt="Admin user"
                className="w-10 md:w-16 rounded-full mx-auto"
              />
            )}
            <div>
              <h2 className="font-medium text-xs md:text-sm text-center text-primary">
                {userData?.name || user?.displayName || "Admin User"}
              </h2>
              <p className="text-xs text-disabled text-center">{userData?.role || "Administrator"}</p>
            </div>
          </div>
          <div className="flex border-2 border-divider rounded-md focus-within:ring-2 ring-primary">
            <input
              type="text"
              className="w-full rounded-tl-md rounded-bl-md px-2 py-3 text-sm text-text focus:outline-none bg-surface"
              placeholder="Search"
            />
            <button className="rounded-tr-md rounded-br-md px-2 py-3 hidden md:block">
              <svg
                className="w-4 h-4 fill-current text-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
          <div id="menu" className="flex flex-col space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`text-sm font-medium text-text py-2 px-2 hover:bg-primary hover:text-white hover:scale-105 rounded-md transition duration-150 ease-in-out ${activeTab === tab.id ? 'bg-primary text-white' : ''
                  }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 fill-current"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={tab.icon}></path>
                  </svg>
                  <span className="ml-2">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 bg-background">
        <AdminHeader />
        <div className="p-4">
          <button
            className="md:hidden mb-4 p-2 bg-gray-200 rounded"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? 'Close Menu' : 'Open Menu'}
          </button>
          <div className="border-2 border-gray-200 border-dashed rounded-lg p-4">
            {renderActiveTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;