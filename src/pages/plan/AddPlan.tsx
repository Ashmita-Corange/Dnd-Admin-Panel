import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { createPlan } from "../../store/slices/plan";

interface PlanFeature {
  key: string;
  value: string;
}

export default function AddSubscriptionPlan() {
  const [plan, setPlan] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "INR",
    features: [] as PlanFeature[],
    availability: "monthly",
    duration: 3,
    isActive: true,
    discount: 0,
    discountType: "percentage",
    trialPeriod: 0,
    trialPeriodType: "days",
    isFeatured: false,
    metadata: {} as any,
  });

  const [currentFeature, setCurrentFeature] = useState({
    key: "",
    value: "",
  });

  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(
    (state: RootState) => state.plan?.loading || false
  );

  // Available options
  const availabilityOptions = ["daily", "weekly", "monthly", "yearly"];
  const discountTypes = ["percentage", "fixed"];
  const trialPeriodTypes = ["days", "weeks", "months"];
  const currencies = ["INR", "USD", "EUR", "GBP"];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setPlan({ ...plan, [name]: checked });
    } else if (type === "number") {
      setPlan({ ...plan, [name]: parseFloat(value) || 0 });
    } else {
      setPlan({ ...plan, [name]: value });
    }
  };

  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentFeature({ ...currentFeature, [name]: value });
  };

  const addFeature = () => {
    if (!currentFeature.key.trim() || !currentFeature.value.trim()) {
      toast.error("Both feature key and value are required.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    // Check if feature key already exists
    const existingFeature = plan.features.find(
      (feature) =>
        feature.key.toLowerCase() === currentFeature.key.toLowerCase()
    );

    if (existingFeature) {
      toast.error("Feature key already exists.", {
        duration: 4000,
        position: "top-right",
      });
      return;
    }

    setPlan({
      ...plan,
      features: [...plan.features, { ...currentFeature }],
    });

    setCurrentFeature({ key: "", value: "" });
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = plan.features.filter((_, i) => i !== index);
    setPlan({ ...plan, features: updatedFeatures });
  };

  const calculateDiscountedPrice = () => {
    if (plan.discount <= 0) return plan.price;

    if (plan.discountType === "percentage") {
      return plan.price - (plan.price * plan.discount) / 100;
    } else {
      return Math.max(0, plan.price - plan.discount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!plan.name.trim()) {
      toast.error("Plan name is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (plan.price < 0) {
      toast.error("Price cannot be negative.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (
      plan.discount < 0 ||
      (plan.discountType === "percentage" && plan.discount > 100)
    ) {
      toast.error("Invalid discount value.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    if (plan.features.length === 0) {
      toast.error("At least one feature is required.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    try {
      // Create the plan
      console.log("Creating Plan:", plan);
      const createdPlan = await dispatch(createPlan(plan)).unwrap();

      console.log("Created Plan:", createdPlan);

      setPopup({
        
        isVisible: true,
        message: "Subscription plan created successfully!",
        type: "success",
      });

      // Reset form
      setPlan({
        name: "",
        description: "",
        price: 0,
        currency: "INR",
        features: [],
        availability: "monthly",
        duration: 3,
        isActive: true,
        discount: 0,
        discountType: "percentage",
        trialPeriod: 0,
        trialPeriodType: "days",
        isFeatured: false,
        metadata: {},
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to create subscription plan. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Add Subscription Plan | TailAdmin"
        description="Add a new subscription plan page for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Add Subscription Plan" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Plan Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={plan.name}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter plan name"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={plan.currency}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={plan.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  placeholder="Enter plan description"
                />
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Pricing & Duration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={plan.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={plan.availability}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {availabilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={plan.duration}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Duration"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={plan.discount}
                    onChange={handleChange}
                    min="0"
                    max={plan.discountType === "percentage" ? "100" : undefined}
                    step="0.01"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    value={plan.discountType}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {discountTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price Preview */}
              {plan.discount > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <span className="font-medium">Final Price:</span>{" "}
                    {plan.currency} {calculateDiscountedPrice().toFixed(2)}
                    <span className="ml-2 line-through text-gray-500">
                      {plan.currency} {plan.price.toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Trial Period Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Trial Period
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trial Period Duration
                  </label>
                  <input
                    type="number"
                    name="trialPeriod"
                    value={plan.trialPeriod}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Set to 0 for no trial period
                  </p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Trial Period Type
                  </label>
                  <select
                    name="trialPeriodType"
                    value={plan.trialPeriodType}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    {trialPeriodTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Plan Features
              </h3>

              {/* Add Feature Form */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                  Add Feature
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      name="key"
                      value={currentFeature.key}
                      onChange={handleFeatureChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="Feature key (e.g., users)"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="value"
                      value={currentFeature.value}
                      onChange={handleFeatureChange}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      placeholder="Feature value (e.g., 100)"
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                      Add Feature
                    </button>
                  </div>
                </div>
              </div>

              {/* Features List */}
              {plan.features.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-800 dark:text-white">
                    Current Features:
                  </h4>
                  {plan.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                    >
                      <div>
                        <span className="font-medium text-gray-800 dark:text-white">
                          {feature.key}:
                        </span>
                        <span className="ml-2 text-gray-600 dark:text-gray-400">
                          {feature.value}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-800 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Plan Settings */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Plan Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={plan.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Plan is Active
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={plan.isFeatured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Featured Plan
                  </span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Creating Plan..." : "Create Subscription Plan"}
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
