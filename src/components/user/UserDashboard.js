import React from 'react';
import { useAuth } from '../../hooks/useAuth';

function UserDashboard() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-surface shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-text">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryLight focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="bg-surface rounded-lg shadow-lg p-8 text-center max-w-2xl w-full">
          <h2 className="text-4xl font-bold text-primary mb-4">Coming Soon</h2>
          <p className="text-text text-lg mb-6">
            We're working hard to bring you an amazing experience. 
            The user dashboard will be available soon!
          </p>
          <div className="animate-pulse inline-block">
            <div className="h-2 w-24 bg-primary rounded"></div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
