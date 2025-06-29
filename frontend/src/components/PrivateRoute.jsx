import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  // Check if user is authenticated
  if (!userInfo.token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
