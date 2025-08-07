import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  AlertTriangle,
  Mail,
  Eye,
  Plus,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchEmailTemplates } from "../../store/slices/emailTemplate";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";
import { Link } from "react-router";

interface EmailTemplate {
  _id: string;
  name: string;
  subject: string;
  type: string;
  status: "active" | "inactive";
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Delete Confirmation Modal Component
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  template: EmailTemplate | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, template, isDeleting }) => {
  if (!isOpen || !template) return null;

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
                Delete Email Template
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
              Are you sure you want to delete the email template{" "}
              <strong className="text-gray-900 dark:text-white">
                "{template.name}"
              </strong>
              ?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
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

// Preview Modal Component
const PreviewModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  template: EmailTemplate | null;
}> = ({ isOpen, onClose, template }) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {template.name}
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
          <div className="p-6 overflow-y-auto max-h-96">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Subject</h4>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {template.subject}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Type</h4>
                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  {template.type}
                </span>
              </div>

              {template.description && (
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    {template.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Status</h4>
                  <div className="flex items-center gap-2">
                    {template.status === "active" ? (
                      <CheckCircle className="text-green-500 h-5 w-5" />
                    ) : (
                      <XCircle className="text-red-500 h-5 w-5" />
                    )}
                    <span className="capitalize text-gray-600 dark:text-gray-300">
                      {template.status}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Created</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailTemplateList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { templates, loading, error } = useAppSelector((state) => state.emailTemplates);
  console?.log("Email templates:", templates);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [templateToPreview, setTemplateToPreview] = useState<EmailTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });

  // Fetch email templates
  useEffect(() => {
    dispatch(fetchEmailTemplates());
  }, [dispatch]);

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchInput.toLowerCase());
    const matchesStatus = !statusFilter || template.status === statusFilter;
    const matchesType = !typeFilter || template.type === typeFilter;
    const notDeleted = !template.isDeleted;
    
    return matchesSearch && matchesStatus && matchesType && notDeleted;
  });

  // Pagination
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTemplates = filteredTemplates.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusFilter("");
    setTypeFilter("");
    setCurrentPage(1);
  };

  const openDeleteModal = (template: EmailTemplate) => {
    setTemplateToDelete(template);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTemplateToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const openPreviewModal = (template: EmailTemplate) => {
    setTemplateToPreview(template);
    setPreviewModalOpen(true);
  };

  const closePreviewModal = () => {
    setTemplateToPreview(null);
    setPreviewModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      setIsDeleting(true);
      try {
        // Here you would dispatch a delete action when it's implemented
        // await dispatch(deleteEmailTemplate(templateToDelete._id)).unwrap();

        setPopup({
          message: `Email template "${templateToDelete.name}" deleted successfully`,
          type: "success",
          isVisible: true,
        });

        closeDeleteModal();
        dispatch(fetchEmailTemplates());
      } catch (error) {
        console.error("Failed to delete template:", error);
        setPopup({
          message: "Failed to delete template. Please try again.",
          type: "error",
          isVisible: true,
        });
        setIsDeleting(false);
      }
    }
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxPages = 5;

    const start = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);

    if (start > 1) pages.push(1, "...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...", totalPages);

    return pages;
  };

  // Get unique template types for filter dropdown
  const templateTypes = Array.from(new Set(templates.map(template => template.type)));

  return (
    <div>
      <PageMeta
        title="Email Template List | TailAdmin"
        description="List of all email templates in TailAdmin"
      />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Email Templates
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-500 text-sm dark:text-gray-400">
              Total: {filteredTemplates.length}
            </span>
            <Link 
              to="/email-template/create"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </Link>
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
                placeholder="Search by name or subject..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
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

            {/* Type Filter */}
            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                {templateTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Per Page */}
            <div className="flex items-center gap-2">
              <span className="text-sm dark:text-gray-300">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Subject
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
              {paginatedTemplates.map((template, idx) => (
                <tr
                  key={template._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    {startIndex + idx + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {template.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                    <div className="max-w-xs truncate" title={template.subject}>
                      {template.subject}
                    </div>
                  </td>
                 
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openPreviewModal(template)}
                      className="text-green-500 hover:text-green-700 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <Link to={`/email-template/edit/${template._id}`}>
                      <button className="text-blue-500 hover:text-blue-700 transition-colors" title="Edit">
                        <Pencil className="h-5 w-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => openDeleteModal(template)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {!loading && paginatedTemplates.length === 0 && (
            <div className="text-center py-8">
              <Mail className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No email templates found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new email template.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTemplates.length)} of{" "}
              {filteredTemplates.length} results
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                      currentPage === page
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
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        template={templateToDelete}
        isDeleting={isDeleting}
      />

      {/* Preview Modal */}
      <PreviewModal
        isOpen={previewModalOpen}
        onClose={closePreviewModal}
        template={templateToPreview}
      />
    </div>
  );
};

export default EmailTemplateList;
