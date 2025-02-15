import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle } from 'react-icons/fa';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const { therapistData } = useAuth();

  useEffect(() => {
    fetchClients();
  }, [therapistData]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const clientsRef = ref(db, `therapists/${therapistData?.id}/clients`);
      const snapshot = await get(clientsRef);
      
      if (snapshot.exists()) {
        const clientsData = snapshot.val();
        const clientsList = await Promise.all(
          Object.keys(clientsData).map(async (clientId) => {
            const userRef = ref(db, `users/${clientId}`);
            const userSnapshot = await get(userRef);
            return {
              id: clientId,
              ...userSnapshot.val(),
            };
          })
        );
        setClients(clientsList);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
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
      <h2 className="text-2xl font-bold mb-6">My Clients</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-surface rounded-lg shadow-md p-6">
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
          </div>
        ))}
      </div>
    </div>
  );
}

export default Clients; 