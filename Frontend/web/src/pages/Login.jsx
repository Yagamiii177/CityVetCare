import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../pages/styles/Login.css";
import logo from "../assets/logo.png";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "staff",
  });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Login function
  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          userType: "admin", // Web login is always for admin users
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token if provided
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        if (data.role) {
          localStorage.setItem("role", data.role);
        }
        if (data.userId) {
          localStorage.setItem("userId", data.userId);
        }
        return { success: true };
      } else {
        return { success: false, error: data.message || "Login failed" };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, error: "Failed to connect to server" };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        // Navigate based on user role
        navigate("/vaccination-dashboard");
      } else {
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setCreateError("");
    setCreateSuccess("");

    // Validation
    if (
      !createForm.fullName ||
      !createForm.username ||
      !createForm.password ||
      !createForm.confirmPassword
    ) {
      setCreateError("Please fill in all fields");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setCreateError("Passwords do not match");
      return;
    }

    if (createForm.password.length < 4) {
      setCreateError("Password must be at least 4 characters");
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: createForm.fullName,
          username: createForm.username,
          password: createForm.password,
          role: createForm.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCreateSuccess("Account created successfully! You can now login.");
        setCreateForm({
          fullName: "",
          username: "",
          password: "",
          confirmPassword: "",
          role: "staff",
        });
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateSuccess("");
        }, 2000);
      } else {
        setCreateError(data.message || "Failed to create account");
      }
    } catch (err) {
      setCreateError("Error creating account. Please try again.");
      console.error("Create account error:", err);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="login-container flex items-center justify-center p-4 overflow-hidden">
      {/* Modern background pattern */}
      <div className="absolute inset-0 login-bg-pattern"></div>

      {/* Animated floating circles - Layer 1 */}
      <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-[#FA8630]/20 rounded-full animate-float-slow"></div>
      <div
        className="absolute top-1/3 right-1/4 w-6 h-6 bg-[#FA8630]/15 rounded-full animate-float-medium"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div
        className="absolute bottom-1/4 left-1/3 w-10 h-10 bg-[#FA8630]/10 rounded-full animate-float-slow"
        style={{ animationDelay: "3s" }}
      ></div>

      {/* Layer 2 - More circles */}
      <div className="absolute top-10 left-10 w-4 h-4 bg-[#FA8630]/25 rounded-full animate-float-fast"></div>
      <div
        className="absolute top-20 right-20 w-7 h-7 bg-[#FA8630]/12 rounded-full animate-float-medium"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute bottom-32 left-20 w-5 h-5 bg-[#FA8630]/18 rounded-full animate-float-slow"
        style={{ animationDelay: "4s" }}
      ></div>
      <div
        className="absolute bottom-20 right-32 w-9 h-9 bg-[#FA8630]/08 rounded-full animate-float-fast"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Layer 3 - Even more circles */}
      <div
        className="absolute top-40 left-16 w-3 h-3 bg-[#FA8630]/20 rounded-full animate-float-medium"
        style={{ animationDelay: "2.5s" }}
      ></div>
      <div
        className="absolute top-16 right-40 w-6 h-6 bg-[#FA8630]/15 rounded-full animate-float-slow"
        style={{ animationDelay: "3.5s" }}
      ></div>
      <div
        className="absolute bottom-40 left-40 w-7 h-7 bg-[#FA8630]/10 rounded-full animate-float-fast"
        style={{ animationDelay: "0.5s" }}
      ></div>
      <div
        className="absolute bottom-16 right-16 w-4 h-4 bg-[#FA8630]/22 rounded-full animate-float-medium"
        style={{ animationDelay: "4.5s" }}
      ></div>

      {/* Moving background dots pattern */}
      <div className="absolute inset-0 moving-dots animate-pan"></div>

      <div className="max-w-sm w-full relative z-10">
        {/* Header Section - Improved Logo */}
        <div className="text-center mb-8">
          {/* Logo Container with Better Styling */}
          <div className="flex justify-center mb-4">
            <div className="relative logo-container">
              {/* Main Logo Container */}
              <div className="">
                {/* Logo Image */}
                <img
                  src={logo}
                  alt="City Vet Care Logo"
                  className="w-16 h-16 object-contain drop-shadow-sm"
                  onError={(e) => {
                    // Fallback to SVG if image fails to load
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "block";
                  }}
                />
                {/* Fallback SVG - Styled Better */}
                <svg
                  className="w-12 h-12 text-[#FA8630] hidden"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z M12,11.5c-1.38,0-2.5-1.12-2.5-2.5s1.12-2.5,2.5-2.5s2.5,1.12,2.5,2.5S13.38,11.5,12,11.5z" />
                </svg>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FA8630] to-[#FF9A52] rounded-full logo-decoration animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-gradient-to-br from-[#FA8630] to-[#FF9A52] rounded-full logo-decoration delay-150"></div>
            </div>
          </div>

          {/* Title and Subtitle */}
          <h1 className="text-5xl font-bold gradient-text mb-3">
            City Vet Care
          </h1>
          <div className="space-y-1">
            <p className="text-gray-700 font-medium text-sm">
              Anti Rabies Program
            </p>
            <p className="text-gray-500 text-xs">
              Naga City Veterinary Services
            </p>
          </div>
        </div>

        {/* Login Card */}
        <form onSubmit={handleSubmit} className="login-card overflow-hidden">
          <div className="login-header p-6 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 login-header-overlay"></div>
            <h2 className="text-xl font-bold relative z-10">Welcome Back</h2>
            <p className="text-white/90 text-sm mt-1 relative z-10">
              Sign in to continue
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                Username
              </label>
              <div className="relative input-group">
                <input
                  id="username"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 pl-11 login-input outline-none"
                  type="text"
                  placeholder="Enter username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 input-icon">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
              >
                Password
              </label>
              <div className="relative input-group">
                <input
                  id="password"
                  className="w-full border border-gray-200 rounded-xl py-3 px-4 pl-11 login-input outline-none"
                  type="password"
                  placeholder="Enter password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 input-icon">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 border border-transparent rounded-xl text-white font-semibold login-btn mt-4 ${
                isLoading ? "cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Create Account Button */}
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="w-full py-3 px-4 border-2 border-[#FA8630] rounded-xl text-[#FA8630] font-semibold hover:bg-[#FA8630]/10 transition-colors mt-3"
            >
              Create Account
            </button>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500">
              Need help?{" "}
              <a
                href="#"
                className="text-[#FA8630] hover:text-[#FF9A52] font-medium transition-colors"
              >
                Contact support
              </a>
            </p>
          </div>
        </form>

        {/* Additional Info */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure access to Naga City's Anti Rabies Management System
          </p>
        </div>

        {/* Create Account Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full animate-scale-in">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-[#FA8630] to-[#FF9A52] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">Create New Account</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                    setCreateSuccess("");
                  }}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
                {/* Error Message */}
                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                    {createError}
                  </div>
                )}

                {/* Success Message */}
                {createSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                    {createSuccess}
                  </div>
                )}

                {/* Full Name Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="create-fullname"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    Full Name
                  </label>
                  <input
                    id="create-fullname"
                    type="text"
                    placeholder="Enter full name"
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#FA8630] transition-colors"
                  />
                </div>

                {/* Username Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="create-username"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    Username
                  </label>
                  <input
                    id="create-username"
                    type="text"
                    placeholder="Enter username"
                    value={createForm.username}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, username: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#FA8630] transition-colors"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="create-password"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    Password
                  </label>
                  <input
                    id="create-password"
                    type="password"
                    placeholder="Enter password"
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#FA8630] transition-colors"
                  />
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirm password"
                    value={createForm.confirmPassword}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#FA8630] transition-colors"
                  />
                </div>

                {/* Role Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="role"
                    className="block text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    Role
                  </label>
                  <select
                    id="role"
                    value={createForm.role}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, role: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl py-3 px-4 outline-none focus:border-[#FA8630] transition-colors bg-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="veterinarian">Veterinarian</option>
                  </select>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateError("");
                      setCreateSuccess("");
                    }}
                    className="flex-1 py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FA8630] to-[#FF9A52] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
