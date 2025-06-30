import { useEffect, useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
import { SOCKET_URL } from "../config/api.js";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const newSocket = io(SOCKET_URL, {
      auth: { user: userInfo },
      transports: ["websocket", "polling"],
      timeout: 20000,
    });

    // Add connection event listeners
    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay with Blur */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 mobile-overlay-backdrop z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar - Fixed */}
      <div
        className={`
        fixed lg:relative z-50 h-full
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        transition-transform duration-300 ease-in-out
        w-[280px] sm:w-[300px] lg:w-[320px]
        flex-shrink-0
      `}
      >
        <Sidebar
          setSelectedGroup={(group) => {
            setSelectedGroup(group);
            closeSidebar(); // Close sidebar on mobile when group is selected
          }}
          socket={socket}
        />
      </div>

      {/* Main Chat Area - Fixed height */}
      <div className="flex-1 flex flex-col lg:ml-0 min-w-0 h-full overflow-hidden">
        {/* Mobile Header - Fixed */}
        <div className="lg:hidden flex items-center justify-between p-3 sm:p-4 bg-white border-b border-gray-200 shadow-sm flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? (
              <FiX className="text-xl" />
            ) : (
              <FiMenu className="text-xl" />
            )}
          </button>
          <div className="flex-1 text-center min-w-0 px-2">
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
              {selectedGroup ? selectedGroup.name : "ChatVerse"}
            </h1>
          </div>
          <div className="w-10 flex-shrink-0"></div>{" "}
          {/* Spacer for centering */}
        </div>

        {/* Chat Area - Takes remaining space */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
        </div>
      </div>
    </div>
  );
};

export default Chat;
