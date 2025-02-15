import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, get, set, remove, push } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Tabs } from 'flowbite-react';
import { FaUserMd, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import emailjs from '@emailjs/browser';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { firebaseConfig } from '../../firebase'; // Make sure this path is correct

// Add these constants at the top of your file (replace with your actual values from EmailJS)
const EMAILJS_SERVICE_ID = "service_b9rn5fg";
const EMAILJS_TEMPLATE_ID = "template_p4fvgnm";
const EMAILJS_PUBLIC_KEY = "FQG6j2iC9MVZyWRJu";

function Therapists() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTherapist, setNewTherapist] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    education: '',
    licenseNumber: '',
    bio: '',
    languages: [],
    availability: '',
    hourlyRate: '',
  });

  // Updated language options
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
    // Other popular global languages
    { value: 'spanish', label: 'Spanish' },
    { value: 'mandarin', label: 'Mandarin' },
    { value: 'arabic', label: 'Arabic' },
    { value: 'french', label: 'French' },
    { value: 'german', label: 'German' },
    { value: 'japanese', label: 'Japanese' },
    { value: 'korean', label: 'Korean' }
  ];

  useEffect(() => {
    fetchTherapists();
  }, []);

  const fetchTherapists = async () => {
    try {
      const therapistsRef = ref(db, 'therapists');
      const snapshot = await get(therapistsRef);
      if (snapshot.exists()) {
        const therapistsData = snapshot.val();
        const therapistsList = Object.entries(therapistsData).map(([id, data]) => ({
          id,
          ...data
        }));
        setTherapists(therapistsList);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching therapists:', error);
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  };

  // Add a handler for language selection
  const handleLanguageChange = (selectedOptions) => {
    setNewTherapist({
      ...newTherapist,
      languages: selectedOptions.map(option => option.value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Generate password first and ensure it's not empty
      const password = generatePassword();
      if (!password) {
        throw new Error('Password generation failed');
      }
      
      console.log('Generated password:', password); // For debugging
      
      // Create therapist auth account using the existing auth instance
      if (!newTherapist.email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newTherapist.email.trim(),
        password.toString()
      );

      // Create user record with role
      const userRef = ref(db, `users/${userCredential.user.uid}`);
      await set(userRef, {
        email: newTherapist.email,
        role: 'therapist',
        isActive: true,
        createdAt: Date.now()
      });

      // Add to therapists collection
      const therapistsRef = ref(db, 'therapists');
      const newTherapistRef = push(therapistsRef);
      
      await set(newTherapistRef, {
        ...newTherapist,
        uid: userCredential.user.uid,
        createdAt: Date.now(),
        languages: newTherapist.languages.join(', '),
      });

      // Sign out the newly created therapist account immediately
      await signOut(auth);

      // Send welcome email using EmailJS
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: newTherapist.email,
          to_name: newTherapist.name,
          login_url: `${window.location.origin}/login`,
          email: newTherapist.email,
          password: password,
        },
        EMAILJS_PUBLIC_KEY
      );

      // Show success message to admin
      alert('Therapist account created successfully! A welcome email has been sent to the therapist with their login credentials.');

      // Reset form
      setNewTherapist({
        name: '',
        email: '',
        phone: '',
        specialization: '',
        experience: '',
        education: '',
        licenseNumber: '',
        bio: '',
        languages: [],
        availability: '',
        hourlyRate: '',
      });
      
      fetchTherapists();
    } catch (error) {
      console.error('Error adding therapist:', error);
      alert('Error creating therapist account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  

  const renderTherapistsList = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Therapists List</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Specialization</th>
              <th className="px-4 py-2">Experience</th>
              <th className="px-4 py-2">License</th>
              <th className="px-4 py-2">Rate</th>
              <th className="px-4 py-2">Languages</th>
            </tr>
          </thead>
          <tbody>
            {therapists.map((therapist) => (
              <tr key={therapist.id} className="border-b">
                <td className="px-4 py-2">{therapist.name}</td>
                <td className="px-4 py-2">{therapist.email}</td>
                <td className="px-4 py-2">{therapist.phone}</td>
                <td className="px-4 py-2">{therapist.specialization}</td>
                <td className="px-4 py-2">{therapist.experience}</td>
                <td className="px-4 py-2">{therapist.licenseNumber}</td>
                <td className="px-4 py-2">₹{therapist.hourlyRate}</td>
                <td className="px-4 py-2">{therapist.languages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAddTherapist = () => (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Add New Therapist</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Personal Information */}
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={newTherapist.name}
                onChange={(e) => setNewTherapist({...newTherapist, name: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                value={newTherapist.email}
                onChange={(e) => setNewTherapist({...newTherapist, email: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number (e.g., +91-9876543210)"
                pattern="[\+]?[0-9\-\s]+"
                value={newTherapist.phone}
                onChange={(e) => setNewTherapist({...newTherapist, phone: e.target.value})}
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
                    newTherapist.languages.includes(option.value)
                  )}
                  onChange={handleLanguageChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Professional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Specialization"
                value={newTherapist.specialization}
                onChange={(e) => setNewTherapist({...newTherapist, specialization: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Years of Experience"
                min="0"
                max="100"
                value={newTherapist.experience}
                onChange={(e) => setNewTherapist({...newTherapist, experience: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Education/Qualifications"
                value={newTherapist.education}
                onChange={(e) => setNewTherapist({...newTherapist, education: e.target.value})}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="License Number"
                value={newTherapist.licenseNumber}
                onChange={(e) => setNewTherapist({...newTherapist, licenseNumber: e.target.value})}
                className="p-2 border rounded"
                required
              />
            </div>
          </div>

          {/* Scheduling & Rates */}
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Scheduling & Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={newTherapist.availability}
                onChange={(e) => setNewTherapist({...newTherapist, availability: e.target.value})}
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
                  step="0.01"
                  value={newTherapist.hourlyRate}
                  onChange={(e) => setNewTherapist({...newTherapist, hourlyRate: e.target.value})}
                  className="p-2 flex-1 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Professional Bio</h4>
            <textarea
              placeholder="Write a professional bio describing your experience, approach, and specialties..."
              value={newTherapist.bio}
              onChange={(e) => setNewTherapist({...newTherapist, bio: e.target.value})}
              className="p-2 border rounded w-full"
              rows="4"
              required
            />
          </div>
        </div>

        <div className="col-span-2 mt-4">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Add Therapist'}
          </button>
        </div>
      </form>
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Manage Therapists</h2>
      
      <Tabs>
        <Tabs.Item
          active
          title="Therapists List"
          icon={FaUserMd}
        >
          {renderTherapistsList()}
        </Tabs.Item>
        
        <Tabs.Item
          title="Add New Therapist"
          icon={FaPlus}
        >
          {renderAddTherapist()}
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

export default Therapists; 