import React, { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";

function Admin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");

  useEffect(() => {
    setActiveLink(location.pathname.split("/").pop());
  }, [location]);

  useEffect(() => {
    if (!localStorage.getItem("loggedIn")) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to logout?");
    if (confirmLogout) {
      localStorage.removeItem("loggedIn");
      navigate("/", { replace: true });
    }
  };

  const navItems = [
    { label: "Billing", path: "billing", icon: "receipt_long" },
    { label: "Stock", path: "stock", icon: "inventory_2" },
    { label: "Purchase", path: "purchase", icon: "shopping_cart" },
    { label: "Critical Stock", path: "criticalstock", icon: "production_quantity_limits" },
    { label: "Suppliers", path: "suppliers", icon: "local_shipping" },
    { label: "Add User", path: "adduser", icon: "person_add" },
  ];

  return (
    <div className="flex min-h-screen font-poppins bg-[#f4f6f8]">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a2c66] text-white fixed top-0 left-0 bottom-0 p-6 z-10 shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-12 tracking-wide leading-tight">
          KPS SILKS<br />
          <span className="text-lg font-light">Admin</span>
        </h2>

        <nav>
          <ul className="space-y-3">
            {navItems.map(({ label, path, icon }) => {
              const isActive = activeLink === path;
              return (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setActiveLink(path)}
                    className={`flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-300 shadow-sm 
                      ${isActive ? "bg-white text-[#0a2c66]" : "bg-[#1976d2] text-white"} 
                      hover:bg-white hover:text-[#0a2c66]"`}
                  >
                    <span className={`material-symbols-outlined text-xl ${isActive ? "text-[#0a2c66]" : "text-white"}`}>
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
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-3 mt-8 w-full rounded-lg bg-[#e53935] hover:bg-[#c62828] text-white transition-all duration-300 shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="ml-64 w-full p-8 sm:p-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Admin;
