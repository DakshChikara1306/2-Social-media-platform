// ========================== IMPORTS ==========================
import React from "react";

// Assets
import { assets } from "../assets/assets";

// Icons
import { Star } from "lucide-react";

// Auth Component
import { SignIn } from "@clerk/clerk-react";


// ========================== COMPONENT ==========================
const Login = () => {

  // ========================== JSX ==========================
  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ========================== BACKGROUND IMAGE ========================== */}
      <img
        src={assets.bgImage}
        alt=""
        className="absolute top-0 left-0 -z-1 w-full h-full object-cover"
      />


      {/* ========================== LEFT SECTION (BRANDING) ========================== */}
      <div className="flex-1 flex flex-col items-start justify-between p-6 md:p-10 lg:pl-40">

        {/* -------- LOGO -------- */}
        <img
          src={assets.logo}
          alt=""
          className="h-12 object-contain"
        />


        {/* -------- MAIN CONTENT -------- */}
        <div>

          {/* ---- USERS + RATING ---- */}
          <div className="flex items-center gap-3 mb-4 max-md:mt-10">

            <img
              src={assets.group_users}
              alt=""
              className="h-8 md:h-10"
            />

            <div>

              {/* Star Ratings */}
              <div className="flex">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 md:size-4.5 text-transparent fill-amber-500"
                    />
                  ))}
              </div>

              <p>Used by 12k+ developers</p>

            </div>

          </div>


          {/* ---- HEADING ---- */}
          <h1 className="text-3xl md:text-6xl md:pb-2 font-bold 
                         bg-gradient-to-r from-indigo-950 to-indigo-800 
                         bg-clip-text text-transparent">
            More than just friends truly connect
          </h1>


          {/* ---- SUBTEXT ---- */}
          <p className="text-xl md:text-3xl text-indigo-900 
                        max-w-72 md:max-w-md">
            connect with global community on pingup.
          </p>

        </div>


        {/* Spacer */}
        <span className="md:h-10"></span>

      </div>


      {/* ========================== RIGHT SECTION (AUTH FORM) ========================== */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">

        {/* Clerk SignIn Component */}
        <SignIn />

      </div>

    </div>
  );
};


// ========================== EXPORT ==========================
export default Login;