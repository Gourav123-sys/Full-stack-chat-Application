import { FiUsers, FiWifi } from "react-icons/fi";

const UsersList = ({ users }) => {
  return (
    <div className="h-full bg-white border-l border-gray-200 flex flex-col shadow-lg overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 sticky top-0 z-10 flex-shrink-0">
        <div className="flex items-center min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
            <FiWifi className="text-white text-lg sm:text-xl" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
              Online Users
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {users?.length || 0} {users?.length === 1 ? "user" : "users"}{" "}
              connected
            </p>
          </div>
        </div>
      </div>

      {/* Users List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4">
        {users && users.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {users.map((user) => (
              <div
                key={user?.id || user?._id}
                className="flex items-center p-2 sm:p-3 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-fadeIn"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                </div>
                <div className="ml-2 sm:ml-3 flex-1 min-w-0">
                  <div className="font-medium text-gray-800 text-sm sm:text-base truncate">
                    {user.username}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium truncate flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Online now
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <FiUsers className="text-3xl sm:text-4xl text-gray-300 mb-2 sm:mb-3" />
            <div className="text-sm sm:text-base font-medium mb-1">
              No users online
            </div>
            <div className="text-xs sm:text-sm text-gray-400">
              Users will appear here when they join
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;
