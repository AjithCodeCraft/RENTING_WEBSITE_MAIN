import React, { useEffect, useState, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { LocateFixed, Plus } from "lucide-react";
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
import OwnerHeader from "../OwnerHeader";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/router";

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
  el.style.transition = "width 0.3s, height 0.3s"; // Add transition for smooth resizing
  return el;
};

// Function to convert hex to Base64
const hexToBase64 = (hex) => {
  const bytes = new Uint8Array(
    hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return Buffer.from(bytes).toString("base64");
};

const OwnerHostels = () => {
  const [map, setMap] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pendingApartments, setPendingApartments] = useState([]);
  const [approvedApartments, setApprovedApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [hoveredHostel, setHoveredHostel] = useState(null);
  const mapContainerRef = useRef(null); // Ref for the map container
  const detailsRef = useRef(null); // Ref for the details popup
  const [curretnTab, setCurrentTab] = useState("approved");
  const [currentHostels, setCurrentHostels] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  
  const router = useRouter();

  // Fetch pending apartments and their images
  useEffect(() => {
    const fetchPendingApartments = async () => {
      try {
        const accessToken = localStorage.getItem("access_token_owner");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        // Fetch pending apartments
        const apartmentsResponse = await fetch(
          "http://localhost:8000/api/pending_apartments_for_owner/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        // Fetch Approved Apartments
        const approvedApartmentResponse = await fetch(
          "http://localhost:8000/api/apartment/approved/by-owner/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!apartmentsResponse.ok) {
          throw new Error("Failed to fetch pending apartments");
        }
        if (!approvedApartmentResponse.ok) {
          throw new Error("Failed to fetch approved apartments");
        }
        const apartmentsData = await apartmentsResponse.json();
        const approvedApartments = await approvedApartmentResponse.json();

        // Fetch images for each apartment
        const apartmentsWithImages = await Promise.all(
          apartmentsData.map(async (apartment) => {
            try {
              const imagesResponse = await fetch(
                `http://127.0.0.1:8000/api/apartment-images/${apartment.apartment_id}/`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!imagesResponse.ok) {
                // If no images are found, use the default thumbnail
                return {
                  ...apartment,
                  images: [{ image_data: DEFAULT_THUMBNAIL }],
                };
              }

              const imagesData = await imagesResponse.json();
              return { ...apartment, images: imagesData.images };
            } catch (error) {
              console.error(
                `Error fetching images for apartment ${apartment.apartment_id}:`,
                error
              );
              // If there's an error, use the default thumbnail
              return {
                ...apartment,
                images: [{ image_data: DEFAULT_THUMBNAIL }],
              };
            }
          })
        );

        const approvedApartmentsWithImages = await Promise.all(
          approvedApartments.map(async (apartment) => {
            try {
              const imagesResponse = await fetch(
                `http://127.0.0.1:8000/api/apartment-images/${apartment.apartment_id}/`,
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

              if (!imagesResponse.ok) {
                // If no images are found, use the default thumbnail
                return {
                  ...apartment,
                  images: [{ image_data: DEFAULT_THUMBNAIL }],
                };
              }

              const imagesData = await imagesResponse.json();
              return { ...apartment, images: imagesData.images };
            } catch (error) {
              console.error(
                `Error fetching images for apartment ${apartment.apartment_id}:`,
                error
              );
              // If there's an error, use the default thumbnail
              return {
                ...apartment,
                images: [{ image_data: DEFAULT_THUMBNAIL }],
              };
            }
          })
        );

        setApprovedApartments(approvedApartmentsWithImages);
        setPendingApartments(apartmentsWithImages);
        setCurrentHostels(approvedApartmentsWithImages);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPendingApartments();
  }, []);

  useEffect(() => {
    const lTotalPages = Math.ceil(currentHostels.length / ITEMS_PER_PAGE);
    setTotalPages(lTotalPages);
    setCurrentPage(1);
  }, [currentHostels]);

  const handleApprovedTabClick = () => {
    setCurrentTab("approved");
    setCurrentHostels(approvedApartments);
  };

  const handlePendingTabClick = () => {
    setCurrentTab("pending");
    setCurrentHostels(pendingApartments);
  };

  // Initialize the map
  useEffect(() => {
    if (
      !mapContainerRef.current ||
      pendingApartments.length + approvedApartments.length === 0
    )
      return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [76.8801, 8.5585], // Default center
      zoom: DEFAULT_ZOOM,
    });

    setMap(mapInstance);

    mapInstance.on("load", () => {
      mapInstance._controlContainer.children[2]?.remove(); // Remove unnecessary controls
    });

    mapInstance.addControl(
      new maplibregl.NavigationControl({ showCompass: false, showZoom: false }),
      "top-right"
    );

    const allApartments = [...pendingApartments, ...approvedApartments];
    const markers = allApartments.map((apartment) => {
      const marker = new maplibregl.Marker({
        element: createCustomMarker(HOSTEL_ICON_URL),
      })
        .setLngLat([apartment.longitude, apartment.latitude])
        .addTo(mapInstance);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHostel(apartment); // Show legend when marker is clicked
      });

      return marker;
    });

    setMarkers(markers);

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          // Add a marker for the user's location
          const userMarker = new maplibregl.Marker({
            element: createCustomMarker(USER_ICON_URL, [35, 35]),
          })
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

    // Handle clicks outside the details popup
    const handleClickOutside = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        setSelectedHostel(null);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      mapInstance.remove(); // Clean up the map instance
      document.removeEventListener("click", handleClickOutside);
    };
  }, [loading]); // loadint may cause an error /// so use [approvedApartments, pendingApartment] ///

  // Center the map on the selected hostel when a hostel card is clicked
  useEffect(() => {
    if (selectedHostel && map) {
      map.flyTo({
        center: [selectedHostel.longitude, selectedHostel.latitude],
        zoom: CLOSE_ZOOM,
      });
    }
  }, [selectedHostel, map]);

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

  const handleGetDirections = () => {
    if (selectedHostel && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedHostel.latitude},${selectedHostel.longitude}`;
      window.open(url, "_blank");
    }
  };


  const handleClick = (apartment) => {
    setSelectedHostel(apartment);
  };

  const handleDoubleClick = (apartmentId) => {
    router.push(`\hostels\\${apartmentId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <OwnerHeader />
      </header>
      <div className="flex flex-col md:flex-row h-full w-full p-4">
        {/* Left Section - Hostel Listings */}
        <div className="w-full md:w-3/5 md:pr-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">My Hostels</h1>
            <Link href="/addapp" passHref>
              <Button className="bg-blue-500 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add New Hostel
              </Button>
            </Link>
          </div>
          <Tabs defaultValue="approved" className="space-y-4">
            <TabsList className="w-full md:w-auto">
              <TabsTrigger
                value="approved"
                className="w-full md:w-auto"
                onClick={handleApprovedTabClick}
              >
                Approved Apartements
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="w-full md:w-auto"
                onClick={handlePendingTabClick}
              >
                Pending Apartements
              </TabsTrigger>
            </TabsList>

            <TabsContent value={curretnTab} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentHostels.map((apartment) => {
                  const imageData = apartment.images[0]?.image_data;
                  const imageUrl = imageData.startsWith("ffd8") // Check if it's a hex string
                    ? `data:image/jpeg;base64,${hexToBase64(imageData)}`
                    : imageData;

                  return (
                    <div
                      key={apartment.apartment_id}
                      className={`w-full group/card cursor-pointer overflow-hidden relative rounded-md shadow-xl max-w-sm mx-auto bg-cover transition-transform transform ${
                        selectedHostel?.apartment_id === apartment.apartment_id
                          ? "scale-105"
                          : ""
                      }`}
                      style={{
                        backgroundImage: `url(${imageUrl})`,
                      }}
                      onClick={() => handleClick(apartment)}
                      onMouseEnter={() => setHoveredHostel(apartment)}
                      onMouseLeave={() => setHoveredHostel(null)}
                      onDoubleClick={() => handleDoubleClick(apartment.apartment_id)}
                    >
                      <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                      <div className="flex flex-row items-center space-x-4 z-10 p-4">
                        <Image
                          height="100"
                          width="100"
                          alt="Avatar"
                          src="/manu.png"
                          className="h-10 w-10 rounded-full border-2 object-cover"
                        />
                        <div className="flex flex-col">
                          <p className="font-normal text-base text-gray-50 relative z-10">
                            {apartment.title}
                          </p>
                          <p className="text-sm text-gray-400">
                            {apartment.location}
                          </p>
                        </div>
                      </div>
                      <div className="text content p-4">
                        <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                          {apartment.title}
                        </h1>
                        <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
                          ₹{apartment.rent}
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
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Section - Map */}
        <div className="md:w-2/5 items-center justify-center rounded-xl md:mt-0">
          <div className="relative w-full h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Use the ref for the map container */}
              <div
                id="map"
                ref={mapContainerRef}
                className="w-full h-full rounded-xl"
              />
              {/* Locate User Button */}
              <button
                className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
                onClick={locateUser}
              >
                <LocateFixed className="w-5 h-5 text-blue-500" />
              </button>
              {/* Selected Hostel Details */}
              {selectedHostel && (
                <div
                  ref={detailsRef}
                  className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60"
                >
                  <h3 className="text-md font-semibold">
                    {selectedHostel.title}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {selectedHostel.location}
                  </p>
                  <p className="text-xs text-green-600 font-medium">
                    Price: ₹{selectedHostel.rent}
                  </p>
                  <Button
                    className="mt-2 w-full bg-blue-500 text-white text-xs py-1"
                    onClick={handleGetDirections}
                  >
                    Get Directions
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OwnerHostels;
