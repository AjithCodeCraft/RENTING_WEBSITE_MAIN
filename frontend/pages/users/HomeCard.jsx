import React from "react";
import { Card } from "./Cards";

// Sample Hostel Data with Custom Sizes & Positions
const hostels = [
  { 
    id: 1, 
    title: "Luxury PG", 
    images: ["/loginhome.jpg"], 
    description: "Spacious rooms with AC & WiFi.",
    width: "300px", height: "250px", top: "10px", left: "20px"
  },
  { 
    id: 2, 
    title: "Budget Stay", 
    images: ["https://via.placeholder.com/300"], 
    description: "Affordable hostel near city center.",
    width: "350px", height: "270px", top: "50px", left: "100px"
  },
  { 
    id: 3, 
    title: "Girls PG", 
    images: ["https://via.placeholder.com/300"], 
    description: "Safe & comfortable for women.",
    width: "280px", height: "230px", top: "90px", left: "50px"
  },
  { 
    id: 4, 
    title: "Boys Hostel", 
    images: ["https://via.placeholder.com/300"], 
    description: "Best for students & working professionals.",
    width: "320px", height: "260px", top: "30px", left: "200px"
  },
  { 
    id: 5, 
    title: "Co-Living Space", 
    images: ["https://via.placeholder.com/300"], 
    description: "Modern living experience.",
    width: "310px", height: "280px", top: "80px", left: "120px"
  }
];

const HomeCard = () => {
  return (
    <div className="relative mt-9 pb-10"> {/* Ensure relative parent */}
      {hostels.map((hostel) => (
        <Card
          key={hostel.id}
          title={hostel.title}
          images={hostel.images}
          description={hostel.description}
          width={hostel.width}
          height={hostel.height}
          top={hostel.top}
          left={hostel.left}
        />
      ))}
    </div>
  );
};

export default HomeCard;
