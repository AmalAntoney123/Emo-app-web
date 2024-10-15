import React from 'react';

function Analytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">User Growth</h3>
        <p className="text-gray-600">Chart placeholder for user growth over time</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4">Revenue Analysis</h3>
        <p className="text-gray-600">Chart placeholder for revenue analysis</p>
      </div>
    </div>
  );
}

export default Analytics;
