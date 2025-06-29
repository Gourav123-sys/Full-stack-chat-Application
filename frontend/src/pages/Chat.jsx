import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatArea from "../components/ChatArea";
import io from "socket.io-client";
const ENDPOINT = "https://full-stack-chat-application-zz0h.onrender.com";

const Chat = () => {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
    const newSocket = io(ENDPOINT, {
      auth: { user: userInfo },
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-[300px] border-r border-gray-200">
        <Sidebar setSelectedGroup={setSelectedGroup} />
      </div>
      <div className="flex-1">
        {socket && <ChatArea selectedGroup={selectedGroup} socket={socket} />}
      </div>
    </div>
  );
};

export default Chat;
