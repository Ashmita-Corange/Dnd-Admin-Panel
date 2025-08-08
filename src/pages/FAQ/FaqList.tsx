import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchFaqs,
  deleteFaq,
  setSearchQuery,
  setFilters,
  setPagination,
  resetFilters,
} from "../../store/slices/faq";
import { FAQ } from "../../store/slices/faq";
import { X, Trash2, RotateCcw, Search, Filter, ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import PopupAlert from "../../components/popUpAlert";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "website", label: "Website" },
  { value: "product", label: "Product" },
];

const getStatusBadge = (status: string) => {
  const statusConfig = {
    active: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
    inactive: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-200" },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {status?.charAt(0)?.toUpperCase() + status?.slice(1)}
    </span>
  );
};

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  faq: FAQ | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, faq, isDeleting }) => {
  if (!isOpen || !faq) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-transparent backdrop-blur-xs transition-opacity" onClick={onClose}></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete FAQ</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Are you sure you want to delete the FAQ <strong className="text-gray-900 dark:text-white">"{faq.question}"</strong>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50">Cancel</button>
            <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
              {isDeleting ? "Deleting..." : (<><Trash2 className="w-4 h-4" />Delete</>)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FaqList: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { faqs, loading, error, pagination, searchQuery, filters } = useAppSelector((state) => state.faq);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [popup, setPopup] = useState({ message: "", type: "success" as "success" | "error", isVisible: false });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  useEffect(() => {
    const activeFilters = { ...(localFilters.status ? { status: localFilters.status } : {}), ...(localFilters.type ? { type: localFilters.type } : {}) };
  dispatch(fetchFaqs({ page: pagination.page, limit: pagination.limit, filters: activeFilters, search: searchInput || "", sortField: "createdAt", sortOrder: "desc" }));
  }, [dispatch, pagination.page, pagination.limit, searchInput, localFilters]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch(fetchFaqs({ page: newPage, limit: pagination.limit, filters: { ...(localFilters.status ? { status: localFilters.status } : {}), ...(localFilters.type ? { type: localFilters.type } : {}) }, search: searchInput || "", sortField: "createdAt", sortOrder: "desc" }));
    }
  };

  const handleLimitChange = (newLimit: number) => {
  dispatch(fetchFaqs({ page: 1, limit: newLimit, filters: { ...(localFilters.status ? { status: localFilters.status } : {}), ...(localFilters.type ? { type: localFilters.type } : {}) }, search: searchInput || "", sortField: "createdAt", sortOrder: "desc" }));
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    dispatch(setFilters(updated));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
    dispatch(resetFilters());
  };

  const openDeleteModal = (faq: FAQ) => {
    setFaqToDelete(faq);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFaqToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (faqToDelete) {
      setIsDeleting(true);
      try {
        await dispatch(deleteFaq(faqToDelete._id)).unwrap();
        setPopup({ message: `FAQ "${faqToDelete.question}" deleted successfully`, type: "success", isVisible: true });
        closeDeleteModal();
  const activeFilters = { ...(localFilters.status ? { status: localFilters.status } : {}), ...(localFilters.type ? { type: localFilters.type } : {}) };
  dispatch(fetchFaqs({ page: pagination.page, limit: pagination.limit, filters: activeFilters, search: searchInput || "", sortField: "createdAt", sortOrder: "desc" }));
      } catch (error) {
        setPopup({ message: "Failed to delete FAQ. Please try again.", type: "error", isVisible: true });
        setIsDeleting(false);
      }
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const current = pagination.page;
    const maxPages = 5;
    const start = Math.max(1, current - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);
    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);
    return pages;
  };

  return (
    <div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">FAQ List</h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">Total: {pagination.total}</span>
        </div>
        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by question, answer..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select value={localFilters.status || ""} onChange={(e) => handleFilterChange("status", e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Type:</span>
              <select value={localFilters.type || ""} onChange={(e) => handleFilterChange("type", e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select value={pagination.limit} onChange={(e) => handleLimitChange(Number(e.target.value))} className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <button onClick={handleResetFilters} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800">
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        )}
        <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Status</th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {(!faqs || faqs.length === 0) ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">No FAQs found.</td>
                </tr>
              ) : (
                faqs.map((faq, idx) => (
                  <tr key={faq._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate" title={faq.question}>{faq.question}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate" title={faq.answer}>{faq.answer}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{faq.type || "-"}</td>
                    {/* <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-200">{faq.type === "product" ? (faq.product ? faq.product : "-") : "-"}</td> */}
                    <td className="px-6 py-4">{getStatusBadge(faq.status)}</td>

                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => navigate(`/faq/edit/${faq._id}`)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1 rounded-md"
                        title="Edit FAQ"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(faq)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 px-2 py-1 rounded-md" title="Delete FAQ">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1} className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {generatePageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button key={idx} onClick={() => handlePageChange(page)} className={`px-3 py-1 rounded ${pagination.page === page ? "bg-indigo-500 text-white" : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"}`}>{page}</button>
            ) : (
              <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">{page}</span>
            )
          )}
          <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.totalPages} className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <PopupAlert message={popup.message} type={popup.type} isVisible={popup.isVisible} onClose={() => setPopup({ ...popup, isVisible: false })} />
      <DeleteModal isOpen={deleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteConfirm} faq={faqToDelete} isDeleting={isDeleting} />
    </div>
  );
};

export default FaqList;
