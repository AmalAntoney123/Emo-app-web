import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { therapistData } = useAuth();

  useEffect(() => {
    fetchSessions();
  }, [therapistData]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const sessionsRef = ref(db, `therapists/${therapistData?.id}/sessions`);
      const snapshot = await get(sessionsRef);
      
      if (snapshot.exists()) {
        const sessionsData = Object.entries(snapshot.val()).map(([id, session]) => ({
          id,
          ...session,
        }));
        setSessions(sessionsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'scheduled':
        return <FaClock className="text-blue-500" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Sessions</h2>
      <div className="bg-surface rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-divider">
          <thead className="bg-background">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-disabled uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-disabled uppercase tracking-wider">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-disabled uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-disabled uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-disabled uppercase tracking-wider">
                Duration
              </th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-divider">
            {sessions.map((session) => (
              <tr key={session.id} className="hover:bg-background">
                <td className="px-6 py-4 whitespace-nowrap">
                  {format(new Date(session.date), 'PPp')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {session.clientName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {session.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(session.status)}
                    <span className="capitalize">{session.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {session.duration} minutes
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sessions; 