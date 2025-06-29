import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
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

      const { data } = await axios.get("http://localhost:5000/api/groups", {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
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
        "http://localhost:5000/api/groups",
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
        `http://localhost:5000/api/groups/${groupId}/join`,
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
        `http://localhost:5000/api/groups/${groupId}/leave`,
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
    <div className="h-full bg-white border-r border-gray-200 w-[300px] flex flex-col relative">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10 backdrop-blur">
        <div className="flex items-center">
          <FiUsers className="text-blue-500 text-2xl mr-2" />
          <span className="text-xl font-bold text-gray-800">Groups</span>
        </div>
        {isAdmin && (
          <button
            className="p-2 rounded-full hover:bg-blue-100 transition"
            title="Create New Group"
            onClick={() => setIsOpen(true)}
          >
            <FiPlus className="text-blue-500 text-lg" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 mb-16">
        <div className="flex flex-col gap-3">
          {groups.map((group) => {
            const isJoined = userGroups.includes(group?._id);
            return (
              <div
                key={group._id}
                className={`p-4 cursor-pointer rounded-lg border transition-all ${
                  isJoined
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                } hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300`}
              >
                <div className="flex justify-between items-center">
                  <div
                    className="flex-1"
                    onClick={() => isJoined && setSelectedGroup(group)}
                  >
                    <div className="flex items-center mb-2">
                      <span className="font-bold text-gray-800">
                        {group.name}
                      </span>
                      {isJoined && (
                        <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700">
                          Joined!!!
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 line-clamp-2">
                      {group.description}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      isJoined
                        ? handleLeaveGroup(group._id)
                        : handleJoinGroup(group._id);
                    }}
                    disabled={actionLoading === group._id}
                    className={`ml-3 px-3 py-1 text-sm font-medium rounded transition-all flex items-center justify-center gap-2 ${
                      isJoined
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    } ${
                      actionLoading === group._id
                        ? "opacity-70 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {actionLoading === group._id ? (
                      <svg
                        className="animate-spin h-4 w-4 mr-1 text-current"
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
          })}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50 absolute bottom-0 left-0 right-0 w-full">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 rounded hover:bg-red-50 text-red-600 font-medium transition shadow hover:-translate-y-0.5"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() => setIsOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">Create New Group</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Group Name
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Description
              </label>
              <input
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-400"
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
              />
            </div>
            <button
              className="w-full bg-blue-500 text-white py-2 rounded mt-2 hover:bg-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={handleCreateGroup}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Group"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
