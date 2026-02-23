// ========================== IMPORTS ==========================
import React, { useState } from "react";

// Icons
import { Image, X } from "lucide-react";

// Redux
import { useSelector } from "react-redux";

// Auth
import { useAuth } from "@clerk/clerk-react";

// API & Utilities
import api from "../api/axios";
import { toast } from "react-hot-toast";

// Routing
import { useNavigate } from "react-router-dom";


// ========================== COMPONENT ==========================
function CreatePost() {

  // ========================== HOOKS ==========================
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // Get logged-in user from Redux
  const user = useSelector((state) => state.user.value);


  // ========================== STATE ==========================
  const [content, setContent] = useState("");  // Post text
  const [images, setImages] = useState([]);    // Selected images
  const [loading, setLoading] = useState(false); // Upload loading


  // ========================== HANDLERS ==========================
  /**
   * Handle post creation
   */
  const handleSubmit = async () => {

    // Validation: require text or image
    if (!images.length && !content.trim()) {
      return toast.error("Please add text or image");
    }

    try {
      setLoading(true);

      // ================= DETERMINE POST TYPE =================
      const postType =
        images.length && content
          ? "text_with_image"
          : images.length
          ? "image"
          : "text";

      // ================= FORM DATA =================
      const formData = new FormData();
      formData.append("content", content);
      formData.append("post_type", postType);

      // Append all selected images
      images.forEach((image) => {
        formData.append("images", image);
      });

      // ================= API REQUEST =================
      const token = await getToken();

      const { data } = await api.post("/api/post/add", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // ================= RESPONSE HANDLING =================
      if (data.success) {
        toast.success("Post created");
        navigate("/");
      } else {
        throw new Error(data.message);
      }

    } catch (error) {
      toast.error(error.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };


  // ========================== GUARD ==========================
  // Prevent rendering if user not loaded
  if (!user) return null;


  // ========================== JSX ==========================
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      <div className="max-w-6xl mx-auto p-6">

        {/* ========================== HEADER ========================== */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Post</h1>
          <p className="text-slate-600">Share your thoughts</p>
        </div>


        {/* ========================== POST CARD ========================== */}
        <div className="max-w-xl bg-white p-6 rounded-xl shadow space-y-4">

          {/* -------- USER INFO -------- */}
          <div className="flex items-center gap-3">

            <img
              src={user.profile_picture}
              className="w-12 h-12 rounded-full"
              alt=""
            />

            <div>
              <h2 className="font-semibold">{user.full_name}</h2>
              <p className="text-sm text-gray-500">
                @{user.username}
              </p>
            </div>

          </div>


          {/* -------- CONTENT INPUT -------- */}
          <textarea
            className="w-full resize-none text-sm outline-none"
            placeholder="What's happening?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />


          {/* -------- IMAGE PREVIEW -------- */}
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">

              {images.map((image, i) => (

                <div key={i} className="relative group">

                  <img
                    src={URL.createObjectURL(image)}
                    className="h-20 rounded"
                    alt=""
                  />

                  {/* Remove Image */}
                  <div
                    onClick={() =>
                      setImages(images.filter((_, index) => index !== i))
                    }
                    className="absolute inset-0 hidden group-hover:flex 
                               bg-black/40 justify-center items-center 
                               cursor-pointer"
                  >
                    <X className="text-white" />
                  </div>

                </div>

              ))}

            </div>
          )}


          {/* ========================== FOOTER ========================== */}
          <div className="flex justify-between border-t pt-3">

            {/* Image Upload */}
            <label htmlFor="images" className="cursor-pointer">
              <Image />
            </label>

            <input
              type="file"
              id="images"
              hidden
              multiple
              accept="image/*"
              onChange={(e) =>
                setImages([
                  ...images,
                  ...Array.from(e.target.files),
                ])
              }
            />


            {/* Publish Button */}
            <button
              disabled={loading}
              onClick={() =>
                toast.promise(handleSubmit(), {
                  loading: "Uploading...",
                  success: "Post added",
                  error: "Failed",
                })
              }
              className="bg-indigo-600 text-white px-6 py-2 rounded"
            >
              Publish
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}


// ========================== EXPORT ==========================
export default CreatePost;