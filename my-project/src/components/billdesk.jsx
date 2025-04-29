import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

function Billdesk() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    const role = localStorage.getItem("role");
    if (!loggedIn || role !== "billdesk") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    setActiveLink(location.pathname.split("/").pop());
  }, [location]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const navItems = [
    { label: "Billing", path: "billing", icon: "receipt_long" },
    { label: "Stock", path: "stock", icon: "inventory_2" }, 
    { label: "Critical Stock", path: "criticalstock", icon: "production_quantity_limits" },
  ];

  return (
    <div className="flex min-h-screen font-poppins bg-[#f4f6f8]">
      <aside className="w-64 bg-[#1976d2] text-white fixed top-0 left-0 bottom-0 p-6 shadow-lg z-10">
        <h2 className="text-3xl font-bold mb-12 text-center tracking-wide">
          Bill Desk
        </h2>
        <nav>
          <ul className="space-y-3">
            {navItems.map(({ label, path, icon }) => {
              const isActive = activeLink === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-300 shadow-sm 
                      ${isActive ? "bg-white text-[#1976d2]" : "bg-[#2196f3] text-white"} 
                      hover:bg-white hover:text-[#1976d2]`}
                    onClick={() => setActiveLink(path)}
                  >
                    <span className={`material-symbols-outlined text-xl ${isActive ? "text-[#1976d2]" : "text-white"}`}>
                      {icon}
                    </span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          className="flex items-center gap-4 px-5 py-3 mt-8 rounded-lg bg-[#f44336] text-white hover:bg-[#d32f2f] w-full transition-all duration-300 shadow-sm"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-xl">exit_to_app</span>
          Logout
        </button>
      </aside>

      <main className="ml-64 w-full p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Billdesk;
