import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  Filter, 
  RotateCcw, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle, 
  X,
  Ticket,
  Pencil,
  Eye,
  Check,
  MessageCircle
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { 
  fetchTickets, 
  setSearchQuery, 
  setFilters, 
  resetFilters,
  updateTicket 
} from "../../store/slices/supportticket";
import { SupportTicket } from "../../store/slices/supportticket";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";

// Helper functions
const getTicketTitle = (ticket: SupportTicket) => {
  return ticket.title || ticket.subject || 'No Title';
};

const getAvatarInitials = (ticket: SupportTicket) => {
  const title = getTicketTitle(ticket);
  return title
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Helper function to safely get assignedTo name
const getAssignedToName = (ticket: SupportTicket): string => {
  if (!ticket.assignedTo) return '';
  
  if (typeof ticket.assignedTo === 'string') {
    return ticket.assignedTo;
  }
  
  if (typeof ticket.assignedTo === 'object' && ticket.assignedTo.name) {
    return ticket.assignedTo.name;
  }
  
  return '';
};

// Helper function for status badges
const getStatusBadge = (status: string) => {
  const statusConfig = {
    open: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-200" },
    "in-progress": { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
    "in_progress": { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
    resolved: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
    closed: { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-800 dark:text-gray-200" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
    </span>
  );
};

// Helper function for priority badges
const getPriorityBadge = (priority: string) => {
  const priorityConfig = {
    low: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
    medium: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
    high: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-800 dark:text-orange-200" },
    urgent: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-200" },
  };

  const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

// Ticket Details Modal Component
const TicketDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
}> = ({ isOpen, onClose, ticket }) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 mt-10">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                <Ticket className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Ticket Details
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTicketTitle(ticket)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Basic Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Title
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {ticket.title || ticket.subject}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Priority
                  </label>
                  <div className="mt-1">
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
                {ticket.category && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Category
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {ticket.category}
                    </p>
                  </div>
                )}
                {ticket.customerName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {ticket.customerName}
                    </p>
                  </div>
                )}
                {ticket.customerEmail && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900 dark:text-white">
                      {ticket.customerEmail}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h4>
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>
            </div>

            {/* Assigned To */}
            {(() => {
              const assignedToName = getAssignedToName(ticket);
              return assignedToName && assignedToName.trim() !== '' && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                    Assigned To
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {assignedToName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {assignedToName}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Timestamps */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
                Timeline
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Update Modal Component
const StatusUpdateModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
  onUpdate: (ticketId: string, newStatus: string) => void;
  isUpdating: boolean;
}> = ({ isOpen, onClose, ticket, onUpdate, isUpdating }) => {
  const [selectedStatus, setSelectedStatus] = useState("");

  // Status options with display names
  const statusOptions = [
    { value: "open", label: "Open", description: "Ticket is newly created and needs attention" },
    { value: "in_progress", label: "In Progress", description: "Ticket is being worked on" },
    { value: "resolved", label: "Resolved", description: "Issue has been resolved" },
    { value: "closed", label: "Closed", description: "Ticket is closed and completed" },
  ];

  // Initialize with current status when modal opens
  useEffect(() => {
    if (isOpen && ticket) {
      setSelectedStatus(ticket.status);
    }
  }, [isOpen, ticket]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = () => {
    if (selectedStatus && selectedStatus !== ticket.status) {
      onUpdate(ticket._id, selectedStatus);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
    <div
       className="fixed inset-0 backdrop-blur-sm transition-opacity"
       onClick={onClose}
     />


      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 mt-10">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Ticket Status
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {getTicketTitle(ticket)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={isUpdating}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Current Status: {getStatusBadge(ticket.status)}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select New Status:
                </label>
                <div className="space-y-3">
                  {statusOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedStatus === option.value
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="status"
                        value={option.value}
                        checked={selectedStatus === option.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                        disabled={isUpdating}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {option.label}
                          </span>
                          {selectedStatus === option.value && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {option.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUpdating || !selectedStatus || selectedStatus === ticket.status}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SupportTicketList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { tickets = [], loading, error, pagination, searchQuery, filters } =
    useAppSelector((state) => state.tickets);

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [statusUpdateModalOpen, setStatusUpdateModalOpen] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Popup state for alerts
  const [popup, setPopup] = useState({
    message: "",
    type: "success" as "success" | "error",
    isVisible: false,
  });

  // Status options for filter
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "open", label: "Open" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ];

  // Priority options for filter
  const priorityOptions = [
    { value: "", label: "All Priorities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
  ];

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  // Fetch tickets
  useEffect(() => {
    const activeFilters = {
      ...(localFilters.status ? { status: localFilters.status } : {}),
      ...(localFilters.priority ? { priority: localFilters.priority } : {}),
    };

    dispatch(
      fetchTickets({
        page: pagination.page,
        limit: pagination.limit,
        filters: activeFilters,
        search: searchInput !== "" ? searchInput : undefined,
        sort: { createdAt: "desc" },
      })
    );
  }, [dispatch, pagination.page, pagination.limit, searchInput, localFilters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(
        fetchTickets({
          page: newPage,
          limit: pagination.limit,
          filters: {
            ...(localFilters.status ? { status: localFilters.status } : {}),
            ...(localFilters.priority ? { priority: localFilters.priority } : {}),
          },
          search: searchInput !== "" ? searchInput : undefined,
          sort: { createdAt: "desc" },
        })
      );
    }
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(
      fetchTickets({
        page: 1,
        limit: newLimit,
        filters: {
          ...(localFilters.status ? { status: localFilters.status } : {}),
          ...(localFilters.priority ? { priority: localFilters.priority } : {}),
        },
        search: searchInput !== "" ? searchInput : undefined,
        sort: { createdAt: "desc" },
      })
    );
  };

  const handleFilterChange = (filterName: string, value: string) => {
    const newFilters = {
      ...localFilters,
      [filterName]: value || undefined,
    };
    
    // Remove undefined values
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] === undefined) {
        delete newFilters[key];
      }
    });

    setLocalFilters(newFilters);
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    setLocalFilters({});
    setSearchInput("");
    dispatch(resetFilters());
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setDetailsModalOpen(false);
    setSelectedTicket(null);
  };

  const handleEditTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setStatusUpdateModalOpen(true);
  };

  const handleChat = (ticket: SupportTicket) => {
    navigate(`/tickets/${ticket._id}/chat`);
  };

  const closeStatusUpdateModal = () => {
    setStatusUpdateModalOpen(false);
    setSelectedTicket(null);
    setIsUpdatingStatus(false);
  };

  const handleStatusUpdate = async (ticketId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const result = await dispatch(updateTicket({ 
        id: ticketId, 
        data: { status: newStatus as "open" | "in_progress" | "resolved" | "closed" } 
      })).unwrap();
      
      setPopup({
        message: "Ticket status updated successfully!",
        type: "success",
        isVisible: true,
      });
      
      // Close modal after successful update
      closeStatusUpdateModal();
      
      // Refresh the tickets list
      dispatch(
        fetchTickets({
          page: pagination.page,
          limit: pagination.limit,
          filters: {
            ...(localFilters.status ? { status: localFilters.status } : {}),
            ...(localFilters.priority ? { priority: localFilters.priority } : {}),
          },
          search: searchInput !== "" ? searchInput : undefined,
          sort: { createdAt: "desc" },
        })
      );
    } catch (error: any) {
      setPopup({
        message: error || "Failed to update ticket status",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const current = pagination.page;
    const total = pagination.totalPages;
    const pages = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(total);
      } else if (current >= total - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = current - 1; i <= current + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(total);
      }
    }

    return pages;
  };

  return (
    <div>
      <PageMeta
        title="Support Tickets | TailAdmin"
        description="List of all support tickets in TailAdmin"
      />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Support Tickets
          </h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Total: {pagination.total}
          </span>
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
                placeholder="Search by title, description, customer..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={localFilters.status || ""}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <select
                value={localFilters.priority || ""}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Limit */}
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select
                value={pagination.limit}
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
                  Avatar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {(!tickets || tickets.length === 0) ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Ticket className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                      <p>No support tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (tickets || []).map((ticket, idx) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {(pagination.page - 1) * pagination.limit + idx + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                          {getAvatarInitials(ticket)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      <div className="max-w-48 truncate">
                        {getTicketTitle(ticket)}
                      </div>
                      {ticket.category && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {ticket.category}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        {ticket.customerName || 'N/A'}
                      </div>
                      {ticket.customerEmail && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-32 truncate">
                          {ticket.customerEmail}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                      onClick={() => handleViewTicket(ticket)}
                      className="text-indigo-500 hover:text-indigo-700 transition-colors"
                      title="View Details"
                      >
                      <Eye className="h-5 w-5" />
                      </button>
                      <button
                      onClick={() => handleEditTicket(ticket)}
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="Edit Ticket"
                      >
                      <Pencil className="h-5 w-5" />
                      </button>
                      {/* Chat/Reply */}
                      <button
                        onClick={() => handleChat(ticket)}
                        className="text-green-500 hover:text-green-700 transition-colors"
                        title="Chat / View Replies"
                      >
                        <MessageCircle className="h-5 w-5" />
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
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {generatePageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  pagination.page === page
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ) : (
              <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                {page}
              </span>
            )
          )}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
      
      {/* Details Modal */}
      <TicketDetailsModal
        isOpen={detailsModalOpen}
        onClose={closeDetailsModal}
        ticket={selectedTicket}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={statusUpdateModalOpen}
        onClose={closeStatusUpdateModal}
        ticket={selectedTicket}
        onUpdate={handleStatusUpdate}
        isUpdating={isUpdatingStatus}
      />
    </div>
  );
};

export default SupportTicketList;
