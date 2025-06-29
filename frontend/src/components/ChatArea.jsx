import { useEffect, useState, useRef } from "react";
import {
  FiSend,
  FiInfo,
  FiMessageCircle,
  FiUsers,
  FiSmile,
} from "react-icons/fi";
import UsersList from "./UsersList";
import axios from "axios";
import { toast } from "react-toastify";
import API_BASE_URL from "../config/api.js";

const ChatArea = ({ selectedGroup, socket }) => {
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [showUsersList, setShowUsersList] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
        `${API_BASE_URL}/api/messages/${selectedGroup._id}`,
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
        console.log("User joined:", user);
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
        console.log("User left:", userId);
        setConnectedUsers((prev) =>
          prev.filter((user) => user?._id !== userId)
        );
      });

      // Listen for notifications
      socket.on("notification", (notification) => {
        console.log("Notification:", notification);
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
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

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/messages`,
        {
          content: newMessage,
          groupId: selectedGroup?._id,
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );

      // Emit new message to socket
      socket.emit("new message", {
        ...data,
        groupId: selectedGroup?._id,
      });

      // Add message to local state
      setMessages((prev) => [...prev, data]);
      setNewMessage("");

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
    }
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
          <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
            <div className="flex items-center flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                <FiMessageCircle className="text-white text-lg sm:text-xl" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-bold text-gray-800 truncate">
                  {selectedGroup.name}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 truncate">
                  {selectedGroup.description}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setShowUsersList(!showUsersList)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                title="Toggle Users List"
              >
                <FiUsers className="text-gray-600 text-lg sm:text-xl" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0">
                <FiInfo className="text-gray-400 text-lg sm:text-xl hover:text-blue-500" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 sm:gap-4 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 relative">
          {selectedGroup ? (
            <>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`max-w-[90%] sm:max-w-[85%] lg:max-w-[70%] message-bubble ${
                      message.sender._id === currentUser.id
                        ? "self-end"
                        : "self-start"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className={`flex items-center mb-1 gap-1 sm:gap-2 ${
                          message.sender._id === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.sender._id === currentUser.id ? (
                          <>
                            <span className="text-xs text-gray-500">You</span>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                              {message.sender.username[0].toUpperCase()}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {message.sender.username[0].toUpperCase()}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {message.sender.username}
                            </span>
                          </>
                        )}
                      </div>
                      <div
                        className={`p-2 sm:p-3 rounded-2xl shadow-sm ${
                          message.sender._id === currentUser.id
                            ? "message-sent"
                            : "message-received"
                        }`}
                      >
                        <span className="break-words text-sm sm:text-base">
                          {message.content}
                        </span>
                      </div>
                      <div
                        className={`text-xs text-gray-400 mt-1 ${
                          message.sender._id === currentUser.id
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {formatDateTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <FiMessageCircle className="text-4xl sm:text-6xl text-gray-300 mb-3 sm:mb-4" />
                  <div className="text-lg sm:text-xl font-semibold mb-2">
                    No messages yet
                  </div>
                  <div className="text-xs sm:text-sm max-w-md mx-auto">
                    Start the conversation by sending the first message!
                  </div>
                </div>
              )}

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="self-start max-w-[90%] sm:max-w-[85%] lg:max-w-[70%] animate-fadeIn">
                  <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-100 rounded-2xl">
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
                    <span className="text-xs sm:text-sm text-gray-600 font-medium">
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
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <FiUsers className="text-2xl sm:text-4xl text-blue-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-700">
                No Group Selected
              </div>
              <div className="text-sm sm:text-md max-w-md mx-auto text-gray-500 leading-relaxed">
                Please select a group from the sidebar to start chatting.
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
            className="p-3 sm:p-4 bg-white border-t border-gray-200 relative z-10 flex-shrink-0"
          >
            <div className="relative">
              <input
                className="w-full py-2 sm:py-3 pl-3 sm:pl-4 pr-16 sm:pr-20 bg-gray-50 border-none focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-2xl text-sm sm:text-base transition-all duration-200"
                placeholder="Type your message..."
                value={newMessage}
                onChange={handleTyping}
                disabled={!selectedGroup || loading || !socketConnected}
              />
              <button
                type="submit"
                disabled={
                  !selectedGroup ||
                  loading ||
                  !newMessage.trim() ||
                  !socketConnected
                }
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
              >
                <FiSend className="text-sm sm:text-lg" />
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
