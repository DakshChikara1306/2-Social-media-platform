// ========================== IMPORTS ==========================
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Pencil } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from "../features/user/userSlice";
import { useAuth } from '@clerk/clerk-react';


// ========================== COMPONENT ==========================
const ProfileModal = ({ setShowEditProfile }) => {

  // ========================== HOOKS ==========================
  const dispatch = useDispatch();
  const { getToken } = useAuth();

  // Get current user from Redux store
  const user = useSelector((state) => state.user.value);


  // ========================== STATE ==========================
  // Form state for editing profile
  const [editForm, setEditForm] = useState({
    username: user?.username || "",
    bio: user?.bio || "",
    location: user?.location || "",
    profile_picture: null,
    cover_photo: null,
    full_name: user?.full_name || "",
  });


  // ========================== HANDLERS ==========================
  /**
   * Handle saving updated profile data
   */
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    try {
      // Create FormData to send files + text data
      const userData = new FormData();

      // Destructure form fields
      const {
        username,
        bio,
        location,
        profile_picture,
        cover_photo,
        full_name,
      } = editForm;

      // Append text fields
      userData.append("username", username);
      userData.append("bio", bio);
      userData.append("location", location);
      userData.append("full_name", full_name);

      // Append profile image if exists
      if (profile_picture) {
        userData.append("profile", profile_picture);
      }

      // Append cover image if exists
      if (cover_photo) {
        userData.append("cover", cover_photo);
      }

      // Get auth token from Clerk
      const token = await getToken();

      // Dispatch Redux action to update user
      await dispatch(updateUser({ userData, token }));

      // Show success message
      toast.success("Profile updated");

      // Close modal
      setShowEditProfile(false);

    } catch (err) {
      console.log(err);
      toast.error("Failed to update profile");
    }
  };


  // ========================== JSX ==========================
  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto">

      <div className="max-w-2xl mx-auto py-6">

        <div className="bg-white rounded-lg shadow p-6">

          {/* ================= HEADER ================= */}
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>


          {/* ================= FORM ================= */}
          <form
            className="space-y-4"
            onSubmit={(e) =>
              toast.promise(handleSaveProfile(e), {
                loading: "Saving...",
              })
            }
          >

            {/* ================= PROFILE IMAGE ================= */}
            <div>
              <label
                htmlFor="profile_picture"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profile Picture
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                id="profile_picture"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    profile_picture: e.target.files[0],
                  })
                }
              />

              {/* Image Preview */}
              <label htmlFor="profile_picture" className="cursor-pointer">
                <div className="relative group">

                  <img
                    src={
                      editForm.profile_picture
                        ? URL.createObjectURL(editForm.profile_picture)
                        : user?.profile_picture
                    }
                    alt=""
                    className="w-24 h-24 rounded-full object-cover mt-2"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute hidden group-hover:flex inset-0 bg-black/30 rounded-full items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>

                </div>
              </label>
            </div>


            {/* ================= COVER IMAGE ================= */}
            <div>
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cover Photo
              </label>

              {/* Hidden file input */}
              <input
                type="file"
                id="cover_photo"
                accept="image/*"
                hidden
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    cover_photo: e.target.files[0],
                  })
                }
              />

              {/* Image Preview */}
              <label htmlFor="cover_photo" className="cursor-pointer">
                <div className="relative group">

                  <img
                    src={
                      editForm.cover_photo
                        ? URL.createObjectURL(editForm.cover_photo)
                        : user?.cover_photo
                    }
                    alt=""
                    className="w-full h-40 rounded-lg object-cover mt-2"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute hidden group-hover:flex inset-0 bg-black/30 rounded-lg items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>

                </div>
              </label>
            </div>


            {/* ================= NAME INPUT ================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>

              <input
                type="text"
                value={editForm.full_name}
                onChange={(e) =>
                  setEditForm({ ...editForm, full_name: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>


            {/* ================= USERNAME INPUT ================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>

              <input
                type="text"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>


            {/* ================= BIO INPUT ================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>

              <textarea
                rows={3}
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>


            {/* ================= LOCATION INPUT ================= */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>

              <input
                type="text"
                value={editForm.location}
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                className="w-full p-3 border border-gray-200 rounded-lg"
              />
            </div>


            {/* ================= ACTION BUTTONS ================= */}
            <div className="flex justify-end gap-3 pt-6">

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              >
                Cancel
              </button>

              {/* Submit Button */}
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                Save Changes
              </button>

            </div>

          </form>

        </div>
      </div>
    </div>
  );
};


// ========================== EXPORT ==========================
export default ProfileModal;