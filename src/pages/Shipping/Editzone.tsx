import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchShippingZones,
  updateShippingZone,
} from "../../store/slices/shippingZone";
import { fetchShipping } from "../../store/slices/shippingSlice";
import toast, { Toaster } from "react-hot-toast";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { Plus, Minus, ArrowLeft } from "lucide-react";

const EditZone: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { zoneList, loading, error } = useSelector(
    (state: RootState) => state.shippingZone
  );
  const shippingList = useSelector(
    (state: RootState) => state.shipping.shippingList
  );

  const [shippingZone, setShippingZone] = useState({
    shippingId: "",
    postalCodes: [{ code: "", price: 0 }],
    isActive: true,
  });

  const [originalZone, setOriginalZone] = useState<any>(null);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  // Fetch zone and shipping list on mount
  useEffect(() => {
    dispatch(fetchShippingZones({}));
    dispatch(fetchShipping({}));
  }, [dispatch]);

  // Populate form when zoneList is loaded
  useEffect(() => {
    if (zoneList.length && id) {
      const zone = zoneList.find((z) => z._id === id);
      if (zone) {
        const zoneData = {
          shippingId:
            typeof zone.shippingId === "string"
              ? zone.shippingId
              : zone.shippingId?._id || "",
          postalCodes: zone.postalCodes.map((pc) => ({
            code: pc.code,
            price: pc.price,
          })),
          isActive: zone.isActive !== undefined ? zone.isActive : true,
        };
        setShippingZone(zoneData);
        setOriginalZone(zone);
      }
    }
  }, [zoneList, id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setShippingZone({ ...shippingZone, [name]: checked });
    } else {
      setShippingZone({ ...shippingZone, [name]: value });
    }
  };

  const handlePostalCodeChange = (index: number, field: string, value: string | number) => {
    const updatedPostalCodes = [...shippingZone.postalCodes];
    (updatedPostalCodes[index] as any)[field] = field === "price" ? Number(value) : value;
    setShippingZone({ ...shippingZone, postalCodes: updatedPostalCodes });
  };

  const addPostalCode = () => {
    setShippingZone({
      ...shippingZone,
      postalCodes: [...shippingZone.postalCodes, { code: "", price: 0 }],
    });
  };

  const removePostalCode = (index: number) => {
    if (shippingZone.postalCodes.length > 1) {
      const updatedPostalCodes = shippingZone.postalCodes.filter((_, i) => i !== index);
      setShippingZone({ ...shippingZone, postalCodes: updatedPostalCodes });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!shippingZone.shippingId.trim()) {
      toast.error("Please select a shipping method.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    const validPostalCodes = shippingZone.postalCodes.filter(
      (pc) => pc.code.trim() !== "" && pc.price >= 0
    );

    if (validPostalCodes.length === 0) {
      toast.error("Please add at least one valid postal code with price.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    // Check for duplicate postal codes
    const codes = validPostalCodes.map(pc => pc.code.trim().toLowerCase());
    const uniqueCodes = new Set(codes);
    if (codes.length !== uniqueCodes.size) {
      toast.error("Duplicate postal codes are not allowed.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    // Clean up data before submission
    const zoneData = {
      id: id!,
      shippingId: shippingZone.shippingId,
      postalCodes: validPostalCodes.map(pc => ({
        code: pc.code.trim().toUpperCase(),
        price: pc.price,
      })),
      isActive: shippingZone.isActive,
    };

    try {
      await dispatch(updateShippingZone(zoneData)).unwrap();

      setPopup({
        isVisible: true,
        message: "Shipping zone updated successfully!",
        type: "success",
      });

      setTimeout(() => {
        navigate("/shipping/zone/list");
      }, 1500);
    } catch (err: any) {
      console.error("Error updating shipping zone:", err);
      setPopup({
        isVisible: true,
        message: err?.message || "Failed to update shipping zone. Please try again.",
        type: "error",
      });
    }
  };

  // Get selected shipping method details
  const selectedShipping = shippingList.find(ship => ship._id === shippingZone.shippingId);

  if (!originalZone && zoneList.length > 0 && id) {
    const zone = zoneList.find((z) => z._id === id);
    if (!zone) {
      return (
        <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">Shipping zone not found.</p>
            <button
              onClick={() => navigate("/shipping/zone/list")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Back to Zone List
            </button>
          </div>
        </div>
      );
    }
  }

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Shipping Zone | TailAdmin"
        description="Edit shipping zone for TailAdmin"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/shipping/zone/list")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Zones
            </button>
          </div>
          
          <PageBreadcrumb pageTitle="Edit Shipping Zone" />
          
          {originalZone && (
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Current Zone Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div>
                  <span className="font-medium">Original Method:</span> {originalZone.shippingId?.name || "N/A"}
                </div>
                <div>
                  <span className="font-medium">Postal Codes:</span> {originalZone.postalCodes?.length || 0}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Zone Information
              </h3>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Shipping Method <span className="text-red-500">*</span>
                </label>
                <select
                  name="shippingId"
                  value={shippingZone.shippingId}
                  onChange={handleChange}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  required
                >
                  <option value="">Select a shipping method</option>
                  {shippingList
                    .filter(ship => ship.status === "active")
                    .map((ship) => (
                      <option key={ship._id} value={ship._id}>
                        {ship.name} - {ship.carrier} ({ship.shippingMethod})
                      </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Choose the shipping method for which you want to update zones
                </p>
              </div>

              {/* Display selected shipping details */}
              {selectedShipping && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Selected Shipping Method Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                    <div>
                      <span className="font-medium">Name:</span> {selectedShipping.name}
                    </div>
                    <div>
                      <span className="font-medium">Carrier:</span> {selectedShipping.carrier}
                    </div>
                    <div>
                      <span className="font-medium">Method:</span> {selectedShipping.shippingMethod}
                    </div>
                    <div>
                      <span className="font-medium">Base Cost:</span> ₹{selectedShipping.cost}
                    </div>
                    <div>
                      <span className="font-medium">Delivery:</span> {selectedShipping.estimatedDeliveryDays?.min} - {selectedShipping.estimatedDeliveryDays?.max} days
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 ${selectedShipping.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedShipping.status}
                      </span>
                    </div>
                  </div>
                  {selectedShipping.description && (
                    <div className="mt-2">
                      <span className="font-medium">Description:</span> {selectedShipping.description}
                    </div>
                  )}
                </div>
              )}

             
            </div>

            {/* Postal Codes Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Postal Codes & Pricing
                </h3>
                <button
                  type="button"
                  onClick={addPostalCode}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Postal Code
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update specific postal codes and their corresponding shipping prices for this zone. 
                These prices will override the base shipping cost for orders to these postal codes.
              </p>

              <div className="space-y-4">
                {shippingZone.postalCodes.map((postalCode, index) => (
                  <div
                    key={index}
                    className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">
                        Postal Code {index + 1}
                      </h4>
                      {shippingZone.postalCodes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePostalCode(index)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition duration-200"
                        >
                          <Minus className="w-3 h-3" />
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={postalCode.code}
                          onChange={(e) =>
                            handlePostalCodeChange(index, "code", e.target.value)
                          }
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          placeholder="e.g., 395006, 400001"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter the postal/PIN code for this area
                        </p>
                      </div>

                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          Shipping Price (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={postalCode.price}
                          onChange={(e) =>
                            handlePostalCodeChange(index, "price", e.target.value)
                          }
                          min="0"
                          step="0.01"
                          className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                          placeholder="0.00"
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Shipping cost specific to this postal code
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

            {/* Zone Summary Section */}
            {shippingZone.shippingId && shippingZone.postalCodes.some(pc => pc.code.trim()) && (
              <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  Updated Zone Summary
                </h3>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Shipping Method:
                      </span>
                      <p className="text-gray-800 dark:text-white">
                        {selectedShipping?.name || "Not selected"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Carrier:
                      </span>
                      <p className="text-gray-800 dark:text-white">
                        {selectedShipping?.carrier || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Base Cost:
                      </span>
                      <p className="text-gray-800 dark:text-white">
                        ₹{selectedShipping?.cost || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total Postal Codes:
                      </span>
                      <p className="text-gray-800 dark:text-white">
                        {shippingZone.postalCodes.filter(pc => pc.code.trim()).length}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Zone Status:
                      </span>
                      <p className={`${shippingZone.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {shippingZone.isActive ? 'Active' : 'Inactive'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Updated Postal Code Pricing:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {shippingZone.postalCodes
                        .filter(pc => pc.code.trim())
                        .map((pc, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {pc.code} → ₹{pc.price}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Zone Status Section */}
            <div className="space-y-6 border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Zone Status
              </h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={shippingZone.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Zone is Active
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Inactive zones will not be used for shipping calculations and postal code matching
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  className="flex-1 sm:flex-none rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Zone...
                    </div>
                  ) : (
                    "Update Shipping Zone"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/shipping/zone/list")}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-200"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (originalZone) {
                      setShippingZone({
                        shippingId:
                          typeof originalZone.shippingId === "string"
                            ? originalZone.shippingId
                            : originalZone.shippingId?._id || "",
                        postalCodes: originalZone.postalCodes.map((pc: any) => ({
                          code: pc.code,
                          price: pc.price,
                        })),
                        isActive: originalZone.isActive !== undefined ? originalZone.isActive : true,
                      });
                      toast.success("Form reset to original values", {
                        duration: 3000,
                        position: "top-right",
                      });
                    }
                  }}
                  className="px-6 py-3 border border-orange-300 dark:border-orange-600 text-orange-700 dark:text-orange-300 rounded hover:bg-orange-50 dark:hover:bg-orange-900/20 transition duration-200"
                >
                  Reset to Original
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
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

export default EditZone;