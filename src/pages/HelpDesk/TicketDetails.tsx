import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchSupportTicketById, updateSupportTicketStatus } from "../../store/slices/support";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileText, Image, File } from "lucide-react";

interface SupportTicket {
    _id: string;
    userId: { _id: string; fullName: string; email: string };
    subject: string;
    category: string;
    description: string;
    priority: string;
    status: string;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

const TicketDetails: React.FC<{ isEditMode: boolean }> = ({ isEditMode }) => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { tickets, loading, error } = useAppSelector((state) => state.support);

    const ticket = tickets.find((t) => t._id === ticketId);
    const [status, setStatus] = useState(ticket?.status || "open");


    const ImageUrl = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000/uploads/";

    useEffect(() => {
        if (ticketId && !ticket) {
            dispatch(fetchSupportTicketById(ticketId));
        }
    }, [dispatch, ticketId, ticket]);

    useEffect(() => {
        if (ticket) {
            setStatus(ticket.status);
        }
    }, [ticket]);

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatus(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (ticketId) {
            await dispatch(updateSupportTicketStatus({ ticketId, status }));
            navigate("/requests");
        }
    };

    const getFileIcon = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return <Image className="w-4 h-4" />;
        } else if (['pdf', 'doc', 'docx', 'txt'].includes(ext || '')) {
            return <FileText className="w-4 h-4" />;
        }
        return <File className="w-4 h-4" />;
    };

    const getFileName = (filePath: string) => {
        return filePath.split('\\').pop() || filePath.split('/').pop() || filePath;
    };

    // Remove duplicate "uploads" in the URL if present
    const normalizeUrl = (url: string) => {
        return url.replace(/\/uploads\/uploads\//g, '/uploads/');
    };

    const handleFileDownload = (filePath: string) => {
        let fileUrl = `${ImageUrl}/${getFileName(filePath)}`;
        fileUrl = normalizeUrl(fileUrl);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = getFileName(filePath);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileView = (filePath: string) => {
        let fileUrl = `${ImageUrl}/${getFileName(filePath)}`;
        fileUrl = normalizeUrl(fileUrl);
        window.open(fileUrl, '_blank');
    };

    return (
        <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            <button
                onClick={() => navigate("/requests")}
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Tickets
            </button>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-6">
                {isEditMode ? "Update Support Ticket Status" : "View Support Ticket"}
            </h1>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                    <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
            ) : !ticket ? (
                <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">Ticket not found.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Subject
                        </label>
                        <input
                            type="text"
                            name="subject"
                            value={ticket.subject}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </label>
                        <input
                            type="text"
                            name="category"
                            value={ticket.category}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white opacity-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={ticket.description}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white opacity-50"
                            rows={5}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Priority
                        </label>
                        <input
                            type="text"
                            name="priority"
                            value={ticket.priority}
                            disabled
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white opacity-50"
                        />
                    </div>
                    {ticket.attachments && ticket.attachments.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                Attachments ({ticket.attachments.length})
                            </label>
                            <div className="space-y-2">
                                {ticket.attachments.map((attachment, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-md bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
                                    >
                                        {getFileIcon(attachment)}
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                                            {getFileName(attachment)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleFileView(attachment)}
                                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800
                                            dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                                        >
                                            {getFileIcon(attachment)}
                                            View
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleFileDownload(attachment)}
                                            className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Status
                        </label>
                        <select
                            name="status"
                            value={status}
                            onChange={handleStatusChange}
                            disabled={!isEditMode}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    {isEditMode && (
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                Save Status
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate("/requests")}
                                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default TicketDetails;