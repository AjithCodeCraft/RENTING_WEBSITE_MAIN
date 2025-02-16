"use client"

import { Mail, Phone, MapPin } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import UserHeader from "../UserHeader"

export default function ProfilePage() {
  // Dummy user data (replace with actual data from your backend)
  const user = {
    name: "Alexa Rawles",
    email: "alexarawles@gmail.com",
    phone: "+1 123-456-7890",
    user_type: "Seeker",
    latitude: 37.7749,
    longitude: -122.4194,
    created_at: "2022-06-07",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9f9f9] to-[#e0e7ff]">
      {/* Header */}
    
      <div className="sticky top-0 z-50 bg-white shadow-md">
              <UserHeader>
             
              </UserHeader>
            </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-8 px-6">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 border-2 border-[#2dac5c]">
              <AvatarImage src="" />
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold text-[#3e435d]">{user.name}</h2>
              {/* <p className="text-[#2dac5c] text-sm mt-1">{user.user_type}</p> */}
            </div>
          </div>

          {/* User Details */}  
          <div className="space-y-6">
            {/* Email Section */}
            <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
              <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-[#2dac5c]" />
              </div>
              <div>
                <p className="text-[#2dac5c] font-medium">Email</p>
                <p className="text-[#86909c]">{user.email}</p>
              </div>
            </div>

            {/* Phone Section */}
            <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
              <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                <Phone className="h-6 w-6 text-[#2dac5c]" />
              </div>
              <div>
                <p className="text-[#2dac5c] font-medium">Phone</p>
                <p className="text-[#86909c]">{user.phone}</p>
              </div>
            </div>

            {/* Location Section */}
            <div className="flex items-center gap-4 p-4 bg-[#f8f9fa] rounded-lg hover:bg-[#f0f4ff] transition-all">
              <div className="h-12 w-12 rounded-full bg-[#4182f9]/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-[#2dac5c]" />
              </div>
              <div>
                <p className="text-[#2dac5c] font-medium">Location</p>
                <p className="text-[#86909c]">
                  Latitude: {user.latitude}, Longitude: {user.longitude}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}