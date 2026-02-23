import {
  BadgeCheck,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  MoreVertical,
} from "lucide-react";

import React, { useState, useMemo } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios";
import toast from "react-hot-toast";

const PostCard = ({ post, fetchPosts }) => {

  const navigate = useNavigate();
  const { getToken } = useAuth();

  const currentUser = useSelector((state) => state.user.value);
  const userId = currentUser?._id;

  // ================= SAFE DATA =================
  const content = post?.content || "";
  const user = post?.user || {};
  const images = post?.image_url || [];

  // ================= STATE =================
  const [likes, setLikes] = useState(post?.likes_count || []);
  const [menuOpen, setMenuOpen] = useState(false);

  // ================= MEMO =================
  const isLiked = useMemo(() => {
    return likes.includes(userId);
  }, [likes, userId]);

  // ================= HASHTAGS =================
  const formattedContent = useMemo(() => {
    return content.replace(
      /(#\w+)/g,
      '<span class="text-indigo-600 font-medium">$1</span>'
    );
  }, [content]);

  // ================= LIKE =================
  const handleLike = async () => {
    if (!userId) return toast.error("Login required");

    try {
      const token = await getToken();

      const { data } = await api.post(
        "/api/post/like",
        { postId: post._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!data.success) {
        return toast.error(data.message);
      }

      setLikes(data.likes);

    } catch (err) {
      console.error(err);
      toast.error("Failed to like post");
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    try {
      const token = await getToken();

      const { data } = await api.delete(`/api/post/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!data.success) {
        return toast.error(data.message);
      }

      toast.success("Post deleted");

      fetchPosts?.();

    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // ================= SHARE =================
  const handleShare = async () => {
    try {
      const link = `${window.location.origin}/post/${post._id}`;

      await navigator.clipboard.writeText(link);

      toast.success("Link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // ================= UI =================
  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl">

      {/* ================= USER ================= */}
      <div className="flex justify-between">

        <div
          onClick={() => navigate(`/profile/${user._id}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={user?.profile_picture || "/default.png"}
            className="w-10 h-10 rounded-full"
          />

          <div>
            <div className="flex items-center gap-1">
              <span>{user?.full_name || "User"}</span>
              <BadgeCheck className="w-4 h-4 text-blue-500" />
            </div>

            <div className="text-sm text-gray-500">
              @{user?.username || "username"} ·{" "}
              {moment(post.createdAt).fromNow()}
            </div>
          </div>
        </div>

        {/* ================= MENU ================= */}
        {userId && user._id === userId && (
          <div className="relative">

            <MoreVertical
              onClick={() => setMenuOpen((prev) => !prev)}
              className="w-5 h-5 cursor-pointer"
            />

            {menuOpen && (
              <div className="absolute right-0 bg-white border rounded shadow text-sm z-10">

                <div
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-gray-100 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= CONTENT ================= */}
      {content && (
        <div
          className="text-sm text-gray-800 break-words"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />
      )}

      {/* ================= IMAGES ================= */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <img
              key={i}
              src={img}
              className={`w-full rounded-lg object-cover ${
                images.length === 1 ? "col-span-2 h-auto" : "h-48"
              }`}
            />
          ))}
        </div>
      )}

      {/* ================= ACTIONS ================= */}
      <div className="flex items-center gap-6 text-sm border-t pt-2">

        {/* LIKE */}
        <div className="flex items-center gap-1">
          <Heart
            onClick={handleLike}
            className={`w-4 h-4 cursor-pointer ${
              isLiked ? "text-red-500 fill-red-500" : ""
            }`}
          />
          <span>{likes.length}</span>
        </div>

        {/* COMMENT */}
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4 cursor-pointer" />
          <span>0</span>
        </div>

        {/* SHARE */}
        <Share2
          onClick={handleShare}
          className="w-4 h-4 cursor-pointer"
        />
      </div>
    </div>
  );
};

export default PostCard;