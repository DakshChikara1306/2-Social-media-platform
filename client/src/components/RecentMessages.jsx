import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'
import { useAuth, useUser } from '@clerk/clerk-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

const RecentMessages = () => {

  const [messages, setMessages] = useState([])
  const { getToken } = useAuth()
  const { user, isLoaded } = useUser()

  // ================= FETCH RECENT MESSAGES =================
  const fetchRecentMessages = async () => {
    try {
      const token = await getToken()

      if (!token) return

      const { data } = await api.get("/api/user/recent-messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!data.success) {
        toast.error(data.message)
        return
      }

      setMessages(data.messages || [])

    } catch (error) {
      console.error(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  // ================= EFFECT =================
  useEffect(() => {
    if (!isLoaded || !user) return

    fetchRecentMessages()

    // optional polling
    const interval = setInterval(fetchRecentMessages, 30000)

    return () => clearInterval(interval)

  }, [user, isLoaded])

  // ================= HELPER =================
  const getUserId = (userObj) => {
    if (!userObj) return null
    return typeof userObj === "string" ? userObj : userObj._id
  }

  const getUserName = (userObj) => {
    if (!userObj) return "User"
    return typeof userObj === "string" ? "User" : userObj.full_name || "User"
  }

  const getUserImage = (userObj) => {
    if (!userObj) return "/default.png"
    return typeof userObj === "string"
      ? "/default.png"
      : userObj.profile_picture || "/default.png"
  }

  // ================= RENDER =================
  return (
    <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>

      <h3 className="font-semibold text-slate-800 mb-4">
        Recent Messages
      </h3>

      <div className="flex flex-col max-h-56 overflow-y-scroll no-scrollbar">

        {messages.length === 0 && (
          <p className='text-center text-slate-400 py-4'>
            No messages
          </p>
        )}

        {messages.map((message) => {

          // 🔹 get sender id safely
          const fromId = getUserId(message.from_user_id)

          // 🔹 check if current user sent message
          const isMe = String(fromId) === String(user.id)

          // 🔹 get other user
          const otherUser = isMe
            ? message.to_user_id
            : message.from_user_id

          const otherUserId = getUserId(otherUser)

          if (!otherUserId) return null

          return (
            <Link
              to={`/messages/${otherUserId}`}
              key={message._id}
              className='flex items-start gap-2 py-2 hover:bg-slate-100'
            >

              <img
                src={getUserImage(otherUser)}
                alt=""
                className='w-8 h-8 rounded-full'
              />

              <div className="w-full">

                <div className="flex justify-between">
                  <p className="font-medium">
                    {getUserName(otherUser)}
                  </p>

                  <p className='text-[10px] text-slate-400'>
                    {moment(message.createdAt).fromNow()}
                  </p>
                </div>

                <div className="flex justify-between">
                  <p className='text-gray-500 truncate'>
                    {message.text || "Media"}
                  </p>
                </div>

              </div>

            </Link>
          )
        })}

      </div>

    </div>
  )
}

export default RecentMessages