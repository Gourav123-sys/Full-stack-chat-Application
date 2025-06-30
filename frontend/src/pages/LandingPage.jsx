import { Link as RouterLink } from "react-router-dom";
import {
  FiMessageSquare,
  FiUsers,
  FiLock,
  FiLogIn,
  FiLogOut,
  FiUserPlus,
  FiGlobe,
  FiActivity,
  FiCheckCircle,
  FiUserCheck,
  FiArrowRight,
  FiStar,
} from "react-icons/fi";

const Feature = ({ title, text, icon, badges = [] }) => (
  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
        {icon}
      </div>
      <div className="flex gap-2">
        {badges.map((badge, index) => (
          <span
            key={index}
            className={`px-2 py-1 text-xs rounded-full font-medium ${
              badge.color === "green"
                ? "bg-green-100 text-green-700"
                : badge.color === "blue"
                ? "bg-blue-100 text-blue-700"
                : badge.color === "purple"
                ? "bg-purple-100 text-purple-700"
                : badge.color === "orange"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {badge.text}
          </span>
        ))}
      </div>
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{text}</p>
  </div>
);

const ChatMessage = ({ message, sender, time, isUser }) => (
  <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-sm ${
        isUser
          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
          : "bg-white text-gray-800 border border-gray-100"
      }`}
    >
      <div className="font-semibold text-sm mb-1">{sender}</div>
      <div className="text-sm">{message}</div>
      <div
        className={`text-xs mt-2 ${isUser ? "text-white/70" : "text-gray-500"}`}
      >
        {time}
      </div>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center space-y-12 lg:space-y-0 lg:space-x-16 py-20 lg:py-28">
          <div className="flex-1 space-y-8 text-center lg:text-left">
            <div className="space-y-4">
              <h1 className="font-bold leading-tight text-5xl sm:text-6xl lg:text-7xl">
                <span className="relative inline-block text-gray-800">
                  Welcome to
                  <span className="absolute left-0 bottom-2 w-full h-3 bg-gradient-to-r from-blue-400 to-indigo-500 -z-10 rounded-full opacity-30"></span>
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  ChatVerse
                </span>
              </h1>
              <p className="text-gray-600 text-xl lg:text-2xl leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Experience seamless group communication with our modern chat
                platform. Connect with teams, friends, and communities in
                real-time with advanced features.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <RouterLink
                to="/register"
                className="btn-primary px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2"
              >
                <FiUserPlus className="text-xl" />
                Get Started Free
                <FiArrowRight className="text-lg" />
              </RouterLink>
              <RouterLink
                to="/login"
                className="btn-secondary px-8 py-4 text-lg font-semibold inline-flex items-center justify-center gap-2"
              >
                <FiLogIn className="text-xl" />
                Sign In
              </RouterLink>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">10K+</div>
                <div className="text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">500+</div>
                <div className="text-gray-600">Groups Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">99.9%</div>
                <div className="text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Chat Preview */}
          <div className="flex-1 flex justify-center items-center relative w-full max-w-2xl">
            <div className="relative h-[600px] w-full rounded-3xl shadow-2xl bg-white border border-gray-200 overflow-hidden animate-fadeIn">
              {/* Chat Header */}
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white border-b border-blue-600 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <FiUsers className="text-xl" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Team ChatVerse</span>
                    <div className="text-blue-100 text-sm">
                      3 members online
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm">Live</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex flex-col gap-4 p-6 pt-20 h-[calc(100%-140px)] overflow-y-auto">
                <ChatMessage
                  sender="Sarah Chen"
                  message="Hey team! Just pushed the new updates to staging. 🚀"
                  time="10:30 AM"
                  isUser={false}
                />
                <ChatMessage
                  sender="Alex Thompson"
                  message="Great work! The new features look amazing. Can't wait to test them!"
                  time="10:31 AM"
                  isUser={false}
                />
                <ChatMessage
                  sender="You"
                  message="Thanks! Let's review it in our next standup meeting."
                  time="10:32 AM"
                  isUser={true}
                />
                <div className="w-full text-center">
                  <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
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
                    <span>Sarah is typing...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-24">
          <div className="flex flex-col items-center mb-16 space-y-4 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4">
              <FiStar className="text-2xl text-white" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-800">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Everything you need for seamless team collaboration and
              communication
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={<FiLock className="w-8 h-8" />}
              title="Secure Authentication"
              badges={[{ text: "Secure", color: "green" }]}
              text="Register and login securely with email verification and encrypted passwords for maximum security."
            />
            <Feature
              icon={<FiUsers className="w-8 h-8" />}
              title="Group Management"
              badges={[{ text: "Real-time", color: "blue" }]}
              text="Create, join, or leave groups easily. Manage multiple conversations in one place with intuitive controls."
            />
            <Feature
              icon={<FiUserCheck className="w-8 h-8" />}
              title="Online Presence"
              badges={[{ text: "Live", color: "green" }]}
              text="See who's currently online and active in your groups in real-time with status indicators."
            />
            <Feature
              icon={<FiActivity className="w-8 h-8" />}
              title="Typing Indicators"
              badges={[{ text: "Interactive", color: "purple" }]}
              text="Know when others are typing with real-time typing indicators and animated feedback."
            />
            <Feature
              icon={<FiMessageSquare className="w-8 h-8" />}
              title="Instant Messaging"
              badges={[{ text: "Fast", color: "orange" }]}
              text="Send and receive messages instantly with real-time delivery and push notifications."
            />
            <Feature
              icon={<FiGlobe className="w-8 h-8" />}
              title="Global Access"
              badges={[{ text: "24/7", color: "blue" }]}
              text="Access your chats from anywhere, anytime with persistent connections and cloud sync."
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="py-24">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <div className="max-w-3xl mx-auto space-y-6">
              <h3 className="text-4xl lg:text-5xl font-bold">
                Ready to join ChatVerse?
              </h3>
              <p className="text-xl text-blue-100 leading-relaxed">
                Join thousands of users already using our platform for seamless
                communication
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <RouterLink
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
                >
                  <FiUserPlus className="text-xl" />
                  Create Free Account
                </RouterLink>
                <RouterLink
                  to="/login"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-xl text-lg transition-all duration-200 inline-flex items-center justify-center gap-2"
                >
                  <FiLogIn className="text-xl" />
                  Sign In
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Minimalist Footer */}
      <footer className="w-full py-6 bg-transparent flex justify-center items-center border-t border-gray-100 mt-12">
        <span className="text-gray-400 text-sm">
          © {new Date().getFullYear()} Gourav Mondal
        </span>
      </footer>
    </div>
  );
}
