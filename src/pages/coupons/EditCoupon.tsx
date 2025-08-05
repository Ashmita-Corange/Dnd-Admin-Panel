import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCoupon,
  getCouponById,
  updateCoupon,
} from "../../store/slices/coupon";
import { RootState, AppDispatch } from "../../store";
import PopupAlert from "../../components/popUpAlert";
import { Toaster } from "react-hot-toast";
import { useParams } from "react-router";

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

const EditCoupon: React.FC = () => {
  const [coupon, setCoupon] = useState(initialCoupon);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });
  const params = useParams();
  const couponId = params.id;

  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector((state: RootState) => state.coupon.loading);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
      setPopup({
        isVisible: true,
        message: "Coupon code is required.",
        type: "error",
      });
      return;
    }
    if (!coupon.expiresAt) {
      setPopup({
        isVisible: true,
        message: "Expiry date is required.",
        type: "error",
      });
      return;
    }
    try {
      await dispatch(updateCoupon({ id: couponId, data: coupon })).unwrap();
      setPopup({
        isVisible: true,
        message: "Coupon created successfully!",
        type: "success",
      });
      setCoupon(initialCoupon);
    } catch {
      setPopup({
        isVisible: true,
        message: "Failed to create coupon. Please try again.",
        type: "error",
      });
    }
  };

  useEffect(() => {
    // Fetch coupon details if editing an existing coupon
    const fetchCoupon = async () => {
      // Assuming you have a way to get the coupon ID from the URL or props
      const response = await dispatch(getCouponById(couponId));
      console.log("Fetched coupon details:", response);
      const data = response.payload.data;
      if (data) {
        setCoupon({
          code: data.code,
          type: data.type,
          value: data.value,
          isActive: data.isActive,
          expiresAt: data.expiresAt.split("T")[0], // Format date to YYYY-MM-DD
          usageLimit: data.usageLimit || 1,
          usedCount: data.usedCount || 0,
          minCartValue: data.minCartValue || 0,
        });
      } else {
        setPopup({
          isVisible: true,
          message: "Failed to load coupon details.",
          type: "error",
        });
      }
    };

    fetchCoupon();
  }, []);

  return (
    <div>
      <Toaster position="top-right" />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full ">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white/90">
            Edit Coupon
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Coupon Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Coupon Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={coupon.code}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter coupon code"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Type
                  </label>
                  <select
                    name="type"
                    value={coupon.type}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  >
                    <option value="percent">Percentage</option>
                    <option value="flat">Flat</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Value
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={coupon.value}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="Enter value"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Minimum Cart Value
                  </label>
                  <input
                    type="number"
                    name="minCartValue"
                    value={coupon.minCartValue}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={coupon.usageLimit}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    placeholder="1"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={coupon.expiresAt}
                    onChange={handleChange}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={coupon.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-900 dark:text-gray-300"
                >
                  Active
                </label>
              </div>
            </div>
            <div className="pt-6">
              <button
                type="submit"
                className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Updating Coupon..." : "Update Coupon"}
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

export default EditCoupon;
