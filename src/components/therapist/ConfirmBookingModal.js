import React, { useState } from 'react';

const ConfirmBookingModal = ({ booking, onConfirm, onClose }) => {
  const [step, setStep] = useState(1);
  const [selectedDatetime, setSelectedDatetime] = useState('');
  const [meetLink, setMeetLink] = useState('');

  const handleDatetimeSelect = () => {
    if (!selectedDatetime) {
      alert('Please select a date and time');
      return;
    }
    setStep(2);
  };

  const handleMeetLinkSubmit = () => {
    if (!meetLink || !meetLink.includes('meet.google.com')) {
      alert('Please enter a valid Google Meet link (should start with meet.google.com)');
      return;
    }
    setStep(3);
  };

  const handleFinalConfirmation = () => {
    onConfirm(selectedDatetime, meetLink);
  };

  const getGoogleCalendarLink = () => {
    const date = new Date(selectedDatetime);
    const endDate = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour later
    
    const formatDate = (date) => {
      return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const eventDetails = {
      text: `Therapy Session - ${booking.userName}`,
      dates: `${formatDate(date)}/${formatDate(endDate)}`,
      details: 'Therapy session appointment'
    };

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.text)}&dates=${eventDetails.dates}&details=${encodeURIComponent(eventDetails.details)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Confirm Booking</h2>
        
        {step === 1 && (
          <div className="space-y-4">
            <p>Select date and time for the session:</p>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={selectedDatetime}
              onChange={(e) => setSelectedDatetime(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDatetimeSelect}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="font-semibold mb-2">Schedule Google Meet:</p>
            <ol className="list-decimal list-inside space-y-3 text-sm">
              <li>Click the button below to open Google Calendar</li>
              <li>Set the meeting title as: "Therapy Session - {booking.userName}"</li>
              <li>Verify the date and time are correct</li>
              <li className="font-medium text-blue-600">
                Important: Before saving the event
                <ul className="ml-6 mt-2 list-disc text-black">
                  <li>Click "Add Google Meet video conferencing" under the time selection</li>
                  <li>This will generate the Meet link</li>
                </ul>
              </li>
              <li>Click "Save" to create the event</li>
              <li>Copy the Meet link (starts with "meet.google.com")</li>
            </ol>
            <div className="mt-4">
              <a
                href={getGoogleCalendarLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
              >
                Open Google Calendar
              </a>
              <div className="space-y-2">
                <p className="text-sm font-medium">Google Meet Link: <span className="text-red-500">*</span></p>
                <p className="text-xs text-gray-500">Must start with: meet.google.com</p>
                <input
                  type="text"
                  placeholder="Example: https://meet.google.com/abc-defg-hij"
                  className="w-full border rounded px-3 py-2"
                  value={meetLink}
                  onChange={(e) => setMeetLink(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleMeetLinkSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="font-semibold">Please confirm the session details:</p>
            <div className="space-y-2">
              <p>Client: {booking.userName}</p>
              <p>Date: {new Date(selectedDatetime).toLocaleDateString()}</p>
              <p>Time: {new Date(selectedDatetime).toLocaleTimeString()}</p>
              <p>Meet Link: <a href={meetLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{meetLink}</a></p>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Back
              </button>
              <button
                onClick={handleFinalConfirmation}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmBookingModal; 