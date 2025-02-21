import React, { useEffect, useState } from "react";
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
import Link from "next/link";

const DEFAULT_ZOOM = 7;
const CLOSE_ZOOM = 13.5;
const HOSTEL_ICON_URL = "/hostel.png"; // Ensure the path is correct
const USER_ICON_URL = "/user.png"; // Ensure the path is correct
const ITEMS_PER_PAGE = 6; // Number of hostels per page
const DEFAULT_THUMBNAIL = "/default-image.jpg"; // Default thumbnail image

const createCustomMarker = (iconUrl, size = [30, 30]) => {
  const el = document.createElement("div");
  el.style.backgroundImage = `url(${iconUrl})`;
  el.style.width = `${size[0]}px`;
  el.style.height = `${size[1]}px`;
  el.style.backgroundSize = "cover";
  return el;
};

// Function to convert hex to Base64
const hexToBase64 = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  return Buffer.from(bytes).toString("base64");
};

const UserHostels = () => {
  const [map, setMap] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch hostels for users
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const accessToken = sessionStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        // Fetch hostels for users
        const hostelsResponse = await fetch("http://localhost:8000/api/apartments/approved/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (!hostelsResponse.ok) {
          throw new Error("Failed to fetch hostels");
        }
        const hostelsData = await hostelsResponse.json();

        // Fetch images for each hostel
        const hostelsWithImages = await Promise.all(
          hostelsData.map(async (hostel) => {
            try {
              const imagesResponse = await fetch(`http://127.0.0.1:8000/api/apartment-images/${hostel.apartment_id}/`, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });

              if (!imagesResponse.ok) {
                // If no images are found, use the default thumbnail
                return { ...hostel, images: [{ image_data: DEFAULT_THUMBNAIL }] };
              }

              const imagesData = await imagesResponse.json();
              return { ...hostel, images: imagesData.images };
            } catch (error) {
              console.error(`Error fetching images for hostel ${hostel.apartment_id}:`, error);
              // If there's an error, use the default thumbnail
              return { ...hostel, images: [{ image_data: DEFAULT_THUMBNAIL }] };
            }
          })
        );

        setHostels(hostelsWithImages);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // Calculate total pages
  const totalPages = Math.ceil(hostels.length / ITEMS_PER_PAGE);

  // Get hostels for the current page
  const currentHostels = hostels.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Initialize the map
  useEffect(() => {
    if (hostels.length === 0) return;

    const mapInstance = new maplibregl.Map({
      container: "map",
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [76.8801, 8.5585], // Default center
      zoom: DEFAULT_ZOOM,
    });

    setMap(mapInstance);

    mapInstance.on("load", () => {
      mapInstance._controlContainer.children[2]?.remove(); // Remove unnecessary controls
    });

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), "top-right");

    // Add markers for each hostel
    hostels.forEach((hostel) => {
      const marker = new maplibregl.Marker({ element: createCustomMarker(HOSTEL_ICON_URL) })
        .setLngLat([hostel.longitude, hostel.latitude])
        .setPopup(new maplibregl.Popup().setText(hostel.name))
        .addTo(mapInstance);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHostel(hostel);
      });
    });

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Add a marker for the user's location
          const userMarker = new maplibregl.Marker({ element: createCustomMarker(USER_ICON_URL, [35, 35]) })
            .setLngLat([longitude, latitude])
            .setPopup(new maplibregl.Popup().setText("Your Location"))
            .addTo(mapInstance);

          // Center the map on the user's location
          mapInstance.setCenter([longitude, latitude]);
          mapInstance.setZoom(CLOSE_ZOOM);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => {
      mapInstance.remove(); // Clean up the map instance
    };
  }, [hostels]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const locateUser = () => {
    if (navigator.geolocation && map) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Center the map on the user's location
          map.setCenter([longitude, latitude]);
          map.setZoom(CLOSE_ZOOM);
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4">
      {/* Left Section - Hostel Listings */}
      <div className="w-full md:w-3/5 md:pr-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentHostels.map((hostel) => {
            const imageData = hostel.images[0]?.image_data;
            const imageUrl = imageData.startsWith("ffd8") // Check if it's a hex string
              ? `data:image/jpeg;base64,${hexToBase64(imageData)}`
              : imageData;

            return (
              <div
                key={hostel.apartment_id}
                className="w-full group/card cursor-pointer overflow-hidden relative h-65 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4 bg-cover"
                style={{
                  backgroundImage: `url(${imageUrl})`,
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
                    {hostel.rent}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="mt-8 mb-8">
          <Pagination>
            <PaginationContent>
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
      <div className="md:w-2/5 items-center justify-center rounded-xl md:mt-0">
        <div className="relative w-full h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
          <div className="relative w-full h-full">
            <div id="map" className="w-full h-full rounded-xl" />
            {/* Locate User Button */}
            <button
              className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
              onClick={locateUser}
            >
              <LocateFixed className="w-5 h-5 text-blue-500" />
            </button>
            {/* Selected Hostel Details */}
            {selectedHostel && (
              <div className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60">
                <h3 className="text-md font-semibold">{selectedHostel.name}</h3>
                <p className="text-xs text-gray-600">{selectedHostel.address}</p>
                <p className="text-xs text-green-600 font-medium">Price: {selectedHostel.rent}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserHostels;