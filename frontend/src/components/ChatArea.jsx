import { useEffect, useState, useRef } from "react";
import {
  FiSend,
  FiInfo,
  FiMessageCircle,
  FiUsers,
  FiSmile,
  FiPaperclip,
  FiImage,
  FiFile,
  FiDownload,
  FiX,
} from "react-icons/fi";
import UsersList from "./UsersList";
import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "../config/api.js";

const ChatArea = ({ selectedGroup, socket }) => {
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("userInfo") || "{}");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(
        API_ENDPOINTS.GROUP_MESSAGES(selectedGroup._id),
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error("Failed to fetch messages");
    }
  };

  // Fetch messages for the selected group
  useEffect(() => {
    if (selectedGroup && socket) {
      fetchMessages();

      // Join room
      socket.emit("join room", selectedGroup?._id);

      // Listen for new messages
      socket.on("message recieved", (newMessage) => {
        console.log("New message received:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      });

      // Listen for users in room
      socket.on("Users in room", (users) => {
        console.log("Users in room:", users);
        setConnectedUsers(users || []);
      });

      // Listen for user joined
      socket.on("user joined", (user) => {
        setConnectedUsers((prev) => {
          const exists = prev.find((u) => u._id === user._id);
          if (!exists) {
            return [...prev, user];
          }
          return prev;
        });
      });

      // Listen for user left
      socket.on("user left", (userId) => {
        setConnectedUsers((prev) =>
          prev.filter((user) => user?._id !== userId)
        );
      });

      // Listen for notifications
      socket.on("notification", (notification) => {
        // Show different toast styles based on notification type
        const toastConfig = {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        };

        if (notification.type === "USER JOINED") {
          toast.success(notification.message, {
            ...toastConfig,
            icon: "👋",
          });
        } else if (notification.type === "USER LEFT") {
          toast.info(notification.message, {
            ...toastConfig,
            icon: "👋",
          });
        } else if (notification.type === "USER DISCONNECTED") {
          toast.warning(notification.message, {
            ...toastConfig,
            icon: "📴",
          });
        } else {
          toast.info(notification.message, toastConfig);
        }
      });

      // Listen for typing indicators
      socket.on("user typing", ({ username }) => {
        console.log("User typing:", username);
        if (username !== currentUser.username) {
          setTypingUsers((prev) => new Set(prev).add(username));
        }
      });

      socket.on("user stop typing", ({ username }) => {
        console.log("User stopped typing:", username);
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(username);
          return newSet;
        });
      });

      // Cleanup function
      return () => {
        socket.emit("leave room", selectedGroup?._id);
        socket.off("message recieved");
        socket.off("Users in room");
        socket.off("user joined");
        socket.off("user left");
        socket.off("notification");
        socket.off("user typing");
        socket.off("user stop typing");
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      };
    }
  }, [selectedGroup, socket, currentUser.username]);

  // Monitor socket connection status
  useEffect(() => {
    if (socket) {
      const handleConnect = () => {
        console.log("Socket connected");
        setSocketConnected(true);
      };

      const handleDisconnect = () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
      };

      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);

      // Set initial connection status
      setSocketConnected(socket.connected);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
      };
    }
  }, [socket]);

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    const reader = new FileReader();
    reader.onload = (e) => setFilePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  // Remove selected file
  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Send message with or without file
  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedGroup) return;

    setLoading(true);
    setUploading(!!selectedFile);

    try {
      let messageData;

      if (selectedFile) {
        // Upload file
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("content", newMessage || `Sent ${selectedFile.name}`);
        formData.append("groupId", selectedGroup._id);

        const { data } = await axios.post(API_ENDPOINTS.UPLOAD_FILE, formData, {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        messageData = data;
      } else {
        // Send text message
        const { data } = await axios.post(
          API_ENDPOINTS.MESSAGES,
          {
            content: newMessage,
            groupId: selectedGroup?._id,
          },
          {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          }
        );
        messageData = data;
      }

      // Emit new message to socket
      socket.emit("new message", {
        ...messageData,
        groupId: selectedGroup?._id,
      });

      // Add message to local state
      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
      removeFile();

      // Stop typing indicator
      socket.emit("stop typing", {
        groupId: selectedGroup?._id,
      });
      setIsTyping(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  // Get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith("image/")) {
      return "🖼️";
    }
    return "📎";
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format date and time with proper AM/PM
  const formatDateTime = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    const diffInDays = (now - date) / (1000 * 60 * 60 * 24);

    // Format time with AM/PM
    const timeString = date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // If same day, show only time
    if (diffInHours < 24) {
      return timeString;
    }
    // If within 7 days, show day and time
    else if (diffInDays < 7) {
      const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
      return `${dayName} ${timeString}`;
    }
    // If older, show date and time
    else {
      const dateString = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${dateString} ${timeString}`;
    }
  };

  // handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && selectedGroup && socketConnected) {
      setIsTyping(true);
      socket.emit("typing", {
        username: currentUser.username,
        groupId: selectedGroup?._id,
      });
    }

    // clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedGroup && socketConnected) {
        socket.emit("stop typing", {
          groupId: selectedGroup?._id,
        });
      }
      setIsTyping(false);
    }, 2000);
  };

  // Render message content based on type
  const renderMessageContent = (message) => {
    if (message.messageType === "image") {
      return (
        <div className="space-y-2">
          {message.content && (
            <span className="break-words text-sm sm:text-base">
              {message.content}
            </span>
          )}
          <div className="relative group">
            <img
              src={message.file.url}
              alt={message.file.originalName}
              className="max-w-full max-h-64 rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(message.file.url, "_blank")}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
              <FiDownload className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl" />
            </div>
          </div>
        </div>
      );
    }

    return (
      <span className="break-words text-sm sm:text-base">
        {message.content}
      </span>
    );
  };

  return (
    <div className="flex h-full relative bg-gray-50 overflow-hidden">
      {/* Connection Status Indicator */}
      {!socketConnected && (
        <div className="absolute top-2 right-2 z-20 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
          Connecting...
        </div>
      )}

      {/* Chat Area - Fixed layout */}
      <div className="flex-1 flex flex-col bg-white lg:max-w-[calc(100%-260px)] overflow-hidden">
        {/* Chat Header - Fixed */}
        {selectedGroup ? (
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-sm">
                <FiMessageCircle className="text-white text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                  {selectedGroup.name}
                </div>
                <div className="text-sm text-gray-500 truncate mt-1">
                  {selectedGroup.description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowUsersList(!showUsersList)}
                className="lg:hidden p-2 sm:p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
                title="Toggle Users List"
              >
                <FiUsers className="text-gray-600 text-lg sm:text-xl" />
              </button>
              <button className="p-2 sm:p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 flex-shrink-0">
                <FiInfo className="text-gray-400 text-lg sm:text-xl hover:text-blue-500 transition-colors" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative bg-gray-50 messages-scrollbar">
          {selectedGroup ? (
            <>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`max-w-[85%] sm:max-w-[80%] lg:max-w-[65%] xl:max-w-[60%] message-bubble ${
                      message.sender._id === currentUser.id
                        ? "self-end"
                        : "self-start"
                    }`}
                  >
                    <div className="flex flex-col gap-2">
                      {/* User info and timestamp */}
                      <div
                        className={`flex items-center gap-2 ${
                          message.sender._id === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.sender._id === currentUser.id ? (
                          <>
                            <span className="text-xs text-gray-500 font-medium">
                              You
                            </span>
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
                              {message.sender.username[0].toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold shadow-sm">
                              {message.sender.username[0].toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-600 font-semibold">
                              {message.sender.username}
                            </span>
                          </>
                        )}
                        <span className="text-xs text-gray-400 font-medium">
                          {formatDateTime(message.createdAt)}
                        </span>
                      </div>

                      {/* Message content */}
                      <div
                        className={`p-3 sm:p-4 rounded-2xl shadow-sm border ${
                          message.sender._id === currentUser.id
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-400"
                            : "bg-white text-gray-800 border-gray-200 hover:border-gray-300"
                        } transition-all duration-200`}
                      >
                        {/* Text content */}
                        {message.content && (
                          <div className="break-words text-sm sm:text-base leading-relaxed mb-3">
                            {message.content}
                          </div>
                        )}

                        {/* File attachment */}
                        {message.file && (
                          <div className="mt-3">
                            {message.messageType === "image" ? (
                              <div className="relative group">
                                <img
                                  src={message.file.url}
                                  alt={message.file.originalName}
                                  className="max-w-full max-h-80 rounded-xl cursor-pointer hover:opacity-95 transition-all duration-200 shadow-md"
                                  onClick={() =>
                                    window.open(message.file.url, "_blank")
                                  }
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200 rounded-xl flex items-center justify-center">
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                                    Click to view full size
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all duration-200 cursor-pointer group"
                                onClick={() =>
                                  window.open(message.file.url, "_blank")
                                }
                              >
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                                  <div className="text-2xl">
                                    {getFileIcon(message.file.mimeType)}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">
                                    {message.file.originalName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatFileSize(message.file.size)}
                                  </p>
                                </div>
                                <div className="text-blue-500 group-hover:text-blue-600 transition-colors">
                                  <FiDownload className="w-5 h-5" />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <FiMessageCircle className="text-3xl sm:text-4xl text-blue-400" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold mb-3 text-gray-700">
                    No messages yet
                  </div>
                  <div className="text-sm sm:text-base max-w-md mx-auto text-gray-500 leading-relaxed">
                    Start the conversation by sending the first message!
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="self-start max-w-[85%] sm:max-w-[80%] lg:max-w-[65%] xl:max-w-[60%] animate-fadeIn">
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 font-medium">
                      {Array.from(typingUsers).join(", ")}{" "}
                      {typingUsers.size === 1 ? "is" : "are"} typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 select-none">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                <FiUsers className="text-3xl sm:text-4xl text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-3 text-gray-700">
                No Group Selected
              </div>
              <div className="text-sm sm:text-base max-w-md mx-auto text-gray-500 leading-relaxed">
                Please select a group from the sidebar to start chatting in
                ChatVerse.
                <br />
                You can join or create a group to begin your conversation!
              </div>
            </div>
          )}
        </div>

        {/* Message Input - Fixed */}
        {selectedGroup ? (
          <form
            onSubmit={sendMessage}
            className="p-4 sm:p-6 bg-white border-t border-gray-200 relative z-10 flex-shrink-0"
          >
            {/* File Preview */}
            {selectedFile && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {filePreview ? (
                      <img
                        src={filePreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center shadow-sm">
                        <div className="text-2xl">
                          {getFileIcon(selectedFile.type)}
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-800 truncate max-w-48">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-200"
                  >
                    <FiX className="text-lg" />
                  </button>
                </div>
              </div>
            )}

            <div className="relative">
              <input
                className="w-full py-3 sm:py-4 pl-4 sm:pl-6 pr-24 sm:pr-28 bg-gray-50 border-2 border-gray-200 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-2xl text-sm sm:text-base transition-all duration-200 placeholder-gray-500"
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleTyping}
                disabled={!selectedGroup || loading || !socketConnected}
              />

              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!selectedGroup || loading || !socketConnected}
                className="absolute right-20 sm:right-24 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach image"
              >
                <FiPaperclip className="text-lg sm:text-xl" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />

              <button
                type="submit"
                disabled={
                  !selectedGroup ||
                  loading ||
                  (!newMessage.trim() && !selectedFile) ||
                  !socketConnected
                }
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-xl"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiSend className="text-lg sm:text-xl" />
                )}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* UsersList - Desktop - Fixed */}
      <div className="hidden lg:block w-[260px] sticky right-0 top-0 h-full flex-shrink-0 overflow-hidden">
        {selectedGroup && <UsersList users={connectedUsers} />}
      </div>

      {/* UsersList - Mobile Overlay with Blur */}
      {showUsersList && selectedGroup && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 mobile-overlay-backdrop"
            onClick={() => setShowUsersList(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[280px] sm:w-80 bg-white shadow-2xl animate-slideInRight overflow-hidden">
            <UsersList users={connectedUsers} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
