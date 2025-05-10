import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import { FaUserCircle, FaArrowLeft, FaLock, FaLockOpen } from 'react-icons/fa';
import { decryptData } from '../../utils/encryption';

function ClientDetail() {
  const [client, setClient] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [decryptedNotes, setDecryptedNotes] = useState(new Map());
  const [sessionNotes, setSessionNotes] = useState({});
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      // Find therapist docId
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
      // Fetch client data
      const clientRef = ref(db, `users/${clientId}`);
      const clientSnapshot = await get(clientRef);
      setClient(clientSnapshot.exists() ? clientSnapshot.val() : null);

      // Fetch bookings
      const bookingsRef = ref(db, `therapists/${therapistKey}/bookings`);
      const bookingsSnapshot = await get(bookingsRef);
      let allBookings = [];
      if (bookingsSnapshot.exists()) {
        allBookings = Object.entries(bookingsSnapshot.val())
          .filter(([_, booking]) => booking.userId === clientId)
          .map(([id, booking]) => ({ id, ...booking }))
          .sort((a, b) => new Date(b.scheduledDate) - new Date(a.scheduledDate));
      }
      setBookings(allBookings);
      setLoading(false);
    };
    fetchDetails();
  }, [user, clientId]);

  useEffect(() => {
    // Fetch session notes for each booking
    const fetchSessionNotes = async () => {
      if (!clientId || bookings.length === 0) return;
      const notesObj = {};
      for (const booking of bookings) {
        const noteRef = ref(db, `users/${clientId}/therapyNotes/${booking.id}`);
        const noteSnap = await get(noteRef);
        if (noteSnap.exists()) {
          notesObj[booking.id] = noteSnap.val();
        }
      }
      setSessionNotes(notesObj);
    };
    fetchSessionNotes();
  }, [clientId, bookings]);

  // Decrypt note handler (from Notes.js)
  const handleDecryptNote = async (sessionId, encryptedNotes, encryptionKey) => {
    try {
      if (decryptedNotes.has(sessionId)) {
        const newDecryptedNotes = new Map(decryptedNotes);
        newDecryptedNotes.delete(sessionId);
        setDecryptedNotes(newDecryptedNotes);
        return;
      }
      if (!encryptionKey) {
        setDecryptedNotes(prev => new Map(prev).set(sessionId, encryptedNotes));
        return;
      }
      const decryptedNote = await decryptData(encryptedNotes, encryptionKey);
      setDecryptedNotes(prev => new Map(prev).set(sessionId, decryptedNote));
    } catch (error) {
      setDecryptedNotes(prev => new Map(prev).set(sessionId, encryptedNotes));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => navigate('/therapist/clients')}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <FaArrowLeft className="mr-2" /> Back to Clients
        </button>
        <div className="bg-surface rounded-lg shadow-md p-6">
          <p className="text-center text-gray-600">Client not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-3xl mx-auto">
      <button 
        onClick={() => navigate('/therapist/clients')}
        className="flex items-center text-primary hover:text-primary-dark mb-4"
      >
        <FaArrowLeft className="mr-2" /> Back to Clients
      </button>

      <div className="bg-surface rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center space-x-4 mb-6">
          {client.photoURL ? (
            <img
              src={client.photoURL}
              alt={client.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <FaUserCircle className="w-16 h-16 text-gray-400" />
          )}
          <div>
            <h2 className="text-2xl font-bold">{client.name}</h2>
            <p className="text-disabled">{client.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-semibold mb-2">Client Information</h3>
            <p><span className="font-medium">Age:</span> {client.age || 'Not specified'}</p>
            <p><span className="font-medium">Concerns:</span> {client.concerns?.join(', ') || 'None specified'}</p>
            <p><span className="font-medium">Goals:</span> {client.goals?.join(', ') || 'None specified'}</p>
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Session History</h3>
        {bookings.length === 0 ? (
          <p className="text-gray-600">No sessions found</p>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => {
              const note = sessionNotes[booking.id];
              return (
                <div key={booking.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-2">
                    <div>
                      <p className="font-medium text-lg">
                        {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                      <p className="text-sm text-disabled">Status: <span className="capitalize">{booking.status}</span></p>
                    </div>
                  </div>
                  {/* Therapy Notes Section */}
                  {note ? (
                    <div className="mt-4">
                      <button
                        onClick={() => handleDecryptNote(booking.id, note.notes, note.encryptionKey)}
                        className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 mb-2"
                      >
                        {decryptedNotes.has(booking.id) ? <FaLockOpen /> : <FaLock />}
                        {decryptedNotes.has(booking.id) ? 'Hide Notes' : 'View Notes'}
                      </button>
                      <div className="bg-gray-50 p-3 rounded">
                        {decryptedNotes.has(booking.id) ? (
                          <p className="text-gray-700 whitespace-pre-wrap">{decryptedNotes.get(booking.id)}</p>
                        ) : (
                          <p className="text-gray-500 italic">
                            {note.encryptionKey
                              ? 'Notes are encrypted. Click "View Notes" to decrypt.'
                              : 'Legacy notes. Click "View Notes" to show.'}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <p>Therapist: {note.therapistName}</p>
                        <p>Last Updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <p className="text-gray-500 italic">No notes for this session.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetail;
