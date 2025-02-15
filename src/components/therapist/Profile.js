import React, { useEffect } from 'react';
import { FaUserCircle, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';

function Profile() {
  const { therapistData } = useAuth();

  // Log the data to verify what we're receiving
  useEffect(() => {
    console.log('Current therapist data:', therapistData);
  }, [therapistData]);

  if (!therapistData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-surface rounded-lg shadow-md p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold">Profile Information</h2>
          <button className="flex items-center space-x-2 text-primary hover:text-primaryLight">
            <FaEdit />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="flex flex-col items-center space-y-4">
            {therapistData.photoURL ? (
              <img
                src={therapistData.photoURL}
                alt="Profile"
                className="w-32 h-32 rounded-full"
              />
            ) : (
              <FaUserCircle className="w-32 h-32 text-gray-400" />
            )}
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-disabled">Name</label>
              <p className="font-medium">{therapistData.name}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Email</label>
              <p className="font-medium">{therapistData.email}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Phone</label>
              <p className="font-medium">{therapistData.phone}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Education</label>
              <p className="font-medium">{therapistData.education}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Specialization</label>
              <p className="font-medium">{therapistData.specialization}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">License Number</label>
              <p className="font-medium">{therapistData.licenseNumber}</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Experience</label>
              <p className="font-medium">{therapistData.experience} years</p>
            </div>
            <div>
              <label className="text-sm text-disabled">Languages</label>
              <p className="font-medium">{therapistData.languages}</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <label className="text-sm text-disabled">Bio</label>
          <p className="mt-2">{therapistData.bio}</p>
        </div>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-8">
        <h3 className="text-xl font-semibold mb-4">Availability</h3>
        <p className="text-text">{therapistData.availability}</p>
      </div>

      <div className="bg-surface rounded-lg shadow-md p-8">
        <h3 className="text-xl font-semibold mb-4">Rates</h3>
        <p className="text-text">
          Hourly Rate: ₹{therapistData.hourlyRate}/hour
        </p>
      </div>
    </div>
  );
}

export default Profile; 