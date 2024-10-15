import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { ref as databaseRef, get, set, remove, push } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

function SleepMusic() {
  const [sleepMusic, setSleepMusic] = useState([]);
  const [newMusic, setNewMusic] = useState({ title: '', artist: '', file: null });
  const [editingMusic, setEditingMusic] = useState(null);

  useEffect(() => {
    fetchSleepMusic();
  }, []);

  const fetchSleepMusic = async () => {
    const musicRef = databaseRef(db, 'sleepMusic');
    const snapshot = await get(musicRef);
    if (snapshot.exists()) {
      const musicData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      setSleepMusic(musicData);
    }
  };

  const addMusic = async () => {
    if (!newMusic.file) {
      alert('Please select a music file');
      return;
    }

    const storage = getStorage();
    const fileRef = storageRef(storage, `sleepMusic/${Date.now()}_${newMusic.file.name}`);

    try {
      // Upload the file
      await uploadBytes(fileRef, newMusic.file);

      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Add the music entry to the database
      const musicRef = databaseRef(db, 'sleepMusic');
      await push(musicRef, {
        title: newMusic.title,
        artist: newMusic.artist,
        fileUrl: downloadURL,
        createdAt: Date.now(),
      });

      setNewMusic({ title: '', artist: '', file: null });
      fetchSleepMusic();
    } catch (error) {
      console.error('Error adding music:', error);
      alert('Failed to add music. Please try again.');
    }
  };

  const updateMusic = async (musicId, updatedMusic) => {
    const musicRef = databaseRef(db, `sleepMusic/${musicId}`);
    await set(musicRef, updatedMusic);
    fetchSleepMusic();
  };

  const deleteMusic = async (musicId) => {
    if (window.confirm('Are you sure you want to delete this music?')) {
      const musicRef = databaseRef(db, `sleepMusic/${musicId}`);
      await remove(musicRef);
      fetchSleepMusic();
    }
  };

  const openEditModal = (music) => {
    setEditingMusic({ ...music });
  };

  const closeEditModal = () => {
    setEditingMusic(null);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    await updateMusic(editingMusic.id, editingMusic);
    closeEditModal();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Sleep Music</h2>
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Add New Music</h3>
        <input
          type="text"
          placeholder="Title"
          value={newMusic.title}
          onChange={(e) => setNewMusic({ ...newMusic, title: e.target.value })}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Artist"
          value={newMusic.artist}
          onChange={(e) => setNewMusic({ ...newMusic, artist: e.target.value })}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setNewMusic({ ...newMusic, file: e.target.files[0] })}
          className="mr-2 p-2 border rounded"
        />
        <button onClick={addMusic} className="bg-green-500 text-white p-2 rounded">Add Music</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sleepMusic.map((music) => (
          <div key={music.id} className="border p-4 rounded">
            <h4 className="text-lg font-semibold">{music.title}</h4>
            <p>Artist: {music.artist}</p>
            <audio src={music.fileUrl} controls className="w-full mt-2"></audio>
            <div className="mt-2">
              <button
                onClick={() => openEditModal(music)}
                className="bg-yellow-500 text-white p-2 rounded mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => deleteMusic(music.id)}
                className="bg-red-500 text-white p-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingMusic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Music</h3>
            <form onSubmit={handleEditSubmit}>
              <input
                type="text"
                value={editingMusic.title}
                onChange={(e) => setEditingMusic({ ...editingMusic, title: e.target.value })}
                className="block w-full p-2 border rounded mb-2"
                placeholder="Title"
              />
              <input
                type="text"
                value={editingMusic.artist}
                onChange={(e) => setEditingMusic({ ...editingMusic, artist: e.target.value })}
                className="block w-full p-2 border rounded mb-4"
                placeholder="Artist"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="bg-gray-300 text-black p-2 rounded mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SleepMusic;
