"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import UserHeader from "../UserHeader";
import FooterSection from "../footerSection";

const hostels = [
  { id: 1, name: "Green View Hostel", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.88013843230549, lat: 8.55855167721169, address: "XYZ Street, Your City" },
  { id: 2, name: "Sunset Residency", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg", lng: 76.87899888341339, lat: 8.556990221115427, address: "XYZ Street, Your City" },
  { id: 3, name: "City Lights Hostel", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.87645772879704, lat: 8.558444894438177, address: "XYZ Street, Your City" },
  { id: 4, name: "Green View Hostel 2", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.87603094023191, lat: 8.555420290444625, address: "XYZ Street, Your City" },
  { id: 5, name: "Sunset Residency 2 ", location: "Uptown", price: "$350/mo", image: "/loginhome.jpg", lng: 76.87802262020246, lat: 8.554576210624122, address: "XYZ Street, Your City" },
  { id: 6, name: "City Lights Hostel 2", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.86806422034977, lat: 8.560906763671213, address: "XYZ Street, Your City" },
  { id: 1, name: "Green View Hostel", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.88013843230549, lat: 8.55855167721169, address: "XYZ Street, Your City" },
  { id: 2, name: "Sunset Residency", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg", lng: 76.87899888341339, lat: 8.556990221115427, address: "XYZ Street, Your City" },
  { id: 3, name: "City Lights Hostel", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.87645772879704, lat: 8.558444894438177, address: "XYZ Street, Your City" },
  { id: 4, name: "Green View Hostel 2", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.87603094023191, lat: 8.555420290444625, address: "XYZ Street, Your City" },
  { id: 5, name: "Sunset Residency 2", location: "Uptown", price: "$350/mo", image: "/loginhome.jpg", lng: 76.87802262020246, lat: 8.554576210624122, address: "XYZ Street, Your City" },
  { id: 6, name: "City Lights Hostel 2", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.86806422034977, lat: 8.560906763671213, address: "XYZ Street, Your City" },
  { id: 1, name: "Green View Hostel", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.88013843230549, lat: 8.55855167721169, address: "XYZ Street, Your City" },
  { id: 2, name: "Sunset Residency", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg", lng: 76.87899888341339, lat: 8.556990221115427, address: "XYZ Street, Your City" },
  { id: 3, name: "City Lights Hostel", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.87645772879704, lat: 8.558444894438177, address: "XYZ Street, Your City" },
  { id: 4, name: "Green View Hostel 2", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.87603094023191, lat: 8.555420290444625, address: "XYZ Street, Your City" },
  { id: 5, name: "Sunset Residency 2", location: "Uptown", price: "$350/mo", image: "/loginhome.jpg", lng: 76.87802262020246, lat: 8.554576210624122, address: "XYZ Street, Your City" },
  { id: 6, name: "City Lights Hostel 2", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.86806422034977, lat: 8.560906763671213, address: "XYZ Street, Your City" },
  { id: 1, name: "Green View Hostel", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.88013843230549, lat: 8.55855167721169, address: "XYZ Street, Your City" },
  { id: 2, name: "Sunset Residency", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg", lng: 76.87899888341339, lat: 8.556990221115427, address: "XYZ Street, Your City" },
  { id: 3, name: "City Lights Hostel", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.87645772879704, lat: 8.558444894438177, address: "XYZ Street, Your City" },
  { id: 4, name: "Green View Hostel 2", location: "Downtown", price: "$300/mo", image: "/download.png", lng: 76.87603094023191, lat: 8.555420290444625, address: "XYZ Street, Your City" },
  { id: 5, name: "Sunset Residency 2", location: "Uptown", price: "$350/mo", image: "/loginhome.jpg", lng: 76.87802262020246, lat: 8.554576210624122, address: "XYZ Street, Your City" },
  { id: 6, name: "City Lights Hostel 2", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg", lng: 76.86806422034977, lat: 8.560906763671213, address: "XYZ Street, Your City" },
  // Add more hostels as needed
];

export function HostelCards() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter hostels based on the search query
  const filteredHostels = hostels.filter(
    (hostel) =>
      hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hostel.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    
    <div>
        <div className="sticky top-0 z-50 bg-white shadow-md">
                <UserHeader/>
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
      <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-3  pt-6 px-10">
        {filteredHostels.map((hostel) => (
          <div key={hostel.id} className="max-w-xs w-full group/card">
            <div
              className={cn(
                "cursor-pointer overflow-hidden relative card h-64 rounded-md shadow-xl backgroundImage flex flex-col justify-between p-4",
                "bg-cover bg-center"
              )}
              style={{ backgroundImage: `url(${hostel.image})` }}
            >
              <div
                className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"
              ></div>
              <div className="flex flex-row items-center space-x-4 z-10">
                <Image
                  height="100"
                  width="100"
                  alt="Avatar"
                  src="/manu.png"
                  className="h-10 w-10 rounded-full border-2 object-cover"
                />
                <div className="flex flex-col">
                  <p className="font-normal text-base text-gray-50 relative z-10">
                    {hostel.name}
                  </p>
                  <p className="text-sm text-gray-400">{hostel.location}</p>
                </div>
              </div>
              <div className="text content">
                <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                  {hostel.price}
                </h1>
                <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
                  {hostel.address}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
      <FooterSection/>

      </div>
    </div>
    
  );
}

export default HostelCards;