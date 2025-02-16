import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getDatabase, ref, get, onValue } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

function Schedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    if (!auth.currentUser?.uid) {
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
            if (therapist.uid === auth.currentUser.uid) {
              // Now fetch bookings using the therapist doc ID
              const bookingsRef = ref(db, `therapists/${child.key}/bookings`);
              onValue(bookingsRef, (bookingsSnapshot) => {
                if (bookingsSnapshot.exists()) {
                  const allEvents = [];
                  bookingsSnapshot.forEach((bookingChild) => {
                    const booking = bookingChild.val();
                    
                    // Parse the date string (e.g., "February 10, 2025")
                    const dateObj = new Date(booking.scheduledDate);
                    
                    // Parse time (e.g., "02:57 PM")
                    const [time, period] = booking.scheduledTime.split(' ');
                    const [hours, minutes] = time.split(':');
                    let hour = parseInt(hours);
                    
                    // Convert to 24-hour format
                    if (period === 'PM' && hour !== 12) {
                      hour += 12;
                    } else if (period === 'AM' && hour === 12) {
                      hour = 0;
                    }

                    // Create start date
                    const startDate = new Date(dateObj);
                    startDate.setHours(hour);
                    startDate.setMinutes(parseInt(minutes));
                    
                    // Create end date (1 hour later)
                    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

                    allEvents.push({
                      title: `${booking.userName} - ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}`,
                      start: startDate,
                      end: endDate,
                      status: booking.status,
                      meetLink: booking.meetLink,
                      userName: booking.userName,
                      resource: booking
                    });
                  });
                  
                  console.log('Setting events:', allEvents);
                  setEvents(allEvents);
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
      console.error('Error fetching schedule:', error);
      setLoading(false);
    }
  };

  // Call fetchSchedule in useEffect
  useEffect(() => {
    fetchSchedule();
  }, [auth.currentUser]);

  // Add useEffect debug log
  useEffect(() => {
    console.log('Current events in state:', events);
  }, [events]);

  // Add debug log to eventStyleGetter
  const eventStyleGetter = (event) => {
    console.log('Styling event:', event); // Log event being styled
    
    let backgroundColor = '#3174ad';  // confirmed - blue
    let borderColor = '#2c699d';

    if (event.status === 'pending') {
      backgroundColor = '#f59e0b';    // pending - yellow
      borderColor = '#d97706';
    } else if (event.status === 'completed') {
      backgroundColor = '#10b981';    // completed - green
      borderColor = '#059669';
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  const EventComponent = ({ event }) => (
    <div className="p-1">
      <div className="font-semibold">{event.title}</div>
      <div className="text-sm">
        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
      </div>
    </div>
  );

  const handleSelectEvent = (event) => {
    // Show event details in a modal or tooltip
    const details = `
      Client: ${event.userName}
      Status: ${event.status}
      Time: ${format(event.start, 'h:mm a')} - ${format(event.end, 'h:mm a')}
      ${event.meetLink ? `Meet Link: ${event.meetLink}` : ''}
    `;
    alert(details);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-screen p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <p className="text-gray-600">
          Your upcoming sessions and appointment requests
        </p>
      </div>

      <div className="h-[calc(100vh-200px)] bg-white rounded-lg shadow-md p-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent
          }}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="week"
        />
      </div>
    </div>
  );
}

export default Schedule; 