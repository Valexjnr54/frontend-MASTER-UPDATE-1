import React, { useState, useEffect, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { fetchDonations, fetchDonationStats } from "@/src/api/super_admin/donationService";
import { showErrorAlert } from "@/src/utils/alerts";

interface Donation {
  id: number;
  amount: number;
  type: string;
  currency: string;
  fullName: string;
  email: string;
  reference: string;
  status: string;
  paymentUrl: string;
  paymentData: {
    transaction_amount: number;
    transaction_ref: string;
    email: string;
    transaction_status: string;
    transaction_currency_id: string;
    created_at: string;
    transaction_type: string;
    merchant_name: string;
    merchant_business_name: string;
    gateway_transaction_ref: string;
    merchant_email: string;
    meta: {
      donationId: number;
      donationType: string;
    };
    card_type?: string;
    fee: number;
    merchant_amount: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface DonationStats {
  total_donations: number;
  total_amount: number;
  total_donors: number;
  funded_project: number;
  donations_by_type: Record<string, { count: number; total_amount: number }>;
}

const DonationsView = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    const loadDonations = async () => {
      try {
        const [donationsData, statsData] = await Promise.all([
          fetchDonations(),
          fetchDonationStats(),
        ]);
        setDonations(donationsData);
        setStats(statsData);
      } catch (error: any) {
        showErrorAlert("Error!", "Failed to fetch donations or stats. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  // Define columns for the table
  const columns = useMemo<ColumnDef<Donation>[]>(
    () => [
      {
        accessorKey: "fullName",
        header: "Donor Name",
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("fullName")}</div>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue("amount"));
          return <div>{amount.toLocaleString()}</div>;
        },
      },
      {
        accessorKey: "currency",
        header: "Currency",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return (
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                status === "completed"
                  ? "bg-green-100 text-green-800"
                  : status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "paymentData.transaction_type",
        header: "Payment Method",
        cell: ({ row }) => {
          const paymentData = row.original.paymentData;
          return <div>{paymentData.transaction_type}</div>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          return (
            <button
              onClick={() => openModal(row.original)}
              className="text-purple-600 hover:text-purple-800 font-semibold py-1 px-2 rounded"
            >
              View Details
            </button>
          );
        },
      },
    ],
    []
  );

  // Initialize the table
  const table = useReactTable({
    data: donations,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const openModal = (donation: Donation) => {
    setSelectedDonation(donation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDonation(null);
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Donations Management</h1>
        <p className="text-gray-600 mt-2">Track and manage all donations in one place</p>
      </div>

      {/* Loading / Error States */}
      {loading && <p className="text-gray-600">Loading donations...</p>}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-blue-100 p-3 mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Donations</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? stats.total_donations.toLocaleString() : "-"}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-green-100 p-3 mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? `₦${stats.total_amount.toLocaleString()}` : "-"}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-purple-100 p-3 mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Active Donors</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? stats.total_donors.toLocaleString() : "-"}</h3>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md flex items-center">
              <div className="rounded-full bg-yellow-100 p-3 mr-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Funded Projects</p>
                <h3 className="text-2xl font-bold text-gray-800">{stats ? stats.funded_project.toLocaleString() : "-"}</h3>
              </div>
            </div>
          </div>

          {/* Donations Table */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">All Donations</h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={globalFilter ?? ""}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="block w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Search donations..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-gray-100 text-gray-600">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="p-4 font-semibold">
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
                        <td key={cell.id} className="p-4">
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
                  className="border rounded p-1"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<<'}
                </button>
                <button
                  className="border rounded p-1"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  {'<'}
                </button>
                <button
                  className="border rounded p-1"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  {'>'}
                </button>
                <button
                  className="border rounded p-1"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  {'>>'}
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div>Page</div>
                  <strong>
                    {table.getState().pagination.pageIndex + 1} of{' '}
                    {table.getPageCount()}
                  </strong>
                </span>
                <span className="flex items-center gap-1">
                  | Go to page:
                  <input
                    type="number"
                    defaultValue={table.getState().pagination.pageIndex + 1}
                    onChange={e => {
                      const page = e.target.value ? Number(e.target.value) - 1 : 0
                      table.setPageIndex(page)
                    }}
                    className="border p-1 rounded w-16"
                  />
                </span>
                <select
                  value={table.getState().pagination.pageSize}
                  onChange={e => {
                    table.setPageSize(Number(e.target.value))
                  }}
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

          {/* Modal */}
          {isModalOpen && selectedDonation && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex items-end justify-center min-h-screen text-center sm:block sm:p-0">
                <div
                  className="fixed inset-0 bg-gray-500 bg-opacity-75"
                  onClick={closeModal}
                ></div>
                <div className="inline-block align-bottom bg-white rounded-lg text-left shadow-xl transform transition-all sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      Donation Details
                    </h3>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Reference</p>
                        <p className="font-medium">{selectedDonation.reference}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Donor</p>
                        <p className="font-medium">{selectedDonation.fullName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{selectedDonation.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">
                          {selectedDonation.amount.toLocaleString()} {selectedDonation.currency}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">
                          {selectedDonation.paymentData.transaction_type}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            selectedDonation.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : selectedDonation.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedDonation.status}
                        </span>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">
                          {new Date(selectedDonation.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DonationsView;