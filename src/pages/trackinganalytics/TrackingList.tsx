import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrackingEvents,
  TrackingEvent,
  selectTrackingState,
} from "../../store/slices/trackingSlice";
import type { AppDispatch, RootState } from "../../store";
import { Eye, X } from "lucide-react";
import { fetchProducts as fetchProductsAction, Product } from "../../store/slices/product";

// common tracking event types for dropdown
const EVENT_TYPES = [
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "ADD_TO_WISHLIST",
  // "REMOVE_FROM_WISHLIST",
  // "ORDER_PLACED",
  // "CHECKOUT_START",
  // "CHECKOUT_ABANDONED",
  // "SEARCH",
];

export default function TrackingList() {
  const dispatch = useDispatch<AppDispatch>();
  const { events, loading, error } = useSelector((state: RootState) =>
    selectTrackingState(state)
  );

  // load products from product slice
  const products = useSelector((state: RootState) => state.product?.products ?? []);
  const productsLoading = useSelector((state: RootState) => state.product?.loading ?? false);

  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(null);

  // filters state
  const [productId, setProductId] = useState<string | "">("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [since, setSince] = useState<string>(""); // ISO datetime string
  const [limit, setLimit] = useState<number>(200);

  // current applied filters (so refresh uses them)
  const [appliedFilters, setAppliedFilters] = useState<any>({ limit: 200 });

  useEffect(() => {
    // initial products load (fetch many to populate dropdown)
    dispatch(fetchProductsAction({ page: 1, limit: 1000 }));
    // initial events load with default limit
    dispatch(fetchTrackingEvents({ limit: 200 }));
    setAppliedFilters({ limit: 200 });
  }, [dispatch]);

  const onRefresh = () => {
    dispatch(fetchTrackingEvents(appliedFilters));
  };

  const applyFilters = () => {
    const p: any = { limit };
    if (productId) p.productId = productId;
    if (typeFilter) p.type = typeFilter;
    if (since) {
      // ensure ISO string — if user picks date only, append time
      const iso = new Date(since).toISOString();
      p.since = iso;
    }
    setAppliedFilters(p);
    dispatch(fetchTrackingEvents(p));
  };

  const eventsList = Array.isArray(events)
    ? events
    : events?.events
    ? events.events
    : [];

  const openDetailsModal = (event: TrackingEvent) => {
    setSelectedEvent(event);
  };

  const closeDetailsModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tracking Events</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors shadow-sm"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md"
              >
                <option value="">All products</option>
                {products?.map((p: Product) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md px-2 py-1"
              >
                <option value="">All types</option>
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* <div className="min-w-[220px]">
              <label className="block text-sm font-medium text-gray-700">Since (date/time)</label>
              <input
                type="datetime-local"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md px-2 py-1"
              />
            </div> */}

            <div className="min-w-[120px]">
              <label className="block text-sm font-medium text-gray-700">Limit</label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md px-2 py-1"
                min={1}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setProductId("");
                  setTypeFilter("");
                  setSince("");
                  setLimit(200);
                  setAppliedFilters({ limit: 200 });
                  dispatch(fetchTrackingEvents({ limit: 200 }));
                }}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            Error: {String(error)}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Guest ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && eventsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Loading events...
                    </td>
                  </tr>
                ) : eventsList.length > 0 ? (
                  eventsList.map((ev: TrackingEvent) => {
                    const user =
                      ev?.user?.name ||
                      ev?.userInfo?.name ||
                      (typeof ev?.user === "string" ? ev.user : null) ||
                      (ev?.user && ev.user._id ? ev.user._id : null) ||
                      "guest";
                    const email = ev?.user?.email || ev?.userInfo?.email || null;
                    const ts = ev?.timestamp
                      ? new Date(ev.timestamp).toLocaleString()
                      : "-";

                    return (
                      <tr key={ev._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {ev._id?.slice?.(0, 8) ?? ev._id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {ev.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{user}</span>
                            {email && (
                              <span className="text-xs text-gray-500">{email}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {ev.guestId ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ev.product?.name ?? ev.productId ?? "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {ts}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => openDetailsModal(ev)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No events found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {eventsList.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {eventsList.length} events
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-transparent backfrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Event ID</p>
                      <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent._id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Type</p>
                      <p className="text-sm text-gray-900 mt-1">
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {selectedEvent.type}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Timestamp</p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedEvent.timestamp ? new Date(selectedEvent.timestamp).toLocaleString() : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">Guest ID</p>
                      <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent.guestId || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                {(selectedEvent.user || selectedEvent.userInfo) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">User Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 font-medium">
                        Name: {selectedEvent.user?.name || selectedEvent.userInfo?.name}
                      </p>
                                            <p className="text-sm text-gray-900 font-medium">
                        Email: {selectedEvent.user?.email || selectedEvent.userInfo?.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Product Information */}
                {selectedEvent.product && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Information</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Product Name</p>
                        <p className="text-sm text-gray-900 mt-1">{selectedEvent.product.name || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Slug</p>
                        <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent.product.slug || "-"}</p>
                      </div>
                      {selectedEvent.productId && (
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-gray-500 uppercase">Product ID</p>
                          <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent.productId}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cart Information (for checkout events) */}
                {selectedEvent.cart && Array.isArray(selectedEvent.cart) && selectedEvent.cart.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cart Items</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      {selectedEvent.cart.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-500">Product:</span>
                              <span className="text-gray-900 ml-2 font-mono">{item.product}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <span className="text-gray-900 ml-2">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Price:</span>
                              <span className="text-gray-900 ml-2">₹{item.price}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Variant:</span>
                              <span className="text-gray-900 ml-2 font-mono">{item.variant}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Addresses */}
                {selectedEvent.addresses && selectedEvent.addresses.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Addresses</h3>
                    <div className="space-y-3">
                      {selectedEvent.addresses.map((addr, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded">
                              {addr.title || "Address"}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="col-span-2">
                              <p className="text-gray-900 font-medium">
                                {addr.address.firstName} {addr.address.lastName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Email</p>
                              <p className="text-gray-900">{addr.address.email}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Phone</p>
                              <p className="text-gray-900">{addr.address.phone}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-gray-500 text-xs">Address</p>
                              <p className="text-gray-900">
                                {addr.address.line1}
                                {addr.address.line2 && `, ${addr.address.line2}`}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">City / State</p>
                              <p className="text-gray-900">{addr.address.city}, {addr.address.state}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs">Pincode</p>
                              <p className="text-gray-900">{addr.address.pincode}</p>
                            </div>
                            {addr.address.landmark && (
                              <div className="col-span-2">
                                <p className="text-gray-500 text-xs">Landmark</p>
                                <p className="text-gray-900">{addr.address.landmark}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Fields */}
                {(selectedEvent.userId || selectedEvent.variantId || selectedEvent.quantity) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      {selectedEvent.userId && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">User ID</p>
                          <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent.userId}</p>
                        </div>
                      )}
                      {selectedEvent.variantId && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Variant ID</p>
                          <p className="text-sm text-gray-900 font-mono mt-1">{selectedEvent.variantId}</p>
                        </div>
                      )}
                      {selectedEvent.quantity && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Quantity</p>
                          <p className="text-sm text-gray-900 mt-1">{selectedEvent.quantity}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={closeDetailsModal}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}