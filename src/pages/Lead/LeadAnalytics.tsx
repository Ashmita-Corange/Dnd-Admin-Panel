import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  Users,
  Phone,
  CheckCircle,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  Search,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { RootState, AppDispatch } from "../../store";
import { fetchLeadAnalytics } from "../../store/slices/leadAnalytics";
import { fetchStaff } from "../../store/slices/staff";

import DatePicker from "../../components/form/date-picker";
import { Link } from "react-router";

const LeadAnalytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { analytics, loading, error } = useSelector(
    (state: RootState) => state.leadAnalytics
  );
  const { staff, loading: staffLoading } = useSelector(
    (state: RootState) => state.staff
  );

  const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
  const userRoleId = userInfo?.role || "";
  const userId = userInfo?._id || "";
  const isSuperAdmin = userInfo?.isSuperAdmin || false;
  const STAFF_ROLE_ID = "6892f49e5e1bb25c871bdd3c";
  const isAdmin =
    isSuperAdmin || (userRoleId !== STAFF_ROLE_ID && userRoleId !== "");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [staffSearchTerm, setStaffSearchTerm] = useState("");
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
  const staffDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    if (!isAdmin) setSelectedStaff(userId);
  }, [isAdmin, userId]);

  useEffect(() => {
    dispatch(fetchStaff({ limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (!isAdmin) params.assignedTo = userId;
    else if (selectedStaff) params.assignedTo = selectedStaff;
    dispatch(fetchLeadAnalytics(params));
  }, [dispatch, startDate, endDate, selectedStaff, isAdmin, userId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        staffDropdownRef.current &&
        !staffDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStaffDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStaff = staff.filter(
    (s) =>
      s.name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(staffSearchTerm.toLowerCase())
  );
  const selectedStaffMember = staff.find((s) => s._id === selectedStaff);

  useEffect(() => {
    if (analytics?.callMetrics) {
      console.log("callMetrics (debug):", analytics.callMetrics);
    }
  }, [analytics]);

  const handleStaffSelect = (staffId: string) => {
    setSelectedStaff(staffId);
    setIsStaffDropdownOpen(false);
    setStaffSearchTerm("");
  };

  const MetricCard = ({
    icon: Icon,
    value,
    label,
    gradient,
    iconBg,
    trend,
  }: any) => (
    <div className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 ${iconBg} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <TrendingUp className="w-5 h-5 text-emerald-500 animate-pulse" />
          )}
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1">
          {value}
        </h3>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 p-6">
      <style>{`
                @keyframes shimmer { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
                .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
                @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
                .animate-float { animation: float 3s ease-in-out infinite; }
            `}</style>

      {/* Header */}
      <div className="mb-8 relative">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-shimmer" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Lead Analytics
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            {isAdmin
              ? "Comprehensive analytics dashboard for all leads"
              : "Your personal performance metrics"}
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <div className="flex gap-4 mt-4 flex-wrap justify-end mb-8">
        <div className="w-48">
          <DatePicker
            id="lead-analytics-start-date"
            label="Start Date"
            defaultDate={startDate || undefined}
            onChange={(_selectedDates: Date[], dateStr: string) =>
              setStartDate(dateStr)
            }
          />
        </div>
        <div className="w-48">
          <DatePicker
            id="lead-analytics-end-date"
            label="End Date"
            defaultDate={endDate || undefined}
            onChange={(_selectedDates: Date[], dateStr: string) =>
              setEndDate(dateStr)
            }
          />
        </div>
        <button
          onClick={() => {
            const params: any = {};
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;
            if (!isAdmin) params.assignedTo = userId;
            else if (selectedStaff) params.assignedTo = selectedStaff;
            dispatch(fetchLeadAnalytics(params));
          }}
          className="self-end px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Apply
        </button>
        <button
          onClick={() => {
            const now = new Date();
            const formatDate = (d: Date) => d.toISOString().split("T")[0];
            setStartDate(
              formatDate(new Date(now.getFullYear(), now.getMonth(), 1))
            );
            setEndDate(
              formatDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
            );
          }}
          className="self-end px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Reset Dates
        </button>
      </div>

      {/* Filters */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <Filter className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isAdmin && (
            <div>
              <label className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Users className="w-4 h-4 text-pink-600" />
                Filter by Staff
              </label>
              <div className="relative" ref={staffDropdownRef}>
                <input
                  type="text"
                  value={
                    selectedStaffMember
                      ? `${selectedStaffMember.name} - ${selectedStaffMember.email}`
                      : staffSearchTerm
                  }
                  onChange={(e) => {
                    setStaffSearchTerm(e.target.value);
                    setIsStaffDropdownOpen(true);
                  }}
                  onFocus={() => setIsStaffDropdownOpen(true)}
                  placeholder={staffLoading ? "Loading..." : "All Staff"}
                  className="w-full rounded-xl border-2 border-gray-200 dark:border-gray-700 px-4 py-3 pr-10 bg-white dark:bg-gray-900 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-all outline-none text-gray-800 dark:text-white"
                  disabled={staffLoading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {selectedStaffMember ? (
                    <button
                      onClick={() => {
                        setSelectedStaff("");
                        setStaffSearchTerm("");
                      }}
                      className="text-gray-400 hover:text-gray-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : (
                    <Search className="w-4 h-4 text-gray-400" />
                  )}
                </div>

                {isStaffDropdownOpen && !staffLoading && (
                  <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                    {filteredStaff.length > 0 ? (
                      <>
                        <div
                          onClick={() => handleStaffSelect("")}
                          className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer transition"
                        >
                          All Staff (No Filter)
                        </div>
                        {filteredStaff.map((s) => (
                          <div
                            key={s._id}
                            onClick={() => handleStaffSelect(s._id)}
                            className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-700 cursor-pointer transition"
                          >
                            <span className="font-semibold text-gray-800 dark:text-white block">
                              {s.name}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {s.email}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No staff found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            setSelectedStaff(isAdmin ? "" : userId);
          }}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          Reset Filters
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" />
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300 animate-pulse">
            Loading analytics...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 shadow-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <p className="text-red-800 dark:text-red-200 font-semibold">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading && analytics?.overview && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={Users}
              value={analytics.overview.totalLeads ?? 0}
              label="Total Leads"
              gradient="from-blue-500 to-cyan-500"
              iconBg="bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
              trend
            />
            <MetricCard
              icon={Activity}
              value={analytics.overview.newLeads ?? 0}
              label="New Leads"
              gradient="from-purple-500 to-pink-500"
              iconBg="bg-gradient-to-br from-purple-500 to-pink-600 text-white"
            />
            <MetricCard
              icon={CheckCircle}
              value={analytics.overview.convertedLeads ?? 0}
              label="Converted Leads"
              gradient="from-green-500 to-emerald-500"
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600 text-white"
            />
            <MetricCard
              icon={BarChart3}
              value={analytics.overview.conversionRate ?? "0.00%"}
              label="Conversion Rate"
              gradient="from-orange-500 to-red-500"
              iconBg="bg-gradient-to-br from-orange-500 to-red-600 text-white"
            />
          </div>

          {/* Follow-up & Revenue */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={AlertCircle}
              value={analytics.followUpMetrics?.untouchedLeads ?? 0}
              label="Untouched Leads"
              gradient="from-red-500 to-rose-500"
              iconBg="bg-gradient-to-br from-red-500 to-rose-600 text-white"
            />
            <MetricCard
              icon={Clock}
              value={analytics.followUpMetrics?.followupForToday ?? 0}
              label="Follow-ups Today"
              gradient="from-yellow-500 to-amber-500"
              iconBg="bg-gradient-to-br from-yellow-500 to-amber-600 text-white"
            />
            <MetricCard
              icon={Clock}
              value={analytics.overview.avgResponseTime ?? "N/A"}
              label="Avg Response Time"
              gradient="from-indigo-500 to-blue-500"
              iconBg="bg-gradient-to-br from-indigo-500 to-blue-600 text-white"
            />
            <MetricCard
              icon={DollarSign}
              value={`₹${(
                analytics.revenueMetrics?.totalExpectedRevenue ?? 0
              ).toLocaleString()}`}
              label="Expected Revenue"
              gradient="from-emerald-500 to-teal-500"
              iconBg="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              trend
            />
          </div>

          {/* Status & Source */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {analytics.statusDistribution && (
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <PieChart className="w-5 h-5 text-white" />
                  </div>
                  Leads by Status
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.statusDistribution).map(
                    ([status, count]) => (
                      <div key={status} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {status}
                          </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 group-hover:scale-105"
                            style={{
                              width: `${
                                (count /
                                  (analytics.overview?.totalLeads || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {analytics.sourceBreakdown && (
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                <h3 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  Leads by Source
                </h3>
                <div className="space-y-4">
                  {Object.entries(analytics.sourceBreakdown).map(
                    ([source, count]) => (
                      <div key={source} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                            {source.replace(/_/g, " ")}
                          </span>
                          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                            {count}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500 group-hover:scale-105"
                            style={{
                              width: `${
                                (count /
                                  (analytics.overview?.totalLeads || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Call Metrics */}
          {analytics.callMetrics && (
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6 mb-8">
              <h3 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                Call Status Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(
                  analytics.callMetrics as Record<string, unknown>
                ).map(([status, count]: [string, unknown]) => {
                  const displayCount = (() => {
                    if (typeof count === "number") return count;
                    if (typeof count === "string" && !isNaN(Number(count)))
                      return Number(count);
                    if (count && typeof count === "object") {
                      const cntObj = count as Record<string, unknown>;
                      // object with `count` property
                      if ("count" in cntObj && typeof cntObj.count === "number")
                        return cntObj.count as number;
                      // array-like
                      if (
                        Array.isArray(count) &&
                        (count as unknown[]).length > 0
                      ) {
                        const first = (count as unknown[])[0];
                        if (typeof first === "number") return first;
                        if (first && typeof first === "object") {
                          const fObj = first as Record<string, unknown>;
                          if ("count" in fObj && typeof fObj.count === "number")
                            return fObj.count as number;
                        }
                      }
                    }
                    return 0;
                  })();

                  return (
                    <Link
                      to={`/lead/list?lastcallstatus=${status}`}
                      key={status}
                    >
                      <div className="p-5 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">
                          {status.replace(/([A-Z])/g, " $1").trim()}
                        </p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {displayCount}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Top Performers */}
          {/* {isAdmin && analytics.teamPerformance?.topPerformers?.length > 0 && (
                        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl p-6">
                            <h3 className="flex items-center gap-3 text-xl font-bold text-gray-800 dark:text-white mb-6">
                                <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                Top Performers
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Staff Member</th>
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Total Leads</th>
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Converted</th>
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Conversion Rate</th>
                                            <th className="text-left py-4 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Total Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analytics.teamPerformance.topPerformers.map((p, i) => (
                                            <tr key={i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 dark:hover:from-gray-700/30 dark:hover:to-gray-700/30 transition-colors">
                                                <td className="py-4 px-4 text-sm font-semibold text-gray-800 dark:text-white">{p.userName || p.userId}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{p.totalLeads}</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-green-600 dark:text-green-400">{p.convertedLeads}</td>
                                                <td className="py-4 px-4 text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{p.conversionRate}%</td>
                                                <td className="py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">₹{p.totalValue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )} */}
        </>
      )}
    </div>
  );
};

export default LeadAnalytics;
