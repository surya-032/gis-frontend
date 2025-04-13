import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaMap, FaMapMarkerAlt, FaDrawPolygon, FaRoute, FaSignOutAlt,
  FaBars, FaTimes, FaChevronDown, FaEdit, FaTrash, FaUserCircle, FaPlus
} from "react-icons/fa";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState({}); 
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");  
    localStorage.removeItem("user");  
    navigate("/login");  
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const toggleSubMenu = (menu) => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true); 
    }
    setOpenSubMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleSidebarToggle = () => {
    if (isSidebarOpen) {
      setOpenSubMenus({}); 
    }
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
    {/* Sidebar */}
    <div className={`bg-blue-950 text-white transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"} flex flex-col relative shadow-lg`}>
      
      {/* Toggle Button */}
      <div className="flex justify-center items-center p-4">
        <button className="text-white text-2xl focus:outline-none" onClick={handleSidebarToggle}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Sidebar Menu */}
      <ul className="flex flex-col space-y-2 mt-4">
        <li>
          <Link to="/dashboard/admin" className={`flex items-center p-3 rounded-lg transition-all duration-300 group
            ${isActive("/dashboard/admin") ? "bg-white text-blue-950" : "hover:bg-blue-800 hover:text-white"}`}>
            <FaHome className="text-2xl" />
            <span className={`ml-3 ${isSidebarOpen ? "opacity-100" : "hidden"}`}>Dashboard</span>
          </Link>
        </li>

        <li>
          <Link to="/dashboard/map" className={`flex items-center p-3 rounded-lg transition-all duration-300 group 
            ${isActive("/dashboard/map") ? "bg-white text-blue-950" : "hover:bg-blue-800 hover:text-white"}`}>
            <FaMap className="text-2xl" />
            <span className={`ml-3 ${isSidebarOpen ? "opacity-100" : "hidden"}`}>Peta Geografis</span>
          </Link>
        </li>

          {/* Marker Management */}
          <li>
            <button className="flex items-center p-3 w-full text-left rounded-lg transition-all duration-300 group hover:bg-white hover:text-blue-900"
              onClick={() => toggleSubMenu("marker")}>
              <FaMapMarkerAlt className="text-2xl transition-all duration-300" />
              {isSidebarOpen && <span className="ml-3">Marker</span>}
              <FaChevronDown className={`ml-auto transition-transform duration-300 ${openSubMenus["marker"] ? "rotate-180" : ""}`} />
            </button>
            {openSubMenus["marker"] && isSidebarOpen && (
              <ul className="ml-6">
                <li><Link to="/dashboard/marker/preview" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaMap className="text-xl"/><span className="ml-3">Preview</span></Link></li>
                <li><Link to="/dashboard/marker/add" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaPlus className="text-xl"/><span className="ml-3">Add</span></Link></li>
                <li><Link to="/dashboard/marker/manage" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaEdit className="text-xl"/><span className="ml-3">Edit</span></Link></li>
                <li><Link to="/dashboard/marker/delete" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaTrash className="text-xl"/><span className="ml-3">Delete</span></Link></li>
              </ul>
            )}
          </li>
  {/* Line Management */}
  <li>
            <button className="flex items-center p-3 w-full text-left rounded-lg transition-all duration-300 group hover:bg-white hover:text-blue-900"
              onClick={() => toggleSubMenu("line")}>
              <FaRoute className="text-2xl transition-all duration-300" />
              {isSidebarOpen && <span className="ml-3 transition-all duration-300">Line</span>}
              <FaChevronDown className={`ml-auto transition-transform duration-300 ${openSubMenus["line"] ? "rotate-180" : ""}`} />
            </button>
            {openSubMenus["line"] && isSidebarOpen && (
              <ul className="ml-6">
                <li><Link to="/dashboard/line/preview" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaMap className="text-xl"/><span className="ml-3">Preview</span></Link></li>
                <li><Link to="/dashboard/line/add" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaPlus className="text-xl"/><span className="ml-3">Add</span></Link></li>
                <li><Link to="/dashboard/line/manage" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaEdit className="text-xl"/><span className="ml-3">Edit</span></Link></li>
                <li><Link to="/dashboard/line/delete" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaTrash className="text-xl"/><span className="ml-3">Delete</span></Link></li>
              </ul>
            )}
          </li>

   {/* Polygon Management */}
<li>
  <button className="flex items-center p-3 w-full text-left rounded-lg transition-all duration-300 group hover:bg-white hover:text-blue-900"
    onClick={() => toggleSubMenu("polygon")}>
    <FaDrawPolygon className="text-2xl transition-all duration-300" />
    {isSidebarOpen && <span className="ml-3 transition-all duration-300">Polygon</span>}
    <FaChevronDown className={`ml-auto transition-transform duration-300 ${openSubMenus["polygon"] ? "rotate-180" : ""}`} />
  </button>
  {openSubMenus["polygon"] && isSidebarOpen && (
    <ul className="ml-6">
      <li><Link to="/dashboard/polygon/preview" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900">
        <FaMap className="text-xl"/><span className="ml-3">Preview</span></Link></li>
        <li><Link to="/dashboard/polygon/add" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900"><FaPlus className="text-xl"/><span className="ml-3">Add</span></Link></li>
      <li><Link to="/dashboard/polygon/manage" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900">
        <FaEdit className="text-xl"/><span className="ml-3">Edit</span></Link></li>
      <li><Link to="/dashboard/polygon/delete" className="flex items-center p-2 rounded-lg hover:bg-white hover:text-blue-900">
        <FaTrash className="text-xl"/><span className="ml-3">Delete</span></Link></li>
    </ul>
  )}
</li>
          {/* Logout */}
          <li>
            <button onClick={handleLogout} className="flex items-center p-3 rounded-lg hover:bg-red-600 w-full">
              <FaSignOutAlt className="text-2xl" />
              <span className={`ml-3 ${isSidebarOpen ? "opacity-100" : "hidden"}`}>Logout</span>
            </button>
          </li>

        </ul>
      </div>

      {/* Navbar */}
      <div className="flex-1">
        <nav className="bg-white p-4 shadow-md flex items-center">
       <span className="text-gray-900 font-bold text-lg">Dashboard Sistem Informasi Geografis</span>


            {/* User Profile in Navbar */}
            <div className="ml-auto flex items-center space-x-4">
            <FaUserCircle className="text-3xl text-black" />
            <span className="text-black font-semibold">
              {user ? user.nama_lengkap : "User"}
            </span>
          </div>
        </nav>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
