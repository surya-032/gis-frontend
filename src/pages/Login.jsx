import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion"; 

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); 
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isSuccess, setIsSuccess] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("192.168.4.4:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalMessage(data.message || "Login gagal!");
        setIsSuccess(false);
        setIsModalOpen(true);
        return;
      }

      localStorage.setItem("token", data.token);

      const userResponse = await fetch("https://gis-backend-production-f4bc.up.railway.app/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${data.token}` },
      });

      const userData = await userResponse.json();
      localStorage.setItem("user", JSON.stringify(userData));

      setModalMessage("Login berhasil!");
      setIsSuccess(true);
      setIsModalOpen(true);

      setTimeout(() => {
        setIsModalOpen(false);
        navigate("/dashboard/admin");
      }, 2000);
    } catch (error) {
      console.error("Login error:", error);
      setModalMessage("Terjadi kesalahan. Silakan coba lagi.");
      setIsSuccess(false);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-950 relative">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={`bg-white p-6 rounded-lg shadow-xl w-80 text-center border relative ${
                isSuccess ? "border-blue-900" : "border-red-500"
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <div className="flex flex-col items-center">
                {isSuccess ? (
                  <FaCheckCircle className="text-5xl text-blue-900" />
                ) : (
                  <FaTimesCircle className="text-5xl text-red-500" />
                )}
                <h3 className={`text-lg font-bold mt-2 ${isSuccess ? "text-blue-900" : "text-red-600"}`}>
                  {isSuccess ? "Login Berhasil" : "Login Gagal"}
                </h3>
                <p className="text-gray-700 mt-2">{modalMessage}</p>
              </div>
              <button 
                className={`mt-4 px-4 py-2 rounded-lg text-white ${
                  isSuccess ? "bg-blue-900 hover:bg-blue-800" : "bg-red-500 hover:bg-red-600"
                }`}
                onClick={() => setIsModalOpen(false)}
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="bg-white p-8 rounded-lg shadow-md w-96 z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-3xl font-bold text-center text-blue-900">Login</h2>

        <form onSubmit={handleLogin} className="mt-6">
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mt-4 relative">
            <label className="block text-gray-700 font-medium">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-4 py-2 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-900 focus:outline-none pr-10"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[45px] text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-2 mt-6 rounded-lg hover:bg-blue-800 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 mt-4">
          Don't have an account? <a href="/register" className="text-blue-900 font-semibold">Register</a>
        </p>
      </motion.div>
    </div>
  );
}
