"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// Simulated API Response (House Listings)
const houseListings = [
  {
    id: 1,
    title: "Luxury Villa",
    description: "A beautiful villa with a sea view.",
    image: "/loginhome.jpg",
    owner: "John Doe",
    time: "5 min read",
    size: "col-span-2 row-span-2 h-[360px]", // Large card
  },
  {
    id: 2,
    title: "Modern Apartment",
    description: "A stylish apartment in the city center.",
    image: "download.png",
    owner: "Emma Smith",
    time: "3 min read",
    size: "col-span-1 row-span-1 h-[175px]", // Smaller card
  },
  {
    id: 3,
    title: "Cozy Cottage",
    description: "A cozy home surrounded by nature.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    owner: "David Johnson",
    time: "6 min read",
    size: "col-span-1 row-span-1 h-[175px]", // Smaller card
  },
  {
    id: 4,
    title: "Penthouse Suite",
    description: "A luxurious penthouse with a skyline view.",
    image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80",
    owner: "Sophia Williams",
    time: "4 min read",
    size: "col-span-1 row-span-1 h-[175px]", // Same as small cards
  },
  {
    id: 5,
    title: "Rustic Cabin",
    description: "A peaceful retreat in the woods.",
    image: "https://images.unsplash.com/photo-1592595896613-0f72e81f2af5?auto=format&fit=crop&w=800&q=80",
    owner: "Michael Brown",
    time: "5 min read",
    size: "col-span-1 row-span-1 h-[175px]", // Same as small cards
  },
];

export function CardDemo() {
  return (
<div className="flex flex-wrap gap-q2 px-8 py-6">
  {houseListings.map((house) => (
    <Card
      key={house.id}
      className={`relative w-full sm:w-[48%] lg:w-[32%] xl:w-[24%] overflow-hidden rounded-md shadow-xl group ${
        house.id === 1 ? "lg:w-[48%] xl:w-[49%] h-[360px]" : "h-[175px]"
      }`}
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition duration-300 group-hover:scale-110"
        style={{ backgroundImage: `url(${house.image})` }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 group-hover:bg-black/80 transition duration-300" />

      {/* Card Content */}
      <CardHeader className="relative z-10 flex flex-row items-center space-x-4 p-4">
        <Image
          height={40}
          width={40}
          alt="Avatar"
          src="/manu.png"
          className="h-10 w-10 rounded-full border-2 object-cover"
        />
        <div>
          <p className="text-base font-medium text-gray-50">{house.owner}</p>
          <p className="text-sm text-gray-400">{house.time}</p>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 p-4">
        <CardTitle className="text-gray-50 text-xl md:text-2xl">{house.title}</CardTitle>
        <p className="text-sm text-gray-50 mt-2">{house.description}</p>
      </CardContent>
      <CardFooter className="relative z-10 p-4">
        <Button className="w-full bg-transparent text-white hover:bg-gray-700/50">
          View Details
        </Button>
      </CardFooter>
    </Card>
  ))}
</div>

  );
}
