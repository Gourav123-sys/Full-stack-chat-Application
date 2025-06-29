import { Link } from "react-router-dom";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "https://full-stack-chat-application-zz0h.onrender.com/api/users/login",
        {
          email,
          password,
        }
      );
      // Save user into localstorage
      localStorage.setItem("userInfo", JSON.stringify(data.user));
      toast.success("Login Successful");
      setLoading(false);
      navigate("/chat");
    } catch (err) {
      toast.error(err.response?.data?.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="flex w-[95%] md:w-[90%] lg:w-[80%] xl:w-[75%] max-w-[1200px] h-auto md:h-auto lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
        {/* Left Panel - Hidden on mobile */}
        <div
          className="hidden lg:flex w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1579548122080-c35fd6820ecb')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-center p-10 text-white">
            <div className="text-4xl font-bold mb-4">Welcome Back</div>
            <div className="text-lg max-w-[400px]">
              Stay connected with friends and family through instant messaging
            </div>
          </div>
        </div>
        {/* Right Panel - Login Form */}
        <div className="w-full lg:w-1/2 bg-white p-6 md:p-8 lg:p-10 flex flex-col justify-center">
          <div className="block lg:hidden text-center mb-6">
            <FiLogIn className="mx-auto text-3xl text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-800">Welcome Back</div>
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6 w-full max-w-[400px] mx-auto"
          >
            <div>
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
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
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 text-white rounded-lg text-md font-medium flex items-center justify-center gap-2 hover:bg-blue-600 transition disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FiLogIn /> {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="text-gray-600 text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Register now
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
