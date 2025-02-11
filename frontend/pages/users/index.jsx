import React from "react";
import UserHeader from "./UserHeader";
import Searchbar from "./searchbar";
import HomeCard from "./HomeCard";

export default function Index() {
  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header Section */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <UserHeader />
      </div>

      {/* Searchbar Section */}
      <div className="flex justify-center items-center mt-10">
        <Searchbar />
      </div>

      {/* Homecard Section */}
      <div className="flex justify-center items-center mt-9 pb-10">
        <HomeCard />
      </div>
    </div>
  );
}
