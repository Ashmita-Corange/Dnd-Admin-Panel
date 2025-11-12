import React, { useEffect, useState, useMemo } from "react";
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
  Package,
  DollarSign,
  Star,
  Eye,
  Tag,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";
import { Link } from "react-router";
import { fetchVariants, deleteAttribute } from "../../store/slices/variant";

interface Variant {
  _id: string;
  productId: string;
  title: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  images: string[];
  attributes: Array<{
    attributeId: string;
    value: string;
    _id: string;
  }>;
  isDefault?: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AttributeOption {
  label: string;
  value: string;
}

// Delete Confirmation Modal Component
const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant: Variant | null;
  isDeleting: boolean;
}> = ({ isOpen, onClose, onConfirm, variant, isDeleting }) => {
  if (!isOpen || !variant) return null;

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
                Delete Variant
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
              Are you sure you want to delete the variant{" "}
              <strong className="text-gray-900 dark:text-white">
                "{variant.title}"
              </strong>
              ?
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Warning:</strong> This will permanently remove the
                variant with SKU: {variant.sku}
              </p>
            </div>
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

const VariantList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { variants, loading, error } = useAppSelector((state) => state.variant);
  // derive variants safely when needed inside memoized helpers
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<Variant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [localFilters, setLocalFilters] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [popup, setPopup] = useState<{
    message: string;
    type: "success" | "error";
    isVisible: boolean;
  }>({
    message: "",
    type: "success",
    isVisible: false,
  });
  const [availableAttributes, setAvailableAttributes] = useState<
    AttributeOption[]
  >([]);

  // Fetch variants on mount
  useEffect(() => {
    // You may need to get tenant from context, props, or URL
    const tenant = "default"; // Replace with actual tenant logic
    dispatch(fetchVariants({ tenant }));
  }, [dispatch]);

  // Update pagination total and totalPages when variants change
  // Compute filtered variants based on search and local filters
  const filteredVariants = useMemo(() => {
    const list = Array.isArray(variants) ? variants : [];
    const q = searchInput.trim().toLowerCase();

    return list.filter((v) => {
      // Search by title or sku
      if (q) {
        const inTitle = v.title?.toLowerCase().includes(q);
        const inSku = v.sku?.toLowerCase().includes(q);
        if (!inTitle && !inSku) return false;
      }

      // Stock filter
      if (localFilters.stock) {
        const val = localFilters.stock;
        if (val === "in-stock" && v.stock <= 0) return false;
        if (val === "low-stock" && !(v.stock > 0 && v.stock <= 20))
          return false;
        if (val === "out-of-stock" && v.stock > 0) return false;
      }

      // isDefault filter
      if (
        localFilters.isDefault !== undefined &&
        localFilters.isDefault !== ""
      ) {
        if (localFilters.isDefault === "true" && !v.isDefault) return false;
        if (localFilters.isDefault === "false" && v.isDefault) return false;
      }

      return true;
    });
  }, [variants, searchInput, localFilters]);

  // Update pagination totals when filtered list or limit changes
  useEffect(() => {
    setPagination((prev) => {
      const total = filteredVariants.length;
      const totalPages = Math.max(1, Math.ceil(total / prev.limit));
      const page = Math.min(prev.page, totalPages);
      return { ...prev, total, totalPages, page };
    });
  }, [filteredVariants, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setLocalFilters({});
  };

  const openDeleteModal = (variant: Variant) => {
    setVariantToDelete(variant);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setVariantToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const handleDeleteConfirm = async () => {
    if (variantToDelete) {
      setIsDeleting(true);
      try {
        // Dispatch deleteAttribute thunk
        const tenant = "default"; // Replace with actual tenant logic if needed
        await dispatch(
          deleteAttribute({ attributeId: variantToDelete._id, tenant })
        ).unwrap();
        setPopup({
          message: `Variant "${variantToDelete.title}" deleted successfully`,
          type: "success",
          isVisible: true,
        });
        closeDeleteModal();
      } catch (error) {
        setPopup({
          message: "Failed to delete variant. Please try again.",
          type: "error",
          isVisible: true,
        });
        setIsDeleting(false);
      }
      console.error(error);
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };
  const getStockStatus = (stock: number) => {
    if (stock > 50)
      return {
        color: "text-green-600",
        borderColor: "border-green-200",
        bgColor: "bg-green-50",
        text: "In Stock",
      };
    if (stock > 20)
      return {
        color: "text-yellow-600",
        borderColor: "border-yellow-200",
        bgColor: "bg-yellow-50",
        text: "Low Stock",
      };
    if (stock > 0)
      return {
        color: "text-red-600",
        borderColor: "border-red-200",
        bgColor: "bg-red-50",
        text: "Low Stock",
      };
    return {
      color: "text-red-600",
      borderColor: "border-red-200",
      bgColor: "bg-red-100",
      text: "Out of Stock",
    };
  };

  const renderAttributes = (attributes: Variant["attributes"]) => {
    if (attributes.length === 0) {
      return (
        <span className="text-xs text-gray-400 dark:text-gray-500 italic">
          No attributes
        </span>
      );
    }

    const firstAttribute = attributes[0];
    const remainingCount = attributes.length - 1;

    return (
      <div className="relative group">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
            <Tag className="w-3 h-3" />
            {firstAttribute.value}
          </span>
          {remainingCount > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              +{remainingCount} more
            </span>
          )}
        </div>
        {/* Tooltip on hover showing all attributes */}
        {attributes.length > 1 && (
          <div className="absolute left-0 top-full mt-2 w-max max-w-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
              All Attributes:
            </div>
            <div className="flex flex-wrap gap-1">
              {attributes.map((attr) => (
                <span
                  key={attr._id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                >
                  <Tag className="w-3 h-3" />
                  {attr.value}
                </span>
              ))}
            </div>
            {/* Arrow pointing up */}
            <div className="absolute -top-1 left-4 w-2 h-2 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-45"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageMeta
        title="Variant List | TailAdmin"
        description="List of all product variants in TailAdmin"
      />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Product Variants
          </h1>
          <span className="text-gray-500 text-sm dark:text-gray-400">
            Total: {variants.length}
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
                placeholder="Search by title, SKU..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={localFilters.stock || ""}
                onChange={(e) => handleFilterChange("stock", e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Stock</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Default Filter */}
            <div className="flex items-center gap-2">
              <select
                value={localFilters.isDefault || ""}
                onChange={(e) =>
                  handleFilterChange("isDefault", e.target.value)
                }
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              >
                <option value="">All Variants</option>
                <option value="true">Default Only</option>
                <option value="false">Non-Default</option>
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
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Title & SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Attributes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Sale
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
              {/** Use paginated, filtered variants for rendering */}
              {filteredVariants
                .slice(
                  (pagination.page - 1) * pagination.limit,
                  pagination.page * pagination.limit
                )
                .map((variant, idx) => {
                  const stockStatus = getStockStatus(variant.stock);
                  return (
                    <tr
                      key={variant._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {(pagination.page - 1) * pagination.limit + idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <img
                            src={
                              variant.images && variant.images[0]
                                ? `${import.meta.env.VITE_IMAGE_URL}/${
                                    variant.images[0]
                                  }`
                                : "https://www.redecredauto.com.br/portal/assets/images/default.jpg"
                            }
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://www.redecredauto.com.br/portal/assets/images/default.jpg";
                            }}
                            alt={variant.title}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-700"
                            onClick={() => {
                              console.log("Variant image clicked:", variant);
                            }}
                          />

                          {variant.isDefault && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <Star className="w-3 h-3 text-white fill-current" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {variant.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {renderAttributes(variant.attributes)}
                      </td>
                      <td className="px-6 py-4">{variant.price}</td>
                      <td className="px-6 py-4">{variant.salePrice}</td>

                      <td className="px-6 py-4">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${stockStatus.bgColor} ${stockStatus.borderColor}`}
                        >
                          <Package className={`w-6 h-6 ${stockStatus.color}`} />
                          <div className="flex flex-col">
                            <span
                              className={`text-xs font-medium ${stockStatus.color}`}
                            >
                              {stockStatus.text}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {variant.stock === 0 ? (
                          <XCircle className="text-red-500" />
                        ) : (
                          <CheckCircle className="text-green-500" />
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/variant/edit/${variant._id}`}>
                            <button className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all dark:hover:bg-blue-900/20">
                              <Pencil className="h-4 w-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openDeleteModal(variant)}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {generatePageNumbers().map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={idx}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  pagination.page === page
                    ? "bg-indigo-500 text-white shadow-md"
                    : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {page}
              </button>
            ) : (
              <span
                key={idx}
                className="px-2 py-2 text-gray-400 dark:text-gray-500"
              >
                {page}
              </span>
            )
          )}
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
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

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        variant={variantToDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default VariantList;
