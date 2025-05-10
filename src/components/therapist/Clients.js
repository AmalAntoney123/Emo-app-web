import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, get, onValue } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [therapistDocId, setTherapistDocId] = useState(null);

  useEffect(() => {
    const fetchTherapistAndClients = async () => {
      if (!user?.uid) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }

      try {
        // First get the therapist document ID
        const therapistsRef = ref(db, 'therapists');
        onValue(therapistsRef, (snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((child) => {
              const therapist = child.val();
              if (therapist.uid === user.uid) {
                setTherapistDocId(child.key);
                
                // Now fetch bookings using the therapist doc ID
                const bookingsRef = ref(db, `therapists/${child.key}/bookings`);
                onValue(bookingsRef, async (bookingsSnapshot) => {
                  if (bookingsSnapshot.exists()) {
                    const bookings = bookingsSnapshot.val();
                    console.log('Bookings found:', bookings);

                    // Get unique client IDs from bookings
                    const clientIds = [...new Set(Object.values(bookings)
                      .map(booking => booking.userId))];
                    console.log('Client IDs found:', clientIds);

                    // Fetch client details
                    const clientsData = [];
                    for (const clientId of clientIds) {
                      const clientRef = ref(db, `users/${clientId}`);
                      const clientSnapshot = await get(clientRef);
                      const clientData = clientSnapshot.val();
                      console.log('Client data for', clientId, ':', clientData);

                      if (clientData) {
                        clientsData.push({
                          id: clientId,
                          ...clientData,
                          bookingCount: Object.values(bookings)
                            .filter(booking => booking.userId === clientId)
                            .length
                        });
                      }
                    }

                    console.log('Final clients data:', clientsData);
                    setClients(clientsData);
                    setLoading(false);
                  } else {
                    setClients([]);
                    setLoading(false);
                  }
                });
              }
            });
          } else {
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchTherapistAndClients();
  }, [user]);

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.concerns?.some(concern => concern.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.goals?.some(goal => goal.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Clients</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client) => (
          <div 
            key={client.id} 
            className="bg-surface rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              console.log('Navigating to client:', client.id); // Debug log
              navigate(`/therapist/clients/${client.id}`);
            }}
          >
            <div className="flex items-center space-x-4 mb-4">
              {client.photoURL ? (
                <img
                  src={client.photoURL}
                  alt={client.name}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <FaUserCircle className="w-12 h-12 text-gray-400" />
              )}
              <div>
                <h3 className="font-semibold">{client.name}</h3>
                <p className="text-sm text-disabled">{client.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Age:</span> {client.age}
              </p>
              <p className="text-sm">
                <span className="font-medium">Concerns:</span>{' '}
                {client.concerns?.join(', ') || 'None specified'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Goals:</span>{' '}
                {client.goals?.join(', ') || 'None specified'}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-primary">
                <span className="font-medium">Total Sessions:</span> {client.bookingCount}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clients; 