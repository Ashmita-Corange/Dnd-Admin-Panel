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
  CheckCheck,
  Paperclip,
  X,
  FileText,
  Download,
  Image as ImageIcon,
  Eye
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    if ((!newMessage.trim() && selectedFiles.length === 0) || !ticket || isReplying) return;

    setIsReplying(true);
    try {
      const replyData = {
        message: newMessage.trim() || "File attachment", // Default message if only files
        isStaff: true,
        attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
      };

      const result = await dispatch(addTicketReply({ 
        id: ticket._id, 
        replyData 
      })).unwrap();

      setTicket(result); // Update local ticket with new reply
      setNewMessage("");
      setSelectedFiles([]);
      
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setPopup({
          message: `File "${file.name}" is too large. Maximum size is 10MB.`,
          type: "error",
          isVisible: true,
        });
        return false;
      }
      
      if (!allowedTypes.includes(file.type)) {
        setPopup({
          message: `File "${file.name}" has an unsupported format.`,
          type: "error",
          isVisible: true,
        });
        return false;
      }
      
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    
    if (imageExtensions.includes(extension || '')) {
      return <ImageIcon className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const isImageFile = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.includes(extension || '');
  };

  const getAttachmentUrl = (attachment: any) => {
    console.log("🔍 Attachment object:", attachment);

    const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://yourdomain.com";
    
    // Handle different attachment structures
    let filename;
    
    // Case 1: Attachment is a string (direct path)
    if (typeof attachment === 'string') {
      filename = attachment;
      console.log("� Attachment is string path:", filename);
    } else {
      // Case 2: Attachment is an object with properties
      filename = attachment.filename || attachment.name || attachment.path;
      console.log("📁 Extracted filename from object:", filename);
    }
    
    if (!filename) {
      console.log("❌ No filename found in attachment");
      return null;
    }
    
    // If it's already a full URL, return as is
    if (filename.startsWith('http')) {
      console.log("🌐 Already full URL:", filename);
      return filename;
    }
    
    // If it starts with /ticket-attachments/, construct the full URL
    if (filename.startsWith('/ticket-attachments/')) {
      const constructedUrl = `http://localhost:3000${filename}`;
      console.log("🔗 Constructed URL from path:", constructedUrl);
      return constructedUrl;
    }
    
    // Otherwise, construct the URL with the base path
    const constructedUrl = `http://localhost:3000/ticket-attachments/${filename}`;
    console.log("🔗 Constructed URL with base path:", constructedUrl);
    return constructedUrl;
  };

  const handleDownload = async (attachment: any) => {
    const url = getAttachmentUrl(attachment);
    
    // Extract filename for download
    let filename;
    if (typeof attachment === 'string') {
      filename = attachment.split('/').pop() || 'download';
    } else {
      filename = attachment.filename || attachment.name || 'download';
    }
    
    console.log("📥 Starting download:", { url, filename });
    
    if (!url) {
      setPopup({
        message: "No download URL available",
        type: "error",
        isVisible: true,
      });
      return;
    }

    try {
      // Method 1: Try direct download link (fastest)
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log("✅ Direct download initiated");
      
      // Show success message after a short delay
      setTimeout(() => {
        setPopup({
          message: "Download started successfully!",
          type: "success",
          isVisible: true,
        });
      }, 500);

    } catch (error) {
      console.error("❌ Direct download failed, trying fetch method:", error);
      
      // Method 2: Fallback to fetch + blob (for CORS issues)
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': '*/*',
          },
          mode: 'cors', // Try CORS first
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        setTimeout(() => {
          window.URL.revokeObjectURL(downloadUrl);
        }, 100);

        console.log("✅ Fetch download completed");
        setPopup({
          message: "Download completed successfully!",
          type: "success",
          isVisible: true,
        });

      } catch (fetchError) {
        console.error("❌ Fetch download also failed:", fetchError);
        
        // Method 3: Last resort - open in new tab
        try {
          window.open(url, '_blank', 'noopener,noreferrer');
          setPopup({
            message: "File opened in new tab. Please right-click and save to download.",
            type: "success",
            isVisible: true,
          });
        } catch (finalError) {
          console.error("❌ All download methods failed:", finalError);
          setPopup({
            message: `Download failed: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`,
            type: "error",
            isVisible: true,
          });
        }
      }
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
  const MessageBubble = ({ message, isStaff, author, timestamp, isInitial = false, attachments = [] }: {
    message: string;
    isStaff: boolean;
    author: string;
    timestamp: string;
    isInitial?: boolean;
    attachments?: any[];
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

            {/* Attachments */}
            {attachments && attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {attachments.map((attachment, index) => {
                  console.log(`📎 Processing attachment ${index + 1}:`, attachment);
                  const attachmentUrl = getAttachmentUrl(attachment);
                  
                  // Handle filename extraction for both string and object attachments
                  let filename;
                  if (typeof attachment === 'string') {
                    // Extract filename from path
                    filename = attachment.split('/').pop() || 'Attachment';
                  } else {
                    filename = attachment.filename || attachment.name || 'Attachment';
                  }
                  
                  const isImage = isImageFile(filename);
                  
                  console.log(`🖼️ Is image file (${filename}):`, isImage);
                  console.log(`🔗 Final attachment URL:`, attachmentUrl);
                  
                  return (
                    <div key={index}>
                      {isImage && attachmentUrl ? (
                        // Image attachment with preview
                        <div className={`rounded-lg overflow-hidden ${
                          isStaff 
                            ? 'bg-blue-400/20' 
                            : 'bg-gray-100 dark:bg-gray-600'
                        }`}>
                          <img
                            src={attachmentUrl}
                            alt={filename}
                            className="max-w-full h-auto max-h-64 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(attachmentUrl, '_blank')}
                            onLoad={() => console.log("✅ Image loaded successfully:", attachmentUrl)}
                            onError={(e) => {
                              console.error("❌ Image failed to load:", attachmentUrl);
                              // Fallback to file icon if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          {/* Fallback for broken images */}
                          <div 
                            className={`hidden items-center gap-2 p-3 ${
                              isStaff 
                                ? 'text-blue-100' 
                                : 'text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span className="text-xs flex-1 truncate">{filename}</span>
                          </div>
                          
                          {/* Image overlay with actions */}
                          <div className={`flex items-center justify-between p-2 ${
                            isStaff 
                              ? 'bg-blue-400/30 text-blue-100' 
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            <span className="text-xs truncate flex-1">{filename}</span>
                            <div className="flex gap-1 ml-2">
                              <button
                                onClick={() => window.open(attachmentUrl, '_blank')}
                                className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                                  isStaff ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                                }`}
                                title="View full size"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDownload(attachment)}
                                className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                                  isStaff ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                                }`}
                                title="Download"
                              >
                                <Download className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Non-image attachment
                        <div 
                          className={`flex items-center gap-2 p-3 rounded-lg ${
                            isStaff 
                              ? 'bg-blue-400/30 text-blue-100' 
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {getFileIcon(filename)}
                          <span className="text-xs flex-1 truncate">{filename}</span>
                          <div className="flex gap-1 ml-2">
                            {attachmentUrl && (
                              <>
                                <button
                                  onClick={() => window.open(attachmentUrl, '_blank')}
                                  className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                                    isStaff ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                  title="View"
                                >
                                  <Eye className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDownload(attachment)}
                                  className={`p-1 rounded hover:bg-opacity-20 hover:bg-gray-500 transition-colors ${
                                    isStaff ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                  title="Download"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
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
      isInitial: true,
      attachments: ticket.attachments || []
    },
    ...(ticket.replies || []).map(reply => ({
      message: reply.message,
      isStaff: reply.isStaff,
      author: typeof reply.repliedBy === 'string' 
        ? reply.repliedBy 
        : reply.repliedBy?.name || 'Unknown',
      timestamp: reply.repliedAt,
      isInitial: false,
      attachments: reply.attachments || []
    }))
  ];

  console.log("💬 All messages with attachments:", allMessages.map(msg => ({
    author: msg.author,
    isStaff: msg.isStaff,
    attachments: msg.attachments,
    attachmentCount: msg.attachments.length
  })));

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
                  attachments={message.attachments}
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
          {/* File attachments preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attachments ({selectedFiles.length})
                </span>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-600 p-2 rounded">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end gap-3">
            {/* File attachment button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.txt,.doc,.docx"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isReplying}
              className="w-12 h-12 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center transition-colors disabled:cursor-not-allowed flex-shrink-0"
            >
              <Paperclip className="w-5 h-5" />
            </button>

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
              disabled={(!newMessage.trim() && selectedFiles.length === 0) || isReplying}
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