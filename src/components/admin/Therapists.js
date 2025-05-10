import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, get, set, remove, push } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Tabs } from 'flowbite-react';
import { FaUserMd, FaPlus } from 'react-icons/fa';
import Select from 'react-select';
import emailjs from '@emailjs/browser';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
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
    profileCompleted: false,
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
      
      // Create a new Firebase app instance for therapist creation
      const therapistAuth = getAuth(initializeApp(firebaseConfig, 'therapistCreation'));
      
      // Create therapist auth account using the separate auth instance
      if (!newTherapist.email || !password) {
        throw new Error('Email and password are required');
      }

      const userCredential = await createUserWithEmailAndPassword(
        therapistAuth,
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
        profileCompleted: false,
      });

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
        profileCompleted: false,
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
          {/* Essential Information */}
          <div className="col-span-2">
            <h4 className="text-md font-medium mb-2">Essential Information</h4>
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
            </div>
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