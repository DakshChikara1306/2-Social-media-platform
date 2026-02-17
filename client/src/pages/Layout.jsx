// ================== IMPORTS ==================

import React, { useState } from 'react';

import SideBar from '../components/SideBar';

import { Outlet } from 'react-router-dom';

import { Menu, X } from 'lucide-react';

import Loading from '../components/Loading';

import { dummyUserData } from '../assets/assets';


// ================== COMPONENT ==================

const Layout = () => {


  // ================== STATES ==================

  // Controls sidebar visibility (for mobile)
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // ================== USER DATA ==================

  // Currently using dummy user
  const user = dummyUserData;



  // ================== UI ==================

  return user ? (


    <div className="w-full flex h-screen">


      {/* ================== SIDEBAR ================== */}

      <SideBar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />



      {/* ================== MAIN CONTENT ================== */}

      <div className="flex-1 bg-slate-50">

        {/* Nested routes render here */}
        <Outlet />

      </div>



      {/* ================== MOBILE TOGGLE BUTTON ================== */}

      {sidebarOpen ? (

        // Close Button
        <X
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />

      ) : (

        // Open Button
        <Menu
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSidebarOpen(true)}
        />

      )}

    </div>

  ) : (


    // ================== LOADING STATE ==================

    <Loading />

  );
};

export default Layout;
