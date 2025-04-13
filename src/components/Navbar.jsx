import { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaTimes } from "react-icons/fa";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-black">
          SISTEM INFORMASI GEOGRAFIS
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="py-2 px-4 relative text-black hover:text-blue-800 transition duration-300">
            Beranda
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-800 transition-all duration-300 ease-in-out"></span>
          </Link>
          <Link to="/login" className="py-2 px-4 border border-blue-950 text-blue-950 rounded-lg hover:bg-blue-800 hover:text-white transition duration-300">
            Login
          </Link>
          <Link to="/register" className="py-2 px-4 bg-blue-950 text-white rounded-lg hover:bg-blue-800 transition duration-300">
            Register
          </Link>
        </div>

        {/* Toggle Button (Mobile) */}
        <button className="md:hidden text-black text-2xl transition duration-300" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Menu Mobile */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 transition duration-300">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <Link
              to="/"
              className="py-2 px-4 relative text-black hover:text-blue-800 transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Beranda
              <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-800 transition-all duration-300 ease-in-out"></span>
            </Link>
            <Link
              to="/login"
              className="py-2 px-4 border border-blue-950 text-blue-950 rounded-lg hover:bg-blue-800 hover:text-white transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="py-2 px-4 bg-blue-950 text-white rounded-lg hover:bg-blue-800 transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              Register
            </Link>
          </ul>
        </div>
      )}
    </nav>
  );
}
