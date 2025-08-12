import { 
  createProjectManager, 
  getProjectManagerDetails,
  updateProjectManager,
  deleteProjectManager,
  fetchProjectManagers 
} from "@/src/api/super_admin/projectManagerService";
import { ProjectManager } from "@/src/types";
import { showErrorAlert, showSuccessAlert, showConfirmationAlert } from "@/src/utils/alerts";
import React, { useState, useEffect, useRef } from 'react';

// View Modal Component
const ViewManagerModal: React.FC<{
  manager: ProjectManager;
  onClose: () => void;
}> = ({ manager, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Manager Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{manager.fullname}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{manager.username}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{manager.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{manager.phone_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">{manager.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Created At</label>
            <p className="mt-1 p-2 bg-gray-50 rounded">
              {new Date(manager.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Assigned Projects</h4>
          {manager.project && manager.project.length > 0 ? (
            <ul className="list-disc pl-5 space-y-4">
              {manager.project.map(project => (
                <li key={project.id} className="pl-2">
                  <div className="font-medium">{project.project_name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(project.start_date).toLocaleDateString()} - {new Date(project.end_date).toLocaleDateString()}
                  </div>
                  <div className="text-sm mt-1">{project.description}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Target: {project.target_entry} entries
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No projects assigned</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Modal Component
const EditManagerModal: React.FC<{
  manager: ProjectManager;
  onClose: () => void;
  onUpdate: (updatedManager: ProjectManager) => void;
}> = ({ manager, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    fullname: manager.fullname,
    email: manager.email,
    phone_number: manager.phone_number,
    username: manager.username,
    status: manager.status,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const updatedManager = await updateProjectManager(manager.id, formData);
      onUpdate(updatedManager);
      await showSuccessAlert('Success!', 'Project manager updated successfully');
      onClose();
    } catch (err) {
      setError('Failed to update project manager. Please try again.');
      console.error('Update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Manager</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            &times;
          </button>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Component
const ManagersView: React.FC<{ 
  managers: ProjectManager[];  // Changed back to original prop name
  onManagerAdded: (manager: ProjectManager) => void;
  onManagerUpdated: (manager: ProjectManager) => void;
  onManagerDeleted: (id: string) => void;
}> = ({ managers: propManagers, onManagerAdded, onManagerUpdated, onManagerDeleted }) => {
  // Local state for managers
  const [managers, setManagers] = useState<ProjectManager[]>(propManagers);
  
  // Sync local state when prop changes
  useEffect(() => {
    setManagers(propManagers);
  }, [propManagers])
  
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone_number: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedManager, setSelectedManager] = useState<ProjectManager | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullname || !formData.email || !formData.username || !formData.phone_number) {
      setError('Please fill out all fields.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const newManager = await createProjectManager(formData);
      onManagerAdded(newManager);
      setRefreshKey(prev => prev + 1);
      await showSuccessAlert('Success!', 'Project Manager created successfully');
      setFormData({
        fullname: '',
        email: '',
        phone_number: '',
        username: '',
      });
    } catch (err) {
      await showErrorAlert('Error!', 'Failed to create project manager. Please try again.');
      console.error('Manager creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDropdown = (managerId: string) => {
    setActiveDropdown(activeDropdown === managerId ? null : managerId);
  };

  const handleView = async (manager: ProjectManager) => {
    try {
        setIsLoading(true);
        // Fetch fresh data including projects
        const freshData = await getProjectManagerDetails(manager.id);
        setSelectedManager(freshData);
        setShowViewModal(true);
    } catch (error) {
        await showErrorAlert('Error!', 'Failed to fetch manager details.');
        console.error('Fetch error:', error);
    } finally {
        setIsLoading(false);
        setActiveDropdown(null);
    }
  };

  const handleEdit = (manager: ProjectManager) => {
    setSelectedManager(manager);
    setShowEditModal(true);
    setActiveDropdown(null);
  };

  // Update the component props interface:
interface ManagersViewProps {
  managers: ProjectManager[];
  onManagerAdded: (manager: ProjectManager) => void;
  onManagerUpdated?: (manager: ProjectManager) => void;
  onManagerDeleted?: (id: string) => void;
}

// Then update the handleDelete function:
// const handleDelete = async (manager: ProjectManager) => {
//   setActiveDropdown(null);
  
//   try {
//     const isConfirmed = await showConfirmationAlert(
//       'Are you sure?',
//       'You are about to delete this project manager. This action cannot be undone.',
//       'warning',
//       true
//     );
    
//     if (!isConfirmed) return;

//     setIsLoading(true);
//     await deleteProjectManager(manager.id);
    
//     // Only call if provided
//     const updatedManagers = managers.filter(m => m.id !== manager.id);
//     onManagerDeleted(manager.id);

//     // if (onManagerDeleted) {
//     //   onManagerDeleted(manager.id);
//     // }
    
//     await showSuccessAlert('Deleted!', 'Project manager has been deleted successfully.');
//   } catch (error) {
//     console.error('Delete error:', error);
//     await showErrorAlert(
//       'Error!',
//       error instanceof Error ? error.message : 'Failed to delete project manager.'
//     );
//   } finally {
//     setIsLoading(false);
//   }
// };

// Update the handleDelete function to properly update the local state
  const handleDelete = async (manager: ProjectManager) => {
    setActiveDropdown(null);
    
    try {
      const isConfirmed = await showConfirmationAlert(
        'Are you sure?',
        'You are about to delete this project manager. This action cannot be undone.',
        'warning',
        true
      );
      
      if (!isConfirmed) return;

      setIsLoading(true);
      await deleteProjectManager(manager.id);
      
      // Update local state
      setManagers(prev => prev.filter(m => m.id !== manager.id));
      
      // Notify parent if needed
      if (onManagerDeleted) {
        onManagerDeleted(manager.id);
      }
      
      await showSuccessAlert('Deleted!', 'Project manager has been deleted successfully.');
    } catch (error) {
      console.error('Delete error:', error);
      await showErrorAlert(
        'Error!',
        error instanceof Error ? error.message : 'Failed to delete project manager.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedManager: ProjectManager) => {
    onManagerUpdated(updatedManager);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Create Project Manager Account</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">Full Name</label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter Full Name"
                value={formData.fullname}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-semibold">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Enter username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-semibold">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter Email Address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="font-semibold">Phone Number</label>
              <input
                type="tel"
                name="phone_number"
                placeholder="Enter Phone Number"
                value={formData.phone_number}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>
          </div>
          <div className="text-right">
            <button 
              type="submit" 
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Project Manager Table */}
      <div className="bg-white p-6 rounded-xl shadow-md" key={refreshKey}>
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">All Project Managers</h2>
        {isLoading ? (<div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>): (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created At</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id} className="border-b">
                  <td className="p-3">{m.fullname}</td>
                  <td className="p-3">{m.email}</td>
                  <td className="p-3">
                    <span
                      className={`${
                        m.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      } px-3 py-1 text-xs font-semibold rounded-full`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td className="p-3 relative">
                      <button 
                        onClick={() => toggleDropdown(m.id)}
                        className="text-purple-600 hover:underline text-sm font-semibold"
                      >
                        Manage
                      </button>
                      
                      {activeDropdown === m.id && (
                        <div 
                          ref={dropdownRef}
                          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                        >
                          <div className="py-1">
                            <button
                              onClick={() => handleView(m)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </button>
                            {/* <button
                              onClick={() => handleEdit(m)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Edit
                            </button> */}
                            <button
                              onClick={() => handleDelete(m)}
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showViewModal && selectedManager && (
        <ViewManagerModal 
          manager={selectedManager}
          onClose={() => setShowViewModal(false)}
        />
      )}

      {showEditModal && selectedManager && (
        <EditManagerModal 
          manager={selectedManager}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
};

export default ManagersView