import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import StatCard from './StatCard';
import { fetchStats } from '../../api/super_admin/dashboardService'; // Adjust the import path as needed

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface DashboardStats {
  project_count?: number;
  project_manager_count?: number;
  blog_count?: number;
  comment_count?: number;
  category_count?: number;
  tag_count?: number;
  data_entry_count?: number;
  recent_data_entry?: any[];
  stats?: {
    total_donations?: number;
    total_amount?: number;
    total_donors?: number;
    funded_project?: number;
    donations_by_type?: {
      [key: string]: {
        count: number;
        total_amount: number;
      };
    };
  };
}

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch stats data using your axios service
      const statsData = await fetchStats();
      setStats(statsData);
      
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare data for the pie chart
  const getChartData = () => {
    if (!stats.stats?.donations_by_type) {
      return null;
    }

    const donationsByType = stats.stats.donations_by_type;
    const labels = Object.keys(donationsByType);
    const counts = labels.map(label => donationsByType[label].count);
    const amounts = labels.map(label => donationsByType[label].total_amount);
    const total = counts.reduce((sum, count) => sum + count, 0);
    
    // Calculate percentages
    const percentages = counts.map(count => ((count / total) * 100).toFixed(1));
    
    // Generate colors based on the number of types
    const backgroundColors = [
      'rgba(255, 99, 132, 0.7)',
      'rgba(54, 162, 235, 0.7)',
      'rgba(255, 206, 86, 0.7)',
      'rgba(75, 192, 192, 0.7)',
      'rgba(153, 102, 255, 0.7)',
      'rgba(255, 159, 64, 0.7)',
    ];

    return {
      labels: labels.map((label, index) => 
        `${label.charAt(0).toUpperCase() + label.slice(1)} (${percentages[index]}%)`
      ),
      datasets: [
        {
          data: counts,
          backgroundColor: backgroundColors.slice(0, labels.length),
          borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartData = getChartData();

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const donationType = label.split(' (')[0].toLowerCase();
            const amount = stats.stats?.donations_by_type?.[donationType]?.total_amount || 0;
            return [
              `Count: ${value}`,
              `Amount: ₦${amount.toLocaleString()}`,
            ];
          },
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-600">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading dashboard</h3>
            <p className="text-sm text-red-700 mt-2">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-3 bg-red-100 text-red-700 px-3 py-1 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard 
          icon="fas fa-project-diagram" 
          value={stats.project_count?.toString() || '0'} 
          label="Active Projects" 
        />
        <StatCard 
          icon="fas fa-users" 
          value={stats.project_manager_count?.toString() || '0'} 
          label="Project Managers" 
        />
        <StatCard 
          icon="fas fa-database" 
          value={stats.data_entry_count?.toString() || '0'} 
          label="Data Entries" 
        />
        <StatCard 
          icon="fas fa-donate" 
          value={stats.stats?.total_donors?.toString() || '0'} 
          label="Total Donors" 
        />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
        <div className="xl:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Donations by Type</h2>
          <div className="h-80">
            {chartData ? (
              <Doughnut data={chartData} options={chartOptions} />
            ) : (
              <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No donation data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Donation Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <i className="fas fa-hand-holding-usd text-purple-600"></i>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Total Donations</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-700">
                {stats.stats?.total_donations || 0}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="fas fa-money-bill-wave text-green-600"></i>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Total Amount</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-700">
                ₦{(stats.stats?.total_amount || 0).toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <i className="fas fa-project-diagram text-blue-600"></i>
                </div>
                <div className="ml-3">
                  <p className="font-semibold">Funded Projects</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {stats.stats?.funded_project || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e]">Recent Data Entries</h2>
          <button 
            onClick={fetchDashboardData}
            className="text-sm text-purple-600 hover:text-purple-800"
          >
            <i className="fas fa-sync-alt mr-1"></i> Refresh
          </button>
        </div>
        
        {stats.recent_data_entry && stats.recent_data_entry.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recent_data_entry.slice(0, 5).map((entry: any) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {entry.project?.project_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {entry.location}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {entry.description.length > 50 
                        ? `${entry.description.substring(0, 50)}...` 
                        : entry.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-inbox text-3xl mb-2"></i>
            <p>No recent data entries</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardView;