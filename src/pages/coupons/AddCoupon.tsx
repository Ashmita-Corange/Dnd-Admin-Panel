import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCoupon } from "../../store/slices/coupon";
import { RootState, AppDispatch } from "../../store";
import PopupAlert from "../../components/popUpAlert";
import { Toaster } from "react-hot-toast";

const initialCoupon = {
  code: "",
  type: "percent",
  value: 0,
  isActive: true,
  expiresAt: "",
  usageLimit: 1,
  usedCount: 0,
  minCartValue: 0,
};

const AddCoupon: React.FC = () => {
  const [coupon, setCoupon] = useState(initialCoupon);
  const [popup, setPopup] = useState({ isVisible: false, message: "", type: "" });
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.coupon.loading);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setCoupon({ ...coupon, [name]: checked });
    } else if (type === "number") {
      setCoupon({ ...coupon, [name]: parseFloat(value) });
    } else {
      setCoupon({ ...coupon, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupon.code) {
      setPopup({ isVisible: true, message: "Coupon code is required.", type: "error" });
      return;
    }
    if (!coupon.expiresAt) {
      setPopup({ isVisible: true, message: "Expiry date is required.", type: "error" });
      return;
    }
    try {
      await dispatch(createCoupon(coupon)).unwrap();
      setPopup({ isVisible: true, message: "Coupon created successfully!", type: "success" });
      setCoupon(initialCoupon);
    } catch {
      setPopup({ isVisible: true, message: "Failed to create coupon. Please try again.", type: "error" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 py-8 px-4">
      <Toaster position="top-right" />
      
      <div className="max-w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8 text-start flex gap-2">
          <div className="inline-block mb-4 p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 mb-2">
            Create New Coupon
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Design promotional offers for your customers</p>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden">
          <div>
            {/* Form Content */}
            <div className="p-8 lg:p-12 space-y-8" onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Coupon Code */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="code"
                        value={coupon.code}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="e.g., SAVE20"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Discount Type
                    </label>
                    <div className="relative">
                      <select
                        name="type"
                        value={coupon.type}
                        onChange={handleChange}
                        className="w-full appearance-none rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-white transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                      >
                        <option value="percent">Percentage (%)</option>
                        <option value="flat">Flat Amount (₹)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Value */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Discount Value
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                        {coupon.type === "percent" ? "%" : "₹"}
                      </div>
                      <input
                        type="number"
                        name="value"
                        value={coupon.value}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="Enter value"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  {/* Min Cart Value */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Minimum Cart Value
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                        ₹
                      </div>
                      <input
                        type="number"
                        name="minCartValue"
                        value={coupon.minCartValue}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4">
                  <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Usage Settings</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Usage Limit */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Usage Limit
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="usageLimit"
                        value={coupon.usageLimit}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        placeholder="1"
                        min="1"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expiry Date */}
                  <div className="group">
                    <label className="block mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="expiresAt"
                        value={coupon.expiresAt}
                        onChange={handleChange}
                        className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3.5 text-gray-900 dark:text-white transition-all duration-200 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-5 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-2 border-blue-100 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <label htmlFor="isActive" className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                        Activate Coupon
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Make this coupon available for use immediately</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="isActive"
                      name="isActive"
                      checked={coupon.isActive}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-6 lg:px-12 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setCoupon(initialCoupon)}
                className="px-6 py-3 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                Reset Form
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Coupon...
                    </>
                  ) : (
                    <>
                      Create Coupon
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
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

export default AddCoupon;