import React, { useState } from 'react';
import { FaCalendarPlus } from 'react-icons/fa';

function Schedule() {
  const [availability, setAvailability] = useState([
    { day: 'Monday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Tuesday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Wednesday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Thursday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
    { day: 'Friday', slots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'] },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primaryLight transition-colors">
          <FaCalendarPlus />
          <span>Add Availability</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availability.map((schedule) => (
          <div key={schedule.day} className="bg-surface rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-lg mb-4">{schedule.day}</h3>
            <div className="space-y-2">
              {schedule.slots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg p-3 text-sm"
                >
                  {slot}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Schedule; 