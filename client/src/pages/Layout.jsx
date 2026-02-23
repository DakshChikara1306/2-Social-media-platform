// ========================== IMPORTS ==========================
import React, { useState } from "react";

// Routing
import { Outlet } from "react-router-dom";

// Icons
import { Menu, X } from "lucide-react";

// Components
import SideBar from "../components/SideBar";
import Loading from "../components/Loading";

// Redux
import { useSelector } from "react-redux";


// ========================== COMPONENT ==========================
const Layout = () => {

  // ========================== STATE ==========================
  // Controls sidebar visibility (for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // ========================== REDUX STATE ==========================
  const { value: user, loading, error } = useSelector(
    (state) => state.user
  );


  // ========================== CONDITIONAL UI ==========================
  // Show loader while fetching user data
  if (loading) {
    return <Loading />;
  }

  // Show error if API fails
  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load user: {error}
      </div>
    );
  }

  // Prevent rendering if user data not available
  if (!user) {
    return (
      <div className="p-6 text-center">
        No user data found
      </div>
    );
  }


  // ========================== JSX ==========================
  return (
    <div className="w-full flex h-screen">

      {/* ========================== SIDEBAR ========================== */}
      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />


      {/* ========================== MAIN CONTENT ========================== */}
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>


      {/* ========================== MOBILE MENU BUTTON ========================== */}
      {sidebarOpen ? (
        // Close Button
        <X
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow 
                     w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : (
        // Open Button
        <Menu
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow 
                     w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(true)}
        />
      )}

    </div>
  );
};


// ========================== EXPORT ==========================
export default Layout;