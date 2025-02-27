"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import Image from "next/image";
import UserHeader from "../UserHeader";
import FooterSection from "../footerSection";

const DEFAULT_THUMBNAIL = "/default-hostel.jpg"; // Default thumbnail image

export function HostelCards() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostelImages, setHostelImages] = useState({}); // Store images for each hostel

  // Fetch hostels and images concurrently
  useEffect(() => {
    const fetchHostelsAndImages = async () => {
      try {
        const accessToken = localStorage.getItem("access_token_user");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        const hostelsResponse = await fetch("http://localhost:8000/api/apartments/approved/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (hostelsResponse.status === 401) {
          throw new Error("Unauthorized access. Please login again.");
        }

        if (!hostelsResponse.ok) {
          throw new Error(`HTTP error! status: ${hostelsResponse.status}`);
        }

        const hostelsData = await hostelsResponse.json();
        console.log("Hostels data:", hostelsData);
        setHostels(hostelsData);

        // Fetch images for each hostel concurrently
        const images = {};
        const imageFetchPromises = hostelsData.map(async (hostel) => {
          try {
            const imagesResponse = await fetch(`http://127.0.0.1:8000/api/apartment-images/${hostel.apartment_id}/`);
            const imagesData = await imagesResponse.json();
            console.log(`Images data for hostel ${hostel.apartment_id}:`, imagesData);

            if (imagesResponse.ok && imagesData.images && imagesData.images.length > 0) {
              images[hostel.apartment_id] = imagesData.images;
            } else {
              images[hostel.apartment_id] = [{ image_data: DEFAULT_THUMBNAIL }];
            }
          } catch (error) {
            console.error(`Error fetching images for hostel ${hostel.apartment_id}:`, error);
            images[hostel.apartment_id] = [{ image_data: DEFAULT_THUMBNAIL }];
          }
        });

        await Promise.all(imageFetchPromises);
        setHostelImages(images);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);

        if (error.message.includes("Unauthorized")) {
          sessionStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHostelsAndImages();
  }, []);

  // Filter hostels based on the search query and presence of images
  const filteredHostels = hostels.filter(
    (hostel) =>
      (hostel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.location.toLowerCase().includes(searchQuery.toLowerCase())) &&
      hostelImages[hostel.apartment_id]?.[0]?.image_data !== DEFAULT_THUMBNAIL
  );

  // Handle card tap
  const handleHostelCardTap = (hostel) => {
    localStorage.setItem("apartment_name", hostel.title);
    localStorage.setItem("apartment_id", hostel.apartment_id);
    router.push(`/users/HostelDetails/${hostel.apartment_id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <UserHeader />
      </div>

      {/* Search Bar */}
      <div className="pt-6 px-10">
        <input
          type="text"
          placeholder="Search by hostel name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Hostel Cards Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-6 px-10">
        {filteredHostels.map((hostel) => {
          const imageData = hostelImages[hostel.apartment_id]?.[0]?.image_data || DEFAULT_THUMBNAIL;
          let imageUrl;

          if (imageData.startsWith("http")) {
            imageUrl = imageData;
          } else if (imageData.startsWith("ffd8")) {
            const bytes = new Uint8Array(imageData.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
            imageUrl = `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;
          } else {
            imageUrl = `data:image/jpeg;base64,${imageData}`;
          }

          return (
            <div
              key={hostel.apartment_id}
              className="max-w-xs w-full group/card"
              onClick={() => handleHostelCardTap(hostel)}
            >
              <div
                className={cn(
                  "cursor-pointer overflow-hidden relative card h-64 rounded-md shadow-xl backgroundImage flex flex-col justify-between p-4",
                  "bg-cover bg-center"
                )}
                style={{ backgroundImage: `url(${imageUrl})` }}
              >
                <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                <div className="flex flex-row items-center space-x-4 z-10">
                  <Image
                    height="100"
                    width="100"
                    alt="Avatar"
                    src="/manu.png"
                    className="h-10 w-10 rounded-full border-2 object-cover"
                    loading="lazy"
                  />
                  <div className="flex flex-col">
                    <p className="font-normal text-base text-gray-50 relative z-10">
                      {hostel.title}
                    </p>
                    <p className="text-sm text-gray-400">{hostel.location}</p>
                  </div>
                </div>
                <div className="text content">
                  <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                    ₹{hostel.rent}
                  </h1>
                  <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
                    {hostel.address}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4">
        <FooterSection />
      </div>
    </div>
  );
}

export default HostelCards;
