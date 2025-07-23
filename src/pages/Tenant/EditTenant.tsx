import { use, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import {
  createTenant,
  fetchTenantById,
  updateTenant,
} from "../../store/slices/tenant";
import { useParams } from "react-router";

export default function EditTenant() {
  const [tenant, setTenant] = useState({
    companyName: "",
    subdomain: "",
    plan: "basic",
    subscriptionStatus: "trial",
    trialEndsAt: "",
    notes: "",
    email: "",
  });
  const params = useParams();
  const tenantId = params.id as string;
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.tenant.loading);

  // Auto-generate subdomain from company name
  const generateSubdomain = (companyName: string) => {
    return companyName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setTenant({ ...tenant, [name]: value });

    // Auto-generate subdomain when company name changes
    if (name === "companyName" && value && !tenant.subdomain) {
      const generatedSubdomain = generateSubdomain(value);
      setTenant((prev) => ({
        ...prev,
        companyName: value,
        subdomain: generatedSubdomain,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!tenant.companyName) {
      toast.error("Company name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!tenant.subdomain) {
      toast.error("Subdomain is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (!tenant.email) {
      toast.error("Email is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tenant.email)) {
      toast.error("Please enter a valid email address.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    // Date validation for trial end date
    if (tenant.subscriptionStatus === "trial" && !tenant.trialEndsAt) {
      toast.error("Trial end date is required for trial subscriptions.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    try {
      // Prepare tenant data
      const tenantData = {
        ...tenant,
        trialEndsAt: tenant.trialEndsAt
          ? new Date(tenant.trialEndsAt).toISOString()
          : null,
      };

      // Create the tenant
      const createdTenant = await dispatch(
        updateTenant({ id: tenantId, data: tenantData })
      ).unwrap();

      console.log("Created Tenant:", createdTenant);

      setPopup({
        isVisible: true,
        message: "Tenant created successfully!",
        type: "success",
      });

    //   // Reset form
    //   setTenant({
    //     companyName: "",
    //     subdomain: "",
    //     plan: "basic",
    //     subscriptionStatus: "trial",
    //     trialEndsAt: "",
    //     notes: "",
    //     email: "",
    //   });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to create tenant. Please try again.",
        type: "error",
      });
    }
  };

  // Get today's date for min attribute
  const today = new Date().toISOString().split("T")[0];

  const getData = async () => {
    const response = await dispatch(fetchTenantById(tenantId));
    const data = response.payload;
    setTenant({
      companyName: data?.companyName || "",
      subdomain: data?.subdomain || "",
      plan: data?.plan || "basic",
      subscriptionStatus: data?.subscriptionStatus || "trial",
      trialEndsAt:
        new Date(data?.trialEndsAt).toISOString().split("T")[0] || "",
      notes: data?.notes || "",
      email: data?.email || "",
    });
  };

  useEffect(() => {
    getData();
  }, [tenantId]);

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Tenant | TailAdmin"
        description="Edit an existing tenant page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Edit Tenant" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={tenant.companyName}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subdomain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subdomain"
                    value={tenant.subdomain}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="company-subdomain"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    This will be used as: https://subdomain.yourdomain.com
                  </p>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={tenant.email}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="tenant@example.com"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={tenant.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter any additional notes about the tenant"
                />
              </div>
            </div>

            {/* Subscription Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Subscription Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan
                  </label>
                  <select
                    name="plan"
                    value={tenant.plan}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="free">free</option>
                    <option value="basic">basic</option>
                    <option value="pro">pro</option>
                    <option value="enterprise">enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subscription Status
                  </label>
                  <select
                    name="subscriptionStatus"
                    value={tenant.subscriptionStatus}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              {tenant.subscriptionStatus === "trial" && (
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trial End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="trialEndsAt"
                    value={tenant.trialEndsAt}
                    onChange={handleChange}
                    min={today}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required={tenant.subscriptionStatus === "trial"}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Select when the trial period ends
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Adding Tenant..." : "Add Tenant"}
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
