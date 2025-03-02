import React, { useState, useRef } from "react";

const ImageUploader = ({ name, src, onFileSelect }) => {
  const [imageSrc, setImageSrc] = useState(src);

  const defaultUpdateStyle = "bg-white shadow-gray-400/50";
  const defaultBoxStyle = "ring-2 ring-green-300";
  const [updateStyle, setUpdateStyle] = useState(defaultUpdateStyle);
  const [boxStyle, setBoxStyle] = useState(defaultBoxStyle);
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageSrc(reader.result);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    }
  };

  const handleMouseOver = () => {
    setUpdateStyle("bg-green-600 text-white shadow-green-400/50");
    setBoxStyle("ring-4 ring-green-500");
  }

  const handleMouseLeave = () => {
    setUpdateStyle(defaultUpdateStyle);
    setBoxStyle(defaultBoxStyle);
  }

  // Only use inline style for the dynamic background image
  const backgroundStyle = imageSrc
    ? {
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
      
      };

  return (
    <div>
      {/* Clickable area to trigger image upload */}
      <div
        onClick={handleClick}
        className={`w-52 h-40 shadow flex items-center justify-center text-center cursor-pointer rounded-xl transition duration-300 transform hover:scale-105 overflow-hidden ${
          imageSrc ? "" : "bg-gray-100"
        } ${boxStyle}`}
        style={backgroundStyle}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
      >
        <p className={`text-black px-3 py-2 rounded shadow-lg duration-200 ${updateStyle}`}>Update</p>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        name={name}
      />
    </div>
  );
};

export default ImageUploader;
