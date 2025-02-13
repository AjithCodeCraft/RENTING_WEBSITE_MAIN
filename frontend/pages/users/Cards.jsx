import React from "react";
import { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { LocateFixed } from "lucide-react";
import Image from "next/image";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Updated hostels array with unique IDs
const hostels = [
  { id: 1, name: "Green View Hostel", location: "Downtown", price: "$300/mo", image: "/download.png" },
  { id: 2, name: "Sunset Residency", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg" },
  { id: 3, name: "City Lights Hostel", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg" },
  { id: 4, name: "Green View Hostel 2", location: "Downtown", price: "$300/mo", image: "/download.png" },
  { id: 5, name: "Sunset Residency 2", location: "Uptown", price: "$350/mo", image: "/loginhome.jpg" },
  { id: 6, name: "City Lights Hostel 2", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg" },
  { id: 7, name: "Mountain View Hostel", location: "Uptown", price: "$450/mo", image: "/loginhome.jpg" },
  { id: 8, name: "Ocean Breeze Hostel", location: "Beachside", price: "$500/mo", image: "/loginhome.jpg" },
  { id: 9, name: "Green View Hostel 3", location: "Downtown", price: "$300/mo", image: "/download.png" },
  { id: 10, name: "Sunset Residency 3", location: "Uptown", price: "$350/mo", image: "/tree-house.jpg" },
  { id: 11, name: "City Lights Hostel 3", location: "Midtown", price: "$400/mo", image: "/loginhome.jpg" },
  { id: 12, name: "Mountain View Hostel 2", location: "Uptown", price: "$450/mo", image: "/loginhome.jpg" },
  { id: 13, name: "Ocean Breeze Hostel 2", location: "Beachside", price: "$500/mo", image: "/loginhome.jpg" },
];

const HOSTEL_LOCATIONS = [
  { lng: 76.88013843230549, lat: 8.55855167721169, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
  { lng: 76.87899888341339, lat: 8.556990221115427, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
  { lng: 76.87645772879704, lat: 8.558444894438177, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
  { lng: 76.87603094023191, lat: 8.555420290444625, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
  { lng: 76.87802262020246, lat: 8.554576210624122, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
  { lng: 76.86806422034977, lat: 8.560906763671213, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
];

const DEFAULT_ZOOM = 7;
const CLOSE_ZOOM = 13.5;
const HOSTEL_ICON_URL = "hostel.png";
const USER_ICON_URL = "user.png";
const ITEMS_PER_PAGE = 9; // Number of hostels per page

const createCustomMarker = (iconUrl, size = [30, 30]) => {
  const el = document.createElement("div");
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.width = `${size[0]}px`;
  el.style.height = `${size[1]}px`;
  el.style.backgroundSize = "cover";
  return el;
};

const CardDemo = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const detailsRef = useRef(null);

  // Calculate total pages
  const totalPages = Math.ceil(hostels.length / ITEMS_PER_PAGE);

  // Get hostels for the current page
  const currentHostels = hostels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    const mapInstance = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [76.8801, 8.5585],
      zoom: DEFAULT_ZOOM,
    });

    setMap(mapInstance);

    mapInstance.on("load", () => {
      mapInstance._controlContainer.children[2]?.remove();
    });

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), "top-right");

    HOSTEL_LOCATIONS.forEach((hostel) => {
      const marker = new maplibregl.Marker({ element: createCustomMarker(HOSTEL_ICON_URL) })
        .setLngLat([hostel.lng, hostel.lat])
        .setPopup(new maplibregl.Popup().setText(hostel.name))
        .addTo(mapInstance);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHostel(hostel);
      });
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const userMarker = new maplibregl.Marker({ element: createCustomMarker(USER_ICON_URL, [35, 35]) })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setText("Your Location"))
            .addTo(mapInstance);

          mapInstance.setCenter([longitude, latitude]);
          mapInstance.setZoom(CLOSE_ZOOM);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setSelectedHostel(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      mapInstance.remove();
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleGetDirections = () => {
    if (selectedHostel && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedHostel.lat},${selectedHostel.lng}`;
      window.open(url, "_blank");
    }
  };

  const locateUser = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          if (map) {
            const userMarker = new maplibregl.Marker({ element: createCustomMarker(USER_ICON_URL, [35, 35]) })
              .setLngLat([longitude, latitude])
              .setPopup(new maplibregl.Popup().setText("Your Location"))
              .addTo(map);

            map.setCenter([longitude, latitude]);
            map.setZoom(CLOSE_ZOOM);
          }
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4">
      {/* Left Section - Hostel Listings */}
      <div className="w-full md:w-3/5 md:pr-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentHostels.map((hostel) => (
            <div
              key={hostel.id}
              className="w-full group/card cursor-pointer overflow-hidden relative h-65 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4 bg-cover"
              style={{
                backgroundImage: `url(${hostel.image})`,
              }}
            >
              <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
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
                  {hostel.name}
                </h1>
                <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
                  {hostel.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-8 mb-8">
          <Pagination>
            <PaginationContent>
              {/* Hide "Previous" button on the first page */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                  />
                </PaginationItem>
              )}
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i + 1}>
                  <PaginationLink
                    onClick={() => handlePageChange(i + 1)}
                    isActive={currentPage === i + 1}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              {/* Hide "Next" button on the last page */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      </div>

      {/* Right Section - Map */}
      <div className="md:w-2/5  items-center justify-center rounded-xl     md:mt-0">
        <div className="relative w-full h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="relative w-full h-full">
            <div id="map" className="w-full h-full rounded-xl" />
            <button
              className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
              onClick={locateUser}
            >
              <LocateFixed className="w-5 h-5 text-blue-500" />
            </button>
            {selectedHostel && (
              <div ref={detailsRef} className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60">
                <h3 className="text-md font-semibold">{selectedHostel.name}</h3>
                <p className="text-xs text-gray-600">{selectedHostel.address}</p>
                <p className="text-xs text-green-600 font-medium">Price: {selectedHostel.price}</p>
                <Button className="mt-2 w-full bg-blue-500 text-white text-xs py-1" onClick={handleGetDirections}>
                  Get Directions
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDemo;