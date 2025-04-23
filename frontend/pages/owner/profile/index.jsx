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
    upi_id: "",
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
    upi_id: "",
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
          upi_id: response.data.upi_id || "",
        });
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    console.log("User State Updated:", user);
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setFormData({
      bio: user.bio || "",
      date_of_birth: user.date_of_birth || "",
      upi_id: user.upi_id || "",
    });
  };

  const validateDateOfBirth = (dateOfBirth) => {
    const currentDate = new Date();
    const selectedDate = new Date(dateOfBirth);

    const ageDifference = currentDate.getFullYear() - selectedDate.getFullYear();

    if (ageDifference < 16) {
      return false;
    }

    if (
      ageDifference === 16 &&
      (currentDate.getMonth() < selectedDate.getMonth() ||
        (currentDate.getMonth() === selectedDate.getMonth() &&
          currentDate.getDate() < selectedDate.getDate()))
    ) {
      return false;
    }

    return true;
  };

  const validateUpiId = (upiId) => {
    if (!upiId) return true; // Allow empty UPI ID
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return upiRegex.test(upiId);
  };

  const handleSaveClick = async () => {
    // Validate date of birth
    if (!validateDateOfBirth(formData.date_of_birth)) {
      setError("You must be at least 16 years old.");
      return;
    }

    // Validate UPI ID if provided
    if (formData.upi_id && !validateUpiId(formData.upi_id)) {
      setError("Please enter a valid UPI ID (e.g., username@upi)");
      return;
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
      setError(null);
    } catch (err) {
      console.error("Error updating profile:", err);
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
                    max={new Date().toISOString().split("T")[0]}
                    min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                  />
                </>
              ) : (
                <p className="text-[#86909c]">
                  {user.date_of_birth || "Not provided"}
                </p>
              )}
            </div>

            {/* UPI ID Section */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-[#3e435d] mb-4">UPI ID</h3>
              {isEditing ? (
                <Input
                  type="text"
                  name="upi_id"
                  value={formData.upi_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter your UPI ID (e.g., username@upi)"
                />
              ) : (
                <p className="text-[#86909c]">
                  {user.upi_id || "Not provided"}
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            <CardFooter className="flex justify-end p-8">
              {isEditing ? (
                <div className="flex gap-4">
                  <Button variant="outline" onClick={handleCancelClick}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveClick}>Save Changes</Button>
                </div>
              ) : (
                <Button onClick={handleEditClick}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </CardFooter>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}