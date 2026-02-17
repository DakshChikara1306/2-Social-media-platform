// ================== IMPORTS ==================

import React from 'react';

import { menuItemsData } from '../assets/assets';

import { NavLink } from 'react-router-dom';


// ================== COMPONENT ==================

const MenuItems = ({ setSidebarOpen }) => {


  // ================== UI ==================

  return (

    <div className='px-6 text-gray-600 space-y-1 font-medium'>


      {/* ================== MENU ITEMS LIST ================== */}

      {menuItemsData.map(({ to, label, Icon }) => (


        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          
          // Close sidebar on mobile when link is clicked
          onClick={() => setSidebarOpen(false)}

          // Dynamic active styles
          className={({ isActive }) =>
            `px-3.5 py-2 flex items-center gap-3 rounded-xl 
            ${isActive
              ? 'bg-indigo-50 text-indigo-700'
              : 'hover:bg-gray-50'
            }`
          }
        >


          {/* Icon */}
          <Icon className="h-5 w-5" />


          {/* Label */}
          {label}


        </NavLink>

      ))}

    </div>
  );
};

export default MenuItems;
