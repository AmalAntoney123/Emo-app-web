import React from 'react';
import { FaUsers, FaCalendarCheck, FaCheckCircle, FaStar } from 'react-icons/fa';

function Overview({ stats, loading }) {
  const cards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: FaUsers,
      color: 'bg-blue-500',
    },
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: FaCalendarCheck,
      color: 'bg-green-500',
    },
    {
      title: 'Completed Sessions',
      value: stats.completedSessions,
      icon: FaCheckCircle,
      color: 'bg-purple-500',
    },
    {
      title: 'Average Rating',
      value: stats.averageRating,
      icon: FaStar,
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-surface rounded-lg shadow-md p-6 transition-transform hover:scale-105"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-disabled">{card.title}</p>
                <p className="text-2xl font-bold text-text mt-2">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.color} text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for additional sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <p className="text-disabled">Coming soon...</p>
        </div>
        <div className="bg-surface rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          <p className="text-disabled">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default Overview; 