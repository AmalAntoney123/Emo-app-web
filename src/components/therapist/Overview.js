import React from 'react';
import { FaUsers, FaCalendarCheck, FaCheckCircle, FaStar, FaClock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { useState, useEffect } from 'react';

function Overview({ stats, loading }) {
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);

  useEffect(() => {
    const fetchAdditionalData = async () => {
      if (!user?.uid) return;

      try {
        // Get therapist document ID
        const therapistsRef = ref(db, 'therapists');
        const therapistsSnapshot = await get(therapistsRef);
        let therapistKey = null;
        
        therapistsSnapshot.forEach(child => {
          if (child.val().uid === user.uid) therapistKey = child.key;
        });

        if (!therapistKey) return;

        // Fetch bookings
        const bookingsRef = ref(db, `therapists/${therapistKey}/bookings`);
        const bookingsSnapshot = await get(bookingsRef);
        
        if (bookingsSnapshot.exists()) {
          const bookings = Object.entries(bookingsSnapshot.val())
            .map(([id, booking]) => ({ id, ...booking }))
            .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));

          // Get upcoming sessions (next 7 days)
          const now = new Date();
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          
          const upcoming = bookings
            .filter(booking => {
              const bookingDate = new Date(booking.scheduledDate);
              return bookingDate > now && bookingDate <= nextWeek && booking.status === 'scheduled';
            })
            .slice(0, 5);

          // Get recent activity (last 5 completed sessions or notes)
          const recent = bookings
            .filter(booking => booking.status === 'completed')
            .slice(0, 5);

          setUpcomingSessions(upcoming);
          setRecentActivity(recent);
        }
      } catch (error) {
        console.error('Error fetching additional data:', error);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchAdditionalData();
  }, [user]);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

      {/* Recent Activity and Upcoming Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {loadingSections ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <FaCheckCircle className="w-5 h-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Session with {activity.clientName}</p>
                    <p className="text-sm text-disabled">
                      {formatDate(activity.scheduledDate)} at {formatTime(activity.scheduledDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-disabled">No recent activity</p>
          )}
        </div>

        <div className="bg-surface rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
          {loadingSections ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center space-x-4 p-3 bg-background rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FaClock className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Session with {session.clientName}</p>
                    <p className="text-sm text-disabled">
                      {formatDate(session.scheduledDate)} at {formatTime(session.scheduledDate)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-disabled">No upcoming sessions</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Overview; 