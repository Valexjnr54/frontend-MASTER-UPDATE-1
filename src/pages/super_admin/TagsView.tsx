import { createTag, deleteTag, updateTag, fetchTags } from "@/src/api/super_admin/tagService";
import { Tag } from "@/src/types";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

interface TagsViewProps {
  tags: Tag[];
  onTagAdded: (tag: Tag) => void;
  onTagUpdated: (tag: Tag) => void;
  onTagDeleted: (tagId: number) => void;
}

const TagsView: React.FC<TagsViewProps> = ({
  tags,
  onTagAdded,
  onTagUpdated,
  onTagDeleted,
}) => {
  const [formData, setFormData] = useState({
    name: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [dropdownOpenFor, setDropdownOpenFor] = useState<number | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
  });
  const [localTags, setLocalTags] = useState<Tag[]>([]);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Fetch tags on component mount
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        const tagsData = await fetchTags();
        setLocalTags(tagsData);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setError('Failed to load tags');
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  // Update local tags when props change
  useEffect(() => {
    if (tags && tags.length > 0) {
      setLocalTags(tags);
    }
  }, [tags]);

  // Define table columns
  const columns = useMemo<ColumnDef<Tag>[]>(
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
        accessorKey: 'name',
        header: 'Tag Name',
        cell: info => info.getValue(),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: info => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const tag = row.original;
          return (
            <div className="relative">
              <button 
                className="text-purple-600 hover:underline text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpenFor(dropdownOpenFor === tag.id ? null : tag.id);
                }}
              >
                Manage
              </button>
              {dropdownOpenFor === tag.id && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleViewTag(tag)}
                    >
                      View
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleEditTag(tag)}
                    >
                      Edit
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      onClick={() => handleDeleteTag(tag.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableGlobalFilter: false,
      },
    ],
    [dropdownOpenFor]
  );

  // Initialize table
  const table = useReactTable({
    data: localTags,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Handle view tag
  const handleViewTag = (tag: Tag) => {
    setDropdownOpenFor(null);
    setSelectedTag(tag);
    setIsViewModalOpen(true);
  };

  // Handle edit tag
  const handleEditTag = (tag: Tag) => {
    setDropdownOpenFor(null);
    setSelectedTag(tag);
    setEditFormData({
      name: tag.name,
    });
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle update tag
  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTag) return;

    try {
      setIsLoading(true);
      const updatedTag = await updateTag(selectedTag.id, {
        name: editFormData.name,
      });

      // Update local state
      setLocalTags(prev => 
        prev.map(t => t.id === selectedTag.id ? updatedTag : t)
      );
      
      // Call parent callback if provided
      if (onTagUpdated) {
        onTagUpdated(updatedTag);
      }
      
      setIsEditModalOpen(false);
      setSelectedTag(null);
      await showSuccessAlert('Success!', 'Tag updated successfully');
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to update tag. Please try again.');
      console.error('Tag update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete tag
  const handleDeleteTag = async (tagId: number) => {
    setDropdownOpenFor(null);
    try {
      const result = await showConfirmationAlert(
        'Are you sure?',
        'You will not be able to recover this tag!',
        'warning',
        true
      );

      if (result.isConfirmed) {
        setIsLoading(true);
        await deleteTag(tagId);
        
        // Update local state
        setLocalTags(prev => prev.filter(t => t.id !== tagId));
        
        // Call parent callback if provided
        if (onTagDeleted) {
          onTagDeleted(tagId);
        }
        
        setSelectedTag(null);
        await showSuccessAlert('Deleted!', 'Tag has been deleted.');
      }
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to delete tag. Please try again.');
      console.error('Tag deletion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
  }, [dropdownOpenFor]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Please enter a tag name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newTag = await createTag({
        name: formData.name,
      });

      // Update local state
      setLocalTags(prev => [...prev, newTag]);
      
      // Call parent callback if provided
      if (onTagAdded) {
        onTagAdded(newTag);
      }
      
      setSelectedTag(null);
      
      // Reset form
      setFormData({
        name: '',
      });

      await showSuccessAlert('Success!', 'Tag created successfully');
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to create tag. Please try again.');
      console.error('Tag creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Create New Tag</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleTagSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tag Name - spans full width */}
                <div className="col-span-1 md:col-span-2">
                    <label className="font-semibold">Tag Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter Tag Name"
                      value={formData.name}
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
                {isLoading ? 'Creating...' : 'Create Tag'}
                </button>
            </div>
        </form>
      </div>

      {/* Tags Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e]">All Tags</h2>
          
          {/* Global Search Filter */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search all tags..."
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              className="max-w-sm p-2 border rounded-lg"
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : localTags.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tags found. Create your first tag above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="p-3 cursor-pointer"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
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
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {table.getRowModel().rows.length} of {localTags.length} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
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
          </div>
        )}
      </div>

      {/* View Tag Modal */}
      {isViewModalOpen && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedTag.name}</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Tag ID:</p>
                  <p>{selectedTag.id}</p>
                </div>
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{selectedTag.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Created Date:</p>
                  <p>{new Date(selectedTag.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Updated Date:</p>
                  <p>{new Date(selectedTag.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
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

      {/* Edit Tag Modal */}
      {isEditModalOpen && selectedTag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Tag</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Tag Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
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
                  {isLoading ? 'Updating...' : 'Update Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagsView;