import { AlertTriangle, Edit, Pen, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const EditModal = ({
  isOpen,
  onClose,
  onSubmit,
  data,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  data: any;
}) => {
  const [name, setName] = useState(data?.name || "");

  useEffect(() => {
    if (isOpen) {
      setName(data?.name || "");
    }
  }, [data?.name, isOpen]);

  if (!isOpen) return null;
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
              <Edit className="w-5 h-5" />

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Edit Module
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 px-6 py-6 pb-10">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Module Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                placeholder="Enter module name"
                required
              />
            </div>
          </div>
          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (name.trim()) {
                  onSubmit({ id: data._id, name });
                }
              }}
              disabled={!name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            >
              Save{" "}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
