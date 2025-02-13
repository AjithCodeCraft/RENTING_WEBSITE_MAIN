import React from "react";
import UserHeader from "./UserHeader";
import Searchbar from "./searchbar";
import  CardDemo  from "./Cards";
// import Map from "./MapView";
// import MapCard from "./MapView";
import FooterSection from "./footerSection";

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
      <div className="">
        <CardDemo/>
      </div>
      <div>
      {/* <MapCard/> */}
      </div>
      <FooterSection/>
      
    </div>
  );
}
