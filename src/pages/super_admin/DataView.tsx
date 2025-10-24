import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import apiConfig from '../../config/api';

interface MetadataItem {
  name: string;
  value: string;
}

interface ProjectManager {
  id: number;
  fullname: string;
  username: string;
  email: string;
  status: string;
}

interface Project {
  id: number;
  project_name: string;
  project_manager_id: number;
  description: string;
  project_manager: ProjectManager;
}

interface DataEntry {
  id: number;
  project_id: number;
  date: string;
  location: string;
  description: string;
  image_url: string;
  video_url: string;
  document_url: string;
  metadata: MetadataItem[];
  project: Project;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const DataView: React.FC = () => {
  const [allData, setAllData] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DataEntry | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(
          `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.ADMIN.ALL_DATA_ENTRIES}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
    
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
    
        const result = await response.json();
        const data = result.data;
        
        if (!Array.isArray(data)) {
          throw new Error('Expected array in data property but got: ' + JSON.stringify(result));
        }
    
        setAllData(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleViewClick = (entry: DataEntry) => {
    setSelectedEntry(entry);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  // Define columns
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
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.project.project_name}</div>
            <div className="text-xs text-gray-500 line-clamp-1">
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'project.project_manager.fullname',
        header: 'Manager',
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.project.project_manager.fullname}</div>
            <div className="text-xs text-gray-500">
              {row.original.project.project_manager.username}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'location',
        header: 'Location',
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <button 
            onClick={() => handleViewClick(row.original)}
            className="text-purple-600 hover:text-purple-900 text-sm font-medium"
          >
            View
          </button>
        ),
      },
    ],
    []
  );

  // Create table instance
  const table = useReactTable({
    data: allData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">Error loading data: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#1a0a2e]">All Collected Data</h2>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Showing {table.getFilteredRowModel().rows.length} entries
          </div>
          <input
            type="text"
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
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
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <span>
            Page{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Modal (unchanged from your original code) */}
      {isModalOpen && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Data Entry Details
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-700">Project Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Project Name</p>
                      <p className="font-medium">{selectedEntry.project.project_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project Manager</p>
                      <p className="font-medium">{selectedEntry.project.project_manager.fullname}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project Description</p>
                      <p className="font-medium">{selectedEntry.project.description}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg mb-2 text-gray-700">Entry Details</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">{formatDate(selectedEntry.date)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{selectedEntry.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Description</p>
                      <p className="font-medium">{selectedEntry.description}</p>
                    </div>
                  </div>
                </div>

                {selectedEntry.metadata && selectedEntry.metadata.length > 0 && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-lg mb-2 text-gray-700">Metadata</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedEntry.metadata.map((item, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-500">{item.name}</p>
                          <p className="font-medium">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedEntry.image_url || selectedEntry.video_url || selectedEntry.document_url) && (
                  <div className="md:col-span-2">
                    <h4 className="font-semibold text-lg mb-2 text-gray-700">Media & Documents</h4>
                    <div className="space-y-4">
                      {selectedEntry.image_url && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Image</p>
                          <img 
                            src={selectedEntry.image_url} 
                            alt="Data entry" 
                            className="max-w-full h-auto rounded border border-gray-200"
                          />
                        </div>
                      )}
                      {selectedEntry.video_url && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Video</p>
                          <video 
                            src={selectedEntry.video_url} 
                            controls 
                            className="max-w-full rounded border border-gray-200"
                          />
                        </div>
                      )}
                      {selectedEntry.document_url && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Document</p>
                          <a 
                            href={selectedEntry.document_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:text-purple-800 flex items-center"
                          >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            View Document
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2 text-sm text-gray-500">
                  <p>Created: {formatDate(selectedEntry.createdAt)}</p>
                  <p>Last Updated: {formatDate(selectedEntry.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataView;