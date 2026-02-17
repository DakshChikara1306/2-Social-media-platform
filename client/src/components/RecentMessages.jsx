import React, { use } from 'react'
import { dummyRecentMessagesData } from '../assets/assets';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

const RecentMessages = () => {
    const [messages, setMessages] =useState([]);
    const fetchRecentMessages = async () => {
       setMessages(dummyRecentMessagesData);
    }
    useEffect(() => {
        fetchRecentMessages();
    }, []);
  return (
    <div className='bg-white max-w-xs mt-4 p-4 rounded-md min-h-20 shadow-md text-xs text-slate-800'>
        <h3 className="font-semibold text-slate-800 mb-4">Recent Messages</h3>
        <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
            {
                messages.map((message, index) => (
                    <Link to={`/messages/${message.from_user_id._id}`} key={index} className='flex items-start gap-2 py-2 hover:bg-slate-100'>
                        <img src={message.from_user_id.profile_picture} alt="avatar" className='w-8 h-8 rounded-full' />
                        <div className='w-full'>
                            <div className='flex justify-between'>
                                <p className="font-medium">{message.from_user_id.full_name}</p>
                                <p className="text-slate-500 text-[10px]">{moment(message.createdAt).fromNow()}</p>
                            </div>
                            <div className='flex justify-between'>
                                <p className="text-slate-600">{message.text ? message.text : "No message text available"}</p>
                                {!message.seen && <p className='bg-indigo-500 w-4 h-4 rounded-full text-white flex items-center justify-center '>1</p>}
                            </div>
                        </div>
                        
                        
                    </Link>
                ))
            }
        </div>
      
    </div>
  )
}

export default RecentMessages
