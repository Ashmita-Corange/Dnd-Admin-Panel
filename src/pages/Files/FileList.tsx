import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboard } from "../../store/slices/anayltics";
import { RootState, AppDispatch } from "../../store";

// Lucide React Icons
import {
  Eye,
  Clock,
  Users,
  TrendingUp,
  ShieldAlert,
  Video,
  User,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const VideoAnalyticsDashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { dashboard, loading, error } = useSelector(
    (state: RootState) => state.analytics
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [openUserEngagement, setOpenUserEngagement] = useState(false);
  const [openSecurityIncidents, setOpenSecurityIncidents] = useState(false);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-blue-700">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-700 mb-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-lg font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-600">
        <p className="text-lg">Error: {error}</p>
      </div>
    );

  if (!dashboard)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-500">
        <p className="text-lg">No dashboard data available.</p>
      </div>
    );

  // Filter videos by search term
  const filteredVideos =
    dashboard.videoPerformance?.filter((video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num;
  };

  const formatWatchTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    let timeString = "";
    if (hours > 0) timeString += `${hours}h `;
    if (minutes > 0) timeString += `${minutes}m `;
    timeString += `${secs}s`;
    return timeString.trim();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-white/[0.03] dark:text-white/90 text-gray-800 p-4 sm:p-6 lg:p-8 font-sans">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-gray-900 dark:text-white/90 drop-shadow-sm">
        Video Analytics Dashboard
      </h1>

      {/* Overview Section */}
      <section className="mb-10">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-800  dark:text-white/90 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={24} /> Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Total Views Card */}
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90">
                Total Views
              </h3>
              <Eye className="text-blue-600" size={28} />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white/90">
              {formatNumber(dashboard.overview?.totalViews || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">across all videos</p>
          </div>

          {/* Total Watch Time Card */}
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90">
                Total Watch Time
              </h3>
              <Clock className="text-blue-600" size={28} />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white/90">
              {formatWatchTime(dashboard.overview?.totalWatchTime || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">cumulative</p>
          </div>

          {/* Active Users Card */}
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90">
                Active Users
              </h3>
              <Users className="text-blue-600" size={28} />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white/90">
              {formatNumber(dashboard?.overview?.activeUsers || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">current period</p>
          </div>

          {/* Avg Completion Rate Card */}
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200 hover:border-blue-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90">
                Avg. Completion
              </h3>
              <TrendingUp className="text-blue-600" size={28} />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white/90">
              {dashboard.overview?.avgCompletionRate?.toFixed(1) || "0"}%
            </p>
            <p className="text-sm text-gray-500 mt-1">average for all videos</p>
          </div>

          {/* Security Incidents Card */}
          <div className="bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200 hover:border-red-500 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white/90">
                Security Incidents
              </h3>
              <ShieldAlert className="text-red-500" size={28} />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white/90">
              {formatNumber(dashboard.overview?.securityIncidents || 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1 ">total detected</p>
          </div>
        </div>
      </section>

      {/* Video Performance Section */}
      <section className="mb-10 bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-800 dark:text-white/90 flex items-center gap-2">
          <Video className="text-blue-600" size={24} /> Video Performance
        </h2>
        <div className="flex items-center mb-4 bg-gray-50 dark:bg-white/[0.03] rounded-lg border border-gray-300 focus-within:border-blue-500 transition-colors duration-200">
          <Search className="text-gray-500 ml-3" size={20} />
          <input
            type="text"
            placeholder="Search videos by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-gray-700  dark:text-white/90 dark:placeholder:text-white/40  px-3 py-2 rounded-lg focus:outline-none placeholder-gray-400"
          />
        </div>
        {filteredVideos.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 dark:bg-white/[0.06]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Engagement
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y dark:bg-white/[0.03] divide-gray-200">
                {filteredVideos.map((video) => (
                  <tr
                    key={video.id}
                    className="hover:bg-gray-50 hover:dark:bg-white/[0.06] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white/90">
                      {video?.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {formatNumber(video?.views)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {video.engagement?.toFixed(2) || "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">
            No videos found matching your search.
          </p>
        )}
      </section>

      {/* User Engagement Section */}
      <section className="mb-10 bg-white dark:bg-white/[0.03] p-6 rounded-xl shadow-md border border-gray-200">
        <h2
          className="text-xl sm:text-2xl font-bold mb-5 text-gray-800 flex items-center justify-between cursor-pointer"
          onClick={() => setOpenUserEngagement(!openUserEngagement)}
        >
          <div className="flex items-center gap-2 dark:text-white/90">
            <User className="text-blue-600" size={24} /> User Engagement
          </div>
          {openUserEngagement ? (
            <ChevronUp size={20} className="text-gray-500" />
          ) : (
            <ChevronDown size={20} className="text-gray-500" />
          )}
        </h2>
        {openUserEngagement && (
          <div className="overflow-x-auto rounded-lg border  max-h-[700px] overflow-scroll border-gray-200 mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100 dark:bg-white/[0.06]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Videos Watched
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-white/90 uppercase tracking-wider">
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-white/[0.03] divide-y divide-gray-200">
                {dashboard.userEngagement?.map((user) => (
                  <tr
                    key={user.userId}
                    className="hover:bg-gray-50 hover:dark:bg-white/[0.06] transition-colors duration-200"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white/90">
                      {user?.userId?.fullName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {user.videosWatched}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-white/70">
                      {user.lastActive ? user.lastActive : "Never Active"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dashboard.userEngagement?.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No user engagement data available.
              </p>
            )}
          </div>
        )}
      </section>

      {/* Security Incidents Section */}
      {/* <section className="mb-10 bg-white p-6 rounded-xl shadow-md border border-gray-200">
        <h2 className="text-xl sm:text-2xl font-bold mb-5 text-gray-800 flex items-center justify-between cursor-pointer"
          onClick={() => setOpenSecurityIncidents(!openSecurityIncidents)}>
          <div className="flex items-center gap-2">
            <ShieldAlert className="text-red-500" size={24} /> Security Incidents
          </div>
          {openSecurityIncidents ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </h2>
        {openSecurityIncidents && (
          <div className="overflow-x-auto rounded-lg border border-gray-200 mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Severity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Timestamp</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard.securityIncidents?.map(incident => (
                  <tr key={incident.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${incident.severity === 'High' ? 'bg-red-100 text-red-800' :
                           incident.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                           'bg-green-100 text-green-800'}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{incident.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{incident.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(incident.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {dashboard.securityIncidents?.length === 0 && (
              <p className="text-gray-500 text-center py-8">No security incidents to display.</p>
            )}
          </div>
        )}
      </section> */}
    </div>
  );
};

export default VideoAnalyticsDashboard;
