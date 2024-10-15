import React, { useState } from 'react';
import { db } from '../../firebase';
import { ref, get } from 'firebase/database';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

function Reports() {
  const [selectedReport, setSelectedReport] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { id: 'userGrowth', label: 'User Growth' },
    { id: 'activeUsers', label: 'Active Users' },
    { id: 'supportGroupActivity', label: 'Support Group Activity' },
    { id: 'sleepMusicUsage', label: 'Sleep Music Usage' },
  ];

  const generateReport = async () => {
    if (!selectedReport || !dateRange.start || !dateRange.end) {
      alert('Please select a report type and date range');
      return;
    }

    setLoading(true);

    try {
      let data;
      switch (selectedReport) {
        case 'userGrowth':
          data = await fetchUserGrowthData();
          break;
        case 'activeUsers':
          data = await fetchActiveUsersData();
          break;
        case 'supportGroupActivity':
          data = await fetchSupportGroupActivityData();
          break;
        case 'sleepMusicUsage':
          data = await fetchSleepMusicUsageData();
          break;
        default:
          throw new Error('Invalid report type');
      }

      const filteredData = filterDataByDateRange(data, dateRange);
      generatePDF(filteredData, selectedReport);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGrowthData = async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const users = snapshot.val() || {};
    
    const userGrowth = Object.values(users).reduce((acc, user) => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return userGrowth;
  };

  const fetchActiveUsersData = async () => {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    const users = snapshot.val() || {};
    
    const activeUsers = Object.values(users).reduce((acc, user) => {
      const date = new Date(user.lastLoginAt).toISOString().split('T')[0];
      if (user.isActive) {
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    return activeUsers;
  };

  const fetchSupportGroupActivityData = async () => {
    const groupsRef = ref(db, 'supportGroups');
    const snapshot = await get(groupsRef);
    const groups = snapshot.val() || {};
    
    const groupActivity = Object.values(groups).reduce((acc, group) => {
      const messages = group.messages || {};
      Object.values(messages).forEach(message => {
        const date = new Date(message.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      });
      return acc;
    }, {});

    return groupActivity;
  };

  const fetchSleepMusicUsageData = async () => {
    const musicRef = ref(db, 'sleepMusic');
    const snapshot = await get(musicRef);
    const music = snapshot.val() || {};
    
    const musicUsage = Object.values(music).reduce((acc, track) => {
      const plays = track.plays || {};
      Object.values(plays).forEach(play => {
        const date = new Date(play.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
      });
      return acc;
    }, {});

    return musicUsage;
  };

  const filterDataByDateRange = (data, range) => {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    
    return Object.entries(data).reduce((acc, [date, value]) => {
      const currentDate = new Date(date);
      if (currentDate >= startDate && currentDate <= endDate) {
        acc[date] = value;
      }
      return acc;
    }, {});
  };

  const generatePDF = (data, reportType) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`${reportType.replace(/([A-Z])/g, ' $1').trim()} Report`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Date Range: ${dateRange.start} to ${dateRange.end}`, 14, 30);

    const tableData = Object.entries(data).map(([date, value]) => [date, value]);

    doc.autoTable({
      startY: 40,
      head: [['Date', 'Count']],
      body: tableData,
    });

    doc.save(`${reportType}_${dateRange.start}_${dateRange.end}.pdf`);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>
      <div className="mb-4">
        <label className="block mb-2">Select Report Type:</label>
        <select
          value={selectedReport}
          onChange={(e) => setSelectedReport(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select a report</option>
          {reportTypes.map((report) => (
            <option key={report.id} value={report.id}>
              {report.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-2">Date Range:</label>
        <div className="flex space-x-4">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="w-1/2 p-2 border rounded"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="w-1/2 p-2 border rounded"
          />
        </div>
      </div>
      <button
        onClick={generateReport}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  );
}

export default Reports;
