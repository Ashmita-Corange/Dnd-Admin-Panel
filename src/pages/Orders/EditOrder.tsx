import { useEffect, useState } from "react";
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

  const getServices = async () => {
    try {
      const response = await axiosInstance.post("/orders/shipment", {
        orderId: orderId,
      });
      console.log("Shipping Services:", response.data);
      setAvailableServices(response.data.services || []);
    } catch (error) {
      console.error("Error fetching shipping services:", error);
    }
  };

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

  const getData = async () => {
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
  };

  const createShipment = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      const response = await axiosInstance.post("/orders/shipment/create", {
        orderId: orderId,
        courier: selectedMethod,
        serviceCode: selectedMethod,
      });
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
                    <p className="font-medium text-gray-800 dark:text-white">
                      {currentOrder?.shipping_details?.labelUrl ? (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Label
                          </p>
                          <a
                            target="_blank"
                            href={
                              image_url +
                              currentOrder?.shipping_details?.labelUrl
                            }
                            className="font-medium text-blue-500 underline cursor-pointer dark:text-white"
                          >
                            Download Label
                          </a>
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
