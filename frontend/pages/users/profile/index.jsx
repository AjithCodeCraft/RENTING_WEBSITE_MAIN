import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, User, Calendar, Edit, Globe, Briefcase, Heart } from "lucide-react";
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
    address: "",
    website: "",
    occupation: "",
    interests: "",
    created_at: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/user/profile", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

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
            <button className="absolute top-4 right-4 flex items-center gap-2 bg-[#2dac5c] text-white px-4 py-2 rounded-lg hover:bg-[#248f4d] transition-all">
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* User Details */}
          <div className="p-8">
            {/* Bio Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">About Me</h3>
              <p className="text-[#86909c]">
                {user.bio || "No bio available."}
              </p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Email</p>
                  <p className="text-[#86909c]">{user.email}</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Phone className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Phone</p>
                  <p className="text-[#86909c]">{user.phone}</p>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Date of Birth</p>
                  <p className="text-[#86909c]">
                    {user.date_of_birth || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Address</p>
                  <p className="text-[#86909c]">
                    {user.address || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Website */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Globe className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Website</p>
                  <p className="text-[#86909c]">
                    {user.website || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Occupation */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Briefcase className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Occupation</p>
                  <p className="text-[#86909c]">
                    {user.occupation || "Not provided"}
                  </p>
                </div>
              </div>

              {/* Interests */}
              <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
                <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-[#2dac5c]" />
                </div>
                <div>
                  <p className="text-[#2dac5c] font-medium">Interests</p>
                  <p className="text-[#86909c]">
                    {user.interests || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}