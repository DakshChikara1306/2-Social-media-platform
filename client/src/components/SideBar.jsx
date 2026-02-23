// ========================== IMPORTS ==========================
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Assets & Components
import { assets, dummyUserData } from '../assets/assets';
import MenuItems from './MenuItems';

// Icons
import { CirclePlus, LogOut } from 'lucide-react';

// Auth (Clerk)
import { UserButton, useClerk } from '@clerk/clerk-react';


// ========================== COMPONENT ==========================
const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {

  // ========================== NAVIGATION ==========================
  const navigate = useNavigate();


  // ========================== GLOBAL STATE ==========================
  // Get user data from Redux store
  const user = useSelector((state) => state.user.value);


  // ========================== AUTH ==========================
  // Clerk logout function
  const { signOut } = useClerk();


  // ========================== JSX ==========================
  return (

    <div
      className={`
        w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col 
        justify-between items-center max-sm:absolute top-0 bottom-0 z-20 
        ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} 
        transition-all duration-300 ease-in-out
      `}
    >

      {/* ========================== TOP SECTION ========================== */}
      <div className="w-full">

        {/* -------- LOGO -------- */}
        <img
          src={assets.logo}
          alt="Logo"
          onClick={() => navigate('/')}
          className="w-26 ml-7 my-2 cursor-pointer"
        />


        {/* -------- DIVIDER -------- */}
        <hr className="border-gray-300 mb-8" />


        {/* -------- MENU ITEMS -------- */}
        <MenuItems setSidebarOpen={setSidebarOpen} />


        {/* -------- CREATE POST BUTTON -------- */}
        <Link
          to="/create-post"
          className="
            flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg 
            bg-gradient-to-r from-indigo-500 to-purple-600 
            hover:from-indigo-700 hover:to-purple-800 
            active:scale-95 transition text-white cursor-pointer
          "
        >
          <CirclePlus className="h-5 w-5" />
          Create Post
        </Link>

      </div>


      {/* ========================== BOTTOM SECTION ========================== */}
      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">

        {/* -------- USER INFO -------- */}
        <div className="flex gap-2 items-center cursor-pointer">

          {/* Clerk Avatar */}
          <UserButton />

          {/* User Details */}
          <div>
            <h1 className="text-sm font-medium">
              {user?.full_name}
            </h1>

            <p className="text-xs text-gray-500">
              {user?.username}
            </p>
          </div>

        </div>


        {/* -------- LOGOUT BUTTON -------- */}
        <LogOut
          onClick={() => signOut()}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Sidebar;