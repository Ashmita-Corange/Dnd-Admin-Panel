import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchShipping } from "../../store/slices/shippingSlice";
import { useNavigate } from "react-router-dom";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { bulkImportPincodes } from "../../store/slices/shippingZone";

const BulkPincodeImport: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const shippingList = useSelector((state: RootState) => state.shipping.shippingList);

  const [shippingId, setShippingId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    dispatch(fetchShipping({}));
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingId) {
      setPopup({ isVisible: true, message: "Select a shipping method.", type: "error" });
      return;
    }
    if (!file) {
      setPopup({ isVisible: true, message: "Upload an Excel file.", type: "error" });
      return;
    }
    setLoading(true);
    try {
      // Use redux thunk for bulk import
      await dispatch(bulkImportPincodes({ shippingId, file })).unwrap();

      setPopup({
        isVisible: true,
        message: "Bulk import successful!",
        type: "success",
      });
      setTimeout(() => {
        navigate("/shipping/list");
      }, 1200);
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: err?.message || "Bulk import failed.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageMeta title="Bulk Pincode Import | TailAdmin" description="Bulk import pincodes for shipping zones" />
      <PageBreadcrumb pageTitle="Bulk Pincode Import" />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow">
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Shipping Method <span className="text-red-500">*</span>
          </label>
          <select
            value={shippingId}
            onChange={e => setShippingId(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            required
          >
            <option value="">Select a shipping method</option>
            {shippingList
              .filter(ship => ship.status === "active")
              .map(ship => (
                <option key={ship._id} value={ship._id}>
                  {ship.name} - {ship.carrier} ({ship.shippingMethod})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload Excel File <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Only .xlsx or .xls files are accepted.
          </p>
        </div>
        <button
          type="submit"
          className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Importing..." : "Import Pincodes"}
        </button>
      </form>
      <PopupAlert
        message={popup.message}
        type={popup.type}
        isVisible={popup.isVisible}
        onClose={() => setPopup({ ...popup, isVisible: false })}
      />
    </div>
  );
};

export default BulkPincodeImport;