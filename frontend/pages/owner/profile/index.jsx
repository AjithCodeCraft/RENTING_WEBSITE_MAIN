import { useEffect, useState } from "react";
import axios from "axios";
import { Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import OwnerHeader from "../OwnerHeader";
import Cookies from 'js-cookie';

export default function ProfilePage() {
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    email: "",
    phone: "",
    password_hash: "",
    date_of_birth: "",
    bio: "",
    user_type: "",
    latitude: null,
    longitude: null,
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
            Authorization: `Bearer ${Cookies.get("access_token_owner")}`,
          },
        });

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

  const validateDateOfBirth = (dateOfBirth) => {
    const currentDate = new Date();
    const selectedDate = new Date(dateOfBirth);

    // Calculate the age difference in years
    const ageDifference = currentDate.getFullYear() - selectedDate.getFullYear();

    // Check if the user is at least 16 years old
    if (ageDifference < 16) {
      return false; // Invalid (under 16)
    }

    // Handle edge cases (e.g., if the birthday hasn't occurred yet this year)
    if (
      ageDifference === 16 &&
      (currentDate.getMonth() < selectedDate.getMonth() ||
        (currentDate.getMonth() === selectedDate.getMonth() &&
          currentDate.getDate() < selectedDate.getDate()))
    ) {
      return false; // Invalid (under 16)
    }

    return true; // Valid (16 or older)
  };

  const handleSaveClick = async () => {
    // Validate date of birth
    if (!validateDateOfBirth(formData.date_of_birth)) {
      setError("You must be at least 16 years old.");
      return; // Stop execution if validation fails
    }

    try {
      const response = await axios.put(
        "http://127.0.0.1:8000/api/update-profile/",
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("access_token_owner")}`,
          },
        }
      );
      
      setUser(response.data);
      setIsEditing(false);
      setError(null); // Clear any previous errors
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
        <OwnerHeader />
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-4">
        <Card className="rounded-lg shadow-lg">
          {/* Profile Header */}
          <CardHeader className="bg-gradient-to-r from-[#2dac5c] to-[#4182f9] text-white rounded-t-lg">
            <div className="flex flex-col items-center -mt-16">
              <Avatar className="h-32 w-32 border-4 border-white">
                <AvatarImage src="https://avatar.iran.liara.run/public/boy" />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-3xl font-bold mt-4">{user.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{user.user_type}</CardDescription>
            </div>
          </CardHeader>

          {/* User Details */}
          <CardContent className="p-8">
            {/* Bio Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">About Me</h3>
              {isEditing ? (
                <Textarea
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
                <>
                  <Input
                    type="date"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-lg"
                    max={new Date().toISOString().split("T")[0]} // Restrict future dates
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]} // Allow up to 100 years old
                  />
                  {error && (
                    <div className="mt-2 text-red-500 text-sm">
                      {error}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-[#86909c]">
                  {user.date_of_birth || "Not provided"}
                </p>
              )}
            </div>

            {/* Email Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">Email</h3>
              <p className="text-[#86909c]">{user.email}</p>
            </div>

            {/* Phone Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">Phone</h3>
              <p className="text-[#86909c]">{user.phone}</p>
            </div>

            
          </CardContent>

          
        </Card>
      </main>
    </div>
  );
}