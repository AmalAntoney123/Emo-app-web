import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Tabs } from 'flowbite-react';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { FaCrown, FaMoneyBillWave, FaUsers, FaChartLine } from 'react-icons/fa';
import { format } from 'date-fns';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function EmoElevateManagement() {
  const [stats, setStats] = useState({
    totalSubscribers: 0,
    activeSubscribers: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
    conversionRate: 0,
    subscriptionTrend: null,
    planDistribution: null,
    revenueByPlan: null
  });

  const [subscribers, setSubscribers] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'startDate', direction: 'desc' });

  const calculateMonthlyRevenue = (users) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let monthlyRevenue = 0;
    let totalRevenue = 0;

    Object.values(users).forEach(user => {
      if (user.emoElevate) {
        const startDate = new Date(user.emoElevate.startDate);
        const amount = parseFloat(user.emoElevate.amount || 0);

        // Add to total revenue
        totalRevenue += amount;

        // Check if subscription started in current month
        if (startDate.getMonth() === currentMonth && 
            startDate.getFullYear() === currentYear) {
          monthlyRevenue += amount;
        }
      }
    });

    return {
      monthlyRevenue: monthlyRevenue.toFixed(2),
      totalRevenue: totalRevenue.toFixed(2)
    };
  };

  useEffect(() => {
    fetchPremiumStats();
  }, []);

  const fetchPremiumStats = async () => {
    try {
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const users = snapshot.val();
        
        // Get premium subscribers with details
        const premiumSubscribers = Object.entries(users)
          .filter(([_, user]) => user.emoElevate)
          .map(([uid, user]) => ({
            uid,
            name: user.name || 'N/A',
            email: user.email || 'N/A',
            subscriptionType: user.emoElevate.subscriptionType || 'N/A',
            startDate: user.emoElevate.startDate,
            expiryDate: user.emoElevate.expiryDate,
            amount: user.emoElevate.amount || '0',
            status: new Date(user.emoElevate.expiryDate) > new Date() ? 'active' : 'expired',
            lastPaymentDate: user.emoElevate.lastPaymentDate,
          }))
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        setSubscribers(premiumSubscribers);
        
        // Calculate active and total subscribers
        const premiumUsers = Object.values(users).filter(user => user.emoElevate?.active);
        const activeSubscribers = premiumUsers.filter(user => 
          new Date(user.emoElevate?.expiryDate) > new Date()
        );

        // Calculate revenue
        const { monthlyRevenue, totalRevenue } = calculateMonthlyRevenue(users);

        // Calculate plan distribution
        const planCounts = {};
        premiumUsers.forEach(user => {
          const plan = user.emoElevate?.subscriptionType || 'unknown';
          planCounts[plan] = (planCounts[plan] || 0) + 1;
        });

        // Calculate subscription trend (last 6 months)
        const monthlyTrend = Array(6).fill(0);
        const monthLabels = Array(6).fill().map((_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          return d.toLocaleString('default', { month: 'short' });
        }).reverse();

        premiumUsers.forEach(user => {
          if (user.emoElevate?.startDate) {
            const startDate = new Date(user.emoElevate.startDate);
            const monthDiff = (new Date().getMonth() + 12 * new Date().getFullYear()) - 
                            (startDate.getMonth() + 12 * startDate.getFullYear());
            
            if (monthDiff >= 0 && monthDiff < 6) {
              monthlyTrend[5 - monthDiff]++;
            }
          }
        });

        // Update stats
        setStats({
          totalSubscribers: premiumUsers.length,
          activeSubscribers: activeSubscribers.length,
          monthlyRevenue,
          totalRevenue,
          conversionRate: ((activeSubscribers.length / Object.keys(users).length) * 100).toFixed(1),
          subscriptionTrend: {
            labels: monthLabels,
            datasets: [{
              label: 'New Subscribers',
              data: monthlyTrend,
              borderColor: 'rgb(75, 192, 192)',
              tension: 0.1
            }]
          },
          planDistribution: {
            labels: Object.keys(planCounts),
            datasets: [{
              data: Object.values(planCounts),
              backgroundColor: [
                'rgba(255, 99, 132, 0.6)',
                'rgba(54, 162, 235, 0.6)',
                'rgba(255, 206, 86, 0.6)'
              ]
            }]
          }
        });
      }
    } catch (error) {
      console.error('Error fetching premium stats:', error);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h5>
          <p className={`text-3xl font-bold ${color} mt-2`}>
            {value}
          </p>
        </div>
        <Icon className={`text-4xl ${color} opacity-80`} />
      </div>
    </Card>
  );

  const filterSubscribers = () => {
    return subscribers
      .filter(subscriber => {
        const matchesSearch = 
          subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
          statusFilter === 'all' || subscriber.status === statusFilter;
        
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'startDate' || sortConfig.key === 'expiryDate') {
          return sortConfig.direction === 'asc' 
            ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
            : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
        }
        
        return sortConfig.direction === 'asc'
          ? a[sortConfig.key].localeCompare(b[sortConfig.key])
          : b[sortConfig.key].localeCompare(a[sortConfig.key]);
      });
  };

  const renderControls = () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="w-full px-4 py-2 border rounded-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select
        className="px-4 py-2 border rounded-lg"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
      </select>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Subscribers"
          value={stats.totalSubscribers}
          icon={FaUsers}
          color="text-blue-600"
        />
        <StatCard 
          title="Active Subscribers"
          value={stats.activeSubscribers}
          icon={FaCrown}
          color="text-yellow-600"
        />
        <StatCard 
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue}`}
          icon={FaMoneyBillWave}
          color="text-green-600"
        />
        <StatCard 
          title="Emo Elevate Rate"
          value={`${stats.conversionRate}%`}
          icon={FaChartLine}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="h-[300px]">
          <h5 className="text-xl font-bold mb-4">Subscription Trend</h5>
          {stats.subscriptionTrend && (
            <div className="h-[250px]">
              <Line 
                data={stats.subscriptionTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        boxWidth: 10,
                        padding: 8
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </Card>

        <Card className="h-[300px]">
          <h5 className="text-xl font-bold mb-4">Plan Distribution</h5>
          {stats.planDistribution && (
            <div className="h-[250px]">
              <Doughnut 
                data={stats.planDistribution}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 10,
                        padding: 8
                      }
                    }
                  }
                }}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );

  const renderSubscriberTable = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge color="success">
            Active: {subscribers.filter(s => s.status === 'active').length}
          </Badge>
          <Badge color="warning">
            Expired: {subscribers.filter(s => s.status === 'expired').length}
          </Badge>
        </div>
      </div>
      
      {renderControls()}
      
      <Card>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Plan</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Start Date</Table.HeadCell>
              <Table.HeadCell>Expiry Date</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {filterSubscribers().map((subscriber) => (
                <Table.Row key={subscriber.uid} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {subscriber.name}
                  </Table.Cell>
                  <Table.Cell>{subscriber.email}</Table.Cell>
                  <Table.Cell>
                    {subscriber.subscriptionType.replace('_', ' ').toUpperCase()}
                  </Table.Cell>
                  <Table.Cell>₹{subscriber.amount}</Table.Cell>
                  <Table.Cell>
                    {format(new Date(subscriber.startDate), 'MMM d, yyyy')}
                  </Table.Cell>
                  <Table.Cell>
                    {format(new Date(subscriber.expiryDate), 'MMM d, yyyy')}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={subscriber.status === 'active' ? 'success' : 'warning'}
                      className="whitespace-nowrap"
                    >
                      {subscriber.status.toUpperCase()}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <Tabs>
        <Tabs.Item
          active
          title="Dashboard"
          icon={FaChartLine}
        >
          {renderDashboard()}
        </Tabs.Item>
        
        <Tabs.Item
          title="Subscribers"
          icon={FaUsers}
        >
          {renderSubscriberTable()}
        </Tabs.Item>
      </Tabs>
    </div>
  );
}

export default EmoElevateManagement;