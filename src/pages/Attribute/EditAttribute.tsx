import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import axiosInstance from "../../services/axiosConfig";
import { Sparkles } from "lucide-react";

const EditAttribute = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { id } = useParams();
  const [form, setForm] = useState({
    name: "",
    description: "",
    values: [""],
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  useEffect(() => {
    // Fetch attribute by id
    const fetchAttribute = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/attribute/${id}`, {
          headers: { "x-tenant": "tenant1" },
        });
        const attr = response.data?.data;
        setForm({
          name: attr.name || "",
          description: attr.description || "",
          values: Array.isArray(attr.values) ? attr.values : [""],
          status: attr.status?.toLowerCase() === "inactive" ? "inactive" : "active",
        });
      } catch (err) {
        setPopup({ 
          isVisible: true, 
          message: "Failed to fetch attribute.", 
          type: "error" 
        });
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAttribute();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      // No checkbox fields now
    } else if (type === "number") {
      // No number fields now
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
    setForm((prev) => ({ 
      ...prev, 
      values: prev.values.filter((_, i) => i !== idx) 
    }));
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
    
    setLoading(true);
    try {
      await axiosInstance.put(`/attribute/${id}`, {
        name: form.name,
        description: form.description,
        values: form.values.filter((v) => v.trim()),
        status: form.status,
      }, {
        headers: {
          "x-tenant": "tenant1",
          "Content-Type": "application/json",
        },
      });
      
      setPopup({ 
        isVisible: true, 
        message: "Attribute updated successfully!", 
        type: "success" 
      });

      // Redirect to attribute list page after successful update
      setTimeout(() => {
        navigate("/attribute/list");
      }, 1000);
    } catch (err) {
      setPopup({ 
        isVisible: true, 
        message: "Failed to update attribute. Please try again.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Attribute | TailAdmin"
        description="Edit an existing attribute page for TailAdmin"
      />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-gradient-to-br from-white via-gray-50/50 to-white dark:border-gray-800 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900 px-5 py-7 xl:px-10 xl:py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10"></div>

        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Edit Attribute
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Update attribute details and values
            </p>
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="mx-auto w-full">
            <PageBreadcrumb pageTitle="Edit Attribute" />
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Basic Information Section */}
              <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Attribute Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white"
                      placeholder="Enter attribute name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-white resize-none"
                    placeholder="Enter attribute description"
                  />
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
                  className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3.5 text-white font-semibold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="relative z-10">
                    {loading ? "Updating Attribute..." : "Update Attribute"}
                  </span>
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
    </div>
  );
};

export default EditAttribute;