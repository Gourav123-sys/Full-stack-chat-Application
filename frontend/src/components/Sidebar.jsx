import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const Sidebar = ({ setSelectedGroup }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const navigate = useNavigate();
  const [userInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("userInfo") || "{}");
    } catch {
      return {};
    }
  });

  const checkAuth = () => {
    if (!userInfo?.token) {
      navigate("/login");
      return null;
    }
    return userInfo;
  };

  const checkAdminStatus = () => {
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;
      setIsAdmin(userInfo?.isAdmin || false);
    } catch (err) {
      console.error("Error checking admin status:", err);
      setIsAdmin(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;

      const { data } = await axios.get(
        "https://full-stack-chat-application-zz0h.onrender.com/api/groups",
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      setGroups(data);

      const userGroupIds = data
        .filter((group) =>
          group.members.some((member) => member._id === userInfo.id)
        )
        .map((group) => group._id);
      setUserGroups(userGroupIds);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch groups");
    }
  };

  useEffect(() => {
    checkAdminStatus();
    fetchGroups();
  }, []);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;

      await axios.post(
        "https://full-stack-chat-application-zz0h.onrender.com/api/groups",
        {
          name: newGroupName,
          description: newGroupDescription,
        },
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      toast.success("Group created successfully");
      setIsOpen(false);
      setNewGroupName("");
      setNewGroupDescription("");
      fetchGroups();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    setActionLoading(groupId);
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;
      await axios.post(
        `https://full-stack-chat-application-zz0h.onrender.com/api/groups/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(groups.find((g) => g?._id === groupId));
      toast.success("Joined the group successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to join group");
    } finally {
      setActionLoading("");
    }
  };

  const handleLeaveGroup = async (groupId) => {
    setActionLoading(groupId);
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;
      await axios.post(
        `https://full-stack-chat-application-zz0h.onrender.com/api/groups/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );
      await fetchGroups();
      setSelectedGroup(null);
      toast.success("Left the group successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to leave group");
    } finally {
      setActionLoading("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    if (setSelectedGroup) setSelectedGroup(null);
    navigate("/login");
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 w-full flex flex-col relative shadow-lg overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <FiUsers className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Groups
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              Join conversations
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 hover:scale-105 shadow-md flex-shrink-0"
            title="Create New Group"
            onClick={() => setIsOpen(true)}
          >
            <FiPlus className="text-lg" />
          </button>
        )}
      </div>

      {/* User Info - Fixed */}
      <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-2 sm:mr-3 flex-shrink-0">
            {userInfo?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">
              {userInfo?.username || "User"}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {userInfo?.email || "user@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Groups List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        <div className="flex flex-col gap-3">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <FiUsers className="text-4xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No groups available</p>
            </div>
          ) : (
            groups.map((group) => {
              const isJoined = userGroups.includes(group?._id);
              return (
                <div
                  key={group._id}
                  className={`card p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    isJoined
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                      : "bg-white border-gray-200"
                  } hover:-translate-y-1`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => isJoined && setSelectedGroup(group)}
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <span className="font-bold text-gray-800 text-base sm:text-lg truncate">
                          {group.name}
                        </span>
                        {isJoined && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                            ✓ Joined
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <FiUsers className="mr-1" />
                        {group.members?.length || 0} members
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        isJoined
                          ? handleLeaveGroup(group._id)
                          : handleJoinGroup(group._id);
                      }}
                      disabled={actionLoading === group._id}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${
                        isJoined
                          ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                          : "btn-primary"
                      } ${
                        actionLoading === group._id
                          ? "opacity-70 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {actionLoading === group._id ? (
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      ) : null}
                      {isJoined ? "Leave" : "Join"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Logout Button - Fixed */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all duration-200 hover:shadow-md text-sm sm:text-base"
        >
          <FiLogOut className="text-base sm:text-lg" />
          Logout
        </button>
      </div>

      {/* Create Group Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-xl p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              <FiX />
            </button>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiPlus className="text-white text-xl sm:text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Create New Group
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Start a new conversation
              </p>
            </div>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Group Name
                </label>
                <input
                  className="input-field text-sm sm:text-base"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">
                  Description
                </label>
                <textarea
                  className="input-field resize-none text-sm sm:text-base"
                  rows="3"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                />
              </div>
              <button
                className="w-full btn-primary mt-4 sm:mt-6 py-3 sm:py-4 text-sm sm:text-base"
                onClick={handleCreateGroup}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
