import { createBlog, deleteBlog, updateBlog, fetchBlogs, createBlogFormData } from "@/src/api/super_admin/blogService";
import { fetchCategories } from "@/src/api/super_admin/categoryService";
import { fetchTags } from "@/src/api/super_admin/tagService";
import { Blog, Category, Tag } from "@/src/types";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import Swal from 'sweetalert2';
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

interface BlogsViewProps {
  blogs: Blog[];
  onBlogAdded: (blog: Blog) => void;
  onBlogUpdated: (blog: Blog) => void;
  onBlogDeleted: (blogId: number) => void;
}

// Debounce utility function
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Image compression function
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Canvas toBlob failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Image loading error'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File reading error'));
    reader.readAsDataURL(file);
  });
};

// Auto-close success alert
const showAutoCloseSuccessAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'success',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false
  });
};

const showAutoCloseErrorAlert = (title: string, text: string) => {
  return Swal.fire({
    title,
    text,
    icon: 'error',
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false
  });
};

const BlogsView: React.FC<BlogsViewProps> = ({
  blogs,
  onBlogAdded,
  onBlogUpdated,
  onBlogDeleted,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    tag_id: '',
    published: false,
    cover_image: null as File | null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [dropdownOpenFor, setDropdownOpenFor] = useState<number | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    tag_id: '',
    published: false,
    cover_image: null as File | null,
  });
  const [localBlogs, setLocalBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  
  // Table state
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState({});

  // CKEditor configuration
  const editorConfiguration = {
    toolbar: [
      'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 
      'numberedList', 'blockQuote', 'insertTable', 'uploadImage', 'undo', 'redo'
    ],
    ckfinder: {
      uploadUrl: '', // Empty to disable server upload
    },
    simpleUpload: {
      uploadUrl: '', // Empty to disable server upload
    }
  };

  // Base64 upload adapter with compression
  const Base64UploadAdapter = (loader: any) => {
    return {
      upload: () => {
        return new Promise(async (resolve, reject) => {
          try {
            setIsProcessingImage(true);
            const file = await loader.file;
            
            // Compress image before base64 encoding
            const compressedFile = await compressImage(file);
            
            const reader = new FileReader();
            reader.onload = () => {
              setIsProcessingImage(false);
              resolve({ default: reader.result });
            };
            reader.onerror = (error) => {
              setIsProcessingImage(false);
              reject(error);
            };
            reader.readAsDataURL(compressedFile);
          } catch (error) {
            setIsProcessingImage(false);
            reject(error);
          }
        });
      }
    };
  };

  // Function to extend editor with upload adapter
  const uploadPlugin = (editor: any) => {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
      return Base64UploadAdapter(loader);
    };
  };

  // Define columns for the table
  const columns = useMemo<ColumnDef<Blog>[]>(
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
        accessorKey: 'title',
        header: 'Title',
        cell: ({ row }) => (
          <div className="max-w-xs truncate" title={row.getValue('title')}>
            {row.getValue('title')}
          </div>
        ),
      },
      {
        accessorKey: 'category_id',
        header: 'Category',
        cell: ({ row }) => {
          const category = categories.find(c => c.id === row.getValue('category_id'));
          return category?.name || 'Uncategorized';
        },
      },
      {
        accessorKey: 'published',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs ${
            row.getValue('published') ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {row.getValue('published') ? 'Published' : 'Draft'}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleDateString(),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const blog = row.original;
          return (
            <div className="relative">
              <div className="dropdown">
                <button 
                  className="text-purple-600 hover:underline text-sm font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpenFor(dropdownOpenFor === blog.id ? null : blog.id);
                  }}
                >
                  Manage
                </button>
                {dropdownOpenFor === blog.id && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <div className="py-1">
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleViewBlog(blog)}
                      >
                        View
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleEditBlog(blog)}
                      >
                        Edit
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        onClick={() => handleDeleteBlog(blog.id)}
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
        enableSorting: false,
        enableColumnFilter: false,
      },
    ],
    [categories, dropdownOpenFor]
  );

  // Create table instance
  const table = useReactTable({
    data: localBlogs,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  // Fetch blogs, categories, tags, and admins on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [blogsData, categoriesData, tagsData] = await Promise.all([
          fetchBlogs(),
          fetchCategories(),
          fetchTags(),
        ]);
        setLocalBlogs(blogsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Update local blogs when props change
  useEffect(() => {
    if (blogs && blogs.length > 0) {
      setLocalBlogs(blogs);
    }
  }, [blogs]);

  // Handle image upload with compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsProcessingImage(true);
        const file = e.target.files[0];
        
        // Compress the image before setting it in state
        const compressedFile = await compressImage(file);
        setFormData(prev => ({ ...prev, cover_image: compressedFile }));
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
          setIsProcessingImage(false);
        };
        reader.onerror = () => {
          setIsProcessingImage(false);
          showAutoCloseErrorAlert('Error', 'Failed to process image');
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        setIsProcessingImage(false);
        console.error('Image compression error:', error);
        showAutoCloseErrorAlert('Error', 'Failed to process image');
      }
    }
  };

  const handleEditImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        setIsProcessingImage(true);
        const file = e.target.files[0];
        
        // Compress the image before setting it in state
        const compressedFile = await compressImage(file);
        setEditFormData(prev => ({ ...prev, cover_image: compressedFile }));
        
        const reader = new FileReader();
        reader.onload = (e) => {
          setEditImagePreview(e.target?.result as string);
          setIsProcessingImage(false);
        };
        reader.onerror = () => {
          setIsProcessingImage(false);
          showAutoCloseErrorAlert('Error', 'Failed to process image');
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        setIsProcessingImage(false);
        console.error('Image compression error:', error);
        showAutoCloseErrorAlert('Error', 'Failed to process image');
      }
    }
  };

  // Handle view blog
  const handleViewBlog = (blog: Blog) => {
    setDropdownOpenFor(null);
    setSelectedBlog(blog);
    setIsViewModalOpen(true);
  };

  // Handle edit blog
  const handleEditBlog = (blog: Blog) => {
    setDropdownOpenFor(null);
    setSelectedBlog(blog);
    setEditFormData({
      title: blog.title,
      content: blog.content,
      category_id: blog.category_id.toString(),
      tag_id: blog.tag_id.toString(),
      published: blog.published,
      cover_image: null,
    });
    setEditImagePreview(blog.cover_image || null);
    setIsEditModalOpen(true);
  };

  // Handle edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Debounced CKEditor change handlers
  const handleEditorChange = useCallback(
    debounce((event: any, editor: any) => {
      const data = editor.getData();
      setFormData(prev => ({ ...prev, content: data }));
    }, 300),
    []
  );

  const handleEditEditorChange = useCallback(
    debounce((event: any, editor: any) => {
      const data = editor.getData();
      setEditFormData(prev => ({ ...prev, content: data }));
    }, 300),
    []
  );

  // Handle update blog
  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBlog) return;

    try {
      setIsLoading(true);
      
      const formDataToSend = createBlogFormData(editFormData);
      const updatedBlog = await updateBlog(selectedBlog.id, formDataToSend);

      // Update local state
      setLocalBlogs(prev => 
        prev.map(blog => blog.id === selectedBlog.id ? updatedBlog : blog)
      );
      
      // Call parent callback if provided
      if (onBlogUpdated) {
        onBlogUpdated(updatedBlog);
      }
      
      setIsEditModalOpen(false);
      setSelectedBlog(null);
      setEditImagePreview(null);
      showAutoCloseSuccessAlert('Success!', 'Blog updated successfully');
    } catch (error) {
      showAutoCloseErrorAlert('Error!', 'Failed to update blog. Please try again.');
      console.error('Blog update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete blog
  const handleDeleteBlog = async (blogId: number) => {
    setDropdownOpenFor(null);
    try {
      const result = await showConfirmationAlert(
        'Are you sure?',
        'You will not be to recover this blog post!',
        'warning',
        true
      );

      if (result.isConfirmed) {
        setIsLoading(true);
        await deleteBlog(blogId);
        
        // Update local state
        setLocalBlogs(prev => prev.filter(blog => blog.id !== blogId));
        
        // Call parent callback if provided
        if (onBlogDeleted) {
          onBlogDeleted(blogId);
        }
        
        setSelectedBlog(null);
        showAutoCloseSuccessAlert('Deleted!', 'Blog post has been deleted.');
      }
    } catch (error) {
      showAutoCloseErrorAlert('Error!', 'Failed to delete blog. Please try again.');
      console.error('Blog deletion error:', error);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleTogglePublish = () => {
    setFormData(prev => ({ ...prev, published: !prev.published }));
  };

  const handleEditTogglePublish = () => {
    setEditFormData(prev => ({ ...prev, published: !prev.published }));
  };

  const handleBlogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content || !formData.category_id || !formData.tag_id) {
      setError('Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formDataToSend = createBlogFormData(formData);
      const newBlog = await createBlog(formDataToSend);

      // Update local state
      setLocalBlogs(prev => [...prev, newBlog]);
      
      // Call parent callback if provided
      if (onBlogAdded) {
        onBlogAdded(newBlog);
      }
      
      setSelectedBlog(null);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        category_id: '',
        tag_id: '',
        published: false,
        cover_image: null,
      });
      setImagePreview(null);

      showAutoCloseSuccessAlert('Success!', 'Blog created successfully');
    } catch (error) {
      showAutoCloseErrorAlert('Error!', 'Failed to create blog. Please try again.');
      console.error('Blog creation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Image processing overlay */}
      {isProcessingImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>
            <p>Processing image...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Create New Blog Post</h2>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleBlogSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-semibold">Title *</label>
              <input
                type="text"
                name="title"
                placeholder="Enter Blog Title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-semibold">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tag */}
            <div>
              <label className="font-semibold">Tag *</label>
              <select
                name="tag_id"
                value={formData.tag_id}
                onChange={handleInputChange}
                className="w-full mt-1 p-2 border rounded-lg"
                required
              >
                <option value="">Select Tag</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Image Upload */}
            <div className="col-span-1 md:col-span-2">
              <label className="block mb-2 font-semibold">Cover Image</label>
              <div className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                ) : (
                  <>
                    <i className="fas fa-image text-3xl text-gray-400"></i>
                    <p>Upload Cover Image</p>
                  </>
                )}
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Images will be automatically compressed</p>
            </div>

            {/* Content - CKEditor */}
            <div className="col-span-1 md:col-span-2">
              <label className="font-semibold">Content *</label>
              <div className="ckeditor-container mt-1 border rounded-lg overflow-hidden">
                <CKEditor
                  editor={ClassicEditor}
                  data={formData.content}
                  onChange={handleEditorChange}
                  config={editorConfiguration}
                  onReady={(editor: any) => {
                    uploadPlugin(editor);
                  }}
                />
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="col-span-1 md:col-span-2 flex items-center gap-3">
              <label className="font-semibold">Publish Status:</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{formData.published ? 'Published' : 'Draft'}</span>
                <button
                  type="button"
                  onClick={handleTogglePublish}
                  className={`relative inline-flex items-center justify-center p-1 w-12 h-6 rounded-full transition-colors duration-300 ${
                    formData.published ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                      formData.published ? 'transform translate-x-6' : ''
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="text-right">
            <button 
              type="submit" 
              className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              disabled={isLoading || isProcessingImage}
            >
              {isLoading ? 'Creating...' : 'Create Blog Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Blog Posts Table */}
      <div className="bg-white p-6 rounded-xl shadow-md" key={refreshKey}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <h2 className="text-xl font-bold text-[#1a0a2e] mb-4 md:mb-0">All Blog Posts</h2>
          
          {/* Search Input */}
          <div className="relative">
            <input
              placeholder="Search blogs..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <i className="fas fa-search"></i>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : localBlogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No blog posts found. Create your first blog post above.
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
                        className="p-3 cursor-pointer hover:bg-gray-200"
                        onClick={header.column.getToggleSortingHandler()}
                        style={{ width: header.getSize() }}
                      >
                        <div className="flex items-center justify-between">
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

            {/* Pagination Controls */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {table.getRowModel().rows.length} of {localBlogs.length} results
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </button>
                
                <span className="text-sm">
                  Page{' '}
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </strong>
                </span>
                
                <button
                  className="px-3 py-1 border rounded disabled:opacity-50"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </button>
                
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={(e) => table.setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border rounded"
                >
                  {[10, 20, 30, 40, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      Show {pageSize}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Blog Modal */}
      {isViewModalOpen && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{selectedBlog.title}</h3>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedBlog.cover_image && (
                <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                  <img 
                    src={selectedBlog.cover_image} 
                    alt={selectedBlog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Blog ID:</p>
                  <p>{selectedBlog.id}</p>
                </div>
                <div>
                  <p className="font-semibold">Slug:</p>
                  <p>{selectedBlog.slug}</p>
                </div>
                <div>
                  <p className="font-semibold">Status:</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedBlog.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedBlog.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Category:</p>
                  <p>{categories.find(c => c.id === selectedBlog.category_id)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-semibold">Tag:</p>
                  <p>{tags.find(t => t.id === selectedBlog.tag_id)?.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="font-semibold">Author:</p>
                  <p>{selectedBlog.author.fullname ||'Unknown'}</p>
                </div>
                <div>
                  <p className="font-semibold">Created Date:</p>
                  <p>{new Date(selectedBlog.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-semibold">Updated Date:</p>
                  <p>{new Date(selectedBlog.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <p className="font-semibold">Content:</p>
                <div 
                  className="prose max-w-none mt-2"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
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

      {/* Edit Blog Modal */}
      {isEditModalOpen && selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Blog Post</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleUpdateBlog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="font-semibold">Category *</label>
                  <select
                    name="category_id"
                    value={editFormData.category_id}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag */}
                <div>
                  <label className="font-semibold">Tag *</label>
                  <select
                    name="tag_id"
                    value={editFormData.tag_id}
                    onChange={handleEditInputChange}
                    className="w-full mt-1 p-2 border rounded-lg"
                    required
                  >
                    <option value="">Select Tag</option>
                    {tags.map(tag => (
                      <option key={tag.id} value={tag.id}>
                        {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div className="col-span-1 md:col-span-2">
                  <label className="block mb-2 font-semibold">Cover Image</label>
                  <div className="p-6 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-gray-50 relative">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview" className="max-h-40 mx-auto mb-2" />
                    ) : (
                      <>
                        <i className="fas fa-image text-3xl text-gray-400"></i>
                        <p>Upload Cover Image</p>
                      </>
                    )}
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleEditImageChange}
                      accept="image/*"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Images will be automatically compressed</p>
                </div>

                {/* Content - CKEditor */}
                <div className="col-span-1 md:col-span-2">
                  <label className="font-semibold">Content *</label>
                  <div className="ckeditor-container mt-1 border rounded-lg overflow-hidden">
                    <CKEditor
                      editor={ClassicEditor}
                      data={editFormData.content}
                      onChange={handleEditEditorChange}
                      config={editorConfiguration}
                      onReady={(editor: any) => {
                        uploadPlugin(editor);
                      }}
                    />
                  </div>
                </div>

                {/* Publish Toggle */}
                <div className="col-span-1 md:col-span-2 flex items-center gap-3">
                  <label className="font-semibold">Publish Status:</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{editFormData.published ? 'Published' : 'Draft'}</span>
                    <button
                      type="button"
                      onClick={handleEditTogglePublish}
                      className={`relative inline-flex items-center justify-center p-1 w-12 h-6 rounded-full transition-colors duration-300 ${
                        editFormData.published ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${
                          editFormData.published ? 'transform translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>
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
                  disabled={isLoading || isProcessingImage}
                >
                  {isLoading ? 'Updating...' : 'Update Blog Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsView;