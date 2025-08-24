import React, { useEffect, useState, useMemo } from "react";
import { showConfirmationAlert, showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import { fetchComments, deleteComment, approveComment } from "@/src/api/super_admin/commentService";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

interface Comment {
  id: number;
  content: string;
  author: string;
  email: string;
  approved: boolean;
  createdAt: string;
  blog: { title: string };
}

const CommentsView: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    const data = await fetchComments();
    setComments(data);
  };

  const handleApprove = async (id: number) => {
    const result = await showConfirmationAlert(
      "Approve Comment?",
      "Are you sure you want to approve this comment?",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await approveComment(id);
        showSuccessAlert("Success!", "Comment approved successfully.");
        loadComments();
      } catch (error) {
        showErrorAlert("Error!", "Failed to approve comment.");
      }
    }
  };

  const handleDelete = async (id: number) => {
    const result = await showConfirmationAlert(
      "Delete Comment?",
      "This action cannot be undone. Do you want to proceed?",
      "warning"
    );

    if (result.isConfirmed) {
      try {
        await deleteComment(id);
        showSuccessAlert("Deleted!", "Comment deleted successfully.");
        loadComments();
      } catch (error) {
        showErrorAlert("Error!", "Failed to delete comment.");
      }
    }
  };

  // Define table columns
  const columns = useMemo<ColumnDef<Comment>[]>(
    () => [
      {
        accessorKey: "author",
        header: "Author",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "content",
        header: "Content",
        cell: (info) => {
          const content = info.getValue() as string;
          return content.length > 50 ? `${content.slice(0, 50)}...` : content;
        },
      },
      {
        accessorKey: "blog.title",
        header: "Blog",
        cell: (info) => info.row.original.blog?.title || "N/A",
      },
      {
        accessorKey: "approved",
        header: "Status",
        cell: (info) =>
          info.getValue() ? (
            <span className="text-green-600 font-semibold">Approved</span>
          ) : (
            <span className="text-yellow-600 font-semibold">Pending</span>
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const comment = info.row.original;
          return (
            <div className="flex space-x-2">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setSelectedComment(comment)}
              >
                View
              </button>
              {!comment.approved && (
                <button
                  className="text-green-600 hover:underline text-sm"
                  onClick={() => handleApprove(comment.id)}
                >
                  Approve
                </button>
              )}
              <button
                className="text-red-600 hover:underline text-sm"
                onClick={() => handleDelete(comment.id)}
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Filter comments based on active tab
  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      if (activeTab === "pending") return !c.approved;
      if (activeTab === "approved") return c.approved;
      return true;
    });
  }, [comments, activeTab]);

  // Initialize the table
  const table = useReactTable({
    data: filteredComments,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-8 p-6">
      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex space-x-2">
          {["all", "pending", "approved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search comments..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <span className="absolute right-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      {/* Comments Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Comments</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="p-3">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="p-4 text-center text-gray-500">
                    No comments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button
              className="border rounded p-1"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <span className="flex items-center gap-1">
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </strong>
          </span>
          
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="border rounded p-1"
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* View Comment Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-96 p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-2">Comment by {selectedComment.author}</h3>
            <p className="text-gray-600 mb-2">Email: {selectedComment.email}</p>
            <p className="mb-4">{selectedComment.content}</p>
            <p className="text-sm text-gray-500">
              On Blog: <strong>{selectedComment.blog?.title}</strong>
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedComment(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg"
              >
                Close
              </button>
              {!selectedComment.approved && (
                <button
                  onClick={() => {
                    handleApprove(selectedComment.id);
                    setSelectedComment(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsView;