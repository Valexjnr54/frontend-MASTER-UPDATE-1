import { fetchProject } from '@/src/api/project_manager/ProjectService';
import { Project } from '@/src/types';
import React, { useState, useMemo } from 'react';
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

interface ProjectsViewProps {
  projects: Project[];
  currentManager: {
    id: string;
    fullname: string;
    email: string;
  };
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
  metadata: Array<{
    name: string;
    value: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, currentManager }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Define columns for the table
  const columns = useMemo<ColumnDef<Project>[]>(
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
        accessorKey: 'project_name',
        header: 'Project Name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'start_date',
        header: 'Start Date',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        accessorKey: 'target_entry',
        header: 'Target',
        cell: info => info.getValue(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const project = row.original;
          return (
            <button 
              className={`text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center ${
                isLoading && selectedProject?.id === project.id ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                setSelectedProject({ id: project.id } as Project);
                openModal(project.id);
              }}
              disabled={isLoading && selectedProject?.id === project.id}
            >
              {isLoading && selectedProject?.id === project.id ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : 'View'}
            </button>
          );
        },
      },
    ],
    [isLoading, selectedProject]
  );

  // Create the table instance
  const table = useReactTable({
    data: projects,
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
    pageCount: Math.ceil(projects.length / pagination.pageSize),
  });

  const openModal = async (projectId: number) => {
    console.log('1. Setting loading true');
    setIsLoading(true);
    setError(null);
    try {
      console.log('2. Fetching project...');
      const projectData = await Promise.all([
        fetchProject(projectId),
        new Promise(resolve => setTimeout(resolve, 500)) // Minimum 500ms delay
      ]).then(([data]) => data);
      console.log('3. Fetch completed', projectData);
      
      const project = Array.isArray(projectData) ? projectData[0] : projectData;
      if (!project) {
        throw new Error('Project data not found');
      }
      
      console.log('4. Setting selected project');
      setSelectedProject(project);
      setIsModalOpen(true);
    } catch (err) {
      console.log('5. Error occurred', err);
      setError(err.message || 'Failed to load project details');
    } finally {
      console.log('6. Setting loading false');
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
    setError(null);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e]">My Assigned Projects</h2>
          <button 
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
        
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
              placeholder="Search projects..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm"
            />
          </div>
        </div>
        
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
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                    No projects found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
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
        </div>
      </div>

      {/* Project Details Modal - Remaining code unchanged */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-[#1a0a2e]">
                  {selectedProject?.project_name || 'Project'} Details
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : selectedProject ? (
                <>
                  {/* Project Information Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold mb-4 text-purple-700 border-b pb-2">Project Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Project Name</p>
                          <p className="font-medium">{selectedProject.project_name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-medium">
                            {new Date(selectedProject.start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <p className="font-medium capitalize">{selectedProject.status?.toLowerCase() || 'active'}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-medium">
                            {new Date(selectedProject.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Target Entries</p>
                          <p className="font-medium">{selectedProject.target_entry}</p>
                        </div>
                      </div>
                    </div>
                    {selectedProject.description && (
                      <div className="mt-6">
                        <p className="text-sm text-gray-500">Description</p>
                        <p className="font-medium mt-1 text-gray-800">{selectedProject.description}</p>
                      </div>
                    )}
                  </div>

                  {/* Data Entries Section */}
                  <div>
                    <h4 className="text-lg font-semibold mb-4 text-purple-700 border-b pb-2">Data Entries</h4>
                    {selectedProject.data_entry && selectedProject.data_entry.length > 0 ? (
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedProject.data_entry.map((entry, index) => (
                              <tr key={index}>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                  {new Date(entry.date).toLocaleDateString()}
                                </td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                  {entry.location}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-gray-500">No data entries available for this project</p>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end rounded-b-lg border-t">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsView;