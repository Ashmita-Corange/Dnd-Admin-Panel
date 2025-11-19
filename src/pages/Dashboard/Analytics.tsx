import React, { useState, useEffect } from "react";
import {
  Users,
  Package,
  FolderTree,
  Tags,
  ShoppingCart,
  Clock,
  Ticket,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import axiosInstance from "../../services/axiosConfig";

function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getData = async () => {
    try {
      const response = await axiosInstance("analytics");
      setData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: data.totalUsers,
      bgColor: "bg-blue-50",
      darkBg: "dark:bg-blue-900",
      iconColor: "text-blue-600",
      darkIcon: "dark:text-blue-300",
      Icon: Users,
    },
    {
      title: "Total Products",
      value: data.totalProducts,
      bgColor: "bg-green-50",
      darkBg: "dark:bg-green-900",
      iconColor: "text-green-600",
      darkIcon: "dark:text-green-300",
      Icon: Package,
    },
    {
      title: "Total Categories",
      value: data.totalCategories,
      bgColor: "bg-purple-50",
      darkBg: "dark:bg-purple-900",
      iconColor: "text-purple-600",
      darkIcon: "dark:text-purple-300",
      Icon: FolderTree,
    },
    {
      title: "Total Variants",
      value: data.totalVariants,
      bgColor: "bg-orange-50",
      darkBg: "dark:bg-orange-900",
      iconColor: "text-orange-600",
      darkIcon: "dark:text-orange-300",
      Icon: Tags,
    },
    {
      title: "Total Orders",
      value: data.totalOrders,
      bgColor: "bg-indigo-50",
      darkBg: "dark:bg-indigo-900",
      iconColor: "text-indigo-600",
      darkIcon: "dark:text-indigo-300",
      Icon: ShoppingCart,
    },
    {
      title: "Pending Orders",
      value: data.totalPendingOrders,
      bgColor: "bg-amber-50",
      darkBg: "dark:bg-amber-900",
      iconColor: "text-amber-600",
      darkIcon: "dark:text-amber-300",
      Icon: Clock,
    },
    {
      title: "Pending Tickets",
      value: data.totalPendingTickets,
      bgColor: "bg-rose-50",
      darkBg: "dark:bg-rose-900",
      iconColor: "text-rose-600",
      darkIcon: "dark:text-rose-300",
      Icon: Ticket,
    },
  ];

  // Prepare data for Orders Radar Chart
  const ordersRadarData = Object.entries(data.ordersByStatus).map(
    ([status, count]) => ({
      status: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    })
  );

  // Prepare data for Tickets Radar Chart
  const ticketsRadarData = Object.entries(data.ticketsByStatus).map(
    ([status, count]) => ({
      status: status
        .replace("_", " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      value: count,
    })
  );

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
          Analytics Dashboard
        </h1>
        <p className="text-gray-600 mt-1 dark:text-gray-300">
          Overview of your e-commerce platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow dark:bg-gray-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium dark:text-gray-300">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2 dark:text-gray-100">
                  {stat.value}
                </p>
              </div>
              <div
                className={`${stat.bgColor} ${
                  stat.darkBg || ""
                } w-14 h-14 rounded-lg flex items-center justify-center`}
              >
                <stat.Icon
                  className={`w-7 h-7 ${stat.iconColor} ${stat.darkIcon || ""}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Orders by Status - Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 dark:text-gray-100">
            Orders by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={ordersRadarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="status"
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
              <Radar
                name="Orders"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets by Status - Radar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 dark:text-gray-100">
            Tickets by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={ticketsRadarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="status"
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, "auto"]} />
              <Radar
                name="Tickets"
                dataKey="value"
                stroke="#f43f5e"
                fill="#f43f5e"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Recent Orders
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Items
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {order._id.slice(-8)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {order.user.name || "N/A"}
                      </div>
                      <div className="text-gray-500 dark:text-gray-300">
                        {order.user.email || order.user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                    items
                  </td>
                  <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                    ₹{order.total}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === "pending"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : order.status === "paid"
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          : order.status === "shipped"
                          ? "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                          : order.status === "completed"
                          ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-300"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(order.placedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-sm p-6 dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 dark:text-gray-100">
          Recent Tickets
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Subject
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentTickets.map((ticket) => (
                <tr
                  key={ticket._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-700"
                >
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                    {ticket._id.slice(-8)}
                  </td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {ticket.subject}
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {ticket.customer.name}
                      </div>
                      <div className="text-gray-500 dark:text-gray-300">
                        {ticket.customer.email || ticket.customer.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        ticket.priority === "low"
                          ? "bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                          : ticket.priority === "medium"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : "bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                      }`}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        ticket.status === "open"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-900 dark:text-rose-300"
                          : ticket.status === "in_progress"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                          : ticket.status === "resolved"
                          ? "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300"
                          : "bg-gray-50 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-300">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;