import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchLeadCallLogs } from '../../store/slices/calllog';

const IverLead = ({ leadId, onClose }: { leadId: string, onClose?: () => void }) => {
  const dispatch = useAppDispatch();
  const { leadCallLogs, leadCallLogsLoading, leadCallLogsError, leadCallLogsPagination } = useAppSelector(state => state.calllog);
  const [page, setPage] = useState(1);
  const limit = leadCallLogsPagination?.limit || 10;

  useEffect(() => {
    if (leadId) {
      dispatch(fetchLeadCallLogs({ leadId, page, limit }));
    }
  }, [dispatch, leadId, page, limit]);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDuration = (duration: number | string) => {
    if (!duration) return 'N/A';
    const seconds = typeof duration === 'string' ? parseInt(duration) : duration;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border  max-w-7xl w-full mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Call Logs</h2>
          <p className="text-sm text-gray-600 mt-1">Lead ID: {leadId || 'N/A'}</p>
        </div>
        {onClose && (
          <button
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors duration-200"
            onClick={onClose}
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-3">
        {/* Show No Data if leadId is empty */}
        {!leadId ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No call logs available</h3>
            <p className="mt-2 text-gray-500">There is no lead selected or no data for this lead.</p>
          </div>
        ) : (
          <>
            {/* Loading */}
            {leadCallLogsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <span className="text-gray-600 ml-2">Loading call logs...</span>
                </div>
              </div>
            )}

            {/* Error */}
            {leadCallLogsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <span className="text-red-800 font-medium">Error: {leadCallLogsError}</span>
              </div>
            )}

            {/* Table */}
            {!leadCallLogsLoading && !leadCallLogsError && (
              <>
                {leadCallLogs?.length > 0 ? (
                  <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Call ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caller</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recording</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leadCallLogs.map((log, idx) => (
                          <tr key={log._id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-4 text-sm text-gray-900 font-medium">{(page - 1) * limit + idx + 1}</td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-mono">{log.callId || 'N/A'}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{log.caller || 'Unknown'}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{log.agentName || 'N/A'}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(log.status)}`}>
                                {log.status || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900 font-mono">{formatDuration(log.duration)}</td>
                            <td className="px-4 py-4 text-sm">{log.recordingUrl ? <audio controls src={log.recordingUrl} /> : <span className="text-gray-400 italic">No recording</span>}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{new Date(log.createdAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900">No call logs found</h3>
                    <p className="mt-2 text-gray-500">There are no call logs available for this lead.</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default IverLead;
