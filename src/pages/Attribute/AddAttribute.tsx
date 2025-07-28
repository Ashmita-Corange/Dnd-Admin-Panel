import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { createAttribute } from "../../store/slices/attribute";
import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";

const AddAttribute = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.attribute);

  const [form, setForm] = useState({
    name: "",
    description: "",
    values: [""],
    status: "active",
  });
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else if (type === "number") {
      setForm({ ...form, [name]: parseInt(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleValueChange = (idx: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      values: prev.values.map((v, i) => (i === idx ? value : v)),
    }));
  };

  const addValueField = () => {
    setForm((prev) => ({ ...prev, values: [...prev.values, ""] }));
  };

  const removeValueField = (idx: number) => {
    setForm((prev) => ({ ...prev, values: prev.values.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.name) {
      toast.error("Attribute name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    
    if (!form.values.filter((v) => v.trim()).length) {
      toast.error("At least one value is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }
    
    try {
      await dispatch(createAttribute({
        name: form.name,
        description: form.description,
        values: form.values.filter((v) => v.trim()),
        status: form.status,
      })).unwrap();
      
      setPopup({ 
        isVisible: true, 
        message: "Attribute created successfully!", 
        type: "success" 
      });
      
      setForm({ 
        name: "", 
        description: "", 
        values: [""],
        status: "Active",
      });
    } catch (err) {
      setPopup({ 
        isVisible: true, 
        message: "Failed to create attribute. Please try again.", 
        type: "error" 
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Attribute | TailAdmin"
        description="Create a new attribute page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Add Attribute" />
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Attribute Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter attribute name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter attribute description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sort Order and Featured Attribute fields removed */}
              </div>
            </div>

            {/* Attribute Values Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Attribute Values
              </h3>
              
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Values <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {form.values.map((value, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => handleValueChange(idx, e.target.value)}
                        className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        placeholder={`Value ${idx + 1}`}
                        required
                      />
                      {form.values.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeValueField(idx)}
                          className="px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addValueField}
                  className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  + Add Value
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Add multiple values for this attribute (e.g., Red, Blue, Green for Color attribute)
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating Attribute..." : "Create Attribute"}
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
};

export default AddAttribute;