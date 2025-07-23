import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import { createCategory } from "../../store/slices/categorySlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { createModule } from "../../store/slices/moduleSlice";

export default function AddModule() {
  const [module, setModule] = useState({
    name: "",
  });

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.category.loading);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!module.name) {
      toast.error("Module name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    try {
      // Create the main category and get the result (should include the new category's ID)
      const createdCategory = await dispatch(
        createModule({
          name: module.name,
        })
      ).unwrap();

      console.log(
        "Created Module:",

        createdCategory
      );

      setPopup({
        isVisible: true,
        message: "Module created successfully!",
        type: "success",
      });
      setModule({
        name: "",
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to create Module. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Module | TailAdmin"
        description="Add a new module page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <PageBreadcrumb pageTitle="Add Module" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6  pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={module.name}
                    onChange={(e) =>
                      setModule({ ...module, name: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter module name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Adding Module..." : "Add Module"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
    </div>
  );
}
