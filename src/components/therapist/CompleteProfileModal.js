import React, { useState } from 'react';
import { db, auth } from '../../firebase';
import { ref, update } from 'firebase/database';
import { updatePassword } from 'firebase/auth';
import Select from 'react-select';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

function CompleteProfileModal({ isOpen, onClose, therapistData, onUpdate }) {
  const [formData, setFormData] = useState({
    specialization: '',
    experience: '',
    education: '',
    licenseNumber: '',
    bio: '',
    languages: [],
    availability: '',
    hourlyRate: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const languageOptions = [
    { value: 'english', label: 'English' },
    { value: 'hindi', label: 'Hindi' },
    { value: 'tamil', label: 'Tamil' },
    { value: 'telugu', label: 'Telugu' },
    { value: 'kannada', label: 'Kannada' },
    { value: 'malayalam', label: 'Malayalam' },
    { value: 'marathi', label: 'Marathi' },
    { value: 'gujarati', label: 'Gujarati' },
    { value: 'punjabi', label: 'Punjabi' },
    { value: 'bengali', label: 'Bengali' },
    { value: 'urdu', label: 'Urdu' },
    { value: 'odia', label: 'Odia' },
    { value: 'assamese', label: 'Assamese' },
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' }
  ];

  const handleLanguageChange = (selectedOptions) => {
    setFormData({
      ...formData,
      languages: selectedOptions.map(option => option.value)
    });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in');
      }

      await updatePassword(user, passwordData.newPassword);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordError('');
      alert('Password updated successfully');
    } catch (error) {
      setPasswordError('Failed to update password: ' + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const updates = {};
      const updatedData = {
        ...therapistData,
        ...formData,
        languages: formData.languages.join(', '),
        profileCompleted: true,
      };

      updates[`therapists/${therapistData.id}`] = updatedData;

      await update(ref(db), updates);
      onUpdate(updatedData);
      onClose();
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Professional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Years of Experience"
                min="0"
                max="100"
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Education/Qualifications"
                value={formData.education}
                onChange={(e) => setFormData({...formData, education: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="License Number"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                className="p-2 border rounded"
                required
              />
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Languages & Availability</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                isMulti
                name="languages"
                options={languageOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Languages"
                value={languageOptions.filter(option => 
                  formData.languages.includes(option.value)
                )}
                onChange={handleLanguageChange}
                required
              />
              <select
                value={formData.availability}
                onChange={(e) => setFormData({...formData, availability: e.target.value})}
                className="p-2 border rounded"
                required
              >
                <option value="">Select Availability</option>
                <option value="Weekdays 9AM-5PM">Weekdays 9AM-5PM</option>
                <option value="Weekdays Evening">Weekdays Evening</option>
                <option value="Weekends Only">Weekends Only</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Rates</h4>
            <div className="flex items-center border rounded">
              <span className="px-3 bg-gray-100 border-r h-full flex items-center">₹</span>
              <input
                type="number"
                placeholder="Hourly Rate"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                className="p-2 flex-1 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Professional Bio</h4>
            <textarea
              placeholder="Write a professional bio describing your experience, approach, and specialties..."
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              className="p-2 border rounded w-full"
              rows="4"
              required
            />
          </div>

          <div className="col-span-2 border-t pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center justify-between w-full text-left mb-2"
            >
              <h4 className="text-md font-medium">Change Password (Optional)</h4>
              {showPasswordSection ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {showPasswordSection && (
              <div className="space-y-4 bg-gray-50 p-4 rounded">
                <div>
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="p-2 border rounded w-full"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="p-2 border rounded w-full"
                  />
                </div>
                {passwordError && (
                  <div className="text-red-500 text-sm">{passwordError}</div>
                )}
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Update Password
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryLight disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfileModal; 