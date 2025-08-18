import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchShippingZones, deleteShippingZone } from "../../store/slices/shippingZone";
import {
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Plus,
} from "lucide-react";
import PopupAlert from "../../components/popUpAlert";
import { Link } from "react-router-dom";

interface Zone {
  _id: string;
  shippingId: {
    _id: string;
    name: string;
    carrier: string;
    shippingMethod: string;
    cost: number;
    status: string;
    description?: string;
    estimatedDeliveryDays: {
      min: number;
      max: number;
    };
    supportedRegions: Array<{
      country: string;
      states?: string[];
      postalCodes?: string[];
    }>;
  };
  postalCodes: Array<{
    _id: string;
    code: string;
    price: number;
  }>;
  createdAt: string;
}

// Delete Confirmation Modal Component
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  zone: Zone | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, zone, isDeleting }) => {
  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Shipping Zone
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the shipping zone for{" "}
              <strong className="text-gray-900 dark:text-white">
                "{zone.shippingId?.name}"
              </strong>
              ?
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone and will remove all postal codes and pricing for this zone.
            </p>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    </div>
  );
};

const ZoneList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { zoneList, loading, error, pagination } = useSelector(
    (state: RootState) => state.shippingZone
  );

  // Local state for search, filter, pagination, popup
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<Zone | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    isVisible: false,
  });

  const closeDeleteModal = () => {
    setZoneToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchShippingZones({}));
    }, 400);
    return () => clearTimeout(timer);
  }, [dispatch, searchInput, statusFilter, page, limit]);

  // Filter and pagination logic
  const filteredZones = zoneList.filter(
    (zone) =>
      (!searchInput ||
        zone.shippingId?.name?.toLowerCase()?.includes(searchInput?.toLowerCase()) ||
        zone.shippingId?.carrier?.toLowerCase()?.includes(searchInput?.toLowerCase()) ||
        zone.postalCodes?.some(pc => pc.code.includes(searchInput))) &&
      (!statusFilter ||
        (statusFilter === "active" ? zone.shippingId?.status === "active" : zone.shippingId?.status !== "active"))
  );

  const total = filteredZones.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const paginatedZones = filteredZones.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setPage(1);
    setLimit(10);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    const start = Math.max(1, page - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  const handleDeleteConfirm = async () => {
    if (zoneToDelete) {
      setIsDeleting(true);
      try {
        // Dispatch the delete action
        await dispatch(deleteShippingZone(zoneToDelete._id)).unwrap();

        setPopup({
          message: `Shipping zone for "${zoneToDelete.shippingId?.name}" deleted successfully`,
          type: "success",
          isVisible: true,
        });

        // Close modal and reset state
        closeDeleteModal();

        // Refresh the zones list
        dispatch(fetchShippingZones({}));

        console.log(
          `Shipping zone for "${zoneToDelete.shippingId?.name}" deleted successfully`
        );
      } catch (error) {
        console.error("Failed to delete shipping zone:", error);
        setPopup({
          message: "Failed to delete shipping zone. Please try again.",
          type: "error",
          isVisible: true,
        });
        setIsDeleting(false);
      }
    }
  };

  const openDeleteModal = (zone: Zone) => {
    setZoneToDelete(zone);
    setDeleteModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
  {/* Left side - Title */}
  <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
    Shipping Zones
  </h1>

  {/* Right side - Button + Total */}
  <div className="flex items-center gap-4">
    <Link to="/shipping/zone/create">
      <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
        <Plus className="h-5 w-5" />
        Zone
      </button>
    </Link>

    <span className="text-gray-500 text-sm dark:text-gray-400">
      Total: {total}
    </span>
  </div>
</div>


      {/* Search & Filter */}
      <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, carrier, or postal code..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Shipping Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Carrier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Base Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Postal Codes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Delivery Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
            {paginatedZones.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-6 text-gray-400">
                  No shipping zones found.
                </td>
              </tr>
            ) : (
              paginatedZones.map((zone, idx) => (
                <tr
                  key={zone._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {(page - 1) * limit + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    <div>
                      <div className="font-semibold">{zone.shippingId?.name || "No Name"}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {zone.shippingId?.shippingMethod}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {zone.shippingId?.carrier}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    ₹{zone.shippingId?.cost}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
  <div className="max-w-xs">
    {zone.postalCodes?.length > 0 ? (
      <div className="text-xs">
        <span className="font-medium">{zone.postalCodes.length} codes</span>
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 truncate">
          {zone.postalCodes
            .slice(0, 2)
            .map((pc, idx) => (
              <span key={idx}>{pc.code}</span>
            ))
            .reduce((prev, curr) => [prev, ", ", curr])}

          {zone.postalCodes.length > 2 && (
            <span className="ml-1 flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-medium">
              +{zone.postalCodes.length - 2}
            </span>
          )}
        </div>
      </div>
    ) : (
      <span className="italic text-gray-400">No postal codes</span>
    )}
  </div>
</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {zone.shippingId?.estimatedDeliveryDays?.min} - {zone.shippingId?.estimatedDeliveryDays?.max} days
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {zone.shippingId?.status === "active" ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(zone.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link to={`/shipping/zone/edit/${zone._id}`}>
                      <button className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit Zone">
                        <Pencil className="h-5 w-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(zone)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Zone"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
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
        {generatePageNumbers().map((p, idx) =>
          typeof p === "number" ? (
            <button
              key={idx}
              onClick={() => handlePageChange(p)}
              className={`px-3 py-1 rounded ${
                page === p
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {p}
            </button>
          ) : (
            <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
              {p}
            </span>
          )
        )}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        zone={zoneToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default ZoneList;