import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Trash2,
  Search,
  Filter,
  CheckCircle,XCircle ,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Eye,
  X,
  User,
  Mail,
  Shield,
  Calendar,
  Building,
  Download,
} from "lucide-react";
import axiosInstance from "../../services/axiosConfig";
import { getTenantFromURL } from "../../utils/getTenantFromURL";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCustomers,
  deleteCustomer,
  setSearchQuery,
  setFilters,
  setPage,
  setLimit,
  resetFilters,
} from "../../store/slices/customersSlice";
import { fetchRoles } from "../../store/slices/roles";
import { Link } from "react-router-dom";
import { Customer } from "../../store/slices/customersSlice";

const CustomersList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { customers, loading, error, searchQuery, filters, page, limit, total } =
    useAppSelector((state) => state.customers);
  const { roles } = useAppSelector((state) => state.role);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState(filters);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(filters.role || "");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({ isOpen: false, customer: null });
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSingleLoadingId, setExportSingleLoadingId] = useState<string | null>(null);

  // Fetch roles on component mount
  useEffect(() => {
    dispatch(fetchRoles({ page: 1, limit: 100 }));
  }, [dispatch]);

  // Handle search input changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Handle role filter changes
  useEffect(() => {
    const newFilters = { ...filters };
    if (selectedRole) {
      newFilters.role = selectedRole;
      console.log("Setting role filter:", selectedRole);
    } else {
      delete newFilters.role;
      console.log("Clearing role filter");
    }
    console.log("Updated filters:", newFilters);
    dispatch(setFilters(newFilters));
  }, [selectedRole]);

  // Fetch customers when dependencies change
  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch, searchQuery, page, limit, filters]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(setLimit(newLimit));
    dispatch(setPage(1));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSelectedRole("");
    dispatch(resetFilters());
  };

  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    navigate(`/customers/edit/${customer._id}`);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setDeleteConfirmModal({ isOpen: true, customer });
  };

  const confirmDelete = async () => {
    if (deleteConfirmModal.customer) {
      try {
        await dispatch(deleteCustomer(deleteConfirmModal.customer._id)).unwrap();
        setDeleteConfirmModal({ isOpen: false, customer: null });
        // Optionally show success message
      } catch (error) {
        console.error("Failed to delete customer:", error);
        // Error will be handled by the slice and shown in the UI
      }
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmModal({ isOpen: false, customer: null });
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCustomer(null);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = Math.ceil(total / limit);
    const maxPages = 5;
    const start = Math.max(1, page - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  const getFileNameFromDisposition = (disposition?: string, fallback = "export.xlsx") => {
    if (!disposition) return fallback;
    const match = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (match) {
      return match[1].replace(/['"]/g, "");
    }
    return fallback;
  };

  const exportAllUsers = async () => {
    try {
      setExportLoading(true);
      const tenant = getTenantFromURL();
      const response = await axiosInstance.get("/api/export-user-data", {
        headers: { "x-tenant": tenant },
        responseType: "blob",
      });

      const filename = getFileNameFromDisposition(
        response.headers["content-disposition"],
        "all_users_data.xlsx"
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export all users:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const exportSingleUser = async (userId: string) => {
    try {
      setExportSingleLoadingId(userId);
      const tenant = getTenantFromURL();
      const response = await axiosInstance.get("/api/export-user-data", {
        headers: { "x-tenant": tenant },
        params: { userId },
        responseType: "blob",
      });

      const filename = getFileNameFromDisposition(
        response.headers["content-disposition"],
        `user_${userId}_data.xlsx`
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export user:", err);
    } finally {
      setExportSingleLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          Customers List
        </h1>
        <span className="text-gray-500 text-sm dark:text-gray-400">
          Total: {total}
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or email..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm dark:text-gray-300">Role:</span>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white min-w-[150px]"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Export All */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportAllUsers}
              disabled={exportLoading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
            >
              <Download className="h-4 w-4" />
              {exportLoading ? "Exporting..." : "Export All"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm dark:text-gray-300">Show:</span>
            <select
              value={limit}
              onChange={(e) => handleLimitChange(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                {customers.map((customer, index) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {customer.role?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(customer.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`flex items-center gap-2 text-xs font-medium`}>
                        {customer.isActive ? (
                          <>
                            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            
                          </>
                        ) : (
                          <>
                            <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2 space-x-2">
                        <button
                          onClick={() => handleViewDetails(customer)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditCustomer(customer)}
                          className="text-blue-500 hover:text-blue-700 transition-colors"
                        >
                          <Pencil className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => exportSingleUser(customer._id)}
                          className="text-indigo-500 hover:text-indigo-700 transition-colors flex items-center"
                          disabled={!!exportSingleLoadingId}
                        >
                          {exportSingleLoadingId === customer._id ? (
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {generatePageNumbers().map((pg, idx) =>
              typeof pg === "number" ? (
                <button
                  key={idx}
                  onClick={() => handlePageChange(pg)}
                  className={`px-3 py-1 rounded ${
                    page === pg
                      ? "bg-indigo-500 text-white"
                      : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {pg}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                  {pg}
                </span>
              )
            )}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 mt-16">

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Customer Details
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {selectedCustomer.role?.name || "No Role Assigned"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-base font-medium text-gray-900 dark:text-white">
                        {new Date(selectedCustomer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                      <Building className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                   
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Status</p>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedCustomer.isActive 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {selectedCustomer.isActive ? 'Active' : 'Inactive'}
                  </span>
                  
                  {selectedCustomer.isSuperAdmin && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                      Super Admin
                    </span>
                  )}
                  
                  {selectedCustomer.isDeleted && (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      Deleted
                    </span>
                  )}
                </div>
              </div>

              {/* Role Details */}
              {selectedCustomer.role && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Role Information</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Role ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                          {selectedCustomer.role._id}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Scope</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                          {selectedCustomer.role.scope}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Tenant ID</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white break-all">
                          {selectedCustomer.role.tenantId || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Role Created</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(selectedCustomer.role.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Permissions Count</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedCustomer.role.modulePermissions?.length || 0} modules
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Role Status</p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            selectedCustomer.role.deletedAt 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {selectedCustomer.role.deletedAt ? 'Deleted' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Module Permissions Details */}
                    {selectedCustomer.role.modulePermissions && selectedCustomer.role.modulePermissions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Module Permissions</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedCustomer.role.modulePermissions.map((modulePermission, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {modulePermission.module}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {modulePermission.permissions?.join(', ') || 'No permissions'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

          
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Close
              </button>
             
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.isOpen && deleteConfirmModal.customer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Delete Customer
                </h2>
              </div>
              <button
                onClick={cancelDelete}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete the customer{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {deleteConfirmModal.customer.name}
                </span>
                ?
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                This action cannot be undone. The customer's data will be permanently removed.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-md transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersList;