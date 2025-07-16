import React, { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchSupportTickets } from "../../store/slices/support";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import { Search, ChevronLeft, ChevronRight, RotateCcw, Eye, Edit, Paperclip } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
    _id: string;
    fullName: string;
    email: string;
}

interface SupportTicket {
    _id: string;
    userId: User;
    subject: string;
    category: string;
    description: string;
    priority: string;
    status: string;
    attachments: string[];
    createdAt: string;
    updatedAt: string;
}

const RequestList: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { tickets, loading, error, pagination } = useAppSelector((state) => state.support);
    const [searchInput, setSearchInput] = useState("");
    const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([]);
    const [page, setPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const hasFetched = useRef(false);

    // Fetch tickets on component mount and page change
    useEffect(() => {
        if (!hasFetched.current || (!isSearching && page !== pagination.page)) {
            dispatch(fetchSupportTickets({ page, limit: pagination.limit || 10 }));
            hasFetched.current = true;
        }
    }, [dispatch, page, pagination.page, pagination.limit, isSearching]);

    // Handle search filtering
    useEffect(() => {
        if (searchInput.trim()) {
            setIsSearching(true);
            const searchTerm = searchInput.toLowerCase();
            const filtered = tickets.filter((ticket) => {
                return (
                    ticket.subject.toLowerCase().includes(searchTerm) ||
                    ticket.category.toLowerCase().includes(searchTerm) ||
                    ticket.description.toLowerCase().includes(searchTerm) ||
                    ticket.userId?.fullName?.toLowerCase().includes(searchTerm) ||
                    ticket.userId?.email?.toLowerCase().includes(searchTerm)
                );
            });
            setFilteredTickets(filtered);
        } else {
            setIsSearching(false);
            setFilteredTickets(tickets);
        }
    }, [tickets, searchInput]);

    const handlePageChange = (newPage: number) => {
        if (isSearching) {
            // Client-side pagination for search results
            const totalPages = Math.ceil(filteredTickets.length / (pagination.limit || 10));
            if (newPage >= 1 && newPage <= totalPages) {
                setPage(newPage);
            }
        } else {
            // Server-side pagination for all tickets
            if (newPage >= 1 && newPage <= pagination.totalPages) {
                setPage(newPage);
            }
        }
    };

    const generatePageNumbers = () => {
        const totalPages = isSearching 
            ? Math.ceil(filteredTickets.length / (pagination.limit || 10))
            : pagination.totalPages;
        
        const currentPage = isSearching ? page : pagination.page;
        const pages = [];
        const maxPages = 5;
        const start = Math.max(1, currentPage - Math.floor(maxPages / 2));
        const end = Math.min(totalPages, start + maxPages - 1);

        if (start > 1) {
            pages.push(1);
            if (start > 2) pages.push("...");
        }
        for (let i = start; i <= end; i++) pages.push(i);
        if (end < totalPages) {
            if (end < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }
        return pages;
    };

    const handleSearchReset = () => {
        setSearchInput("");
        setPage(1);
        setIsSearching(false);
        dispatch(fetchSupportTickets({ page: 1, limit: pagination.limit || 10 }));
    };

    // Get current page tickets
    const getCurrentPageTickets = () => {
        if (isSearching) {
            const startIndex = (page - 1) * (pagination.limit || 10);
            const endIndex = startIndex + (pagination.limit || 10);
            return filteredTickets.slice(startIndex, endIndex);
        }
        return filteredTickets;
    };

    const currentTickets = getCurrentPageTickets();
    const totalTickets = isSearching ? filteredTickets.length : pagination.total;
    const currentPage = isSearching ? page : pagination.page;
    const totalPages = isSearching 
        ? Math.ceil(filteredTickets.length / (pagination.limit || 10))
        : pagination.totalPages;

    return (
        <div>
            <PageMeta title="Support Tickets | LMS Admin" description="List of all support tickets" />
            <PageBreadcrumb pageTitle="Support Tickets" />

            <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                        Support Tickets
                    </h1>
                    <span className="text-gray-500 text-sm dark:text-gray-400">
                        Total: {totalTickets}
                    </span>
                </div>

                <div className="bg-white shadow p-4 rounded-md mb-6 dark:bg-gray-900">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by subject, category, user, or description..."
                                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={handleSearchReset}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-6">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="bg-white shadow rounded-lg overflow-x-auto dark:bg-gray-900">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        #
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Subject
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Attachments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Created At
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100 dark:bg-gray-900 dark:divide-gray-800">
                                {currentTickets.map((ticket, idx) => (
                                    <tr key={ticket._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {isSearching 
                                                ? (page - 1) * (pagination.limit || 10) + idx + 1
                                                : (pagination.page - 1) * (pagination.limit || 10) + idx + 1
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                            {ticket.subject.length > 40
                                                ? ticket.subject.slice(0, 40) + "..."
                                                : ticket.subject}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {ticket.userId?.fullName || "N/A"}
                                            <div className="text-xs text-gray-400">{ticket.userId?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                            {ticket.category}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 capitalize">
                                            {ticket.priority}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`${
                                                    ticket.status === "open"
                                                        ? "text-green-500"
                                                        : ticket.status === "closed"
                                                        ? "text-gray-500"
                                                        : "text-yellow-500"
                                                } capitalize`}
                                            >
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                            {ticket.attachments && ticket.attachments.length > 0 ? (
                                                <div className="flex items-center gap-1">
                                                    <Paperclip className="w-4 h-4 text-gray-400" />
                                                    <span className="text-xs text-gray-500">
                                                        {ticket.attachments.length}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(ticket.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/support-tickets/view/${ticket._id}`)}
                                                    className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                                                    title="View Ticket"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/support-tickets/edit/${ticket._id}`)}
                                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                                    title="Edit Ticket"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {currentTickets.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500 dark:text-gray-400">
                                    {searchInput
                                        ? "No tickets found matching your search."
                                        : "No support tickets available."}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {totalTickets > 0 && (
                    <div className="flex justify-between items-center mt-6">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            Showing{" "}
                            {isSearching 
                                ? Math.min((page - 1) * (pagination.limit || 10) + 1, filteredTickets.length)
                                : Math.min((pagination.page - 1) * (pagination.limit || 10) + 1, pagination.total)
                            } to{" "}
                            {isSearching 
                                ? Math.min(page * (pagination.limit || 10), filteredTickets.length)
                                : Math.min(pagination.page * (pagination.limit || 10), pagination.total)
                            } of{" "}
                            {totalTickets} results
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {generatePageNumbers().map((p, idx) =>
                                typeof p === "number" ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(p)}
                                        className={`px-3 py-1 rounded ${
                                            currentPage === p
                                                ? "bg-indigo-500 text-white"
                                                : "bg-gray-100 dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-gray-400 dark:text-gray-500">
                                        {p}
                                    </span>
                                )
                            )}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RequestList;