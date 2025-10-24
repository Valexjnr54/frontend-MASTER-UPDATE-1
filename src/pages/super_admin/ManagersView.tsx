import { 
  createProjectManager, 
  getProjectManagerDetails,
  updateProjectManager,
  deleteProjectManager,
  fetchProjectManagers 
} from "@/src/api/super_admin/projectManagerService";
import { ProjectManager } from "@/src/types";
import { showErrorAlert, showSuccessAlert, showConfirmationAlert } from "@/src/utils/alerts";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  ColumnFiltersState,
} from '@tanstack/react-table';

// View Modal Component (unchanged)
const ViewManagerModal: React.FC<{
  manager: ProjectManager;
  onClose: () => void;
}> = ({ manager, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        {/* ... existing view modal content ... */}
      </div>
    </div>
  );
};

// Edit Modal Component (unchanged)
const EditManagerModal: React.FC<{
  manager: ProjectManager;
  onClose: () => void;
  onUpdate: (updatedManager: ProjectManager) => void;
}> = ({ manager, onClose, onUpdate }) => {
  // ... existing edit modal code ...
};

// Main Component
const ManagersView: React.FC<{ 
  managers: ProjectManager[];
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
  
  // Table state
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Define columns for the table
  const columns = useMemo<ColumnDef<ProjectManager>[]>(
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
        accessorKey: 'fullname',
        header: 'Name',
        cell: ({ row }) => <div className="p-3">{row.original.fullname}</div>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <div className="p-3">{row.original.email}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <div className="p-3">
            <span
              className={`${
                row.original.status === 'Active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              } px-3 py-1 text-xs font-semibold rounded-full`}
            >
              {row.original.status}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: ({ row }) => (
          <div className="p-3 text-sm text-gray-500">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="p-3 relative">
            <button 
              onClick={() => toggleDropdown(row.original.id)}
              className="text-purple-600 hover:underline text-sm font-semibold"
            >
              Manage
            </button>
            
            {activeDropdown === row.original.id && (
              <div 
                ref={dropdownRef}
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
              >
                <div className="py-1">
                  <button
                    onClick={() => handleView(row.original)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleDelete(row.original)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ),
      },
    ],
    [activeDropdown]
  );

  // Initialize the table
  const table = useReactTable({
    data: managers,
    columns,
    state: {
      columnFilters,
      globalFilter,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

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

      {/* Project Manager Table with TanStack React Table */}
      <div className="bg-white p-6 rounded-xl shadow-md" key={refreshKey}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e]">All Project Managers</h2>
          
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search managers..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-3">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>
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
              <div className="text-sm text-gray-500">
                Showing {table.getRowModel().rows.length} of{' '}
                {managers.length} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 border rounded-lg disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm">Page</span>
                <strong>
                  {table.getState().pagination.pageIndex + 1} of{' '}
                  {table.getPageCount()}
                </strong>
              </div>
            </div>
          </>
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

export default ManagersView;