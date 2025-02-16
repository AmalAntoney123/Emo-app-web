import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { FaSearch } from 'react-icons/fa';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const allNotes = [];
        
        // Iterate through all users
        snapshot.forEach((userSnapshot) => {
          const userData = userSnapshot.val();
          const therapyNotes = userData.therapyNotes;
          
          if (therapyNotes) {
            // Convert therapy notes object to array and add user info
            Object.entries(therapyNotes).forEach(([sessionId, noteData]) => {
              allNotes.push({
                id: sessionId,
                clientName: userData.name,
                clientId: userSnapshot.key,
                ...noteData,
                date: new Date(noteData.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              });
            });
          }
        });

        // Sort notes by date (most recent first)
        allNotes.sort((a, b) => b.updatedAt - a.updatedAt);
        setNotes(allNotes);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notes:', error);
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Session Notes</h2>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search notes by client name or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.length === 0 ? (
            <p className="text-center text-gray-600">No notes found</p>
          ) : (
            filteredNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{note.clientName}</h3>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">Session Date: {note.sessionDate}</p>
                      <p className="text-sm text-gray-600">Session Time: {note.sessionTime}</p>
                      <p className="text-sm text-gray-600">Last Updated: {note.date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Session Notes
                  </span>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{note.notes}</p>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                  <p>Therapist: {note.therapistName}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default Notes; 