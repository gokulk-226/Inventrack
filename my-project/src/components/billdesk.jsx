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
    <div className="flex min-h-screen font-poppins bg-[#f5f7fa]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2e3e99] text-white fixed top-0 left-0 bottom-0 p-6 shadow-xl z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold tracking-wide">Bill Desk</h2>
        </div>

        {/* Navigation */}
        <nav>
          <ul className="space-y-4">
            {navItems.map(({ label, path, icon }) => {
              const isActive = activeLink === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setActiveLink(path)}
                    className={`flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-medium shadow-md transition-all duration-300 border
                      ${
                        isActive
                          ? "bg-white text-[#2e3e99] border-white"
                          : "bg-white text-[#2e3e99] hover:shadow-lg hover:border-[#3f51b5]"
                      }`}
                  >
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <button
          className="flex items-center gap-4 px-5 py-3 mt-10 rounded-xl bg-gradient-to-r from-[#f44336] to-[#d32f2f] text-white hover:opacity-90 w-full transition-all duration-300 shadow-md"
          onClick={handleLogout}
        >
          <span className="material-symbols-outlined text-xl">exit_to_app</span>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-full min-h-screen bg-white p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Billdesk;
