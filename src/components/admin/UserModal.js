import React from 'react';

function UserModal({ user, isOpen, onClose, onDeactivate, onChangeRole }) {
  if (!isOpen) return null;

  const getProfilePicture = () => {
    if (user.photoURL) {
      return (
        <img 
          src={user.photoURL} 
          alt={user.name} 
          className="w-40 h-40 rounded-full border-4 border-blue-500 object-cover"
        />
      );
    } else if (user.name) {
      return (
        <div className="w-40 h-40 rounded-full border-4 border-blue-500 bg-blue-200 flex items-center justify-center">
          <span className="text-5xl font-bold text-blue-600">{user.name.charAt(0).toUpperCase()}</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-4xl w-full shadow-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">User Details</h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-6 md:mb-0 flex justify-center items-start">
            {getProfilePicture()}
          </div>
          <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoItem label="Name" value={user.name} />
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Role" value={user.role} />
            <InfoItem label="Status" value={user.isActive ? 'Active' : 'Inactive'} />
            {user.age && <InfoItem label="Age" value={user.age} />}
            {user.gender && <InfoItem label="Gender" value={user.gender} />}
            {user.preferredTherapyType && <InfoItem label="Preferred Therapy" value={user.preferredTherapyType} />}
            {user.previousTherapyExperience && <InfoItem label="Previous Therapy" value={user.previousTherapyExperience} />}
            {user.sleepHabits && <InfoItem label="Sleep Habits" value={user.sleepHabits} />}
          </div>
        </div>
        {(user.concerns || user.goals || user.interests) && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {user.concerns && <InfoItem label="Concerns" value={user.concerns.join(', ')} />}
            {user.goals && <InfoItem label="Goals" value={user.goals.join(', ')} />}
            {user.interests && <InfoItem label="Interests" value={user.interests.join(', ')} />}
          </div>
        )}
        <div className="flex justify-end space-x-3 mt-8">
          <Button onClick={() => onDeactivate(user.id, user.isActive)} color="red">
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          {user.role !== 'admin' && (
            <Button onClick={() => onChangeRole(user.id, 'admin')} color="blue">
              Make Admin
            </Button>
          )}
          <Button onClick={onClose} color="gray">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="text-gray-700">
      <span className="font-semibold">{label}:</span> {value}
    </div>
  );
}

function Button({ onClick, color, children }) {
  const colorClasses = {
    red: 'bg-red-500 hover:bg-red-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    gray: 'bg-gray-300 hover:bg-gray-400 text-gray-800',
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white px-4 py-2 rounded transition duration-200`}
    >
      {children}
    </button>
  );
}

export default UserModal;
