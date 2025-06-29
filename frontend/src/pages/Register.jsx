import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/register",
        {
          username,
          email,
          password,
        }
      );
      toast.success("Registration Successful");
      setLoading(false);
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500">
      <div className="flex w-[95%] md:w-[90%] lg:w-[80%] xl:w-[75%] max-w-[1200px] h-auto md:h-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Panel - Hidden on mobile */}
        <div
          className="hidden lg:flex w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center p-10 text-white">
            <div className="text-4xl font-bold mb-4">
              Join Our Chat Community
            </div>
            <div className="text-lg max-w-[400px]">
              Connect with friends and start chatting instantly
            </div>
          </div>
        </div>
        {/* Right Panel - Registration Form */}
        <div className="w-full lg:w-1/2 bg-white p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="block lg:hidden text-center mb-6">
            <div className="text-2xl font-bold text-gray-800">
              Create Account
            </div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 w-full max-w-[400px] mx-auto"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-gray-700 font-medium mb-1"
              >
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                id="username"
                type="text"
                placeholder="Choose a username"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="email"
                type="email"
                placeholder="Enter your email"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-1"
              >
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                id="password"
                type="password"
                placeholder="Create a password"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full py-3 bg-purple-500 text-white rounded-lg text-md font-medium mt-4 hover:bg-purple-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-purple-500"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
            <div className="text-gray-600 text-center pt-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
