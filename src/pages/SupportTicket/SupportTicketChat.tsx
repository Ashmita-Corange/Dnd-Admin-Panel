import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Send, 
  User, 
  UserCog, 
  Clock, 
  MessageCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { 
  fetchTickets, 
  addTicketReply,
  SupportTicket 
} from "../../store/slices/supportticket";
import { selectCurrentUser } from "../../store/slices/authslice";
import PageMeta from "../../components/common/PageMeta";
import PopupAlert from "../../components/popUpAlert";

const SupportTicketChat: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tickets, loading } = useAppSelector((state) => state.tickets);
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Popup state for alerts
  const [popup, setPopup] = useState({
    message: "",
    type: "success" as "success" | "error",
    isVisible: false,
  });

  // Find the ticket from the store or fetch it
  useEffect(() => {
    if (ticketId) {
      const foundTicket = tickets.find(t => t._id === ticketId);
      if (foundTicket) {
        setTicket(foundTicket);
      } else {
        // If ticket not in store, fetch all tickets
        dispatch(fetchTickets({ page: 1, limit: 100 }));
      }
    }
  }, [ticketId, tickets, dispatch]);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [ticket?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendReply = async () => {
    if (!newMessage.trim() || !ticket || isReplying) return;

    setIsReplying(true);
    try {
      const replyData = {
        message: newMessage.trim(),
        repliedBy: "admin", // You should get this from user context/auth
        isStaff: true,
      };

      const result = await dispatch(addTicketReply({ 
        id: ticket._id, 
        replyData 
      })).unwrap();

      setTicket(result); // Update local ticket with new reply
      setNewMessage("");
      
      setPopup({
        message: "Reply sent successfully!",
        type: "success",
        isVisible: true,
      });
    } catch (error: any) {
      setPopup({
        message: error || "Failed to send reply",
        type: "error",
        isVisible: true,
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { bg: "bg-blue-100 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-200" },
      "in-progress": { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
      "in_progress": { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
      resolved: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
      closed: { bg: "bg-gray-100 dark:bg-gray-900/20", text: "text-gray-800 dark:text-gray-200" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: "bg-green-100 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200" },
      medium: { bg: "bg-yellow-100 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200" },
      high: { bg: "bg-orange-100 dark:bg-orange-900/20", text: "text-orange-800 dark:text-orange-200" },
      urgent: { bg: "bg-red-100 dark:bg-red-900/20", text: "text-red-800 dark:text-red-200" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  if (loading && !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Ticket Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The support ticket you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/tickets/list')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title={`Chat - ${ticket.title || ticket.subject} | TailAdmin`}
        description={`Support ticket chat for ${ticket.title || ticket.subject}`}
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/tickets/list')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {ticket.title || ticket.subject}
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Ticket ID: {ticket._id}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
            </div>
          </div>
          
          {/* Ticket Info */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Customer:</span>
                <p className="text-gray-900 dark:text-white">{ticket.customerName || 'N/A'}</p>
                {ticket.customerEmail && (
                  <p className="text-gray-500 dark:text-gray-400">{ticket.customerEmail}</p>
                )}
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
                <p className="text-gray-900 dark:text-white">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">Last Updated:</span>
                <p className="text-gray-900 dark:text-white">{formatDate(ticket.updatedAt)}</p>
              </div>
            </div>
            
            {ticket.description && (
              <div className="mt-4">
                <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
                <p className="text-gray-900 dark:text-white mt-1">{ticket.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6" style={{ height: 'calc(100vh - 280px)' }}>
          <div className="max-w-4xl mx-auto space-y-4">
            {/* Initial ticket message */}
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {ticket.customerName || 'Customer'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(ticket.createdAt)}
                  </span>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <p className="text-gray-800 dark:text-gray-200">{ticket.description}</p>
                </div>
              </div>
            </div>

            {/* Replies */}
            {ticket.replies && ticket.replies.map((reply, index) => (
              <div key={index} className={`flex gap-3 ${reply.isStaff ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  reply.isStaff 
                    ? 'bg-blue-100 dark:bg-blue-900/20' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}>
                  {reply.isStaff ? (
                    <UserCog className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`flex items-center gap-2 mb-1 ${reply.isStaff ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {typeof reply.repliedBy === 'string' 
                        ? reply.repliedBy 
                        : reply.repliedBy?.name || 'Unknown'}
                      {reply.isStaff && (
                        <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(Staff)</span>
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(reply.repliedAt)}
                    </span>
                  </div>
                  <div className={`border rounded-lg p-3 ${
                    reply.isStaff
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}>
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                      {reply.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                <UserCog className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your reply..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    disabled={isReplying}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!newMessage.trim() || isReplying}
                    className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                  >
                    {isReplying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Press Enter to send, Shift + Enter for new line
                </p>
              </div>
            </div>
          </div>
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
};

export default SupportTicketChat;
