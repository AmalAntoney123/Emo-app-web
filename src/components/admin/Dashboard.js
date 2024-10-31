import React, { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { FaUsers, FaUserCheck, FaBook, FaSmile, FaHeart, FaBrain, FaCrown } from 'react-icons/fa';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalEntries: 0,
    averageMood: 0,
    topChallenges: [],
    commonConcerns: [],
    popularGoals: [],
    userInterests: [],
    moodTrend: null,
    activityStats: null,
    userEngagement: null,
    totalPremiumUsers: 0,
    premiumConversion: 0,
    recentPremiumSignups: 0,
    premiumRevenue: 0,
    emoElevateRate: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        const userArray = Object.values(users);
        
        // Basic stats
        const totalUsers = userArray.length;
        const activeUsers = userArray.filter(user => user.isActive).length;

        // Calculate total journal entries
        const totalEntries = userArray.reduce((sum, user) => {
          return sum + (user.entries ? Object.keys(user.entries).length : 0);
        }, 0);

        // Calculate average mood from recent entries
        let totalMood = 0;
        let moodCount = 0;
        userArray.forEach(user => {
          if (user.moodEntries) {
            Object.values(user.moodEntries).forEach(entry => {
              totalMood += entry.mood;
              moodCount++;
            });
          }
        });
        const averageMood = moodCount > 0 ? (totalMood / moodCount).toFixed(1) : 0;

        // Analyze challenges
        const challengeCounts = {};
        userArray.forEach(user => {
          if (user.challenges) {
            Object.entries(user.challenges).forEach(([challenge, count]) => {
              challengeCounts[challenge] = (challengeCounts[challenge] || 0) + count;
            });
          }
        });
        const topChallenges = Object.entries(challengeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([name, count]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), count }));

        // Analyze concerns and goals
        const concernCounts = {};
        const goalCounts = {};
        const interestCounts = {};

        userArray.forEach(user => {
          // Count concerns
          user.concerns?.forEach(concern => {
            concernCounts[concern] = (concernCounts[concern] || 0) + 1;
          });
          
          // Count goals
          user.goals?.forEach(goal => {
            goalCounts[goal] = (goalCounts[goal] || 0) + 1;
          });

          // Count interests
          user.interests?.forEach(interest => {
            interestCounts[interest] = (interestCounts[interest] || 0) + 1;
          });
        });

        const getTopItems = (obj, limit = 3) => 
          Object.entries(obj)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([name, count]) => ({ name, count }));

        // Calculate mood trends over time
        const moodsByDate = {};
        const activityByType = {
          physicalActivity: [],
          sleepQuality: [],
          stressLevel: []
        };

        userArray.forEach(user => {
          if (user.moodEntries) {
            Object.values(user.moodEntries).forEach(entry => {
              // Group moods by date
              if (!moodsByDate[entry.date]) {
                moodsByDate[entry.date] = [];
              }
              moodsByDate[entry.date].push(entry.mood);

              // Collect activity stats
              if (entry.physicalActivity) activityByType.physicalActivity.push(entry.physicalActivity);
              if (entry.sleepQuality) activityByType.sleepQuality.push(entry.sleepQuality);
              if (entry.stressLevel) activityByType.stressLevel.push(entry.stressLevel);
            });
          }
        });

        // Process mood trend data
        const dates = Object.keys(moodsByDate).sort();
        const moodAverages = dates.map(date => {
          const moods = moodsByDate[date];
          return moods.reduce((sum, mood) => sum + mood, 0) / moods.length;
        });

        // Calculate average activity stats
        const avgActivityStats = {
          physicalActivity: activityByType.physicalActivity.reduce((a, b) => a + b, 0) / activityByType.physicalActivity.length,
          sleepQuality: activityByType.sleepQuality.reduce((a, b) => a + b, 0) / activityByType.sleepQuality.length,
          stressLevel: activityByType.stressLevel.reduce((a, b) => a + b, 0) / activityByType.stressLevel.length,
        };

        // Calculate premium stats
        const premiumUsers = userArray.filter(user => 
          user.emoElevate?.active && new Date(user.emoElevate?.expiryDate) > new Date()
        );
        const totalPremiumUsers = premiumUsers.length;
        const premiumConversion = ((totalPremiumUsers / userArray.length) * 100).toFixed(1);
        
        // Calculate recent premium signups (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentPremiumSignups = premiumUsers.filter(user => {
          const startDate = new Date(user.emoElevate?.startDate);
          return startDate > thirtyDaysAgo;
        }).length;

        // Calculate monthly revenue
        const currentDate = new Date();
        const monthlyRevenue = userArray
          .filter(user => user.emoElevate?.active)
          .reduce((total, user) => {
            const startDate = new Date(user.emoElevate?.startDate);
            if (startDate.getMonth() === currentDate.getMonth() && 
                startDate.getFullYear() === currentDate.getFullYear()) {
              return total + parseFloat(user.emoElevate?.amount || 0);
            }
            return total;
          }, 0);

        // Calculate Emo Elevate users (active subscribers)
        const emoElevateUsers = userArray.filter(user => 
          user.emoElevate?.active && new Date(user.emoElevate?.expiryDate) > new Date()
        );

        // Calculate conversion rate
        const emoElevateRate = ((emoElevateUsers.length / totalUsers) * 100).toFixed(1);

        setStats({
          totalUsers,
          activeUsers,
          totalEntries,
          averageMood,
          topChallenges,
          commonConcerns: getTopItems(concernCounts),
          popularGoals: getTopItems(goalCounts),
          userInterests: getTopItems(interestCounts),
          moodTrend: {
            labels: dates,
            datasets: [{
              label: 'Average Mood',
              data: moodAverages,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          activityStats: {
            labels: ['Physical Activity', 'Sleep Quality', 'Stress Level'],
            datasets: [{
              data: [
                avgActivityStats.physicalActivity,
                avgActivityStats.sleepQuality,
                avgActivityStats.stressLevel
              ],
              backgroundColor: [
                'rgba(75, 192, 192, 0.6)',
                'rgba(153, 102, 255, 0.6)',
                'rgba(255, 99, 132, 0.6)'
              ]
            }]
          },
          userEngagement: {
            labels: ['Journal Entries', 'Mood Entries', 'Completed Challenges'],
            datasets: [{
              label: 'User Engagement',
              data: [
                totalEntries,
                Object.keys(moodsByDate).length,
                Object.values(challengeCounts).reduce((a, b) => a + b, 0)
              ],
              backgroundColor: [
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)',
                'rgba(75, 192, 192, 0.6)'
              ]
            }]
          },
          totalPremiumUsers,
          premiumConversion,
          recentPremiumSignups,
          premiumRevenue: monthlyRevenue.toFixed(2),
          emoElevateRate
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h5>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className={`text-4xl ${color} opacity-80`} />
      </div>
    </Card>
  );

  const InsightCard = ({ title, items, icon: Icon }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-2xl text-blue-600" />
        <h5 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h5>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex justify-between items-center">
            <span className="text-gray-700">{item.name}</span>
            <span className="text-blue-600 font-semibold">{item.count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Emo Elevate Users"
          value={stats.totalPremiumUsers}
          icon={FaCrown}
          color="text-yellow-600"
          subtitle={`${stats.premiumConversion}% conversion`}
        />
        <StatCard 
          title="Monthly Revenue"
          value={`₹${stats.premiumRevenue}`}
          icon={FaCrown}
          color="text-green-600"
          subtitle="From Emo Elevate subscriptions"
        />
        <StatCard 
          title="New Emo Elevate"
          value={stats.recentPremiumSignups}
          icon={FaCrown}
          color="text-purple-600"
          subtitle="Last 30 days"
        />
        <StatCard 
          title="Total Users"
          value={stats.totalUsers}
          icon={FaUsers}
          color="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active Users"
          value={stats.activeUsers}
          icon={FaUserCheck}
          color="text-green-600"
          subtitle={`${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total`}
        />
        <StatCard 
          title="Journal Entries"
          value={stats.totalEntries}
          icon={FaBook}
          color="text-purple-600"
          subtitle={`${(stats.totalEntries / stats.totalUsers).toFixed(1)} per user`}
        />
        <StatCard 
          title="Average Mood"
          value={`${stats.averageMood}/10`}
          icon={FaSmile}
          color="text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-xl font-bold mb-4">Mood Trends</h5>
          {stats.moodTrend && (
            <Line data={stats.moodTrend} options={chartOptions} />
          )}
        </Card>

        <Card>
          <h5 className="text-xl font-bold mb-4">Activity Statistics</h5>
          {stats.activityStats && (
            <Bar 
              data={stats.activityStats} 
              options={{
                ...chartOptions,
                plugins: {
                  legend: {
                    display: false
                  }
                }
              }} 
            />
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h5 className="text-xl font-bold mb-4">User Engagement</h5>
          {stats.userEngagement && (
            <Doughnut 
              data={stats.userEngagement}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }}
            />
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <InsightCard 
            title="Top Challenges"
            items={stats.topChallenges}
            icon={FaBrain}
          />
          <InsightCard 
            title="Common Concerns"
            items={stats.commonConcerns}
            icon={FaHeart}
          />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

