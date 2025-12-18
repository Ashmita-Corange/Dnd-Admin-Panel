import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import { updateCustomer, fetchCustomers, fetchCustomerById } from "../../store/slices/customersSlice";
import { fetchRoles } from "../../store/slices/roles";
import { Customer } from "../../store/slices/customersSlice";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";

export default function EditCustomer() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    role: "",
    isSuperAdmin: false,
    isActive: true,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const params = useParams();
  const customerId = params.id;
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.customers.loading);
  const { customers } = useSelector((state: RootState) => state.customers);
  const { roles, loading: rolesLoading } = useSelector((state: RootState) => state.role);

  // Fetch roles when component mounts
  useEffect(() => {
    dispatch(fetchRoles({}));
  }, [dispatch]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setCustomer({ ...customer, [name]: newValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📝 Submitting customer update:", {
      customerId,
      customerData: customer
    });

    if (!customer.name) {
      toast.error("Customer name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!customer.email) {
      toast.error("Customer email is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!customer.role) {
      toast.error("Please select a role.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    try {
      console.log("🚀 Dispatching updateCustomer with:", {
        id: customerId,
        data: {
          name: customer.name,
          email: customer.email,
          role: customer.role,
          isSuperAdmin: customer.isSuperAdmin,
          isActive: customer.isActive,
        }
      });

      const updatedCustomer = await dispatch(
        updateCustomer({ 
          id: customerId!, 
          data: {
            name: customer.name,
            email: customer.email,
            role: customer.role,
            isSuperAdmin: customer.isSuperAdmin,
            isActive: customer.isActive,
          }
        })
      ).unwrap();

      console.log("✅ Updated Customer:", updatedCustomer);

      toast.success("Customer updated successfully!", {
        duration: 2000,
        position: "top-right",
      });

      // Redirect to customers list page (page 1) after successful update
      setTimeout(() => {
        navigate("/customers/list?page=1");
      }, 500);
    } catch (err: any) {
      console.error("❌ Update failed:", err);
      setPopup({
        isVisible: true,
        message: err || "Failed to update customer. Please try again.",
        type: "error",
      });
    }
  };

  const getCustomerData = async () => {
    setIsInitialLoading(true);
    try {
      console.log("🔍 Looking for customer with ID:", customerId);
      console.log("🔍 Current customers in state:", customers);
      
      let foundCustomer = customers.find((c: Customer) => c._id === customerId);
      console.log("🔍 Found customer in state:", foundCustomer);

      if (!foundCustomer) {
        console.log("🔄 Customer not found in state, fetching by ID from API...");
        // Try to fetch the specific customer first
        try {
          foundCustomer = await dispatch(fetchCustomerById(customerId!)).unwrap();
          console.log("📥 Customer fetched by ID:", foundCustomer);
        } catch (fetchByIdError) {
          console.log("⚠️ fetchCustomerById failed, trying fetchCustomers...");
          // If fetchCustomerById fails, fall back to fetchCustomers
          const response = await dispatch(fetchCustomers()).unwrap();
          console.log("📥 API Response from fetchCustomers:", response);
          foundCustomer = response.customers.find((c: Customer) => c._id === customerId);
          console.log("🔍 Found customer in fetchCustomers response:", foundCustomer);
        }
      }

      if (foundCustomer) {
        console.log("✅ Setting customer data:", foundCustomer);
        setCustomer({
          name: foundCustomer.name,
          email: foundCustomer.email,
          role: foundCustomer.role?._id || "",
          isSuperAdmin: foundCustomer.isSuperAdmin,
          isActive: foundCustomer.isActive,
        });
      } else {
        console.error("❌ Customer not found anywhere");
        setPopup({
          isVisible: true,
          message: "Customer not found.",
          type: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error fetching customer data:", error);
      setPopup({
        isVisible: true,
        message: "Failed to fetch customer data.",
        type: "error",
      });
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      getCustomerData();
    }
  }, [customerId, dispatch]); // Removed customers dependency to avoid infinite loops

  // Separate effect to handle when customers change
  useEffect(() => {
    if (customerId && customers.length > 0) {
      const foundCustomer = customers.find((c: Customer) => c._id === customerId);
      if (foundCustomer && !customer.name) { // Only set if form is empty
        console.log("🔄 Setting customer from updated customers list:", foundCustomer);
        setCustomer({
          name: foundCustomer.name,
          email: foundCustomer.email,
          role: foundCustomer.role?._id || "",
          isSuperAdmin: foundCustomer.isSuperAdmin,
          isActive: foundCustomer.isActive,
        });
      }
    }
  }, [customers, customerId]);

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Customer | TailAdmin"
        description="Edit an existing customer page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Edit Customer" />
          
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Loading customer data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Customer Information
              </h3>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={customer.name}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={customer.email}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter customer email"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={customer.role}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a role</option>
                  {rolesLoading ? (
                    <option value="" disabled>Loading roles...</option>
                  ) : (
                    roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Status & Permissions
              </h3>

              {/* Is Super Admin */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isSuperAdmin"
                    checked={customer.isSuperAdmin}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Is Super Admin
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Grant super admin privileges to this customer
                </p>
              </div>

              {/* Is Active */}
              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={customer.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Is Active
                  </label>
                </div>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Enable or disable this customer account
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
                {loading ? "Updating Customer..." : "Update Customer"}
              </button>
            </div>
          </form>
          )}
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
