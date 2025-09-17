// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { useAuth } from "../context/AuthProvider";

const Navbar = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials =
    user?.name?.trim()?.split(" ")?.map(w => w[0]?.toUpperCase())?.slice(0, 2).join("") || "U";

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-[#ADADAD]">
      <img onClick={() => navigate("/")} className="w-44 cursor-pointer" src={assets.logo} alt="QuickDoc" />

      <ul className="md:flex items-start gap-5 font-medium hidden">
        <NavLink to="/"><li className="py-1">HOME</li></NavLink>
        <NavLink to="/doctors"><li className="py-1">ALL DOCTORS</li></NavLink>
        <NavLink to="/about"><li className="py-1">ABOUT</li></NavLink>
        <NavLink to="/contact"><li className="py-1">CONTACT</li></NavLink>
        {user?.role === "admin" && (
          <NavLink to="/admin">
            <li className="py-1 text-red-600">ADMIN</li>
          </NavLink>
        )}
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            {user.image ? (
              <img className="w-8 h-8 rounded-full object-cover" src={user.image} alt="avatar" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 grid place-items-center text-xs font-semibold">
                {initials}
              </div>
            )}
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-gray-50 rounded shadow-lg flex flex-col gap-4 p-4">
                <p onClick={() => navigate("/my-profile")} className="hover:text-black cursor-pointer">My Profile</p>
                <p onClick={() => navigate("/my-appointments")} className="hover:text-black cursor-pointer">My Appointments</p>
                {user.role === "admin" && (
                  <p onClick={() => navigate("/admin")} className="hover:text-black cursor-pointer text-red-600">Admin Panel</p>
                )}
                <p onClick={handleLogout} className="hover:text-black cursor-pointer">Logout</p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login?mode=signup")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}

        <img onClick={() => setShowMenu(true)} className="w-6 md:hidden" src={assets.menu_icon} alt="menu" />

        {/* Mobile Menu */}
        <div className={`md:hidden ${showMenu ? "fixed w-full" : "h-0 w-0"} right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}>
          <div className="flex items-center justify-between px-5 py-6">
            <img src={assets.logo} className="w-36" alt="QuickDoc" />
            <img onClick={() => setShowMenu(false)} src={assets.cross_icon} className="w-7" alt="close" />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/"><p className="px-4 py-2 rounded full inline-block">HOME</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors"><p className="px-4 py-2 rounded full inline-block">ALL DOCTORS</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about"><p className="px-4 py-2 rounded full inline-block">ABOUT</p></NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact"><p className="px-4 py-2 rounded full inline-block">CONTACT</p></NavLink>
            {user?.role === "admin" && (
              <NavLink onClick={() => setShowMenu(false)} to="/admin">
                <p className="px-4 py-2 rounded full inline-block text-red-600">ADMIN PANEL</p>
              </NavLink>
            )}
            {!user && (
              <button
                onClick={() => { setShowMenu(false); navigate("/login?mode=signup"); }}
                className="mt-2 bg-primary text-white px-6 py-2 rounded-full"
              >
                Create account
              </button>
            )}
            {user && (
              <button
                onClick={() => { setShowMenu(false); handleLogout(); }}
                className="mt-2 border px-6 py-2 rounded-full"
              >
                Logout
              </button>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
