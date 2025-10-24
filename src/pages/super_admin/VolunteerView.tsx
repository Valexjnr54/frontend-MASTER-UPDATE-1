import React, { useEffect, useState, useMemo } from "react";
import { showErrorAlert, showSuccessAlert } from "@/src/utils/alerts";
import { fetchVolunteerApplications, updateApplicationStatus } from "@/src/api/volunteerService";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";

interface VolunteerApplication {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  interests: string;
  motivation: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

const VolunteerView: React.FC = () => {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved">("all");
  const [selectedApplication, setSelectedApplication] = useState<VolunteerApplication | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [applicationToUpdate, setApplicationToUpdate] = useState<{id: number, approved: boolean} | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchVolunteerApplications();
      setApplications(data);
    } catch (error) {
      showErrorAlert("Error!","Failed to load volunteer applications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, approved: boolean) => {
    try {
      await updateApplicationStatus(id, approved);
      
      // Update the local state to reflect the change
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, approved } : app
      ));
      
      showSuccessAlert("Success!",`Application ${approved ? "approved" : "rejected"} successfully`);
    } catch (error) {
      showErrorAlert("Error!","Failed to update application status");
    } finally {
      setShowConfirmDialog(false);
      setApplicationToUpdate(null);
    }
  };

  const openConfirmationDialog = (id: number, approved: boolean) => {
    setApplicationToUpdate({ id, approved });
    setShowConfirmDialog(true);
  };

  // Define table columns
  const columns = useMemo<ColumnDef<VolunteerApplication>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "interests",
        header: "Interests",
        cell: (info) => {
          const interests = info.getValue() as string;
          return interests.length > 30 ? `${interests.slice(0, 30)}...` : interests;
        },
      },
    //   {
    //     accessorKey: "approved",
    //     header: "Status",
    //     cell: (info) =>
    //       info.getValue() ? (
    //         <span className="text-green-600 font-semibold">Approved</span>
    //       ) : (
    //         <span className="text-yellow-600 font-semibold">Pending</span>
    //       ),
    //   },
      {
        accessorKey: "createdAt",
        header: "Applied On",
        cell: (info) => new Date(info.getValue() as string).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => {
          const application = info.row.original;
          return (
            <div className="flex space-x-2">
              <button
                className="text-blue-600 hover:underline text-sm"
                onClick={() => setSelectedApplication(application)}
              >
                View
              </button>
              {/* {!application.approved && (
                <button
                  className="text-green-600 hover:underline text-sm"
                  onClick={() => openConfirmationDialog(application.id, true)}
                >
                  Approve
                </button>
              )}
              {application.approved && (
                <button
                  className="text-red-600 hover:underline text-sm"
                  onClick={() => openConfirmationDialog(application.id, false)}
                >
                  Reject
                </button>
              )} */}
            </div>
          );
        },
      },
    ],
    []
  );

  // Filter applications based on active tab
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
    //   if (activeTab === "pending") return !app.approved;
    //   if (activeTab === "approved") return app.approved;
      return true;
    });
  }, [applications, activeTab]);

  // Initialize the table
  const table = useReactTable({
    data: filteredApplications,
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1a0a2e]">Volunteer Applications</h1>
        <p className="text-gray-600">Manage and review volunteer applications</p>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex space-x-2">
          {["all"].map((tab) => (
            // {["all", "pending", "approved"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg ${
                activeTab === tab ? "bg-purple-600 text-white" : "bg-gray-200"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "all" ? applications.length : tab === "pending" ? applications.filter(a => !a.approved).length : applications.filter(a => a.approved).length})
            </button>
          ))}
        </div>
        
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search applications..."
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

      {/* Applications Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold text-[#1a0a2e] mb-4">Applications</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        ) : (
          <>
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
                        No applications found
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
          </>
        )}
      </div>

      {/* View Application Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl p-6 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Application from {selectedApplication.firstName} {selectedApplication.lastName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{selectedApplication.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{selectedApplication.phone}</p>
              </div>
              <div>
                {/* <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">
                  {selectedApplication.approved ? (
                    <span className="text-green-600">Approved</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </p> */}
              </div>
              <div>
                <p className="text-sm text-gray-600">Applied On</p>
                <p className="font-medium">
                  {new Date(selectedApplication.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">Interests</p>
              <p className="font-medium">{selectedApplication.interests}</p>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">Motivation</p>
              <p className="mt-1 text-gray-800 whitespace-pre-wrap">{selectedApplication.motivation}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              {/* {!selectedApplication.approved && (
                <button
                  onClick={() => openConfirmationDialog(selectedApplication.id, true)}
                  className="px-5 py-2.5 bg-[#880088] text-white font-semibold rounded-lg shadow-md hover:bg-[#4b0082] transition-colors flex items-center gap-2"
                >
                  Approve
                </button>
              )}
              {selectedApplication.approved && (
                <button
                  onClick={() => openConfirmationDialog(selectedApplication.id, false)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              )} */}
              <button
                onClick={() => setSelectedApplication(null)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && applicationToUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-4">
              {applicationToUpdate.approved ? "Approve Application" : "Reject Application"}
            </h3>
            
            <p className="mb-6 text-gray-700">
              Are you sure you want to {applicationToUpdate.approved ? "approve" : "reject"} this volunteer application?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setApplicationToUpdate(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(applicationToUpdate.id, applicationToUpdate.approved)}
                className={`px-4 py-2 text-white rounded-lg ${
                  applicationToUpdate.approved 
                    ? "px-5 py-2.5 bg-[#880088] text-white font-semibold rounded-lg shadow-md hover:bg-[#4b0082] transition-colors flex items-center gap-2" 
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerView;