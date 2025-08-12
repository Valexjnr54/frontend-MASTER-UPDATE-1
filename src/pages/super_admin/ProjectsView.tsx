import { createProject, deleteProject, updateProject } from "@/src/api/super_admin/projectService";
import { Project, ProjectManager } from "@/src/types";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import React, { useState, useEffect } from 'react';

interface ProjectsViewProps {
  projects: Project[];
  managers: ProjectManager[];
  onProjectAdded: (project: Project) => void;
  onProjectUpdated: (project: Project) => void;
  onProjectDeleted: (projectId: number) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  managers,
  onProjectAdded,
  onProjectUpdated,
  onProjectDeleted,
}) => {
  const [formData, setFormData] = useState({
    project_name: '',
    project_manager_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    description: '',
    target_entry: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dropdownOpenFor, setDropdownOpenFor] = useState<number | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    project_name: '',
    project_manager_id: '',
    start_date: '',
    end_date: '',
    description: '',
    target_entry: '',
  });

  // Handle view project
  const handleViewProject = (project: Project) => {
    setDropdownOpenFor(null); // Close dropdown
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  // Handle edit project
  const handleEditProject = (project: Project) => {
    setDropdownOpenFor(null); // Close dropdown
    setSelectedProject(project);
    setEditFormData({
      project_name: project.project_name,
      project_manager_id: project.project_manager_id.toString(),
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date ? project.end_date.split('T')[0] : '',
      description: project.description || '',
      target_entry: project.target_entry.toString(),
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update project
  // const handleUpdateProject = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!selectedProject) return;

  //   try {
  //     setIsLoading(true);
  //     const updatedProject = await updateProject(selectedProject.id, {
  //       project_name: editFormData.project_name,
  //       project_manager_id: parseInt(editFormData.project_manager_id),
  //       start_date: editFormData.start_date,
  //       end_date: editFormData.end_date,
  //       description: editFormData.description,
  //       target_entry: parseInt(editFormData.target_entry)
  //     });

  //     onProjectUpdated(updatedProject);
  //     setIsEditModalOpen(false);
  //     await showSuccessAlert('Success!', 'Project updated successfully');
  //   } catch (error) {
  //     await showErrorAlert('Error!', 'Failed to update project. Please try again.');
  //     console.error('Project update error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const handleUpdateProject = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!selectedProject) return;

  try {
    setIsLoading(true);
    const updatedProject = await updateProject(selectedProject.id, {
      project_name: editFormData.project_name,
      project_manager_id: parseInt(editFormData.project_manager_id),
      start_date: editFormData.start_date,
      end_date: editFormData.end_date,
      description: editFormData.description,
      target_entry: parseInt(editFormData.target_entry)
    });

    onProjectUpdated(updatedProject);
    setIsEditModalOpen(false);
    setSelectedProject(null); // Close dropdown
    await showSuccessAlert('Success!', 'Project updated successfully');
  } catch (error) {
    await showErrorAlert('Error!', 'Failed to update project. Please try again.');
    console.error('Project update error:', error);
  } finally {
    setIsLoading(false);
  }
};

  // Handle delete project
  // const handleDeleteProject = async (projectId: number) => {
  //   try {
  //     const result = await showConfirmationAlert(
  //       'Are you sure?',
  //       'You will not be able to recover this project!',
  //       'warning',
  //       true
  //     );

  //     if (result.isConfirmed) {
  //       setIsLoading(true);
  //       await deleteProject(projectId);
  //       onProjectDeleted(projectId);
  //       await showSuccessAlert('Deleted!', 'Project has been deleted.');
  //     }
  //   } catch (error) {
  //     await showErrorAlert('Error!', 'Failed to delete project. Please try again.');
  //     console.error('Project deletion error:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleDeleteProject = async (projectId: number) => {
    setDropdownOpenFor(null); // Close dropdown
  try {
    const result = await showConfirmationAlert(
      'Are you sure?',
      'You will not be able to recover this project!',
      'warning',
      true
    );

    if (result.isConfirmed) {
      setIsLoading(true);
      await deleteProject(projectId);
      onProjectDeleted(projectId);
      setSelectedProject(null); // Close dropdown
      await showSuccessAlert('Deleted!', 'Project has been deleted.');
    }
  } catch (error) {
    await showErrorAlert('Error!', 'Failed to delete project. Please try again.');
    console.error('Project deletion error:', error);
  } finally {
    setIsLoading(false);
  }
};

  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState('');
  // const [refreshKey, setRefreshKey] = useState(0); // Add refresh trigger

  useEffect(() => {
    // This will ensure the table updates when projects prop changes
  }, [projects]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownOpenFor && !(event.target as Element).closest('.dropdown')) {
      setDropdownOpenFor(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [dropdownOpenFor]); // Changed from selectedProject to dropdownOpenFor

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await fetchProjects(); // You'll need to implement this API call
      projects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

//   const handleProjectSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();

//   if (!formData.project_name || !formData.project_manager_id || 
//       !formData.start_date || !formData.end_date || !formData.target_entry) {
//     setError('Please fill out all required fields.');
//     return;
//   }

//   setIsLoading(true);
//   setError('');

//   try {
//     const newProject = await createProject({
//       project_name: formData.project_name,
//       project_manager_id: parseInt(formData.project_manager_id),
//       start_date: formData.start_date,
//       end_date: formData.end_date,
//       description: formData.description,
//       target_entry: parseInt(formData.target_entry)
//     });

//     if (typeof onProjectAdded === 'function') {
//       onProjectAdded(newProject); // ✅ Safe call
//     }

//     setRefreshKey(prev => prev + 1);

//     await showSuccessAlert('Success!', 'Project created successfully');

//     // onProjectAdded?.(newProject); // ✅ Trigger the refresh

//     setFormData({
//       project_name: '',
//       project_manager_id: '',
//       start_date: new Date().toISOString().split('T')[0],
//       end_date: '',
//       description: '',
//       target_entry: '',
//     });
//   } catch (error) {
//     await showErrorAlert('Error!', 'Failed to create project. Please try again.');
//     console.error('Project creation error:', error);
//   } finally {
//     setIsLoading(false);
//   }
// };
  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.project_name || !formData.project_manager_id || 
        !formData.start_date || !formData.end_date || !formData.target_entry) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newProject = await createProject({
        project_name: formData.project_name,
        project_manager_id: parseInt(formData.project_manager_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        description: formData.description,
        target_entry: parseInt(formData.target_entry)
      });

      onProjectAdded(newProject);
      setSelectedProject(null); // Close dropdown
      
      // Reset form only after successful creation
      setFormData({
        project_name: '',
        project_manager_id: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        description: '',
        target_entry: '',
      });

      await showSuccessAlert('Success!', 'Project created successfully');
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to create project. Please try again.');
      console.error('Project creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Create New Project</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleProjectSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Project Name and Task */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="font-semibold">Project Name *</label>
                    <input
                      type="text"
                      name="project_name"
                      placeholder="Enter Project Name"
                      value={formData.project_name}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold">Task</label>
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Task (optional)"
                      value={formData.task || ''}
                      onChange={handleInputChange}
                      className="w-full mt-1 p-2 border rounded-lg"
                    />
                  </div>
                </div>

                {/* Project Manager */}
                <div>
                <label className="font-semibold">Assign Manager *</label>
                <select
                    name="project_manager_id"
                    value={formData.project_manager_id}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                    <option key={m.id} value={m.id}>
                        {m.fullname} ({m.email})
                    </option>
                    ))}
                </select>
                </div>

                {/* Start Date */}
                <div>
                <label className="font-semibold">Start Date *</label>
                <input
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                />
                </div>

                {/* End Date */}
                <div>
                <label className="font-semibold">End Date *</label>
                <input
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                    min={formData.start_date}
                />
                </div>

                {/* Target Entry - spans full width */}
                <div className="col-span-1 md:col-span-2">
        <label className="font-semibold">Target *</label>
        <input
          type="text"
          name="target_entry"
          placeholder="Enter Target (number or text)"
          value={formData.target_entry}
          onChange={handleInputChange}
          className="w-full mt-1 p-2 border rounded-lg"
          required
        />
                </div>

                {/* Description - spans full width */}
                <div className="col-span-1 md:col-span-2">
                <label className="font-semibold">Description</label>
                <textarea
                    name="description"
                    placeholder="Enter Project Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    rows={3}
                />
                </div>
            </div>

            <div className="text-right">
                <button 
                type="submit" 
                className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50"
                disabled={isLoading}
                >
                {isLoading ? 'Creating...' : 'Create Project'}
                </button>
            </div>
        </form>
      </div>

      {/* Projects Table */}
      <div className="bg-white p-6 rounded-xl shadow-md" key={refreshKey}>
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">All Projects</h2>
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-100 text-gray-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">Project Name</th>
                  <th className="p-3">Manager</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">End Date</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => {
                  const manager = managers.find(m => m.id === p.project_manager_id);
                  return (
                    <tr key={p.id} className="border-b">
                      <td className="p-3">{p.id}</td>
                      <td className="p-3">{p.project_name}</td>
                      <td className="p-3">
                        {manager ? `${manager.fullname}` : 'Unassigned'}
                      </td>
                      <td className="p-3">{new Date(p.start_date).toLocaleDateString()}</td>
                      <td className="p-3">{p.end_date ? new Date(p.end_date).toLocaleDateString() : '-'}</td>
                      <td className="p-3">{p.target_entry}</td>
                      <td className="p-3 text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 relative">
                        <div className="dropdown">
                          <button 
                          className="text-purple-600 hover:underline text-sm font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpenFor(dropdownOpenFor === p.id ? null : p.id);
                          }}
                        >
                          Manage
                        </button>
                          {dropdownOpenFor === p.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                              <div className="py-1">
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleViewProject(p)}
                                >
                                  View
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  onClick={() => handleEditProject(p)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  onClick={() => handleDeleteProject(p.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Project Modal */}
      {isViewModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedProject.project_name}</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* <div>
                  <p className="font-semibold">Project ID:</p>
                  <p>{selectedProject.id}</p>
                </div> */}
                <div>
                  <p className="font-semibold">Manager:</p>
                  <p>{managers.find(m => m.id === selectedProject.project_manager_id)?.fullname || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="font-semibold">Start Date:</p>
                  <p>{new Date(selectedProject.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">End Date:</p>
                  <p>{selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : '-'}</p>
                </div>
                <div>
                  <p className="font-semibold">Target Entries:</p>
                  <p>{selectedProject.target_entry}</p>
                </div>
              </div>
              
              {selectedProject.description && (
                <div>
                  <p className="font-semibold">Description:</p>
                  <p className="whitespace-pre-line">{selectedProject.description}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 text-right">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Project</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="font-semibold">Project Name *</label>
                    <input
                      type="text"
                      name="project_name"
                      value={editFormData.project_name}
                      onChange={handleEditInputChange}
                      className="w-full mt-1 p-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold">Task</label>
                    <input
                      type="text"
                      name="task"
                      placeholder="Enter Task (optional)"
                      value={editFormData.task || ''}
                      onChange={handleEditInputChange}
                      className="w-full mt-1 p-2 border rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold">Assign Manager *</label>
                  <select
                    name="project_manager_id"
                    value={editFormData.project_manager_id}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Manager</option>
                    {managers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.fullname} ({m.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold">Start Date *</label>
                  <input
                    type="date"
                    name="start_date"
                    value={editFormData.start_date}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold">End Date *</label>
                  <input
                    type="date"
                    name="end_date"
                    value={editFormData.end_date}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                    min={editFormData.start_date}
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Target Entries *</label>
                  <input
                    type="text"
                    name="target_entry"
                    value={editFormData.target_entry}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Description</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;