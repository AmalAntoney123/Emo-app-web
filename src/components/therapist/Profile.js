import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEdit, FaKey } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import EditProfileModal from './EditProfileModal';
import PasswordResetModal from './PasswordResetModal';

function Profile() {
  const { therapistData, setTherapistData } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Log the data to verify what we're receiving
  useEffect(() => {
    console.log('Current therapist data:', therapistData);
  }, [therapistData]);

  const handleProfileUpdate = (updatedData) => {
    setTherapistData({ ...therapistData, ...updatedData });
  };

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
          <div className="flex space-x-4">
            <button 
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 text-primary hover:text-primaryLight"
            >
              <FaKey />
              <span>Change Password</span>
            </button>
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center space-x-2 text-primary hover:text-primaryLight"
            >
              <FaEdit />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-disabled">Name</label>
            <p className="font-medium">{therapistData.name || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Email</label>
            <p className="font-medium">{therapistData.email || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Phone</label>
            <p className="font-medium">{therapistData.phone || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Education</label>
            <p className="font-medium">{therapistData.education || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Specialization</label>
            <p className="font-medium">{therapistData.specialization || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">License Number</label>
            <p className="font-medium">{therapistData.licenseNumber || 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Experience</label>
            <p className="font-medium">{therapistData.experience ? `${therapistData.experience} years` : 'Not specified'}</p>
          </div>
          <div>
            <label className="text-sm text-disabled">Languages</label>
            <p className="font-medium">{therapistData.languages || 'Not specified'}</p>
          </div>
        </div>

        {therapistData.bio && (
          <div className="mt-8">
            <label className="text-sm text-disabled">Bio</label>
            <p className="mt-2">{therapistData.bio}</p>
          </div>
        )}
      </div>

      {therapistData.availability && (
        <div className="bg-surface rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">Availability</h3>
          <p className="text-text">{therapistData.availability}</p>
        </div>
      )}

      {therapistData.hourlyRate && (
        <div className="bg-surface rounded-lg shadow-md p-8">
          <h3 className="text-xl font-semibold mb-4">Rates</h3>
          <p className="text-text">
            Hourly Rate: ₹{therapistData.hourlyRate}/hour
          </p>
        </div>
      )}

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        therapistData={therapistData}
        onUpdate={handleProfileUpdate}
      />

      <PasswordResetModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}

export default Profile; 