import React, { useState } from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';

function Notes() {
  const [notes] = useState([
    {
      id: 1,
      clientName: 'John Doe',
      date: '2024-03-15',
      content: 'Made significant progress in anxiety management...',
      tags: ['anxiety', 'progress'],
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      date: '2024-03-14',
      content: 'Discussed new coping strategies for stress...',
      tags: ['stress', 'coping'],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Session Notes</h2>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryLight transition-colors">
          <FaPlus />
          <span>New Note</span>
        </button>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-divider focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-disabled" />
      </div>

      <div className="space-y-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-surface rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{note.clientName}</h3>
                <p className="text-sm text-disabled">{note.date}</p>
              </div>
            </div>
            <p className="text-text mb-4">{note.content}</p>
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primaryLight text-primary px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notes; 