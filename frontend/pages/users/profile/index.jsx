import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserHeader from "../UserHeader";

export default function ProfilePage() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    user_type: "",
    bio: "",
    profile_picture: "",
    date_of_birth: "",
    latitude: null,
    longitude: null,
    created_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: "",
    date_of_birth: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        console.log("API Response:", response.data); // Debugging: Log the response
        setUser(response.data);
        setFormData({
          bio: response.data.bio || "",
          date_of_birth: response.data.date_of_birth || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err); // Debugging: Log the error
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log("User State Updated:", user); // Debugging: Log the user state
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      bio: user.bio || "",
      date_of_birth: user.date_of_birth || "",
    });
  };

  const handleSaveClick = async () => {
    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/update-profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      console.log("Profile Updated:", response.data); // Debugging: Log the update response
      setUser(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err); // Debugging: Log the error
      setError(err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-[#e0e7ff]">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <UserHeader />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header */}
          <div className="relative">
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-[#2dac5c] to-[#4182f9]"></div>

            {/* Profile Picture and Name */}
            <div className="flex flex-col items-center -mt-16">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src={user.profile_picture} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-3xl font-bold text-[#3e435d] mt-4">{user.name}</h2>
              <p className="text-[#2dac5c] text-sm mt-1">{user.user_type}</p>
              <p className="text-[#86909c] text-sm mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={isEditing ? handleCancelClick : handleEditClick}
              className="absolute top-4 right-4 flex items-center gap-2 bg-[#2dac5c] text-white px-4 py-2 rounded-lg hover:bg-[#248f4d] transition-all"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {/* User Details */}
          <div className="p-8">
            {/* Bio Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">About Me</h3>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  rows="4"
                  placeholder="Write something about yourself..."
                />
              ) : (
                <p className="text-[#86909c]">
                  {user.bio || "No bio available."}
                </p>
              )}
            </div>

            {/* Date of Birth Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">Date of Birth</h3>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                />
              ) : (
                <p className="text-[#86909c]">
                  {user.date_of_birth || "Not provided"}
                </p>
              )}
            </div>

            {/* Save Button (Visible only in Edit Mode) */}
            {isEditing && (
              <div className="flex justify-end">
                <button
                  onClick={handleSaveClick}
                  className="bg-[#2dac5c] text-white px-4 py-2 rounded-lg hover:bg-[#248f4d] transition-all"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}