import React, { use } from 'react'
import { BadgeCheck } from 'lucide-react';
import moment from 'moment';
import { dummyUserData } from '../assets/assets';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Share2 } from 'lucide-react';

const PostCard = ({ post }) => {
    const postWithHashtags = post.content.replace(/#(\w+)/g, '<span class="text-blue-500">#$1</span>');
    const[likes , setLikes] = useState(post.likes_count);
    const currentUser = dummyUserData;
    const handleLike = async() => {

    }
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 w-full max-w-2xl border border-gray-200">

      {/* Header */}
      <div className="flex items-start gap-3">
        <img
          src={post.user.profile_picture}
          alt="profile"
          className="w-11 h-11 rounded-full object-cover"
        />

        <div className="flex flex-col">
          {/* Name + Verified */}
          <div className="flex items-center gap-1">
            <span className="font-semibold text-gray-900">
              {post.user.full_name}
            </span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>

          {/* Username + time */}
          <span className="text-gray-500 text-sm">
            @{post.user.username} · {moment(post.createdAt).fromNow()}
          </span>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-line mt-3"
          dangerouslySetInnerHTML={{ __html: postWithHashtags }}
        />
      )}
      {/* Image */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        {post.image_urls.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Post image ${index + 1}`}
            className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 &&'col-span-2 h-auto' }`}
          />
        ))} 
      </div>
      {/* Actions (Like, Comment, Share) */}
      <div className="flex items-center gap-10 mt-4 text-gray-600 text-sm pt-2 border-t border-gray-300">
        <div className="flex items-center gap-1">
            <Heart onClick={handleLike} className={`w-4 h-4 cursor-pointer ${likes.includes(currentUser.id) ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
            <span className="ml-1">{likes.length}</span>
        </div>
        <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4 cursor-pointer text-gray-500"/>
            <span className="ml-1">{12}</span>
        </div>
        <div className="flex items-center gap-1">
            <Share2 className="w-4 h-4 cursor-pointer text-gray-500"/>
            <span className="ml-1">{12}</span>
        </div>

      </div>

    </div>
  );
};

export default PostCard;
