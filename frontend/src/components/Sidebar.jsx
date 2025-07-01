import { useEffect, useState } from "react";
import {
  FiLogOut,
  FiPlus,
  FiUsers,
  FiX,
  FiShield,
  FiCheck,
  FiClock,
  FiSettings,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { API_ENDPOINTS } from "../config/api.js";

const Sidebar = ({ setSelectedGroup, socket }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [isSecureGroup, setIsSecureGroup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [pendingRequests, setPendingRequests] = useState({});
  const [showPendingRequests, setShowPendingRequests] = useState(false);
  const [selectedGroupForRequests, setSelectedGroupForRequests] =
    useState(null);
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

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new groups
    socket.on("new group available", (data) => {
      console.log("New group available:", data);
      fetchGroups(); // Refresh groups list
      toast.info(
        `New group "${data.group.name}" created by ${data.createdBy.username}`
      );
    });

    // Listen for group updates (join/leave)
    socket.on("group updated", (data) => {
      console.log("Group updated:", data);
      fetchGroups(); // Refresh groups list

      if (data.action === "joined") {
        toast.success(`${data.user.username} joined "${data.groupName}"`);
      } else if (data.action === "left") {
        toast.info(`${data.user.username} left "${data.groupName}"`);
      }
    });

    // Listen for join requests
    socket.on("group join request", (data) => {
      console.log("Join request received:", data);
      if ((data.user?.id || data.user?._id) !== userInfo.id) {
        // Don't show for own requests
        toast.info(
          `${data.user.username} requested to join "${data.groupName}"`
        );
      }
      fetchGroups(); // Refresh to update pending requests
    });

    // Listen for join request status updates
    socket.on("join request status", (data) => {
      console.log("Join request status:", data);
      if ((data.user?.id || data.user?._id) === userInfo.id) {
        if (data.status === "approved") {
          toast.success(
            `Your request to join "${data.groupName}" was approved!`
          );
        } else if (data.status === "rejected") {
          toast.error(`Your request to join "${data.groupName}" was rejected.`);
        }
        fetchGroups(); // Refresh groups list
      }
    });

    return () => {
      socket.off("new group available");
      socket.off("group updated");
      socket.off("group join request");
      socket.off("join request status");
    };
  }, [socket, userInfo.id]);

  const fetchGroups = async () => {
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;

      const { data: groupsData } = await axios.get(API_ENDPOINTS.GROUPS, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      setGroups(groupsData);

      // Set user groups
      const userGroupIds = groupsData
        .filter((group) =>
          group.members.some(
            (member) => (member?.id || member?._id) === userInfo.id
          )
        )
        .map((group) => group._id);
      setUserGroups(userGroupIds);

      console.log("User groups after fetch:", userGroupIds);
      console.log(
        "Groups data:",
        groupsData.map((g) => ({
          id: g._id,
          name: g.name,
          isSecure: g.isSecure,
          members: g.members.map((m) => m?.id || m?._id),
          pendingMembers: g.pendingMembers.map(
            (p) => p.user?.id || p.user?._id
          ),
        }))
      );

      // Fetch pending requests for admin groups
      const adminGroups = groupsData.filter(
        (group) => (group.admin?.id || group.admin?._id) === userInfo.id
      );
      const requestsData = {};

      for (const group of adminGroups) {
        if (group.isSecure) {
          try {
            const { data: requests } = await axios.get(
              API_ENDPOINTS.PENDING_REQUESTS(group._id),
              {
                headers: { Authorization: `Bearer ${userInfo.token}` },
              }
            );
            requestsData[group._id] = requests;
          } catch (error) {
            console.error(
              `Failed to fetch pending requests for group ${group._id}:`,
              error
            );
          }
        }
      }
      setPendingRequests(requestsData);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
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
        API_ENDPOINTS.GROUPS,
        {
          name: newGroupName,
          description: newGroupDescription,
          isSecure: isSecureGroup,
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
      setIsSecureGroup(false);
      fetchGroups();
    } catch (error) {
      console.error("Failed to create group:", error);
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

      const group = groups.find((g) => g._id === groupId);
      if (!group) {
        toast.error("Group not found");
        return;
      }

      await axios.post(
        API_ENDPOINTS.JOIN_GROUP(groupId),
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        }
      );

      await fetchGroups();

      // Only set selected group if it's not a secure group or user is already a member
      if (!group.isSecure) {
        setSelectedGroup(groups.find((g) => g?._id === groupId));
        toast.success("Joined the group successfully");
      } else {
        toast.success("Join request sent! Waiting for admin approval.");
      }
    } catch (error) {
      console.error("Failed to join group:", error);
      const message = error.response?.data?.message || "Failed to join group";

      if (message.includes("Already requested")) {
        toast.info("Request already sent! Waiting for admin approval.");
      } else if (message.includes("Already a member")) {
        toast.info("You are already a member of this group.");
      } else {
        toast.error(message);
      }
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
        API_ENDPOINTS.LEAVE_GROUP(groupId),
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
      console.error("Failed to leave group:", error);
      toast.error(error.response?.data?.message || "Failed to leave group");
    } finally {
      setActionLoading("");
    }
  };

  const handleApproveRequest = async (groupId, userId) => {
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;

      await axios.post(
        API_ENDPOINTS.APPROVE_REQUEST(groupId, userId),
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      toast.success("Request approved successfully");
      await fetchGroups();
    } catch (error) {
      console.error("Failed to approve request:", error);
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (groupId, userId) => {
    try {
      const userInfo = checkAuth();
      if (!userInfo) return;

      await axios.post(
        API_ENDPOINTS.REJECT_REQUEST(groupId, userId),
        {},
        {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        }
      );

      toast.success("Request rejected successfully");
      await fetchGroups();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error(error.response?.data?.message || "Failed to reject request");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    if (setSelectedGroup) setSelectedGroup(null);
    navigate("/login");
  };

  const getTotalPendingRequests = () => {
    return Object.values(pendingRequests).reduce(
      (total, requests) => total + requests.length,
      0
    );
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
        <div className="flex items-center gap-2">
          {isAdmin && getTotalPendingRequests() > 0 && (
            <button
              onClick={() => setShowPendingRequests(true)}
              className="relative p-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 hover:scale-105 shadow-md flex-shrink-0"
              title="Pending Requests"
            >
              <FiClock className="text-lg" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getTotalPendingRequests()}
              </span>
            </button>
          )}
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
            {isAdmin && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full mt-1">
                <FiShield className="text-xs" />
                Admin
              </span>
            )}
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
              const isGroupAdmin =
                (group.admin?.id || group.admin?._id) === userInfo.id;
              const hasPendingRequests = pendingRequests[group._id]?.length > 0;

              // Check if user has a pending request for this group
              const hasPendingRequest = group.pendingMembers?.some(
                (member) =>
                  (member.user?.id || member.user?._id) === userInfo.id
              );

              // User can interact with group if they're joined or admin (NOT pending requests)
              const canInteract = isJoined || isGroupAdmin;

              return (
                <div
                  key={group._id}
                  className={`card p-3 sm:p-4 transition-all duration-200 hover:shadow-lg ${
                    canInteract ? "cursor-pointer" : "cursor-not-allowed"
                  } ${
                    isJoined
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                      : hasPendingRequest
                      ? "bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200"
                      : "bg-white border-gray-200"
                  } ${canInteract ? "hover:-translate-y-1" : ""}`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div
                      className="flex-1 min-w-0"
                      onClick={() => {
                        if (canInteract) {
                          setSelectedGroup(group);
                        } else if (hasPendingRequest) {
                          toast.info(
                            "You need admin approval to enter this secure group."
                          );
                        }
                      }}
                    >
                      <div className="flex items-center mb-2 gap-2">
                        <span className="font-bold text-gray-800 text-base sm:text-lg break-words whitespace-pre-line max-h-16 overflow-y-auto">
                          {group.name}
                        </span>
                        {group.isSecure && (
                          <FiShield
                            className="text-orange-500 text-sm"
                            title="Secure Group"
                          />
                        )}
                        {isJoined && (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700 font-medium flex-shrink-0">
                            ✓ Joined
                          </span>
                        )}
                        {hasPendingRequest && (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 font-medium flex-shrink-0">
                            ⏳ Pending
                          </span>
                        )}
                        {isGroupAdmin && (
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 font-medium flex-shrink-0">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 break-words whitespace-pre-line leading-relaxed max-h-24 overflow-y-auto">
                        {group.description}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <FiUsers className="mr-1" />
                        {group.members?.length || 0} members
                        {hasPendingRequests && (
                          <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                            {pendingRequests[group._id].length} pending
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {isGroupAdmin && hasPendingRequests && (
                        <button
                          onClick={() => {
                            setSelectedGroupForRequests(group);
                            setShowPendingRequests(true);
                          }}
                          className="px-2 py-1 text-xs bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                        >
                          Review
                        </button>
                      )}
                      <button
                        onClick={() => {
                          if (isJoined) {
                            handleLeaveGroup(group._id);
                          } else if (hasPendingRequest) {
                            toast.info(
                              "Request already sent! Waiting for admin approval."
                            );
                          } else {
                            handleJoinGroup(group._id);
                          }
                        }}
                        disabled={actionLoading === group._id}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1 sm:gap-2 flex-shrink-0 ${
                          isJoined
                            ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                            : hasPendingRequest
                            ? "bg-gray-50 text-gray-500 border border-gray-200 cursor-not-allowed"
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
                        {isJoined
                          ? "Leave"
                          : hasPendingRequest
                          ? "Pending"
                          : group.isSecure
                          ? "Request"
                          : "Join"}
                      </button>
                    </div>
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
                  className="input-field text-sm sm:text-base resize-none"
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Enter group description"
                  rows="3"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="secureGroup"
                  checked={isSecureGroup}
                  onChange={(e) => setIsSecureGroup(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="secureGroup"
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  <FiShield className="text-orange-500" />
                  Secure Group (Admin approval required)
                </label>
              </div>
              <button
                onClick={handleCreateGroup}
                disabled={
                  loading || !newGroupName.trim() || !newGroupDescription.trim()
                }
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pending Requests Modal */}
      {showPendingRequests && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-4 sm:p-6 relative animate-fadeIn max-h-[80vh] overflow-hidden flex flex-col">
            <button
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-xl p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                setShowPendingRequests(false);
                setSelectedGroupForRequests(null);
              }}
              aria-label="Close"
            >
              <FiX />
            </button>
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <FiClock className="text-white text-xl sm:text-2xl" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                Pending Requests
              </h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Review join requests for secure groups
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedGroupForRequests ? (
                <div>
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800">
                      {selectedGroupForRequests.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroupForRequests.description}
                    </p>
                  </div>

                  {pendingRequests[selectedGroupForRequests._id]?.length > 0 ? (
                    <div className="space-y-3">
                      {pendingRequests[selectedGroupForRequests._id].map(
                        (request) => (
                          <div
                            key={request.user._id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {request.user.username[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm">
                                  {request.user.username}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {request.user.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleApproveRequest(
                                    selectedGroupForRequests._id,
                                    request.user._id
                                  )
                                }
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Approve"
                              >
                                <FiCheck className="text-lg" />
                              </button>
                              <button
                                onClick={() =>
                                  handleRejectRequest(
                                    selectedGroupForRequests._id,
                                    request.user._id
                                  )
                                }
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Reject"
                              >
                                <FiX className="text-lg" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FiClock className="text-4xl text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">
                        No pending requests for this group
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(pendingRequests).map(
                    ([groupId, requests]) => {
                      const group = groups.find((g) => g._id === groupId);
                      if (!group || requests.length === 0) return null;

                      return (
                        <div
                          key={groupId}
                          className="p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-800">
                                {group.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {requests.length} pending request
                                {requests.length > 1 ? "s" : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedGroupForRequests(group)}
                              className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
