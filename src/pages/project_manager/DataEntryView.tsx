import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  fetchProjects,
  fetchDataEntries,
  createDataEntry,
  updateDataEntry,
  deleteDataEntry,
  uploadImage,
  uploadVideo,
  uploadDocument
} from '../../api/project_manager/dataEntryService';
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from '@/src/utils/alerts';
import { CustomField, MediaFile, SubmittedData } from '@/src/types';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  PaginationState,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface Project {
  id: string;
  name: string;
  project_name: string;
  project_manager_id?: string;
}

interface DataEntry {
  id: string;
  project_id: string;
  date: string;
  description: string;
  location: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: CustomField[];
  project?: Project;
  createdAt?: string;
  updatedAt?: string;
}

const DataEntryView: React.FC<{ addSubmission: (submission: SubmittedData) => void }> = ({ addSubmission }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([{ name: '', value: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [entriesError, setEntriesError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // File size limits in bytes (5MB for images, 50MB for videos, 10MB for documents)
  const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB
    video: 5 * 1024 * 1024, // 5MB
    file: 5 * 1024 * 1024, // 5MB
  };

  // Table states
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Fetch projects
  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      setProjectsError(null);
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
        if (projectsData.length > 0) {
          setSelectedProjectId(projectsData[0].id);
        }
      } catch (error) {
        setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  // Fetch data entries
  useEffect(() => {
    const loadEntries = async () => {
      setLoadingEntries(true);
      setEntriesError(null);
      try {
        const entriesData = await fetchDataEntries();
        setDataEntries(entriesData);
      } catch (error) {
        setEntriesError(error instanceof Error ? error.message : 'Failed to load entries');
      } finally {
        setLoadingEntries(false);
      }
    };

    loadEntries();
  }, []);

  // Define columns for the data table
  const columns = useMemo<ColumnDef<DataEntry>[]>(
    () => [
      {
        id: 'serialNumber',
        header: 'S/N',
        size: 60,
        cell: ({ row }) => (
          <div className="text-center">{row.index + 1}</div>
        ),
      },
      {
        accessorKey: 'project.project_name',
        header: 'Project',
        cell: info => info.getValue() || 'N/A',
      },
      {
        accessorKey: 'location',
        header: 'Location',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: info => formatDate(info.getValue() as string),
      },
      {
        id: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.original.description}>
            {row.original.description}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const entry = row.original;
          return (
            <div className="relative">
              <button 
                onClick={() => toggleDropdown(entry.id)}
                className="text-purple-600 hover:text-purple-900 text-sm font-medium"
              >
                Manage <i className={`fas fa-chevron-${dropdownOpen === entry.id ? 'up' : 'down'} ml-1`}></i>
              </button>
              
              {dropdownOpen === entry.id && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button
                      onClick={() => handleView(entry)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-eye mr-2"></i> View
                    </button>
                    <button
                      onClick={() => handleEdit(entry)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <i className="fas fa-edit mr-2"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <i className="fas fa-trash mr-2"></i> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    [dropdownOpen]
  );

  // Create the table instance
  const table = useReactTable({
    data: dataEntries,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    pageCount: Math.ceil(dataEntries.length / pagination.pageSize),
  });

  // Retry functions
  const retryFetchProjects = async () => {
    setProjectsError(null);
    setLoadingProjects(true);
    try {
      const projectsData = await fetchProjects();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (error) {
      setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
    } finally {
      setLoadingProjects(false);
    }
  };

  const retryFetchEntries = async () => {
    setLoadingEntries(true);
    setEntriesError(null);
    try {
      const entriesData = await fetchDataEntries();
      setDataEntries(entriesData);
    } catch (error) {
      setEntriesError(error instanceof Error ? error.message : 'Failed to load entries');
    } finally {
      setLoadingEntries(false);
    }
  };

  // File handling with size validation
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > FILE_SIZE_LIMITS[type]);
      if (oversizedFiles.length > 0) {
        const fileTypeName = type.charAt(0).toUpperCase() + type.slice(1);
        const maxSizeMB = FILE_SIZE_LIMITS[type] / (1024 * 1024);
        
        await showErrorAlert(
          'File Too Large', 
          `${fileTypeName} files cannot exceed ${maxSizeMB}MB. Please choose smaller files.`
        );
        
        // Clear the file input
        e.target.value = '';
        return;
      }
      
      const newFiles = files.map(file => ({
        file,
        type,
        previewUrl: type === 'image' ? URL.createObjectURL(file) : undefined,
        uploading: true,
        error: undefined
      }));
      
      setMediaFiles(prev => [...prev, ...newFiles]);
      
      // Upload files sequentially
      for (const [index, newFile] of newFiles.entries()) {
        try {
          let cloudinaryUrl: string;
          switch(type) {
            case 'image':
              cloudinaryUrl = await uploadImage(newFile.file);
              break;
            case 'video':
              cloudinaryUrl = await uploadVideo(newFile.file);
              break;
            case 'file':
              cloudinaryUrl = await uploadDocument(newFile.file);
              break;
            default:
              throw new Error(`Unknown type: ${type}`);
          }
          
          setMediaFiles(prev => prev.map((item, i) => 
            i === prev.length - newFiles.length + index 
              ? { 
                  ...item, 
                  cloudinaryUrl, 
                  uploading: false,
                  previewUrl: type === 'image' ? cloudinaryUrl : item.previewUrl
                } 
              : item
          ));
        } catch (error) {
          setMediaFiles(prev => prev.map((item, i) => 
            i === prev.length - newFiles.length + index 
              ? { ...item, uploading: false, error: 'Upload failed' } 
              : item
          ));
          
          if (newFile.previewUrl) {
            URL.revokeObjectURL(newFile.previewUrl);
          }
        }
      }
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Wait for pending uploads
      const pendingUploads = mediaFiles.filter(f => f.uploading && !f.error);
      if (pendingUploads.length > 0) {
        await Promise.all(pendingUploads.map(async (file, index) => {
          try {
            let cloudinaryUrl: string;
            switch(file.type) {
              case 'image':
                cloudinaryUrl = await uploadImage(file.file);
                break;
              case 'video':
                cloudinaryUrl = await uploadVideo(file.file);
                break;
              case 'file':
                cloudinaryUrl = await uploadDocument(file.file);
                break;
              default:
                throw new Error(`Unknown type: ${file.type}`);
            }
            
            setMediaFiles(prev => prev.map((item, i) => 
              i === index ? { ...item, cloudinaryUrl, uploading: false } : item
            ));
          } catch (error) {
            setMediaFiles(prev => prev.map((item, i) => 
              i === index ? { ...item, uploading: false, error: 'Upload failed' } : item
            ));
            throw new Error(`Failed to upload ${file.file.name}`);
          }
        }));
      }
      
      // Check for errors
      if (mediaFiles.some(f => f.error)) {
        await showErrorAlert('Error', 'Please fix upload errors before submitting');
        return;
      }
      
      // Prepare submission data
      const newSubmission: SubmittedData = {
        project_id: parseInt(selectedProjectId),
        project: projects.find(p => p.id === selectedProjectId)?.name || '',
        date,
        description,
        location,
        image_url: mediaFiles.find(f => f.type === 'image' && f.cloudinaryUrl)?.cloudinaryUrl || '',
        video_url: mediaFiles.find(f => f.type === 'video' && f.cloudinaryUrl)?.cloudinaryUrl || '',
        document_url: mediaFiles.find(f => f.type === 'file' && f.cloudinaryUrl)?.cloudinaryUrl || '',
        metadata: customFields.filter(f => f.name && f.value)
      };
      
      // Submit data
      const createdEntry = await createDataEntry(newSubmission);
      addSubmission(newSubmission);
      
      // Reset form
      setDate(new Date().toISOString().split('T')[0]);
      setLocation('');
      setDescription('');
      setMediaFiles([]);
      setCustomFields([{ name: '', value: '' }]);

      await showSuccessAlert('Success!', 'Data submitted successfully!');
      
      // Refresh entries
      const updatedEntries = await fetchDataEntries();
      setDataEntries(updatedEntries);
    } catch (error) {
      console.error('Submission error:', error);
      await showErrorAlert('Error!', 'Failed to submit data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Entry management
  const handleView = (entry: DataEntry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
    setDropdownOpen(null);
  };

  const handleEdit = (entry: DataEntry) => {
    setSelectedEntry(entry);
    setShowEditModal(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (entryId: string) => {
    setDropdownOpen(null);
    
    const confirm = await showConfirmationAlert(
      'Are you sure?',
      'You are about to delete this data entry. This action cannot be undone.',
      'warning'
    );
    
    if (confirm) {
      try {
        await deleteDataEntry(entryId);
        setDataEntries(prev => prev.filter(entry => entry.id !== entryId));
        await showSuccessAlert('Deleted!', 'The data entry has been deleted.');
      } catch (error) {
        console.error('Delete error:', error);
        await showErrorAlert('Error!', 'Failed to delete data entry.');
      }
    }
  };

  const handleUpdate = async (updatedEntry: DataEntry) => {
    try {
      const result = await updateDataEntry(updatedEntry.id, updatedEntry);
      
      if (!result?.id) {
        throw new Error('Invalid response from server');
      }

      // Ensure the project property exists
      const normalizedEntry: DataEntry = {
        ...result,
      };

      setDataEntries(prev => 
        prev.map(entry => entry.id === updatedEntry.id ? normalizedEntry : entry)
      );

      await showSuccessAlert('Updated!', 'The data entry has been updated.');
      setShowEditModal(false);
      
      return normalizedEntry;
    } catch (error) {
      console.error('Update error:', error);
      await showErrorAlert(
        'Update Failed', 
        error instanceof Error ? error.message : 'Failed to update entry'
      );
      throw error;
    }
  };
  
  // Helper functions
  const addField = () => setCustomFields([...customFields, { name: '', value: '' }]);
  
  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleCustomFieldChange = (index: number, field: 'name' | 'value', value: string) => {
    const newFields = [...customFields];
    newFields[index][field] = value;
    setCustomFields(newFields);
  };

  const removeFile = (index: number, type: 'image' | 'video' | 'file') => {
    setMediaFiles(prev => {
      // Filter files of the specified type
      const filesOfType = prev.filter(f => f.type === type);
      // Get the specific file to remove
      const fileToRemove = filesOfType[index];
      
      // Remove the file from the main array
      return prev.filter(file => file !== fileToRemove);
    });
  };

  const toggleDropdown = (id: string) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // View Modal Component
  const ViewModal = ({ entry, onClose }: { entry: DataEntry | null, onClose: () => void }) => {
    if (!entry) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Data Entry Details</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Project:</p>
                <p>{entry.project?.project_name || 'N/A'}</p>
              </div>
              <div>
                <p className="font-semibold">Date:</p>
                <p>{formatDate(entry.date)}</p>
              </div>
              <div>
                <p className="font-semibold">Location:</p>
                <p>{entry.location}</p>
              </div>
            </div>
            
            <div>
              <p className="font-semibold">Description:</p>
              <p className="whitespace-pre-line">{entry.description}</p>
            </div>
            
            {entry.metadata && entry.metadata.length > 0 && (
              <div>
                <p className="font-semibold mb-2">Custom Fields:</p>
                <div className="grid grid-cols-2 gap-2">
                  {entry.metadata.map((field, index) => (
                    <div key={index} className="bg-gray-50 p-2 rounded">
                      <p className="text-sm font-medium">{field.name}</p>
                      <p className="text-sm">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-right">
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
  const EditModal = ({ 
    entry, 
    onClose, 
    onUpdate,
    projects 
  }: { 
    entry: DataEntry | null; 
    onClose: () => void; 
    onUpdate: (entry: DataEntry) => Promise<DataEntry>;
    projects: Project[];
  }) => {
    const [formData, setFormData] = useState({
      project_id: entry?.project_id || '',
      date: entry?.date.split('T')[0] || new Date().toISOString().split('T')[0],
      location: entry?.location || '',
      description: entry?.description || '',
    });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
      if (entry) {
        setFormData({
          project_id: entry.project_id,
          date: entry.date.split('T')[0],
          location: entry.location,
          description: entry.description,
        });
      }
    }, [entry]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!entry) return;
      
      setUpdating(true);
      try {
        const updatedEntry: DataEntry = {
          ...entry,
          project_id: formData.project_id,
          date: formData.date,
          location: formData.location,
          description: formData.description,
        };
        
        await onUpdate(updatedEntry);
      } catch (error) {
        console.error('Error updating entry:', error);
      } finally {
        setUpdating(false);
      }
    };

    if (!entry) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Edit Data Entry</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Project</label>
                <select
                  name="project_id"
                  value={formData.project_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name || project.project_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                {updating ? 'Updating...' : 'Update Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-[#1a0a2e] mb-6">Project Data Entry</h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block mb-2 font-semibold">Select Project</label>
                {loadingProjects ? (
                <div className="p-3 border rounded-lg bg-gray-100 animate-pulse">Loading projects...</div>
                ) : projectsError ? (
                <div className="flex items-center gap-2">
                    <span className="text-red-500">{projectsError}</span>
                    <button 
                    onClick={retryFetchProjects}
                    className="text-purple-600 hover:underline text-sm"
                    >
                    Retry
                    </button>
                </div>
                ) : (
                <select 
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)} 
                    className="w-full p-3 border rounded-lg"
                    required
                    disabled={projects.length === 0}
                >
                    {projects.length === 0 ? (
                    <option value="">No projects available</option>
                    ) : (
                    projects.map(project => (
                        <option key={project.id} value={project.id}>
                        {project.name || project.project_name}
                        </option>
                    ))
                    )}
                </select>
                )}
            </div>
            <div>
                <label className="block mb-2 font-semibold">Date</label>
                <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full p-3 border rounded-lg"
                required
                />
            </div>
            </div>
            <div>
            <label className="block mb-2 font-semibold">Location</label>
            <input 
                type="text" 
                placeholder="Enter Location"
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                className="w-full p-3 border rounded-lg"
                required
            />
            </div>
            <div>
            <label className="block mb-2 font-semibold">Activity Description</label>
            <textarea 
                value={description} 
                placeholder="Enter Description"
                onChange={e => setDescription(e.target.value)} 
                rows={4} 
                className="w-full p-3 border rounded-lg" 
                required
            />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block mb-2 font-semibold">Image Upload</label>
                <div className="mb-1 text-sm text-gray-500">
                  Max size: {FILE_SIZE_LIMITS.image / (1024 * 1024)}MB
                </div>
                <div 
                onClick={() => {
                    if (imageInputRef.current) {
                    imageInputRef.current.accept = 'image/*';
                    imageInputRef.current.click();
                    }
                }} 
                className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50"
                >
                <i className="fas fa-image text-3xl text-gray-400"></i>
                <p>Upload Image</p>
                <input 
                    type="file"
                    ref={imageInputRef} 
                    onChange={(e) => handleFileChange(e, 'image')} 
                    accept="image/*"
                    className="hidden"
                />
                </div>
                <div className="mt-3 space-y-2">
                {mediaFiles.filter(f => f.type === 'image').map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                        {/* Show either local preview or Cloudinary URL */}
                        {(file.previewUrl || file.cloudinaryUrl) && (
                            <img 
                            src={file.cloudinaryUrl || file.previewUrl} 
                            alt="Preview" 
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => {
                                // Fallback if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxM0wyMy41IDE3LjVMMjYgMTQuNUwyOS41IDE5SDExTDE1IDE0TDE3LjUgMTdMMjAgMTNaIiBmaWxsPSIjOUE5QTlBIi8+CjxjaXJjbGUgY3g9IjE1LjUiIGN5PSIxMy41IiByPSIxLjUiIGZpbGw9IiM5QTlBOUEiLz4KPC9zdmc+';
                            }}
                            />
                        )}
                        <div className="flex flex-col">
                            <span className="text-sm truncate max-w-xs">{file.file.name}</span>
                            <span className="text-xs text-gray-500">
                            {formatFileSize(file.file.size)}
                            </span>
                        </div>
                        </div>
                    <div className="flex items-center gap-2">
                        {file.uploading && (
                        <span className="text-xs text-gray-500">Uploading...</span>
                        )}
                        {file.cloudinaryUrl && (
                        <span className="text-xs text-green-500">Uploaded</span>
                        )}
                        {file.error && (
                        <span className="text-xs text-red-500">{file.error}</span>
                        )}
                        <button 
                        type="button" 
                        onClick={() => removeFile(i, 'image')}
                        className="text-red-500 hover:text-red-700"
                        >
                        <i className="fas fa-times"></i>
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <label className="block mb-2 font-semibold">Video Upload</label>
                <div className="mb-1 text-sm text-gray-500">
                  Max size: {FILE_SIZE_LIMITS.video / (1024 * 1024)}MB
                </div>
                <div 
                onClick={() => {
                    if (videoInputRef.current) {
                    videoInputRef.current.accept = 'video/*';
                    videoInputRef.current.click();
                    }
                }} 
                className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50"
                >
                <i className="fas fa-video text-3xl text-gray-400"></i>
                <p>Upload Video</p>
                    <input 
                        type="file"
                        ref={videoInputRef} 
                        onChange={(e) => handleFileChange(e, 'video')} 
                        accept="video/*"
                        className="hidden"
                    />
                </div>
                <div className="mt-3 space-y-2">
                {mediaFiles.filter(f => f.type === 'video').map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-video text-gray-400"></i>
                        <div className="flex flex-col">
                            <span className="text-sm truncate max-w-xs">{file.file.name}</span>
                            <span className="text-xs text-gray-500">
                            {formatFileSize(file.file.size)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {file.uploading && (
                        <span className="text-xs text-gray-500">Uploading...</span>
                        )}
                        {file.cloudinaryUrl && (
                        <span className="text-xs text-green-500">Uploaded</span>
                        )}
                        {file.error && (
                        <span className="text-xs text-red-500">{file.error}</span>
                        )}
                        <button 
                        type="button" 
                        onClick={() => removeFile(i, 'video')}
                        className="text-red-500 hover:text-red-700"
                        >
                        <i className="fas fa-times"></i>
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            <div>
                <label className="block mb-2 font-semibold">File Upload</label>
                <div className="mb-1 text-sm text-gray-500">
                  Max size: {FILE_SIZE_LIMITS.file / (1024 * 1024)}MB
                </div>
                <div 
                onClick={() => {
                    if (fileInputRef.current) {
                    fileInputRef.current.accept = '*/*';
                    fileInputRef.current.click();
                    }
                }} 
                className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50"
                >
                <i className="fas fa-file-upload text-3xl text-gray-400"></i>
                <p>Upload Files</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={(e) => handleFileChange(e, 'file')} 
                    accept="*/*"
                    className="hidden"
                    />
                </div>
                <div className="mt-3 space-y-2">
                {mediaFiles.filter(f => f.type === 'file').map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-file text-gray-400"></i>
                        <div className="flex flex-col">
                            <span className="text-sm truncate max-w-xs">{file.file.name}</span>
                            <span className="text-xs text-gray-500">
                            {formatFileSize(file.file.size)}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {file.uploading && (
                        <span className="text-xs text-gray-500">Uploading...</span>
                        )}
                        {file.cloudinaryUrl && (
                        <span className="text-xs text-green-500">Uploaded</span>
                        )}
                        {file.error && (
                        <span className="text-xs text-red-500">{file.error}</span>
                        )}
                        <button 
                        type="button" 
                        onClick={() => removeFile(i, 'file')}
                        className="text-red-500 hover:text-red-700"
                        >
                        <i className="fas fa-times"></i>
                        </button>
                    </div>
                    </div>
                ))}
                </div>
            </div>
            </div>
            <div>
            <h3 className="text-xl font-bold mb-3">Custom Data Fields</h3>
            <div className="space-y-3">
                {customFields.map((field, index) => (
                <div key={index} className="flex items-center gap-3">
                    <input 
                    type="text" 
                    placeholder="Field Name (e.g., Headcount)" 
                    value={field.name} 
                    onChange={e => handleCustomFieldChange(index, 'name', e.target.value)} 
                    className="w-1/2 p-3 border rounded-lg"
                    />
                    <input 
                    type="text" 
                    placeholder="Value" 
                    value={field.value} 
                    onChange={e => handleCustomFieldChange(index, 'value', e.target.value)} 
                    className="flex-1 p-3 border rounded-lg"
                    />
                    <button 
                    type="button" 
                    onClick={() => removeField(index)} 
                    className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex-shrink-0"
                    >
                    &times;
                    </button>
                </div>
                ))}
            </div>
            <button 
                type="button" 
                onClick={addField} 
                className="mt-4 text-purple-600 font-semibold"
            >
                + Add Field
            </button>
            </div>
            <div className="text-right pt-6 border-t">
            <button 
                type="submit" 
                className="px-8 py-3 bg-[#880088] text-white font-bold rounded-lg shadow-md hover:bg-[#4b0082] disabled:opacity-50"
                disabled={isSubmitting || mediaFiles.some(f => f.uploading || f.error) || projects.length === 0}
            >
                {isSubmitting ? (
                <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Submitting...
                </>
                ) : (
                'Submit Data'
                )}
            </button>
            </div>
        </form>
      </div>
      
      {/* Recent Data Entries Table with Data Table Features */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-[#1a0a2e] mb-6">Recent Data Entries</h2>
        
        {/* Search Input */}
        <div className="mb-4">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search entries..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm"
            />
          </div>
        </div>
        
        {loadingEntries ? (
          <div className="p-4 text-center">
            <div className="flex justify-center items-center">
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Loading entries...
            </div>
          </div>
        ) : entriesError ? (
          <div className="p-4 text-center text-red-500">
            <div className="flex flex-col items-center">
              <p>{entriesError}</p>
              <button 
                onClick={retryFetchEntries}
                className="mt-2 text-purple-600 hover:underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : dataEntries.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No data entries found
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                      {headerGroup.headers.map(header => (
                        <th 
                          key={header.id} 
                          className="p-3 cursor-pointer select-none"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="p-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm text-gray-700">
                  <div>Page</div>
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </strong>
                </span>
                <select
                  className="border rounded p-1 text-sm"
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value));
                  }}
                >
                  {[5, 10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* View Modal */}
      {showViewModal && (
        <ViewModal 
          entry={selectedEntry} 
          onClose={() => setShowViewModal(false)} 
        />
      )}
      
      {/* Edit Modal */}
      {showEditModal && (
        <EditModal 
          entry={selectedEntry} 
          onClose={() => setShowEditModal(false)} 
          onUpdate={handleUpdate}
          projects={projects}
        />
      )}
    </div>
  );
};

export default DataEntryView;