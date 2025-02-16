import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, update } from 'firebase/database';
import Select from 'react-select';

function EditProfileModal({ isOpen, onClose, therapistData, onUpdate }) {
  const [formData, setFormData] = useState({
    name: therapistData.name || '',
    email: therapistData.email || '',
    phone: therapistData.phone || '',
    specialization: therapistData.specialization || '',
    experience: therapistData.experience || '',
    education: therapistData.education || '',
    licenseNumber: therapistData.licenseNumber || '',
    bio: therapistData.bio || '',
    languages: therapistData.languages ? therapistData.languages.split(', ') : [],
    availability: therapistData.availability || '',
    hourlyRate: therapistData.hourlyRate || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const availabilityOptions = [
    { value: 'Weekdays 9AM-5PM', label: 'Weekdays 9AM-5PM' },
    { value: 'Weekdays Evening', label: 'Weekdays Evening' },
    { value: 'Weekends Only', label: 'Weekends Only' },
    { value: 'Flexible', label: 'Flexible' },
  ];

  const handleLanguageChange = (selectedOptions) => {
    setFormData({
      ...formData,
      languages: selectedOptions.map(option => option.value)
    });
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
        uid: therapistData.uid,
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

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="p-2 border rounded"
                required
                readOnly
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +91-9876543210)"
                pattern="[\+]?[0-9\-\s]+"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <div className="w-full">
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
              </div>
            </div>
          </div>

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
            <h4 className="text-md font-medium mb-2">Scheduling & Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="flex items-center border rounded">
                <span className="px-3 bg-gray-100 border-r h-full flex items-center">₹</span>
                <input
                  type="number"
                  placeholder="Hourly Rate"
                  min="0"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                  className="p-2 flex-1 focus:outline-none"
                  required
                />
              </div>
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

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primaryLight disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal; 