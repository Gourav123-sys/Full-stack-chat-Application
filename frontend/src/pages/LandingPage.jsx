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
} from "react-icons/fi";

const Feature = ({ title, text, icon, badges = [] }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 hover:shadow-xl transition-all">
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-500 text-white text-2xl mb-2">
      {icon}
    </div>
    <div>
      <div className="flex items-center space-x-2 mb-2">
        <span className="font-semibold text-lg">{title}</span>
        {badges.map((badge, idx) => (
          <span
            key={idx}
            className={`px-2 rounded-full text-xs bg-${badge.color}-100 text-${badge.color}-700`}
          >
            {badge.text}
          </span>
        ))}
      </div>
      <p className="text-gray-500 dark:text-gray-200">{text}</p>
    </div>
  </div>
);

const ChatMessage = ({ message, sender, time, isUser }) => (
  <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
    <div
      className={`rounded-lg px-4 py-2 max-w-[80%] ${
        isUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="font-bold text-sm mb-1">{sender}</div>
      <div>{message}</div>
      <div
        className={`text-xs mt-1 ${isUser ? "text-white/70" : "text-gray-500"}`}
      >
        {time}
      </div>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto pt-10">
        <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-10 py-20 md:py-28">
          <div className="flex-1 space-y-10">
            <h1 className="font-bold leading-tight text-4xl sm:text-5xl lg:text-6xl">
              <span className="relative inline-block">
                MasynTech
                <span className="absolute left-0 bottom-1 w-full h-2 bg-blue-400 -z-10 rounded"></span>
              </span>
              <br />
              <span className="text-blue-400">Chat App</span>
            </h1>
            <p className="text-gray-500 text-xl">
              Experience seamless group communication with our modern chat
              platform. Connect with teams, friends, and communities in
              real-time with advanced features like typing indicators and online
              status.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <RouterLink
                to="/register"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-lg font-normal bg-blue-400 text-white hover:bg-blue-500 transition"
              >
                <FiUserPlus className="mr-2" /> Get Started
              </RouterLink>
              <RouterLink
                to="/login"
                className="inline-flex items-center justify-center rounded-full px-8 py-3 text-lg font-normal border border-blue-400 text-blue-400 hover:bg-blue-50 transition"
              >
                <FiLogIn className="mr-2" /> Sign In
              </RouterLink>
            </div>
          </div>
          {/* Chat Preview */}
          <div className="flex-1 flex justify-center items-center relative w-full">
            <div className="relative h-[500px] w-full rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="absolute top-0 left-0 right-0 bg-blue-500 p-4 text-white border-b border-blue-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiUsers />
                  <span className="font-bold">Team MasynTech</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                    3 online
                  </span>
                  <FiGlobe />
                </div>
              </div>
              {/* Chat Messages */}
              <div className="flex flex-col gap-4 p-4 pt-16 h-[calc(100%-120px)] overflow-y-auto">
                <ChatMessage
                  sender="Sarah Chen"
                  message="Hey team! Just pushed the new updates to staging."
                  time="10:30 AM"
                  isUser={false}
                />
                <ChatMessage
                  sender="Alex Thompson"
                  message="Great work! The new features look amazing 🚀"
                  time="10:31 AM"
                  isUser={false}
                />
                <ChatMessage
                  sender="You"
                  message="Thanks! Let's review it in our next standup."
                  time="10:32 AM"
                  isUser={true}
                />
                <div className="w-full text-center">
                  <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">
                    Sarah is typing...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Features Grid */}
        <div className="py-20">
          <div className="flex flex-col items-center mb-12 space-y-2 text-center">
            <h2 className="text-4xl font-bold">Powerful Features</h2>
            <p className="text-lg text-gray-500">
              Everything you need for seamless team collaboration
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 px-4 md:px-8">
            <Feature
              icon={<FiLock className="w-10 h-10" />}
              title="Secure Authentication"
              badges={[{ text: "Secure", color: "green" }]}
              text="Register and login securely with email verification and encrypted passwords."
            />
            <Feature
              icon={<FiUsers className="w-10 h-10" />}
              title="Group Management"
              badges={[{ text: "Real-time", color: "blue" }]}
              text="Create, join, or leave groups easily. Manage multiple conversations in one place."
            />
            <Feature
              icon={<FiUserCheck className="w-10 h-10" />}
              title="Online Presence"
              badges={[{ text: "Live", color: "green" }]}
              text="See who's currently online and active in your groups in real-time."
            />
            <Feature
              icon={<FiActivity className="w-10 h-10" />}
              title="Typing Indicators"
              badges={[{ text: "Interactive", color: "purple" }]}
              text="Know when others are typing with real-time typing indicators."
            />
            <Feature
              icon={<FiMessageSquare className="w-10 h-10" />}
              title="Instant Messaging"
              badges={[{ text: "Fast", color: "orange" }]}
              text="Send and receive messages instantly with real-time delivery and notifications."
            />
            <Feature
              icon={<FiGlobe className="w-10 h-10" />}
              title="Global Access"
              badges={[{ text: "24/7", color: "blue" }]}
              text="Access your chats from anywhere, anytime with persistent connections."
            />
          </div>
        </div>
        {/* Call to Action */}
        <div className="py-20">
          <div className="flex flex-col md:flex-row items-center justify-center gap-10 bg-blue-50 p-10 rounded-xl">
            <div className="flex flex-col items-start gap-4">
              <h3 className="text-2xl font-bold">Ready to get started?</h3>
              <p className="text-lg text-gray-600">
                Join thousands of users already using our platform
              </p>
            </div>
            <RouterLink
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 text-lg font-medium bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              <FiUserPlus className="mr-2" /> Create Free Account
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  );
}
