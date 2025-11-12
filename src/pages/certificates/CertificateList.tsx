import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCertificates,
  deleteCertificate,
  setSearchQuery,
} from "../../store/slices/certificateSlice";
import PageMeta from "../../components/common/PageMeta";
// PageBreadcrumb intentionally not used here (listing page uses PageMeta only)
import PopupAlert from "../../components/popUpAlert";
import { Link } from "react-router-dom";

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  isDeleting?: boolean;
}> = ({ isOpen, onClose, onConfirm, itemName, isDeleting }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-transparent backdrop-blur-xs"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white z-[99999] dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-lg font-semibold">Delete Certificate</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <p>
              Are you sure you want to delete <strong>{itemName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex justify-end gap-3 p-6 border-t">
            <button onClick={onClose} className="px-4 py-2 rounded border">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 rounded bg-red-600 text-white"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CertificateList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { certificates, loading, pagination, searchQuery } = useAppSelector(
    (s) => (s as any).certificates || {}
  );

  const [searchInput, setSearchInput] = useState(searchQuery || "");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<{
    id: string;
    name?: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [popup, setPopup] = useState({
    message: "",
    type: "success",
    isVisible: false,
  } as any);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        dispatch(setSearchQuery(searchInput));
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, dispatch]);

  useEffect(() => {
    dispatch(
      fetchCertificates({
        page: pagination?.page ?? 1,
        limit: pagination?.limit ?? 10,
        search: searchQuery || "",
      })
    );
  }, [dispatch, pagination?.page, pagination?.limit, searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= (pagination?.totalPages || 1)) {
      dispatch(
        fetchCertificates({
          page: newPage,
          limit: pagination?.limit ?? 10,
          search: searchQuery || "",
        })
      );
    }
  };

  const handleLimitChange = (newLimit: number) => {
    dispatch(
      fetchCertificates({ page: 1, limit: newLimit, search: searchQuery || "" })
    );
  };

  const openDelete = (id: string, name?: string) => {
    setToDelete({ id, name });
    setDeleteModalOpen(true);
  };
  const closeDelete = () => {
    setToDelete(null);
    setDeleteModalOpen(false);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteCertificate(toDelete.id)).unwrap();
      setPopup({
        message: `Certificate '${toDelete.name || ""}' deleted`,
        type: "success",
        isVisible: true,
      });
      closeDelete();
      dispatch(
        fetchCertificates({
          page: pagination?.page ?? 1,
          limit: pagination?.limit ?? 10,
          search: searchQuery || "",
        })
      );
    } catch (err) {
      setPopup({
        message: "Failed to delete certificate",
        type: "error",
        isVisible: true,
      });
      setIsDeleting(false);
    }
  };

  const generatePageNumbers = () => {
    const pages: Array<number | string> = [];
    const totalPages = pagination?.totalPages ?? 1;
    const current = pagination?.page ?? 1;
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
      <PageMeta title="Certificates" description="List of certificates" />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Certificates</h1>
          <Link
            to="/certificate/add"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Add Certificate
          </Link>
        </div>

        <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name..."
                className="pl-10 pr-4 py-2 w-full border rounded"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm">Show:</span>
              <select
                value={pagination?.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="border rounded px-3 py-2"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchInput("");
                dispatch(setSearchQuery(""));
              }}
              className="px-4 py-2 border rounded"
            >
              Reset
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">File</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Description</th>
                  <th className="px-6 py-3 text-left">Created</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {certificates &&
                  certificates.map((c: any, idx: number) => {
                    const fileUrl = c.file
                      ? `${import.meta.env.VITE_IMAGE_URL}/${c.file}`
                      : null;
                    const isImage =
                      typeof c.file === "string" &&
                      /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(c.file);

                    return (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {(pagination?.page - 1) * pagination?.limit + idx + 1}
                        </td>
                        <td className="px-6 py-4">
                          {fileUrl ? (
                            isImage ? (
                              <img
                                src={fileUrl}
                                alt={c.name || "certificate"}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    "https://via.placeholder.com/80x80?text=No+Image";
                                }}
                                className="w-16 h-16 rounded object-cover border"
                              />
                            ) : (
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 underline"
                              >
                                {c.file.split("/").pop() || "Download"}
                              </a>
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium">{c.name}</td>
                        <td className="px-6 py-4">{c.description || "-"}</td>
                        <td className="px-6 py-4">
                          {c.createdAt
                            ? new Date(c.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <Link
                            to={`/certificate/edit/${c._id}`}
                            className="text-blue-500"
                          >
                            <Pencil />
                          </Link>
                          <button
                            onClick={() => openDelete(c._id, c.name)}
                            className="text-red-500"
                          >
                            <Trash2 />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => handlePageChange((pagination?.page || 1) - 1)}
            disabled={(pagination?.page || 1) === 1}
            className="p-2 rounded border"
          >
            <ChevronLeft />
          </button>
          {generatePageNumbers().map((p, i) =>
            typeof p === "number" ? (
              <button
                key={i}
                onClick={() => handlePageChange(Number(p))}
                className={`px-3 py-1 rounded ${
                  pagination?.page === p
                    ? "bg-indigo-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={i} className="px-2">
                {p}
              </span>
            )
          )}
          <button
            onClick={() => handlePageChange((pagination?.page || 1) + 1)}
            disabled={(pagination?.page || 1) === (pagination?.totalPages || 1)}
            className="p-2 rounded border"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        itemName={toDelete?.name}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default CertificateList;
