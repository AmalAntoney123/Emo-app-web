import React from 'react';
import { Card } from 'flowbite-react';

function Dashboard() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Total Users
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          10,000
        </p>
      </Card>
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Active Users
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          8,500
        </p>
      </Card>
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Revenue
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          $50,000
        </p>
      </Card>
      <Card>
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Active Subscriptions
        </h5>
        <p className="font-normal text-gray-700 dark:text-gray-400">
          5,000
        </p>
      </Card>
    </div>
  );
}

export default Dashboard;

