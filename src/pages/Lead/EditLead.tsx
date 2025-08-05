import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, FileText, Users } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { updateLead, fetchLeadById, clearError } from "../../store/slices/lead";
import { RootState, AppDispatch } from "../../store";

type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";

interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  notes: string;
  assignedTo: string;
}

const PageBreadcrumb: React.FC<{ pageTitle: string }> = ({ pageTitle }) => (
  <div className="mb-6">
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-1 md:space-x-3">
        <li className="flex items-center">
          <a href="#" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
            Home
          </a>
        </li>
        <li>
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <a href="/leads" className="text-gray-700 hover:text-blue-600 dark:text-gray-300">
              Leads
            </a>
          </div>
        </li>
        <li>
          <div className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-500 dark:text-gray-400">{pageTitle}</span>
          </div>
        </li>
      </ol>
    </nav>
    <h1 className="text-3xl font-bold text-gray-800 dark:text-white/90">
      {pageTitle}
    </h1>
  </div>
);

const EditLead: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { leads, loading, error } = useSelector((state: RootState) => state.lead);

  const [formData, setFormData] = useState<LeadFormData>({
    fullName: "",
    email: "",
    phone: "",
    status: "new",
    source: "",
    notes: "",
    assignedTo: "",
  });

  const [isFormLoaded, setIsFormLoaded] = useState(false);

  // Fetch lead data when component mounts
  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(id));
    }
  }, [dispatch, id]);

  // Populate form when lead data is available
  useEffect(() => {
    if (id && leads.length > 0) {
      const currentLead = leads.find(lead => lead._id === id);
      if (currentLead && !isFormLoaded) {
        setFormData({
          fullName: currentLead.fullName || "",
          email: currentLead.email || "",
          phone: currentLead.phone || "",
          status: currentLead.status || "new",
          source: currentLead.source || "",
          notes: currentLead.notes && currentLead.notes.length > 0 
            ? currentLead.notes[currentLead.notes.length - 1].note 
            : "",
          assignedTo: currentLead.assignedTo || "",
        });
        setIsFormLoaded(true);
      }
    }
  }, [leads, id, isFormLoaded]);

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const statusOptions: { value: LeadStatus; label: string }[] = [
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "converted", label: "Converted" },
    { value: "lost", label: "Lost" },
  ];

  const sourceOptions = [
    { value: "", label: "Select Source" },
    { value: "website", label: "Website" },
    { value: "newsletter", label: "Newsletter" },
    { value: "popup", label: "Popup" },
    { value: "referral", label: "Referral" },
    { value: "manual", label: "Manual" },
    { value: "other", label: "Other" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      toast.error("Lead ID is missing.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    // Validation
    if (!formData.fullName) {
      toast.error("Full name is required.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (!formData.email) {
      toast.error("Email is required.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    if (!formData.phone) {
      toast.error("Phone number is required.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    try {
      // Format data to match your schema
      const leadData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source as "website" | "newsletter" | "popup" | "referral" | "manual" | "other",
        status: formData.status,
        ...(formData.notes && { 
          notes: [{ 
            note: formData.notes,
            createdAt: new Date().toISOString()
          }] 
        }),
        ...(formData.assignedTo && { assignedTo: formData.assignedTo }),
      };
      
      console.log("Update Lead Data:", leadData);

      // Dispatch the updateLead action
      const result = await dispatch(updateLead({ id, data: leadData }));
      
      if (updateLead.fulfilled.match(result)) {
        toast.success("Lead updated successfully!", {
          duration: 4000,
          position: "top-right",
        });

        // Navigate back to leads list immediately
        navigate("/lead/list");
      } else {
        throw new Error(result.payload as string || "Failed to update lead");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update lead. Please try again.", {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  if (loading && !isFormLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading lead data...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Edit Lead new update" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Full Name <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter full name"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone <span className="text-red-500">*</span>
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                {/* Assigned To */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned To
                    </div>
                  </label>
                  <input
                    type="text"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter user ID"
                  />
                </div>
              </div>
            </div>

            {/* Lead Details Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Lead Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Notes
                  </div>
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter any additional notes..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 flex gap-4">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating Lead..." : "Update Lead"}
              </button>
              
              <button
                type="button"
                onClick={() => navigate("/leads")}
                className="rounded bg-gray-600 px-6 py-3 text-white font-semibold hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default EditLead;
