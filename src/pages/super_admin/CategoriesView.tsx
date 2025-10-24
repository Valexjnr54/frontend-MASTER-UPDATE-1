import { createCategory, deleteCategory, updateCategory, fetchCategories } from "@/src/api/super_admin/categoryService";
import { Category } from "@/src/types";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import React, { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';

interface CategoriesViewProps {
  categories: Category[];
  onCategoryAdded: (category: Category) => void;
  onCategoryUpdated: (category: Category) => void;
  onCategoryDeleted: (categoryId: number) => void;
}

const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onCategoryAdded,
  onCategoryUpdated,
  onCategoryDeleted,
}) => {
  const [formData, setFormData] = useState({
    name: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dropdownOpenFor, setDropdownOpenFor] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
  });
  const [localCategories, setLocalCategories] = useState<Category[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  // Define columns for the table
  const columns = useMemo<ColumnDef<Category>[]>(
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
        header: 'Category Name',
        size: 200,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => {
          const date = getValue() as string;
          return new Date(date).toLocaleDateString();
        },
        size: 120,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="relative">
              <div className="dropdown">
                <button 
                  className="text-purple-600 hover:underline text-sm font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpenFor(dropdownOpenFor === category.id ? null : category.id);
                  }}
                >
                  Manage
                </button>
                {dropdownOpenFor === category.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleViewCategory(category)}
                      >
                        View
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditCategory(category)}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        },
        size: 120,
      },
    ],
    [dropdownOpenFor]
  );

  // Create table instance
  const table = useReactTable({
    data: localCategories,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const categoriesData = await fetchCategories();
        setLocalCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Update local categories when props change
  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories);
    }
  }, [categories]);

  // Handle view category
  const handleViewCategory = (category: Category) => {
    setDropdownOpenFor(null);
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setDropdownOpenFor(null);
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
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

  // Handle update category
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) return;

    try {
      setIsLoading(true);
      const updatedCategory = await updateCategory(selectedCategory.id, {
        name: editFormData.name,
      });

      // Update local state
      setLocalCategories(prev => 
        prev.map(cat => cat.id === selectedCategory.id ? updatedCategory : cat)
      );
      
      // Call parent callback if provided
      if (onCategoryUpdated) {
        onCategoryUpdated(updatedCategory);
      }
      
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      await showSuccessAlert('Success!', 'Category updated successfully');
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to update category. Please try again.');
      console.error('Category update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: number) => {
    setDropdownOpenFor(null);
    try {
      const result = await showConfirmationAlert(
        'Are you sure?',
        'You will not be able to recover this category!',
        'warning',
        true
      );

      if (result.isConfirmed) {
        setIsLoading(true);
        await deleteCategory(categoryId);
        
        // Update local state
        setLocalCategories(prev => prev.filter(cat => cat.id !== categoryId));
        
        // Call parent callback if provided
        if (onCategoryDeleted) {
          onCategoryDeleted(categoryId);
        }
        
        setSelectedCategory(null);
        await showSuccessAlert('Deleted!', 'Category has been deleted.');
      }
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to delete category. Please try again.');
      console.error('Category deletion error:', error);
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

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError('Please enter a category name.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newCategory = await createCategory({
        name: formData.name,
      });

      // Update local state
      setLocalCategories(prev => [...prev, newCategory]);
      
      // Call parent callback if provided
      if (onCategoryAdded) {
        onCategoryAdded(newCategory);
      }
      
      setSelectedCategory(null);
      
      // Reset form
      setFormData({
        name: '',
      });

      await showSuccessAlert('Success!', 'Category created successfully');
    } catch (error) {
      await showErrorAlert('Error!', 'Failed to create category. Please try again.');
      console.error('Category creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Create New Category</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleCategorySubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Category *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter Category"
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
                {isLoading ? 'Creating...' : 'Create Category'}
                </button>
            </div>
        </form>
      </div>

      {/* Categories Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e]">All Categories</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="px-4 py-2 border rounded-lg w-64"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : localCategories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No categories found. Create your first category above.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="p-3 text-left"
                        style={{ width: header.getSize() }}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
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
                Showing {table.getRowModel().rows.length} of{' '}
                {table.getFilteredRowModel().rows.length} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Category Modal */}
      {isViewModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
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
                  <p className="font-semibold">Category ID:</p>
                  <p>{selectedCategory.id}</p>
                </div>
                <div>
                  <p className="font-semibold">Name:</p>
                  <p>{selectedCategory.name}</p>
                </div>
                <div>
                  <p className="font-semibold">Created Date:</p>
                  <p>{new Date(selectedCategory.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Updated Date:</p>
                  <p>{new Date(selectedCategory.updatedAt).toLocaleDateString()}</p>
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

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Category</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Category Name *</label>
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
                  {isLoading ? 'Updating...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesView;