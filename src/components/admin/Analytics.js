import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

function Analytics() {
  const [userGrowthData, setUserGrowthData] = useState(null);
  const [activeUsersData, setActiveUsersData] = useState(null);
  const [supportGroupsData, setSupportGroupsData] = useState(null);

  useEffect(() => {
    fetchUserGrowthData();
    fetchActiveUsersData();
    fetchSupportGroupsData();
  }, []);

  const fetchUserGrowthData = async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const usersByMonth = Object.values(users).reduce((acc, user) => {
        const date = new Date(user.createdAt);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
      }, {});

      const labels = Object.keys(usersByMonth).sort();
      const data = labels.map(label => usersByMonth[label]);

      setUserGrowthData({
        labels,
        datasets: [
          {
            label: 'New Users',
            data,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      });
    }
  };

  const fetchActiveUsersData = async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const activeUsers = Object.values(users).filter(user => user.isActive).length;
      const inactiveUsers = Object.values(users).length - activeUsers;

      setActiveUsersData({
        labels: ['Active Users', 'Inactive Users'],
        datasets: [
          {
            data: [activeUsers, inactiveUsers],
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'],
          },
        ],
      });
    }
  };

  const fetchSupportGroupsData = async () => {
    const groupsRef = ref(db, 'supportGroups');
    const snapshot = await get(groupsRef);
    if (snapshot.exists()) {
      const groups = snapshot.val();
      const groupSizes = Object.values(groups).map(group => Object.keys(group.members || {}).length);
      const labels = Object.values(groups).map(group => group.name);

      setSupportGroupsData({
        labels,
        datasets: [
          {
            label: 'Members',
            data: groupSizes,
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
          },
        ],
      });
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">User Growth</h3>
          {userGrowthData ? (
            <Line
              data={userGrowthData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'User Growth Over Time' },
                },
              }}
            />
          ) : (
            <p>Loading user growth data...</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Active vs Inactive Users</h3>
          {activeUsersData ? (
            <Pie
              data={activeUsersData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Active vs Inactive Users' },
                },
              }}
            />
          ) : (
            <p>Loading active users data...</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Support Group Sizes</h3>
          {supportGroupsData ? (
            <Bar
              data={supportGroupsData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: { display: true, text: 'Support Group Sizes' },
                },
              }}
            />
          ) : (
            <p>Loading support groups data...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Analytics;
