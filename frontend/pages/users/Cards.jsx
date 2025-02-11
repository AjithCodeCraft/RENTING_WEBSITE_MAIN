import Image from "next/image";
import { useState } from "react";

export function Card({ title, images = [], description, width, height, top, left }) {
  const [currentImage, setCurrentImage] = useState(0);
  const imageUrl = images.length > 0 ? images[currentImage] : "/download.png";

  return (
    <div
      className="absolute rounded-md shadow-xl bg-white p-4"
      style={{ width, height, top, left, position: "absolute" }} // Custom Positioning
    >
      {/* Image Section */}
      <div className="relative w-full" style={{ height }}>
        <Image 
          src={imageUrl} 
          alt={title} 
          layout="fill" 
          objectFit="cover" 
          className="rounded-t-md"
        />
      </div>

      {/* Text Section */}
      <div className="p-2 text-center">
        <h1 className="font-bold text-lg text-gray-900">{title}</h1>
        <p className="text-sm text-gray-700 mt-2">{description}</p>
      </div>
    </div>
  );
}
