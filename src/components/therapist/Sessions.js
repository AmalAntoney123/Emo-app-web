import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import { useAuth } from '../../hooks/useAuth';
import ConfirmBookingModal from './ConfirmBookingModal';
import { encryptData } from '../../utils/encryption';

const Sessions = () => {
  const { user, therapistData } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [therapistDocId, setTherapistDocId] = useState(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSessionForNotes, setSelectedSessionForNotes] = useState(null);
  const [addingNotesForSession, setAddingNotesForSession] = useState(null);
  const [newNotes, setNewNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDescription, setPaymentDescription] = useState('');

  // Format date helper function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format time helper function
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    const fetchTherapistAndBookings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const db = getDatabase();
        const therapistsRef = ref(db, 'therapists');
        
        // First get the therapist document ID
        onValue(therapistsRef, (snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((child) => {
              const therapist = child.val();
              if (therapist.uid === user.uid) {
                setTherapistDocId(child.key);
                
                // Now fetch bookings using the therapist doc ID
                const bookingsRef = ref(db, `therapists/${child.key}/bookings`);
                onValue(bookingsRef, (bookingsSnapshot) => {
                  if (bookingsSnapshot.exists()) {
                    const bookingsData = [];
                    bookingsSnapshot.forEach((bookingChild) => {
                      bookingsData.push({
                        id: bookingChild.key,
                        ...bookingChild.val()
                      });
                    });
                    setBookings(bookingsData);
                  } else {
                    setBookings([]);
                  }
                  setLoading(false);
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

    fetchTherapistAndBookings();
  }, [user]);

  const generateGoogleMeetLink = (datetime, therapistName, userName) => {
    const date = new Date(datetime);
    const formattedDate = date.toISOString().replace(/[^0-9]/g, '').slice(0, 8);
    const formattedTime = date.toISOString().replace(/[^0-9]/g, '').slice(8, 12);
    
    // Create a sanitized title for the meeting
    const meetingTitle = `Therapy Session - ${therapistName} & ${userName}`;
    const sanitizedTitle = encodeURIComponent(meetingTitle);
    
    // Generate Google Calendar event link with Meet
    const meetLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${sanitizedTitle}&dates=${formattedDate}T${formattedTime}00Z/${formattedDate}T${parseInt(formattedTime) + 100}00Z&details=Therapy%20session%20appointment&add=&crm=AVAILABLE&add=&crm=AVAILABLE`;
    
    return meetLink;
  };

  const handleConfirmBooking = async (datetime, meetLink) => {
    try {
      const db = getDatabase();
      const date = new Date(datetime);
      
      if (isNaN(date.getTime())) {
        alert('Invalid date selected. Please try again.');
        return;
      }

      const updates = {
        status: 'confirmed',
        scheduledDate: formatDate(date),
        scheduledTime: formatTime(date),
        meetLink: meetLink,
        updatedAt: Date.now()
      };

      // Update only in therapists collection
      await update(
        ref(db, `therapists/${therapistDocId}/bookings/${selectedBooking.id}`),
        {
          ...selectedBooking,
          ...updates
        }
      );

      // Update local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === selectedBooking.id 
            ? { ...booking, ...updates }
            : booking
        )
      );
      
      setSelectedBooking(null);
      alert('Session confirmed successfully!');
    } catch (error) {
      console.error('Error in confirmation process:', error);
      setSelectedBooking(null);
    }
  };

  const handleRejectBooking = async (booking) => {
    const db = getDatabase();
    try {
      const updates = {
        status: 'rejected'
      };

      // Update therapist's booking
      await update(ref(db, `therapistBookings/${user.uid}/${booking.id}`), updates);

      // Update user's booking
      await update(ref(db, `bookings/${booking.userId}/${booking.id}`), updates);
    } catch (error) {
      console.error('Error rejecting booking:', error);
    }
  };

  const handleCompleteSession = async (booking) => {
    setSelectedSessionForNotes(booking);
    // Reset payment fields
    setPaymentAmount('');
    setPaymentDescription('');
    // Fetch existing notes if any
    const db = getDatabase();
    const notesRef = ref(db, `users/${booking.userId}/therapyNotes/${booking.id}`);
    const snapshot = await get(notesRef);
    if (snapshot.exists()) {
      setNewNotes(snapshot.val().notes);
    } else {
      setNewNotes('');
    }
    setShowNotesModal(true);
  };

  // Add this helper function for blockchain interaction
  const saveNoteToBlockchain = async (noteData) => {
    try {
      const db = getDatabase();
      const blockchainRef = ref(db, 'notesBlockchain');
      
      // Get the previous block to link to
      const prevBlockSnapshot = await get(blockchainRef);
      const prevBlock = prevBlockSnapshot.val();
      const prevHash = prevBlock?.latestHash || '0';
      
      // Create new block data - ensure consistent object structure
      const timestamp = Date.now();
      const blockData = {
        previousHash: prevHash,
        timestamp,
        data: noteData,
        therapistId: user.uid,
        sessionId: noteData.sessionId
      };
      
      // Create hash of current block - ensure consistent stringification
      const blockString = JSON.stringify(blockData, Object.keys(blockData).sort());
      const blockHash = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(blockString)
      );
      const hashArray = Array.from(new Uint8Array(blockHash));
      const currentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Save the block with the exact same structure as we verify
      const blockToSave = {
        ...blockData,
        hash: currentHash
      };
      
      // Save the block
      await update(ref(db, `notesBlockchain/${timestamp}`), blockToSave);
      
      // Update latest hash reference
      await update(ref(db, 'notesBlockchain'), {
        latestHash: currentHash
      });
      
      return currentHash;
    } catch (error) {
      console.error('Error saving to blockchain:', error);
      throw error;
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedSessionForNotes) return;

    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    try {
      const noteData = {
        notes: newNotes,
        updatedAt: Date.now(),
        therapistId: user.uid,
        therapistName: therapistData?.name || 'Unknown Therapist',
        sessionDate: selectedSessionForNotes.scheduledDate,
        sessionTime: selectedSessionForNotes.scheduledTime,
        sessionId: selectedSessionForNotes.id,
        userId: selectedSessionForNotes.userId,
        paymentAmount: parseFloat(paymentAmount),
        paymentDescription: paymentDescription,
        paymentStatus: 'pending'
      };

      // Save to blockchain
      const blockHash = await saveNoteToBlockchain(noteData);

      const db = getDatabase();
      // Store reference to blockchain entry
      await update(
        ref(db, `users/${selectedSessionForNotes.userId}/therapyNotes/${selectedSessionForNotes.id}`),
        {
          ...noteData,
          blockHash // Store reference to blockchain entry
        }
      );

      // Update booking status and payment info
      await update(
        ref(db, `therapists/${therapistDocId}/bookings/${selectedSessionForNotes.id}`),
        {
          status: 'completed',
          hasNotes: true,
          blockHash, // Store reference to blockchain entry
          paymentAmount: parseFloat(paymentAmount),
          paymentDescription: paymentDescription,
          paymentStatus: 'pending'
        }
      );

      // Update local state
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.id === selectedSessionForNotes.id
            ? { ...booking, status: 'completed', hasNotes: true, blockHash, paymentAmount: parseFloat(paymentAmount), paymentDescription, paymentStatus: 'pending' }
            : booking
        )
      );

      setShowNotesModal(false);
      setNewNotes('');
      setPaymentAmount('');
      setPaymentDescription('');
      setSelectedSessionForNotes(null);
      alert('Session completed and notes securely saved!');
    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to complete session. Please try again.');
    }
  };

  // Update the handleAddNotes function
  const handleAddNotes = async () => {
    if (!addingNotesForSession || !newNotes.trim()) return;

    try {
      // Encrypt the notes
      const { encryptedData: encryptedNotes, key } = await encryptData(newNotes.trim());

      const noteData = {
        notes: encryptedNotes,
        encryptionKey: key,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        therapistId: user.uid,
        therapistName: therapistData?.name || 'Unknown Therapist',
        sessionDate: addingNotesForSession.scheduledDate,
        sessionTime: addingNotesForSession.scheduledTime,
        sessionId: addingNotesForSession.id,
        userId: addingNotesForSession.userId
      };

      // Save to blockchain
      const blockHash = await saveNoteToBlockchain(noteData);

      const db = getDatabase();
      // Store reference to blockchain entry in a new notes collection
      await update(
        ref(db, `users/${addingNotesForSession.userId}/therapyNotes/${addingNotesForSession.id}/${Date.now()}`),
        {
          ...noteData,
          blockHash
        }
      );

      setShowNotesModal(false);
      setNewNotes('');
      setAddingNotesForSession(null);
      alert('Additional notes saved successfully!');
    } catch (error) {
      console.error('Error adding notes:', error);
      alert('Failed to add notes. Please try again.');
    }
  };

  // Add these new functions
  const verifyBlockchain = async (sessionId) => {
    try {
      const db = getDatabase();
      const blockchainRef = ref(db, 'notesBlockchain');
      const snapshot = await get(blockchainRef);
      
      if (!snapshot.exists()) {
        throw new Error('No blockchain data found');
      }

      const blocks = [];
      snapshot.forEach((child) => {
        if (child.key !== 'latestHash') {
          blocks.push({
            ...child.val(),
            timestamp: parseInt(child.key)
          });
        }
      });

      // Sort blocks by timestamp
      blocks.sort((a, b) => a.timestamp - b.timestamp);

      // Verify the chain
      for (let i = 1; i < blocks.length; i++) {
        const currentBlock = blocks[i];
        const previousBlock = blocks[i-1];

        // Verify previous hash link
        if (currentBlock.previousHash !== previousBlock.hash) {
          throw new Error(`Chain broken between blocks ${previousBlock.timestamp} and ${currentBlock.timestamp}`);
        }

        // Verify current block's hash - ensure consistent object structure
        const blockData = {
          previousHash: currentBlock.previousHash,
          timestamp: currentBlock.timestamp,
          data: currentBlock.data,
          therapistId: currentBlock.therapistId,
          sessionId: currentBlock.sessionId
        };

        // Use the same stringification method as when creating the block
        const blockString = JSON.stringify(blockData, Object.keys(blockData).sort());
        const calculatedHash = await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(blockString)
        );
        const hashArray = Array.from(new Uint8Array(calculatedHash));
        const calculatedHashString = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        if (calculatedHashString !== currentBlock.hash) {
          throw new Error(`Block ${currentBlock.timestamp} has been tampered with`);
        }
      }

      // If looking for specific session, find its block
      if (sessionId) {
        const sessionBlock = blocks.find(block => block.data.sessionId === sessionId);
        if (!sessionBlock) {
          throw new Error('Session notes not found in blockchain');
        }
      }

      return true;
    } catch (error) {
      console.error('Blockchain verification failed:', error);
      throw error;
    }
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Session Requests</h2>
      
      {bookings.length === 0 ? (
        <p className="text-center text-gray-600">No booking requests available</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border rounded-lg p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-3 flex-1">
                  {/* Client Info Section */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{booking.userName}</h3>
                    <p className="text-gray-600 text-sm">
                      Requested: {new Date(booking.requestedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Session Details Section */}
                  {booking.scheduledDate && (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="font-medium text-gray-700 mb-2">Session Details</h4>
                      <p className="text-green-600">
                        <span className="font-medium">Date:</span> {booking.scheduledDate}
                      </p>
                      <p className="text-green-600">
                        <span className="font-medium">Time:</span> {booking.scheduledTime}
                      </p>
                      {booking.meetLink && booking.status === 'confirmed' && (
                        <a 
                          href={booking.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                          Join Google Meet
                        </a>
                      )}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}
                    >
                      <span className={`w-2 h-2 mr-2 rounded-full
                        ${booking.status === 'confirmed' ? 'bg-green-400' :
                        booking.status === 'rejected' ? 'bg-red-400' :
                        booking.status === 'completed' ? 'bg-blue-400' :
                        'bg-yellow-400'}`}
                      ></span>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons Section */}
                <div className="ml-4">
                  {booking.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors w-28"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking)}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors w-28"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCompleteSession(booking)}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors w-full"
                    >
                      Complete Session
                    </button>
                  )}

                  {booking.status === 'completed' && (
                    <button
                      onClick={() => {
                        setAddingNotesForSession(booking);
                        setNewNotes('');
                        setShowNotesModal(true);
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors w-full"
                    >
                      Add Notes
                    </button>
                  )}
                </div>
              </div>

              {/* Add verification buttons for completed sessions with notes */}
              {booking.status === 'completed' && booking.hasNotes && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        await verifyBlockchain(booking.id);
                        alert('Notes integrity verified successfully!');
                      } catch (error) {
                        alert(`Verification failed: ${error.message}`);
                      }
                    }}
                    className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 transition-colors text-sm"
                  >
                    Verify Notes Integrity
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await verifyBlockchain();
                        alert('Full blockchain integrity verified successfully!');
                      } catch (error) {
                        alert(`Verification failed: ${error.message}`);
                      }
                    }}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors text-sm"
                  >
                    Verify All Notes
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedBooking && (
        <ConfirmBookingModal
          booking={selectedBooking}
          onConfirm={handleConfirmBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {addingNotesForSession ? 'Add Additional Notes' : 'Complete Session'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full h-32 p-2 border rounded"
                  placeholder="Enter session notes here..."
                />
              </div>
              {!addingNotesForSession && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₹)</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full p-2 border rounded"
                      placeholder="Enter payment amount in rupees"
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Description</label>
                    <textarea
                      value={paymentDescription}
                      onChange={(e) => setPaymentDescription(e.target.value)}
                      className="w-full h-20 p-2 border rounded"
                      placeholder="Enter payment description (e.g., Session fee for 1 hour therapy)"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setNewNotes('');
                  setPaymentAmount('');
                  setPaymentDescription('');
                  setAddingNotesForSession(null);
                  setSelectedSessionForNotes(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={addingNotesForSession ? handleAddNotes : handleSaveNotes}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                {addingNotesForSession ? 'Save Additional Notes' : 'Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions; 