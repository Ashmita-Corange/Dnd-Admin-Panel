import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import toast, { Toaster } from "react-hot-toast";
import { AppDispatch, RootState } from "../../store";
import { fetchOrderById, updateOrderDelivery } from "../../store/slices/Orders";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PopupAlert from "../../components/popUpAlert";
import { useParams } from "react-router";
import { DELIVERY_OPTIONS, ORDER_STATUS_OPTIONS } from "../../types/order";
import axiosInstance from "../../services/axiosConfig";

const image_url = import.meta.env.VITE_IMAGE_URL;

export default function EditOrder() {
  const [deliveryOption, setDeliveryOption] = useState("");
  const [labelLoading, setLabelLoading] = useState(false);
  const [awbLoading, setAwbLoading] = useState(false);

  const [orderStatus, setOrderStatus] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("DTDC");
  const [selectedService, setSelectedService] = useState("");
  const [selectedLabelCode, setSelectedLabelCode] = useState("SHIP_LABEL_POD");
  const [availableServices, setAvailableServices] = useState([]);
  const [popup, setPopup] = useState({
    isVisible: false,
    message: "",
    type: "",
  });

  const deleiveryOptions = ["DTDC", "DELHIVERY", "BLUEDART"];

  const params = useParams();
  const orderId = params.id || "";

  const dispatch = useDispatch<AppDispatch>();
  const { currentOrder, loading } = useSelector(
    (state: RootState) => state.orders
  );

  const getServices = useCallback(async () => {
    try {
      const response = await axiosInstance.post("/orders/shipment", {
        orderId: orderId,
      });
      console.log("Shipping Services:", response.data);
      setAvailableServices(response.data.services || []);
    } catch (error) {
      console.error("Error fetching shipping services:", error);
    }
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOption && !orderStatus) {
      toast.error("Please select at least one option to update.", {
        duration: 8000,
        position: "top-right",
      });
      return;
    }

    try {
      await dispatch(
        updateOrderDelivery({
          id: orderId,
          deliveryOption: deliveryOption || currentOrder?.deliveryOption || "",
          status: orderStatus || currentOrder?.status || "",
        })
      ).unwrap();

      setPopup({
        isVisible: true,
        message: "Order updated successfully!",
        type: "success",
      });
    } catch (err: any) {
      setPopup({
        isVisible: true,
        message: "Failed to update Order. Please try again.",
        type: "error",
      });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getData = useCallback(async () => {
    try {
      await dispatch(fetchOrderById(orderId)).unwrap();
    } catch (error) {
      console.error("Error fetching order data:", error);
      setPopup({
        isVisible: true,
        message: "Failed to fetch order data.",
        type: "error",
      });
    }
  }, [dispatch, orderId]);

  const createShipment = async (e: React.FormEvent) => {
    try {
      e.preventDefault();

      // If courier is BLUEDART, pass static values as requested
      const isBluedart = String(selectedMethod).toUpperCase() === "BLUEDART";

      const payload: Record<string, unknown> = {
        orderId: orderId,
        courier: isBluedart ? "BLUEDART" : selectedMethod,
        // For Bluedart we send serviceCode: 'D' statically, otherwise use selectedService
        serviceCode: isBluedart ? "D" : selectedService,
      };

      const response = await axiosInstance.post(
        "/orders/shipment/create",
        payload
      );
      console.log("shipping response ===>", response.data);
      window.location.reload();
    } catch (error) {
      console.error("Error creating shipment:", error);
      setPopup({
        isVisible: true,
        message: "Failed to create shipment.",
        type: "error",
      });
    }
  };

  const GenerateLabel = async () => {
    try {
      setLabelLoading(true);
      const response = await axiosInstance.post("/orders/shipment/label", {
        orderId: orderId,
        courier: selectedMethod,
        labelCode: selectedLabelCode,
      });
      console.log("label generating response ===>", response.data);
      setLabelLoading(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating shipment:", error);
      setLabelLoading(false);
      setPopup({
        isVisible: true,
        message: "Failed to create shipment.",
        type: "error",
      });
    }
  };

  const openAwbPdf = async () => {
    try {
      setAwbLoading(true);

      const awbContentRaw =
        currentOrder?.shipping_details?.raw_response?.GenerateWayBillResult
          ?.AWBPrintContent;

      if (!awbContentRaw) {
        setPopup({
          isVisible: true,
          message: "AWB content not available.",
          type: "error",
        });
        setAwbLoading(false);
        return;
      }

      const toUint8ArrayFromBase64 = (b64: string) => {
        const binary = atob(b64);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      };

      const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 20000);
      };

      // 1) If AWBPrintContent is an array of numeric bytes: [12,120,...]
      if (Array.isArray(awbContentRaw)) {
        // Try to interpret as numeric bytes first
        const nums = awbContentRaw.map((v: any) =>
          typeof v === "number" ? v : parseInt(String(v).trim(), 10)
        );
        const allNums = nums.every(
          (n: any) => Number.isFinite(n) && n >= 0 && n <= 255
        );

        if (allNums && nums.length > 0) {
          const bytes = new Uint8Array(nums as number[]);
          const blob = new Blob([bytes], { type: "application/pdf" });
          downloadBlob(blob, "awb.pdf");
          setAwbLoading(false);
          return;
        }

        // If not numeric bytes, maybe it's array of base64 chunks or strings -> join and handle below
        const joined = awbContentRaw.join("");
        // continue with joined string handling
        (awbContentRaw as unknown) = joined;
      }

      // Ensure content is a string from here
      const content =
        typeof awbContentRaw === "string"
          ? awbContentRaw
          : String(awbContentRaw);

      const trimNoSpace = (s: string) => s.replace(/\s+/g, "");
      const cTrim = trimNoSpace(content);

      // 2) If data URI like data:application/pdf;base64,...
      if (content.startsWith("data:application/pdf;base64,")) {
        const b64 = content.split(",")[1];
        const blob = new Blob([toUint8ArrayFromBase64(b64)], {
          type: "application/pdf",
        });
        downloadBlob(blob, "awb.pdf");
        setAwbLoading(false);
        return;
      }

      // 3) If pure base64 PDF (starts with JVBER, possibly with whitespace)
      if (/^JVBER/i.test(cTrim)) {
        const bytes = toUint8ArrayFromBase64(cTrim);
        const blob = new Blob([bytes], { type: "application/pdf" });
        downloadBlob(blob, "awb.pdf");
        setAwbLoading(false);
        return;
      }

      // 4) If content is a sequence of numbers in text (e.g. "12 120 37 ..."), parse them to bytes
      if (/^[\s\d,;]+$/.test(content)) {
        const parts = content.split(/[^0-9]+/).filter(Boolean);
        const nums = parts.map((p) => parseInt(p, 10));
        const allNums = nums.every(
          (n) => Number.isFinite(n) && n >= 0 && n <= 255
        );
        if (allNums && nums.length > 0) {
          const bytes = new Uint8Array(nums);
          const blob = new Blob([bytes], { type: "application/pdf" });
          downloadBlob(blob, "awb.pdf");
          setAwbLoading(false);
          return;
        }
      }

      // 5) If looks like HTML content, wrap and download as HTML
      if (/<\/?html|<\/?body/i.test(content)) {
        const fullHtml = `<!doctype html><html><head><meta charset="utf-8"><title>AWB</title><meta name="viewport" content="width=device-width,initial-scale=1" /></head><body>${content}</body></html>`;
        const blob = new Blob([fullHtml], { type: "text/html" });
        downloadBlob(blob, "awb.html");
        setAwbLoading(false);
        return;
      }

      // 6) Fallback: try treating content as base64 (even if it doesn't start with JVBER)
      try {
        // Remove whitespace/newlines
        const maybeB64 = content.replace(/\s+/g, "");
        // quick validation: length multiple of 4 and only base64 chars
        if (/^[A-Za-z0-9+/=]+$/.test(maybeB64) && maybeB64.length % 4 === 0) {
          const bytes = toUint8ArrayFromBase64(maybeB64);
          // Heuristic: check PDF header bytes (%PDF => 0x25 0x50 0x44 0x46)
          if (
            bytes[0] === 0x25 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x44 &&
            bytes[3] === 0x46
          ) {
            const blob = new Blob([bytes], { type: "application/pdf" });
            downloadBlob(blob, "awb.pdf");
            setAwbLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore and fallback below
      }

      // Final fallback: download as plain text
      const blob = new Blob([content], { type: "text/plain" });
      downloadBlob(blob, "awb.txt");
      setAwbLoading(false);
    } catch (err) {
      console.error("Error downloading AWB:", err);
      setPopup({
        isVisible: true,
        message: "Failed to download AWB content.",
        type: "error",
      });
      setAwbLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      getData();
      getServices();
    }
  }, [orderId]);

  useEffect(() => {
    if (currentOrder) {
      setDeliveryOption(currentOrder.deliveryOption);
      setOrderStatus(currentOrder.status);
    }
  }, [currentOrder]);

  const shippingPlatform = currentOrder?.shipping_details?.platform
    ? String(currentOrder?.shipping_details?.platform).toUpperCase()
    : "";

  return (
    <div>
      <Toaster position="top-right" />
      <PageMeta
        title="Edit Order | TailAdmin"
        description="Edit order details and shipping method"
      />
      <div className="h-fit rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          <PageBreadcrumb pageTitle="Edit Order" />

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
          ) : currentOrder ? (
            <div className="space-y-8">
              {/* Order Overview */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Order Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order ID
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {currentOrder?._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Status
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        currentOrder.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : currentOrder.status === "confirmed"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : currentOrder.status === "processing"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          : currentOrder.status === "shipped"
                          ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                          : currentOrder.status === "delivered"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {currentOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total Amount
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      ₹{currentOrder.total.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed On
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {formatDate(currentOrder.createdAt)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Order track number
                    </p>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {currentOrder?.shipping_details?.reference_number ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    {currentOrder?.shipping_details?.reference_number && (
                      <p className="font-medium text-gray-800 dark:text-white">
                        {currentOrder?.shipping_details?.labelUrl ? (
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Label
                            </p>
                            <a
                              target="_blank"
                              rel="noreferrer"
                              href={
                                image_url +
                                currentOrder?.shipping_details?.labelUrl
                              }
                              className="font-medium text-blue-500 underline cursor-pointer dark:text-white"
                            >
                              Download Label
                            </a>
                          </div>
                        ) : String(
                            currentOrder?.shipping_details?.platform
                          ).toUpperCase() === "BLUEDART" ? (
                          <div className="mt-2 flex items-center gap-3">
                            {currentOrder?.shipping_details?.raw_response
                              ?.GenerateWayBillResult?.AWBPrintContent ? (
                              <>
                                <button
                                  onClick={openAwbPdf}
                                  className="px-4 py-1 w-fit bg-blue-500 text-white rounded-full text-sm"
                                >
                                  {awbLoading ? "Opening..." : "Open AWB"}
                                </button>
                              </>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                AWB not available
                              </p>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="mt-2 flex items-center gap-3">
                              <select
                                value={selectedLabelCode}
                                onChange={(e) =>
                                  setSelectedLabelCode(e.target.value)
                                }
                                className="rounded border border-gray-300 px-3 py-2 bg-white text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                              >
                                <option value="">Select </option>
                                <option value="SHIP_LABEL_A4">
                                  Shipping Label A4
                                </option>
                                <option value="SHIP_LABEL_A6">
                                  Shipping Label A6
                                </option>
                                <option value="SHIP_LABEL_POD">
                                  Shipping Label POD
                                </option>
                                <option value="SHIP_LABEL_4X6">
                                  Shipping Label 4x6
                                </option>
                                <option value="ROUTE_LABEL_A4">
                                  Routing Label A4
                                </option>
                                <option value="ROUTE_LABEL_4X4">
                                  Routing Label 4x4
                                </option>
                              </select>

                              {labelLoading ? (
                                <div className="px-4 py-1 w-fit bg-blue-500 opacity-60 text-white rounded-full text-sm">
                                  Generating...
                                </div>
                              ) : (
                                <button
                                  onClick={GenerateLabel}
                                  className="px-4 py-1 w-fit bg-blue-500 text-white rounded-full text-sm"
                                >
                                  Generate Label
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Order Items
                </h3>
                <div className="space-y-4">
                  {currentOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex  gap-4  p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <img
                        src={
                          image_url +
                          (item?.product?.thumbnail?.url ||
                            item?.product?.images[0]?.url)
                        }
                        alt={item?.product?.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex flex-1 justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            Product ID: {item?.product?._id}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Variant ID: {item?.variant?._id}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Quantity: {item?.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            per item
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Subtotal:
                      </span>
                      <span className="text-gray-800 dark:text-white">
                        ₹
                        {(
                          currentOrder.total + (currentOrder.discount || 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                    {currentOrder.discount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Discount:
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          -₹{currentOrder.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-800 dark:text-white">
                        Total:
                      </span>
                      <span className="text-gray-800 dark:text-white">
                        ₹{currentOrder.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Shipping Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {currentOrder.shippingAddress.fullName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.shippingAddress.addressLine1}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.shippingAddress.city},{" "}
                      {currentOrder.shippingAddress.state}{" "}
                      {currentOrder.shippingAddress.postalCode}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.shippingAddress.country}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Phone: {currentOrder.shippingAddress.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Billing Address
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-800 dark:text-white">
                      {currentOrder.billingAddress.fullName}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.billingAddress.addressLine1}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.billingAddress.city},{" "}
                      {currentOrder.billingAddress.state}{" "}
                      {currentOrder.billingAddress.postalCode}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {currentOrder.billingAddress.country}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      Phone: {currentOrder.billingAddress.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form
                onSubmit={createShipment}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Update Order
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Shipping method
                    </label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    >
                      <option value="">Select Method</option>
                      {deleiveryOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Only show service dropdown when courier is not BLUEDART */}
                  {String(selectedMethod).toUpperCase() !== "BLUEDART" && (
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Service
                      </label>
                      <select
                        value={selectedService}
                        onChange={(e) => setSelectedService(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                      >
                        {availableServices
                          .filter((option) => option.courier === selectedMethod)
                          .map((option) => (
                            <option key={option.code} value={option.code}>
                              {option.code} - {option.name}
                            </option>
                          ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {
                          DELIVERY_OPTIONS.find(
                            (opt) => opt.value === deliveryOption
                          )?.description
                        }
                      </p>
                    </div>
                  )}
                </div>

                {currentOrder.status === "pending" && (
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="rounded bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? "Updating Order..." : "Update Order"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Order not found
              </p>
            </div>
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
