import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProjectManagers, createProjectManager } from '../api/super_admin/projectManagerService';
import { ProjectManager } from "../types";
import { createProject, fetchProjects } from '../api/super_admin/projectService';
import { showErrorAlert, showSuccessAlert } from '../utils/alerts';
import ProjectsView from './super_admin/ProjectsView';
import ManagersView from './super_admin/ManagersView';
import DashboardView from './super_admin/DashboardView';
import BlogsView from './super_admin/BlogsView';
import StatCard from './super_admin/StatCard';
import Sidebar from './super_admin/Sidebar';
import DataView from './super_admin/DataView';
import CommentsView from './super_admin/CommentsView';
import CategoriesView from './super_admin/CategoriesView';
import TagsView from './super_admin/TagsView';
import DonationsView from './super_admin/DonationsView';

// Types
type StatCardProps = {
  icon: string;
  value: string;
  label: string;
};

type Project = {
  id: string;
  name: string;
  manager: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: string;
};

// Main Component
const SuperAdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [managers, setManagers] = useState<ProjectManager[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoadingManagers, setIsLoadingManagers] = useState(false);
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

  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [managersData, projectData] = await Promise.all([
        fetchProjectManagers(),
        fetchProjects()
      ]);
      setManagers(managersData);
      setProjects(projectData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  loadData();
}, []);

  const addProject = (project: Project) => {
    setProjects(prev => [project, ...prev]);
  };

  const handleProjectAdded = (newProject: Project) => {
    setProjects(prev => [...prev, newProject]);
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  const handleProjectDeleted = (projectId: number) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleManagerAdded = async (newManager: ProjectManager) => {
  setIsLoading(true);
  try {
    const updatedManagers = await fetchProjectManagers();
    setManagers(updatedManagers);
  } catch (error) {
    console.error('Error refreshing managers:', error);
    setManagers(prev => [newManager, ...prev]);
  } finally {
    setIsLoading(false);
  }
};

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsView projects={projects} addProject={addProject} managers={managers} onProjectAdded={handleProjectAdded} onProjectUpdated={handleProjectUpdated} onProjectDeleted={handleProjectDeleted}  />;
      case 'managers':
        return <ManagersView managers={managers} onManagerAdded={handleManagerAdded} />;
      case 'data':
        return <DataView />;
      case 'blogs':
        return <BlogsView />;
      case 'comments':
        return <CommentsView />;
      case 'categories':
        return <CategoriesView />;
      case 'tags':
        return <TagsView />;
      case 'donations':
        return <DonationsView />
      case 'dashboard':
      default:
        return (
          <div>
            <DashboardView />
          </div>
        );
    }
  };

  return (
    <div className="bg-[#f5f7fa] min-h-screen">
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a0a2e] text-white flex flex-col transition-all duration-300 z-40 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar activeTab={activeTab} onTabClick={handleTabClick} />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <main className="lg:ml-64 p-6">
        <header className="flex justify-between items-center mb-8 pb-5 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="lg:hidden text-[#1a0a2e] p-2 rounded-md hover:bg-gray-200"
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#1a0a2e]">Super Admin Dashboard</h1>
              <p className="text-gray-500">Manage projects, managers, and view all data</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('projects')}
              className="px-5 py-2.5 bg-[#880088] text-white font-semibold rounded-lg shadow-md hover:bg-[#4b0082] transition-colors flex items-center gap-2"
            >
              <i className="fas fa-plus"></i> New Project
            </button>
            <button
              onClick={logout}
              className="px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </header>
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;