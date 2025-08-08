import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { User, Mail, Phone, FileText, Users, Search, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { updateLead, fetchLeadById, clearError } from "../../store/slices/lead";
import { fetchStaff } from "../../store/slices/staff";
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

interface PopupAlert {
  isVisible: boolean;
  message: string;
  type: string;
}

const PopupAlert: React.FC<PopupAlert & { onClose: () => void }> = ({ 
  message, 
  type, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3
            className={`text-lg font-semibold ${
              type === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {type === 'success' ? 'Success' : 'Error'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

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
  const { staff, loading: staffLoading } = useSelector((state: RootState) => state.staff);
  const [popup, setPopup] = useState<PopupAlert>({
    isVisible: false,
    message: "",
    type: "",
  });

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

  // Search functionality for staff dropdown
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    // Fetch staff data for the dropdown
    dispatch(fetchStaff({}));
  }, [dispatch]);

  // Show error popup if there's an error from Redux
  useEffect(() => {
    if (error) {
      setPopup({
        isVisible: true,
        message: error,
        type: "error",
      });
    }
  }, [error]);

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStaffDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Filter staff based on search term
  const filteredStaff = staff.filter(staffMember =>
    staffMember.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
    staffMember.email.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );

  // Get selected staff member details
  const selectedStaff = staff.find(s => s._id === formData.assignedTo);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStaffSelect = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: staffId,
    }));
    setIsStaffDropdownOpen(false);
    setStaffSearchTerm("");
  };

  const handleStaffSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaffSearchTerm(e.target.value);
    setIsStaffDropdownOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setPopup({
        isVisible: true,
        message: "Lead ID is missing.",
        type: "error",
      });
      return;
    }

    try {
      // Only update status and assignedTo fields
      const leadData = {
        status: formData.status,
        ...(formData.assignedTo && { assignedTo: formData.assignedTo }),
      };
      
      console.log("Update Lead Data:", leadData);

      // Dispatch the updateLead action
      const result = await dispatch(updateLead({ id, data: leadData }));
      
      if (updateLead.fulfilled.match(result)) {
        setPopup({
          isVisible: true,
          message: "Lead updated successfully!",
          type: "success",
        });

        // Navigate back to leads list after a short delay to show the popup
        setTimeout(() => {
          navigate("/lead/list");
        }, 2000);
      } else {
        throw new Error(result.payload as string || "Failed to update lead");
      }
    } catch (error) {
      setPopup({
        isVisible: true,
        message: error instanceof Error ? error.message : "Failed to update lead. Please try again.",
        type: "error",
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
                      Full Name
                    </div>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    readOnly
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
                    placeholder="Enter full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
                    placeholder="Enter email address"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    readOnly
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
                    placeholder="Enter phone number"
                  />
                </div>

                {/* Source */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    disabled
                    className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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


                 {/* Assigned To */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Assigned To
                    </div>
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedStaff ? `${selectedStaff.name} - ${selectedStaff.email}` : staffSearchTerm}
                        onChange={handleStaffSearchChange}
                        onFocus={() => setIsStaffDropdownOpen(true)}
                        placeholder={staffLoading ? "Loading staff..." : "Search and select staff member"}
                        className="w-full rounded border border-gray-300 px-3 py-2 pr-10 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        disabled={staffLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        {selectedStaff ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, assignedTo: "" }));
                              setStaffSearchTerm("");
                            }}
                            className="pointer-events-auto text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        ) : (
                          <Search className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    {isStaffDropdownOpen && !staffLoading && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-600 max-h-60 overflow-y-auto">
                        {filteredStaff.length > 0 ? (
                          <>
                            <div
                              className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleStaffSelect("")}
                            >
                              Clear selection
                            </div>
                            {filteredStaff.map((staffMember) => (
                              <div
                                key={staffMember._id}
                                onClick={() => handleStaffSelect(staffMember._id)}
                                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex flex-col"
                              >
                                <span className="font-medium">{staffMember.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{staffMember.email}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                            No staff members found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {staffLoading && (
                    <p className="text-sm text-gray-500 mt-1">Loading staff...</p>
                  )}
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
                  readOnly
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:text-white cursor-not-allowed"
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

      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
    </div>
  );
};

export default EditLead;
