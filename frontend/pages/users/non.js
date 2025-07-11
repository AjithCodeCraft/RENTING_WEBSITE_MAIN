import React, { useEffect, useState, useRef } from "react";
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
const HOSTEL_ICON_URL = "hostel.png";
const USER_ICON_URL = "user.png";
const ITEMS_PER_PAGE = 9;
const DEFAULT_THUMBNAIL = "/default-hostel.jpg"; // Default thumbnail image

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

const CardDemo = () => {
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [hoveredHostel, setHoveredHostel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [markers, setMarkers] = useState([]);
  const [tapCount, setTapCount] = useState(0);
  const [tapTimeout, setTapTimeout] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hostelImages, setHostelImages] = useState({}); // Store images for each hostel
  const mapContainerRef = useRef(null); // Ref for the map container
  const detailsRef = useRef(null);

  // Fetch hostels with authentication
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const accessToken = sessionStorage.getItem("access_token");
        if (!accessToken) {
          throw new Error("No access token found");
        }

        const response = await fetch("http://localhost:8000/api/apartments/approved/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401) {
          // Handle unauthorized access
          throw new Error("Unauthorized access. Please login again.");
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        setHostels(data);

        // Fetch images for each hostel
        const images = {};
        for (const hostel of data) {
          try {
            const imagesResponse = await fetch(`http://127.0.0.1:8000/api/apartment-images/${hostel.apartment_id}/`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (!imagesResponse.ok) {
              // If no images are found, use the default thumbnail
              images[hostel.id] = [{ image_data: DEFAULT_THUMBNAIL }];
              continue;
            }

            const imagesData = await imagesResponse.json();
            images[hostel.id] = imagesData.images;
          } catch (error) {
            console.error(`Error fetching images for hostel ${hostel.id}:`, error);
            // If there's an error, use the default thumbnail
            images[hostel.id] = [{ image_data: DEFAULT_THUMBNAIL }];
          }
        }

        setHostelImages(images);
      } catch (error) {
        console.error("Fetch error:", error);
        setError(error.message);

        // Redirect to login if unauthorized
        if (error.message.includes("Unauthorized")) {
          sessionStorage.removeItem("access_token");
          window.location.href = "/login";
        }
      } finally {
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

  // Initialize the map after the component is mounted
  useEffect(() => {
    if (!mapContainerRef.current || hostels.length === 0) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainerRef.current, // Use the ref to the map container
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [76.8801, 8.5585],
      zoom: DEFAULT_ZOOM,
    });

    setMap(mapInstance);

    mapInstance.on("load", () => {
      mapInstance._controlContainer.children[2]?.remove();
    });

    mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), "top-right");

    // Add markers for each hostel
    const markers = hostels.map((hostel) => {
      const marker = new maplibregl.Marker({ element: createCustomMarker(HOSTEL_ICON_URL) })
        .setLngLat([hostel.longitude, hostel.latitude])
        .setPopup(new maplibregl.Popup().setText(hostel.title))
        .addTo(mapInstance);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        setSelectedHostel(hostel);
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
  }, [hostels]);

  useEffect(() => {
    if (selectedHostel && map) {
      map.flyTo({
        center: [selectedHostel.longitude, selectedHostel.latitude],
        zoom: CLOSE_ZOOM,
      });

      markers.forEach((marker) => {
        const markerElement = marker.getElement();
        if (marker.getLngLat().lng === selectedHostel.longitude && marker.getLngLat().lat === selectedHostel.latitude) {
          markerElement.style.width = "40px";
          markerElement.style.height = "40px";
        } else {
          markerElement.style.width = "30px";
          markerElement.style.height = "30px";
        }
      });
    }
  }, [selectedHostel, map, markers]);

  useEffect(() => {
    if (hoveredHostel && map) {
      markers.forEach((marker) => {
        const markerElement = marker.getElement();
        if (marker.getLngLat().lng === hoveredHostel.longitude && marker.getLngLat().lat === hoveredHostel.latitude) {
          markerElement.style.width = "40px";
          markerElement.style.height = "40px";
        } else {
          markerElement.style.width = "30px";
          markerElement.style.height = "30px";
        }
      });
    } else if (!hoveredHostel && map) {
      markers.forEach((marker) => {
        const markerElement = marker.getElement();
        markerElement.style.width = "30px";
        markerElement.style.height = "30px";
      });
    }
  }, [hoveredHostel, map, markers]);

  const handleGetDirections = () => {
    if (selectedHostel && userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedHostel.latitude},${selectedHostel.longitude}`;
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

  const handleHostelCardTap = (hostel) => {
    if (tapCount === 0) {
      setSelectedHostel(hostel);
      setTapCount(1);

      setTapTimeout(
        setTimeout(() => {
          setTapCount(0);
        }, 300)
      );
    } else if (tapCount === 1) {
      clearTimeout(tapTimeout);
      setTapCount(0);
      window.location.href = `/users/HostelDetails/${hostel.id}`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-center">
          <p className="text-xl font-semibold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-full w-full p-4">
      {/* Left Section - Hostel Listings */}
      <div className="w-full md:w-3/5 md:pr-4 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentHostels.map((hostel) => {
            const imageData = hostelImages[hostel.id]?.[0]?.image_data;
            const imageUrl = imageData?.startsWith("ffd8") // Check if it's a hex string
              ? `data:image/jpeg;base64,${hexToBase64(imageData)}`
              : imageData || DEFAULT_THUMBNAIL;

            return (
              <div
                key={hostel.id}
                className={`w-full group/card cursor-pointer overflow-hidden relative h-65 rounded-md shadow-xl max-w-sm mx-auto backgroundImage flex flex-col justify-between p-4 bg-cover ${
                  selectedHostel?.id === hostel.id ? "border-2 border-blue-500" : ""
                }`}
                style={{
                  backgroundImage: `url(${imageUrl})`,
                }}
                onClick={() => handleHostelCardTap(hostel)}
                onMouseEnter={() => setHoveredHostel(hostel)}
                onMouseLeave={() => setHoveredHostel(null)}
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
                      {hostel.title}
                    </p>
                    <p className="text-sm text-gray-400">{hostel.location}</p>
                  </div>
                </div>
                <div className="text content">
                  <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                    {hostel.title}
                  </h1>
                  <p className="font-normal text-sm text-gray-50 relative z-10 my-4">
                    ₹{hostel.rent}
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
            {/* Use the ref for the map container */}
            <div id="map" ref={mapContainerRef} className="w-full h-full rounded-xl" />
            <button
              className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
              onClick={locateUser}
            >
              <LocateFixed className="w-5 h-5 text-blue-500" />
            </button>
            {selectedHostel && (
              <div ref={detailsRef} className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60">
                <h3 className="text-md font-semibold">{selectedHostel.title}</h3>
                <p className="text-xs text-gray-600">{selectedHostel.location}</p>
                <p className="text-xs text-green-600 font-medium">Price: ₹{selectedHostel.rent}</p>
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