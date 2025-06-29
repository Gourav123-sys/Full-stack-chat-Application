import { useEffect, useState, useRef } from "react";
import { FiSend, FiInfo, FiMessageCircle, FiUsers } from "react-icons/fi";
import UsersList from "./UsersList";
import axios from "axios";
import { toast } from "react-toastify";

const ChatArea = ({ selectedGroup, socket }) => {
  const [messages, setMessages] = useState([]);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
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
        `https://full-stack-chat-application-zz0h.onrender.com/api/messages/${selectedGroup._id}`,
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      setMessages(data);
    } catch {
      toast.error("Failed to fetch messages");
    }
  };

  // Fetch messages for the selected group
  useEffect(() => {
    if (selectedGroup && socket) {
      fetchMessages();
      socket.emit("join room", selectedGroup?._id);
      socket.on("message recieved", (newMessage) => {
        setMessages((prev) => [...prev, newMessage]);
      });

      socket.on("Users in room", (users) => {
        setConnectedUsers(users);
      });

      socket.on("user joined", (user) => {
        setConnectedUsers((prev) => [...prev, user]);
      });

      socket.on("user left", (userId) => {
        setConnectedUsers((prev) =>
          prev.filter((user) => user?._id !== userId)
        );
      });

      socket.on("notification", (notification) => {
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });

      socket.on("user typing", ({ username }) => {
        setTypingUsers((prev) => new Set(prev).add(username));
      });

      socket.on("user stop typing", ({ username }) => {
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
  }, [selectedGroup, socket]);

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedGroup) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://full-stack-chat-application-zz0h.onrender.com/api/messages",
        {
          content: newMessage,
          groupId: selectedGroup?._id,
        },
        {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        }
      );
      socket.emit("new message", {
        ...data,
        groupId: selectedGroup?._id,
      });
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
      // Stop typing indicator
      socket.emit("stop typing", {
        groupId: selectedGroup?._id,
      });
      setIsTyping(false);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping && selectedGroup) {
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
      if (selectedGroup) {
        socket.emit("stop typing", {
          groupId: selectedGroup?._id,
        });
      }
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex h-full relative">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50 max-w-[calc(100%-260px)]">
        {/* Chat Header */}
        {selectedGroup ? (
          <div className="flex items-center px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
            <FiMessageCircle className="text-blue-500 text-2xl mr-3" />
            <div className="flex-1">
              <div className="text-lg font-bold text-gray-800">
                {selectedGroup ? selectedGroup.name : "Select a group"}
              </div>
              <div className="text-sm text-gray-500">
                {selectedGroup ? selectedGroup.description : ""}
              </div>
            </div>
            <FiInfo className="text-gray-400 text-xl cursor-pointer hover:text-blue-500" />
          </div>
        ) : null}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-4 px-6 py-4 relative scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
          {selectedGroup ? (
            <>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`max-w-[70%] ${
                      message.sender._id === currentUser.id
                        ? "self-end"
                        : "self-start"
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <div
                        className={`flex items-center mb-1 gap-2 ${
                          message.sender._id === currentUser.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.sender._id === currentUser.id ? (
                          <>
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {message.sender.username[0]}
                            </div>
                            <span className="text-xs text-gray-500">You</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-gray-500">
                              {message.sender.username}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                              {message.sender.username[0]}
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        className={`p-3 rounded-lg shadow-sm ${
                          message.sender._id === currentUser.id
                            ? "bg-blue-500 text-white"
                            : "bg-white text-gray-800"
                        }`}
                      >
                        <span>{message.content}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1 ml-1">
                        {message.createdAt
                          ? formatDateTime(message.createdAt)
                          : ""}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400">
                  No messages yet.
                </div>
              )}
              {typingUsers.size > 0 && (
                <div className="self-start max-w-[70%]">
                  <div className="flex items-center gap-2 p-2">
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
                    <span className="text-xs text-gray-500">
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
              <FiUsers className="text-6xl text-blue-300 mb-4" />
              <div className="text-2xl font-bold mb-2">No Group Selected</div>
              <div className="text-md max-w-md mx-auto">
                Please select a group from the sidebar to start chatting.
                <br />
                You can join or create a group to begin your conversation!
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedGroup ? (
          <form
            onSubmit={sendMessage}
            className="p-4 bg-white border-t border-gray-200 relative z-10"
          >
            <div className="relative">
              <input
                className="w-full py-3 pl-4 pr-20 bg-gray-50 border-none focus:outline-none focus:bg-gray-100 rounded-lg text-base"
                placeholder={
                  selectedGroup
                    ? "Type your message..."
                    : "Select a group to chat"
                }
                value={newMessage}
                onChange={handleTyping}
                disabled={!selectedGroup || loading}
              />
              <button
                type="submit"
                disabled={!selectedGroup || loading || !newMessage.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-16 flex items-center justify-center bg-blue-500 text-white rounded-full hover:translate-y-[-2px] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiSend />
              </button>
            </div>
          </form>
        ) : null}
      </div>

      {/* UsersList with fixed width */}
      <div className="w-[260px] sticky right-0 top-0 h-full flex-shrink-0">
        {selectedGroup && <UsersList users={connectedUsers} />}
      </div>
    </div>
  );
};

export default ChatArea;
