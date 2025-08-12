import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Project, ProjectManager, StatCardProps, SubmittedData } from '../types';
import { fetchMyProjects } from '../api/project_manager/ProjectService';
import DataEntryView from './project_manager/DataEntryView';
import ProjectsView from './project_manager/ProjectsView'
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';
import Sidebar from './project_manager/SideBar';
import ProfileView from './project_manager/ProfileView';
import DashboardOverview from './project_manager/DashboardView';
import StatCard from './project_manager/StatCard';
import { fetchDataEntryCount, fetchProjectCount, fetchRecentDataEntry } from '../api/project_manager/StatService';

const ProjectManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [submissions, setSubmissions] = useState<SubmittedData[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
  projectCount: 0,
  dataEntryCount: 0,
  recentSubmissions: [] as SubmittedData[] // Renamed for clarity
});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const logout = async () => {
      try {
        // Clear client-side authentication data
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        
        // Optional: Send logout request to backend to invalidate token
        // await api.post('/auth/logout');
        
        // Redirect to login page
        navigate('/login');
        
        // Show success message
        await showSuccessAlert('Success', 'You have been logged out successfully');
      } catch (error) {
        console.error('Logout error:', error);
        await showErrorAlert('Error', 'Failed to logout. Please try again.');
      }
    };

  const currentManager = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsData = await fetchMyProjects();
      setProjects(projectsData);
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

const loadStats = async () => {
  setLoading(true);
  try {
    const [projectCount, dataEntryCount, recentSubmissions] = await Promise.all([
      fetchProjectCount(),
      fetchDataEntryCount(),
      fetchRecentDataEntry()
    ]);
    
    console.log('Loaded recent submissions:', recentSubmissions); // Debug log
    
    setStats({
      projectCount,
      dataEntryCount,
      recentSubmissions
    });
  } catch (err) {
    console.error('Error loading stats:', err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    if (activeTab === 'projects') {
      loadData();
    } else if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  const addSubmission = (submission: SubmittedData) => {
    setSubmissions(prev => [submission, ...prev]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects': 
      if (loading) {
        return (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        );
      }
      if (error) {
        return (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="text-red-500 mb-4">{error}</div>
            <button 
              onClick={loadData}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
        );
      }
      return <ProjectsView projects={projects} currentManager={currentManager} />;
      case 'data-entry': return <DataEntryView addSubmission={addSubmission} />;
      case 'profile': return <ProfileView />;
      case 'dashboard':
      default:
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <StatCard icon="fas fa-project-diagram" value={stats.projectCount.toString()} label="Active Projects" />
              {/* <StatCard icon="fas fa-tasks" value="78%" label="Completion Rate" /> */}
              <StatCard icon="fas fa-file-upload" value={stats.dataEntryCount.toString()} label="Data Entries" />
              {/* <StatCard icon="fas fa-clock" value="15" label="Days Remaining" /> */}
            </div>
            <DashboardOverview submissions={stats.recentSubmissions} />
          </div>
        );
    }
  };

  return (
    <div className="bg-[#f5f7fa] min-h-screen">
      <Sidebar activeTab={activeTab} onTabClick={setActiveTab} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 p-6">
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-2xl text-[#880088]"
              onClick={() => setSidebarOpen(prev => !prev)}
            >
              <i className="fas fa-bars"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#1a0a2e]">Project Manager Dashboard</h1>
              <p className="text-gray-500">Manage your projects and submit data entries</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-gray-600 hover:text-[#880088] text-xl"><i className="fas fa-bell"></i></button>
            <button onClick={logout} className="px-5 py-2.5 bg-[#880088] text-white font-semibold rounded-lg shadow-md hover:bg-[#4b0082] transition-colors flex items-center gap-2">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default ProjectManagerDashboard;
