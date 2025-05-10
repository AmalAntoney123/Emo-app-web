import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase';
import { ref, get, set } from 'firebase/database';
import TherapistHeader from './TherapistHeader';
import Overview from './Overview';
import Clients from './Clients';
import Sessions from './Sessions';
import Schedule from './Schedule';
import Notes from './Notes';
import Profile from './Profile';
import CompleteProfileModal from './CompleteProfileModal';

function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, therapistData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [showCompleteProfile, setShowCompleteProfile] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    averageRating: 0,
  });

  useEffect(() => {
    fetchDashboardData();
    fetchBookings();
  }, [user]);

  useEffect(() => {
    if (therapistData && !therapistData.profileCompleted) {
      setShowCompleteProfile(true);
    }
  }, [therapistData]);

  const handleProfileUpdate = (updatedData) => {
    setShowCompleteProfile(false);
    // Refresh the dashboard data
    fetchDashboardData();
    fetchBookings();
  };

  const fetchBookings = async () => {
    if (!therapistData?.id) return;
    
    const bookingsRef = ref(db, `therapistBookings/${therapistData.id}`);
    try {
      const snapshot = await get(bookingsRef);
      if (snapshot.exists()) {
        const bookingsData = snapshot.val();
        setBookings(Object.values(bookingsData));
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingUpdate = async (bookingId, status, scheduledDate = null, scheduledTime = null) => {
    try {
      const updates = {
        status,
        ...(scheduledDate && { scheduledDate }),
        ...(scheduledTime && { scheduledTime })
      };

      // Update in therapist's bookings
      await set(ref(db, `therapistBookings/${therapistData.id}/${bookingId}`), {
        ...bookings.find(b => b.id === bookingId),
        ...updates
      });

      // Update in user's bookings
      const booking = bookings.find(b => b.id === bookingId);
      await set(ref(db, `bookings/${booking.userId}/${bookingId}`), {
        ...booking,
        ...updates
      });

      // Refresh bookings
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get therapist document ID
      const therapistsRef = ref(db, 'therapists');
      const therapistsSnapshot = await get(therapistsRef);
      let therapistKey = null;
      
      therapistsSnapshot.forEach(child => {
        if (child.val().uid === user.uid) therapistKey = child.key;
      });

      if (!therapistKey) {
        setLoading(false);
        return;
      }

      // Fetch bookings
      const bookingsRef = ref(db, `therapists/${therapistKey}/bookings`);
      const bookingsSnapshot = await get(bookingsRef);
      
      if (bookingsSnapshot.exists()) {
        const bookings = Object.values(bookingsSnapshot.val());
        
        // Get unique client IDs
        const uniqueClients = new Set(bookings.map(booking => booking.userId));
        
        // Calculate stats
        const totalClients = uniqueClients.size;
        const now = new Date();
        
        const upcomingSessions = bookings.filter(booking => {
          const bookingDate = new Date(booking.scheduledDate);
          return bookingDate > now && booking.status === 'scheduled';
        }).length;

        const completedSessions = bookings.filter(booking => 
          booking.status === 'completed'
        ).length;

        // Calculate average rating from completed sessions
        const ratings = bookings
          .filter(booking => booking.status === 'completed' && booking.rating)
          .map(booking => booking.rating);
        
        const averageRating = ratings.length 
          ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
          : 0;

        setStats({
          totalClients,
          upcomingSessions,
          completedSessions,
          averageRating,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview stats={stats} loading={loading} />;
      case 'clients':
        return <Clients />;
      case 'sessions':
        return (
          <Sessions 
            bookings={bookings} 
            onUpdateBooking={handleBookingUpdate} 
          />
        );
      case 'schedule':
        return <Schedule />;
      case 'notes':
        return <Notes />;
      case 'profile':
        return <Profile therapistData={therapistData} />;
      default:
        return <Overview stats={stats} loading={loading} />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TherapistHeader
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        therapistData={therapistData}
      />
      
      <div className={`flex transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <main className="flex-1 p-8 pt-20">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      <CompleteProfileModal
        isOpen={showCompleteProfile}
        onClose={() => setShowCompleteProfile(false)}
        therapistData={therapistData}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
}

export default TherapistDashboard; 