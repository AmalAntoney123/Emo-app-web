import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { ref, get, set, remove, push } from 'firebase/database';
import { Tabs } from 'flowbite-react';
import { FaUsers, FaPlus } from 'react-icons/fa';

function SupportGroups() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [editingGroup, setEditingGroup] = useState(null);
  const [viewingGroup, setViewingGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const groupsRef = ref(db, 'supportGroups');
    const snapshot = await get(groupsRef);
    if (snapshot.exists()) {
      const groupsData = Object.entries(snapshot.val()).map(([id, data]) => ({
        id,
        ...data,
      }));
      setGroups(groupsData);
    }
  };

  const fetchUserNames = async (members) => {
    const userPromises = Object.keys(members).map(async (userId) => {
      const userRef = ref(db, `users/${userId}`);
      const userSnapshot = await get(userRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        return { [userId]: { ...members[userId], name: userData.name || 'Unknown' } };
      }
      return { [userId]: { ...members[userId], name: 'Unknown' } };
    });

    const userResults = await Promise.all(userPromises);
    return Object.assign({}, ...userResults);
  };

  const addGroup = async () => {
    try {
      if (!newGroup.name.trim()) {
        alert('Please enter a group name');
        return;
      }

      const groupsRef = ref(db, 'supportGroups');
      await push(groupsRef, {
        name: newGroup.name.trim(),
        description: newGroup.description.trim(),
        createdAt: Date.now(),
        createdBy: auth.currentUser.uid,
        members: {},
        messages: {},
      });
      setNewGroup({ name: '', description: '' });
      await fetchGroups();
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Failed to add group. Please try again.');
    }
  };

  const updateGroup = async () => {
    if (!viewingGroup) return;
    const groupRef = ref(db, `supportGroups/${viewingGroup.id}`);
    await set(groupRef, {
      ...viewingGroup,
      name: viewingGroup.name,
      description: viewingGroup.description,
    });
    setViewingGroup(null);
    fetchGroups();
  };

  const deleteGroup = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      const groupRef = ref(db, `supportGroups/${groupId}`);
      await remove(groupRef);
      fetchGroups();
    }
  };

  const removeMember = async (groupId, memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      const memberRef = ref(db, `supportGroups/${groupId}/members/${memberId}`);
      await remove(memberRef);
      fetchGroups();
      if (viewingGroup && viewingGroup.id === groupId) {
        setViewingGroup({
          ...viewingGroup,
          members: Object.fromEntries(
            Object.entries(viewingGroup.members).filter(([id]) => id !== memberId)
          ),
        });
      }
    }
  };

  const handleViewGroup = async (group) => {
    const membersWithNames = await fetchUserNames(group.members || {});
    setViewingGroup({ ...group, members: membersWithNames });
  };

  const renderGroupsList = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <div key={group.id} className="border p-4 rounded">
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <p>{group.description}</p>
          <p>Members: {Object.keys(group.members || {}).length}</p>
          <div className="mt-2">
            <button
              onClick={() => handleViewGroup(group)}
              className="bg-blue-500 text-white p-2 rounded mr-2"
            >
              View
            </button>
            <button
              onClick={() => deleteGroup(group.id)}
              className="bg-red-500 text-white p-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAddGroup = () => (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Group Name"
        value={newGroup.name}
        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
        className="mr-2 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={newGroup.description}
        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
        className="mr-2 p-2 border rounded"
      />
      <button onClick={addGroup} className="bg-green-500 text-white p-2 rounded">Add Group</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs>
        <Tabs.Item
          active
          title="Groups List"
          icon={FaUsers}
        >
          {renderGroupsList()}
        </Tabs.Item>
        
        <Tabs.Item
          title="Add New Group"
          icon={FaPlus}
        >
          {renderAddGroup()}
        </Tabs.Item>
      </Tabs>

      {viewingGroup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold mb-4">
              <input
                type="text"
                value={viewingGroup.name}
                onChange={(e) => setViewingGroup({ ...viewingGroup, name: e.target.value })}
                className="w-full p-2 border rounded"
              />
            </h3>
            <textarea
              value={viewingGroup.description}
              onChange={(e) => setViewingGroup({ ...viewingGroup, description: e.target.value })}
              className="w-full p-2 border rounded mb-4"
            />
            <h4 className="font-semibold mb-2">Members:</h4>
            <ul>
              {Object.entries(viewingGroup.members || {}).map(([memberId, memberData]) => (
                memberData && (
                  <li key={memberId} className="flex justify-between items-center mb-2">
                    {memberData.name || 'Unknown'}
                    <button
                      onClick={() => removeMember(viewingGroup.id, memberId)}
                      className="bg-red-500 text-white p-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </li>
                )
              ))}
            </ul>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  updateGroup();
                  setViewingGroup(null);
                }}
                className="bg-green-500 text-white p-2 rounded mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={() => setViewingGroup(null)}
                className="bg-gray-500 text-white p-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SupportGroups;
