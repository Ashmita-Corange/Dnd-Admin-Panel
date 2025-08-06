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
  AlertCircle,
  Check,
  CheckCheck
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
  const currentUser = useAppSelector(selectCurrentUser);
  
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { bg: "bg-blue-500", text: "text-white" },
      "in-progress": { bg: "bg-yellow-500", text: "text-white" },
      "in_progress": { bg: "bg-yellow-500", text: "text-white" },
      resolved: { bg: "bg-green-500", text: "text-white" },
      closed: { bg: "bg-gray-500", text: "text-white" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace(/[-_]/g, ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { bg: "bg-green-500", text: "text-white" },
      medium: { bg: "bg-yellow-500", text: "text-white" },
      high: { bg: "bg-orange-500", text: "text-white" },
      urgent: { bg: "bg-red-500", text: "text-white" },
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  // WhatsApp-style Message Component
  const MessageBubble = ({ message, isStaff, author, timestamp, isInitial = false }: {
    message: string;
    isStaff: boolean;
    author: string;
    timestamp: string;
    isInitial?: boolean;
  }) => {
    return (
      <div className={`flex mb-4 ${isStaff ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isStaff ? 'order-2' : 'order-1'}`}>
          {/* Message bubble */}
          <div className={`relative px-4 py-3 rounded-2xl ${
            isStaff 
              ? 'bg-blue-500 text-white rounded-br-md' 
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
          }`}>
            {/* Initial message indicator */}
            {isInitial && (
              <div className={`text-xs font-medium mb-2 ${
                isStaff ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
              }`}>
                Initial Message
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap leading-relaxed">
              {message}
            </p>
            
            {/* Time and status */}
            <div className={`flex items-center justify-end gap-1 mt-2 ${
              isStaff ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            }`}>
              <span className="text-xs">
                {formatTime(timestamp)}
              </span>
              {isStaff && (
                <CheckCheck className="w-3 h-3" />
              )}
            </div>
          </div>
          
          {/* Author name for customer messages */}
          {!isStaff && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-3">
              {author}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Date separator
  const DateSeparator = ({ date }: { date: string }) => (
    <div className="flex items-center justify-center my-6">
      <div className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium">
        {date}
      </div>
    </div>
  );

  if (loading && !ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading ticket...</span>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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

  // Group messages by date
  const allMessages = [
    {
      message: ticket.description,
      isStaff: false,
      author: ticket.customerName || 'Customer',
      timestamp: ticket.createdAt,
      isInitial: true
    },
    ...(ticket.replies || []).map(reply => ({
      message: reply.message,
      isStaff: reply.isStaff,
      author: typeof reply.repliedBy === 'string' 
        ? reply.repliedBy 
        : reply.repliedBy?.name || 'Unknown',
      timestamp: reply.repliedAt,
      isInitial: false
    }))
  ];

  const groupedMessages = allMessages.reduce((groups: any[], message) => {
    const date = formatDate(message.timestamp);
    const lastGroup = groups[groups.length - 1];
    
    if (!lastGroup || lastGroup.date !== date) {
      groups.push({ date, messages: [message] });
    } else {
      lastGroup.messages.push(message);
    }
    
    return groups;
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <PageMeta
        title={`Chat - ${ticket.title || ticket.subject} | TailAdmin`}
        description={`Support ticket chat for ${ticket.title || ticket.subject}`}
      />
      
      {/* Header - WhatsApp style */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/tickets/list')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Avatar */}
          <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium text-gray-900 dark:text-white truncate">
              {ticket.customerName || 'Customer'}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {ticket.title || ticket.subject}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>
      </div>

      {/* Messages Area - WhatsApp style chat background */}
      <div 
        className="flex-1 overflow-y-auto px-4 py-4" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e5e7eb' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#f8fafc'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex}>
              <DateSeparator date={group.date} />
              {group.messages.map((message: any, messageIndex: number) => (
                <MessageBubble
                  key={messageIndex}
                  message={message.message}
                  isStaff={message.isStaff}
                  author={message.author}
                  timestamp={message.timestamp}
                  isInitial={message.isInitial}
                />
              ))}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - WhatsApp style */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-3xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none max-h-32 min-h-[48px]"
                disabled={isReplying}
                style={{
                  height: 'auto',
                  minHeight: '48px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            
            <button
              onClick={handleSendReply}
              disabled={!newMessage.trim() || isReplying}
              className="w-12 h-12 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed flex-shrink-0"
            >
              {isReplying ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
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