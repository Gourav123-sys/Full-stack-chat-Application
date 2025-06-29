import { FiUsers, FiCircle } from "react-icons/fi";

const UsersList = ({ users, onlineUserIds = [] }) => {
  return (
    <div className="h-full w-full border-l border-gray-200 bg-white relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center p-5 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <FiUsers className="text-blue-500 text-xl mr-2" />
        <span className="text-lg font-bold text-gray-700">Members</span>
        <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">
          {users.length}
        </span>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {users.map((user) => {
            const isOnline =
              onlineUserIds.length === 0 || onlineUserIds.includes(user._id);
            return (
              <div key={user._id || user.id} className="group">
                <div className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
                    {user.username[0]}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-700 truncate block">
                      {user.username}
                    </span>
                  </div>
                  <div
                    className={`flex items-center px-2 py-1 rounded-full ml-2 ${
                      isOnline ? "bg-green-50" : "bg-gray-100"
                    }`}
                  >
                    <FiCircle
                      className={`text-xs mr-1 ${
                        isOnline ? "text-green-400" : "text-gray-400"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        isOnline ? "text-green-600" : "text-gray-500"
                      }`}
                    >
                      {isOnline ? "online" : "offline"}
                    </span>
                  </div>
                </div>
                {/* Tooltip (simple) */}
                <div className="hidden group-hover:block absolute ml-2 mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 z-20">
                  {user.username} is {isOnline ? "online" : "offline"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UsersList;
