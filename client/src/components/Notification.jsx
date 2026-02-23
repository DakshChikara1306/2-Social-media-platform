import React from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';

const Notifications = ({ t, message, currentUserId }) => {
  const navigate = useNavigate();

  // Get connections from redux
  const connections = useSelector(
    (state) => state.connections.connections
  );

  // Find sender details
  const sender = connections.find(
    (user) => user._id === message.from_user_id
  );

  const handleClick = () => {
    const chatUserId =
      message.from_user_id === currentUserId
        ? message.to_user_id
        : message.from_user_id;

    if (!chatUserId) {
      console.error("❌ chatUserId undefined", message);
      return;
    }

    navigate(`/messages/${chatUserId}`);
    toast.dismiss(t.id);
  };

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg flex border border-gray-300 hover:scale-105 transition">
      
      <div className="flex-1 p-4">
        <div className="flex items-start ">
          
          {/* PROFILE IMAGE */}
          <img
            src={sender?.profile_picture || "/default.png"}
            alt=""
            className="h-10 w-10 rounded-full flex-shrink-0 mt-0.5"
          />

          <div className="ml-3 flex-1">
            
            {/* NAME */}
            <p className="text-sm font-medium text-gray-900">
              {sender?.full_name || "Unknown User"}
            </p>

            {/* MESSAGE */}
            <p className="text-sm text-gray-500">
              {message.text?.slice(0, 50)}
            </p>

          </div>
        </div>
      </div>

      {/* BUTTON */}
      <div className="flex border-l border-gray-200">
        <button
          onClick={handleClick}
          className="p-4 text-indigo-600 font-semibold"
        >
          Reply
        </button>
      </div>
    </div>
  );
};

export default Notifications;