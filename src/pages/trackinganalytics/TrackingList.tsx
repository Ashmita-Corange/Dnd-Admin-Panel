import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTrackingEvents,
  TrackingEvent,
  selectTrackingState,
} from "../../store/slices/trackingSlice";
import type { AppDispatch, RootState } from "../../store";
import { Eye, X } from "lucide-react";
import {
  fetchProducts as fetchProductsAction,
  Product,
} from "../../store/slices/product";

const EVENT_TYPES = [
  "PRODUCT_VIEW",
  "ADD_TO_CART",
  "ADD_TO_WISHLIST",
  "REMOVE_FROM_WISHLIST",
  "CHECKOUT_START",

  "CHECKOUT_ABANDONED",
  "PAGE_VIEW",
  "LOGIN",
  "SIGNUP",
];

export default function TrackingList() {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) =>
    selectTrackingState(state)
  );

  // Load products from product slice
  const products = useSelector(
    (state: RootState) => state.product?.products ?? []
  );

  const [selectedEvent, setSelectedEvent] = useState<TrackingEvent | null>(
    null
  );

  // Filters state
  const [productId, setProductId] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [from, setFrom] = useState<string>(""); // date-only string
  const [to, setTo] = useState<string>(""); // date-only string
  const [limit, setLimit] = useState<number>(200);

  // Current applied filters
  const [appliedFilters, setAppliedFilters] = useState<any>({ limit: 200 });

  useEffect(() => {
    dispatch(fetchProductsAction({ page: 1, limit: 1000 }));
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
    if (from) p.from = from;
    if (to) p.to = to;
    setAppliedFilters(p);
    dispatch(fetchTrackingEvents(p));
  };

  const count = data ?? 0;

  // Extract events array from data
  const eventsList = data?.events ?? [];

  // Calculate metrics from eventTotals
  const eventTotals = data?.eventTotals ?? {};

  // Sum up all variations of the same event type
  const productViews = (eventTotals.PRODUCT_VIEW   ?? 0);
  const addToCart = (eventTotals.ADD_TO_CART  ?? 0);
  const checkoutStart = (eventTotals.CHECKOUT_STARTED ?? 0);
  const pageViews = (eventTotals.PAGE_VIEW  ?? 0);
  const addToWishlist = (count?.currentWishlisted ?? 0);
  const checkoutAbandoned = (eventTotals.CHECKOUT_ABANDONED ?? 0);
  const logins = (eventTotals.LOGIN ?? 0);
  
  // Calculate total events
  const totalEvents = Object.values(eventTotals).reduce(
    (sum, val) => sum + (val ?? 0),
    0
  );

  // Calculate unique users/guests
  const usersSet = new Set<string>();
  eventsList.forEach((ev) => {
    if (typeof ev.user === "string") usersSet.add(ev.user);
    else if (ev.user && (ev.user as any)._id)
      usersSet.add((ev.user as any)._id);
    else if (ev.userInfo && ev.userInfo.email) usersSet.add(ev.userInfo.email);
    else if (ev.guestId) usersSet.add(ev.guestId);
  });
  const uniqueUsers = usersSet.size;

  const openDetailsModal = (event: TrackingEvent) => {
    setSelectedEvent(event);
  };

  const closeDetailsModal = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="max-w-7xl  mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Tracking Events Dashboard
          </h1>
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

        {/* Summary Cards */}
        <div className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
              <span className="text-sm font-medium opacity-90">
                Total Events
              </span>
              <span className="text-4xl font-bold block mt-2">
                {totalEvents.toLocaleString()}
              </span>
              <span className="text-xs opacity-75 mt-1 block">
                All tracked user interactions
              </span>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 rounded-lg shadow-lg text-white">
              <span className="text-sm font-medium opacity-90">Page Views</span>
              <span className="text-4xl font-bold block mt-2">
                {pageViews.toLocaleString()}
              </span>
              <span className="text-xs opacity-75 mt-1 block">
                Total website page visits
              </span>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
              <span className="text-sm font-medium opacity-90">
                Product Views
              </span>
              <span className="text-4xl font-bold block mt-2">
                {productViews.toLocaleString()}
              </span>
              <span className="text-xs opacity-75 mt-1 block">
                Products viewed by customers
              </span>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-lg shadow-lg text-white">
              <span className="text-sm font-medium opacity-90">
                Add to Cart
              </span>
              <span className="text-4xl font-bold block mt-2">
                {addToCart.toLocaleString()}
              </span>
              <span className="text-xs opacity-75 mt-1 block">
                Items added to shopping cart
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Checkout Started
              </span>
              <span className="text-2xl font-bold text-gray-900 block mt-2">
                {checkoutStart}
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                Users who began checkout
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Checkout Abandoned
              </span>
              <span className="text-2xl font-bold text-gray-900 block mt-2">
                {checkoutAbandoned}
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                Incomplete checkout sessions
              </span>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-pink-500">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Wishlist Adds
              </span>
              <span className="text-2xl font-bold text-gray-900 block mt-2">
                {addToWishlist}
              </span>
              <span className="text-xs opacity-75 mt-1 block">
                Items saved for later
              </span>
            </div>

            <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
              <span className="text-xs text-gray-500 uppercase font-semibold">
                Logins
              </span>
              <span className="text-2xl font-bold text-gray-900 block mt-2">
                {logins}
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                User authentication events
              </span>
            </div>
          </div>
        </div>

        {/* Conversion Metrics */}
        {/* {productViews > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow">
                <span className="text-xs text-gray-500 uppercase font-semibold">View to Cart Rate</span>
                <span className="text-2xl font-bold text-blue-600 block mt-2">
                  {((addToCart / productViews) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <span className="text-xs text-gray-500 uppercase font-semibold">Cart to Checkout Rate</span>
                <span className="text-2xl font-bold text-green-600 block mt-2">
                  {addToCart > 0 ? ((checkoutStart / addToCart) * 100).toFixed(1) : 0}%
                </span>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <span className="text-xs text-gray-500 uppercase font-semibold">Abandonment Rate</span>
                <span className="text-2xl font-bold text-red-600 block mt-2">
                  {checkoutStart > 0 ? ((checkoutAbandoned / checkoutStart) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        )} */}

        {/* Filters */}
        <div className="mb-6 max-w-6xl bg-white p-4 rounded shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Product filter */}
            <div className="flex-1 min-w-[180px]">
              <label className="block text-sm font-medium text-gray-700">
                Product
              </label>
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

            {/* Type filter */}
            <div className="min-w-[140px]">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
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

            {/* Limit filter */}
            <div className="min-w-[100px]">
              <label className="block text-sm font-medium text-gray-700">
                Limit
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="mt-1 block w-full border-gray-300 rounded-md px-2 py-1"
                min={1}
              />
            </div>

            {/* Date pickers section - right side */}
            <div className="flex flex-col gap-2 min-w-[220px] items-end ml-auto">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <div className="flex gap-2 bg-gray-100 rounded px-2 py-2">
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="border-gray-300 rounded px-2 py-1 w-[120px] bg-white"
                  placeholder="From"
                />
                <span className="px-2 py-1 text-gray-500">to</span>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="border-gray-300 rounded px-2 py-1 w-[120px] bg-white"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Action buttons */}
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
                  setFrom("");
                  setTo("");
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

        <div className="bg-white max-w-6xl rounded-lg shadow overflow-hidden">
          <div className="overflow-x-scroll w-full">
            <table className="min-w-full overflow-x-scroll  divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Guest ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading && eventsList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
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
                    const email =
                      ev?.user?.email || ev?.userInfo?.email || null;
                    const ts = ev?.timestamp
                      ? new Date(ev.timestamp).toLocaleString()
                      : "-";

                    return (
                      <tr
                        key={ev._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
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
                            <span className="text-sm font-medium text-gray-900">
                              {user}
                            </span>
                            {email && (
                              <span className="text-xs text-gray-500">
                                {email}
                              </span>
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
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-gray-500"
                    >
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
                Showing {eventsList.length} events of {totalEvents} total
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-xs bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-900">
                Event Details
              </h2>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Event ID
                      </p>
                      <p className="text-sm text-gray-900 font-mono mt-1">
                        {selectedEvent._id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Type
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        <span className="px-3 py-1 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {selectedEvent.type}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Timestamp
                      </p>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedEvent.timestamp
                          ? new Date(selectedEvent.timestamp).toLocaleString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase">
                        Guest ID
                      </p>
                      <p className="text-sm text-gray-900 font-mono mt-1">
                        {selectedEvent.guestId || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                {(selectedEvent.user || selectedEvent.userInfo) && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      User Information
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-900 font-medium">
                        Name:{" "}
                        {selectedEvent.user?.name ||
                          selectedEvent.userInfo?.name}
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        Email:{" "}
                        {selectedEvent.user?.email ||
                          selectedEvent.userInfo?.email}
                      </p>
                    </div>
                  </div>
                )}

                {/* Product Information */}
                {selectedEvent.product && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Product Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Product Name
                        </p>
                        <p className="text-sm text-gray-900 mt-1">
                          {selectedEvent.product.name || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          Slug
                        </p>
                        <p className="text-sm text-gray-900 font-mono mt-1">
                          {selectedEvent.product.slug || "-"}
                        </p>
                      </div>
                      {selectedEvent.productId && (
                        <div className="col-span-2">
                          <p className="text-xs font-medium text-gray-500 uppercase">
                            Product ID
                          </p>
                          <p className="text-sm text-gray-900 font-mono mt-1">
                            {selectedEvent.productId}
                          </p>
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
