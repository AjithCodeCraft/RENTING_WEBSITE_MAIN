import React, {useEffect, useState, useRef} from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {Button} from "@/components/ui/button";
import {LocateFixed} from "lucide-react";
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
import useSearchFilterStore from "@/store/searchFilter";
import { abortController } from "../owner";
import { useRouter } from "next/router";

const DEFAULT_ZOOM = 7;
const CLOSE_ZOOM = 13.5;
const HOSTEL_ICON_URL = "/hostel.png"; // Ensure the path is correct
const USER_ICON_URL = "/user.png"; // Ensure the path is correct
const ITEMS_PER_PAGE = 9; // Number of hostels per page
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
    const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
    return Buffer.from(bytes).toString("base64");
};

const UserHostels = () => {
    const [map, setMap] = useState(null);
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [hostels, setHostels] = useState([]);
    const [filteredHostels, setFilteredHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [hoveredHostel, setHoveredHostel] = useState(null);
    const [tapCount, setTapCount] = useState(0);
    const [tapTimeout, setTapTimeout] = useState(null);
    const router = useRouter();

    const mapContainerRef = useRef(null);
    const detailsRef = useRef(null);

    const {filters} = useSearchFilterStore();

    const filterApartments = (apartments, filters) => {
        return apartments.filter(apartment => {
            if (filters.textSearch) {
                const searchText = filters.textSearch.toLowerCase();
                const titleMatch = apartment.title.toLowerCase().includes(searchText);
                const locationMatch = apartment.location.toLowerCase().includes(searchText);
                if (!titleMatch && !locationMatch) return false;
            }
          
            if (filters.rentMin && parseFloat(apartment.rent) < parseFloat(filters.rentMin)) return false;
            if (filters.rentMax && parseFloat(apartment.rent) > parseFloat(filters.rentMax)) return false;
            if (filters.duration && apartment.duration !== filters.duration) return false;
            if (filters.roomSharingType && apartment.room_sharing_type !== filters.roomSharingType) return false;
            if (filters.parkingAvailable && !apartment.parking_available) return false;
            if (filters.hostelType && apartment.hostel_type !== filters.hostelType) return false;
            return !(filters.bhk && apartment.bhk !== filters.bhk);
        });
    };

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                    const accessToken = localStorage.getItem("access_token_user");
                    if (!accessToken) throw new Error("No access token found");

                try {
                    const hostelsResponse = await fetch("http://localhost:8000/api/apartments/approved/", {
                        headers: {Authorization: `Bearer ${accessToken}`},
                        signal: abortController.signal
                    });
                    var hostelsData = await hostelsResponse.json();
                } catch (error) {
                    if (error.name === "AbortError") {
                      } else {
                        console.error("Fetch error:", error);
                      }
                }

                const hostelsWithImages = await Promise.all(
                    hostelsData.map(async (hostel) => {
                        try {
                            const imagesResponse = await fetch(`http://127.0.0.1:8000/api/apartment-images/${hostel.apartment_id}/`, {
                                headers: {Authorization: `Bearer ${accessToken}`},
                                signal: abortController.signal
                            });

                            if (!imagesResponse.ok) return {...hostel, images: [{image_data: DEFAULT_THUMBNAIL}]};

                            const imagesData = await imagesResponse.json();
                            return {...hostel, images: imagesData.images};
                        } catch (error) {
                            if (error.name === "AbortError") {
                            } else {
                                console.error(`Error fetching images for hostel ${hostel.apartment_id}:`, error);
                                return {...hostel, images: [{image_data: DEFAULT_THUMBNAIL}]};
                            }
                        }
                    })
                );

                setHostels(hostelsWithImages);
                setFilteredHostels(filterApartments(hostelsWithImages, filters));
                setLoading(false);
            } catch (error) {
                if (axios.isCancel(error)) {
                } else {
                  console.error("Error fetching data:", error);
                  setError(error.message);
                }
                setLoading(false);
            }
        };

        fetchHostels();
    }, []);

    useEffect(() => {
        if (hostels.length > 0) {
            const filteredData = filterApartments(hostels, filters);
            setFilteredHostels(filteredData);
        }
    }, [filters, hostels]);

    useEffect(() => {
        if (!mapContainerRef.current || filteredHostels.length === 0) return;

        const mapInstance = new maplibregl.Map({
            container: mapContainerRef.current,
            style: "https://tiles.openfreemap.org/styles/liberty",
            center: [76.8801, 8.5585],
            zoom: DEFAULT_ZOOM,
        });

        setMap(mapInstance);

        mapInstance.on("load", () => {
            mapInstance._controlContainer.children[2]?.remove();
        });

        mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), "top-right");

        const markers = filteredHostels.map((hostel) => {
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

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    localStorage.setItem("user_lat", latitude);
                    localStorage.setItem("user_lng", longitude);
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
    }, [filteredHostels]);

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

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const locateUser = () => {
        if (navigator.geolocation && map) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const {latitude, longitude} = position.coords;
                    setUserLocation({lat: latitude, lng: longitude});
                    map.setCenter([longitude, latitude]);
                    map.setZoom(CLOSE_ZOOM);
                },
                (error) => console.error("Geolocation error:", error),
                {enableHighAccuracy: true, timeout: 5000, maximumAge: 0}
            );
        }
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
            localStorage.setItem("apartment_id", hostel.apartment_id);
            router.push(`/users/HostelDetails/${hostel.apartment_id}`);
        }
    };

    const handleGetDirections = () => {
        if (selectedHostel && userLocation) {
            const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedHostel.latitude},${selectedHostel.longitude}`;
            window.open(url, "_blank");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }
    const totalPages = Math.ceil(filteredHostels.length / ITEMS_PER_PAGE);
    const currentHostels = filteredHostels.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="flex flex-col md:flex-row h-full w-full p-4">
            {/* Left Section - Hostel Listings */}
            <div className="w-full md:w-3/5 md:pr-4 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {currentHostels?.map((hostel) => {
                        const imageData = hostel.images[0]?.image_data;
                        const imageUrl = imageData.startsWith("ffd8") // Check if it's a hex string
                            ? `data:image/jpeg;base64,${hexToBase64(imageData)}`
                            : imageData;

                        return (
                            <div
                                key={hostel.apartment_id} // Use `apartment_id` as the key
                                className={`relative w-full h-64 md:h-65 group/card cursor-pointer overflow-hidden rounded-md shadow-xl bg-cover transition-transform transform ${
                                    selectedHostel?.apartment_id === hostel.apartment_id ? "scale-105" : ""
                                }`}
                                style={{
                                    backgroundImage: `url(${imageUrl})`,
                                }}
                                onClick={() => handleHostelCardTap(hostel)}
                                onMouseEnter={() => setHoveredHostel(hostel)}
                                onMouseLeave={() => setHoveredHostel(null)}
                            >
                                <div
                                    className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>
                                <div className="absolute bottom-0 w-full p-4 z-10">
                                    <h1 className="font-bold text-xl md:text-2xl text-gray-50 relative z-10">
                                        {hostel.title}
                                    </h1>
                                    <p className="font-normal text-sm text-gray-50 relative z-10 my-2">
                                        ₹{hostel.rent}
                                    </p>
                                    <p className="text-sm text-gray-400">{hostel.location}</p>
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
                            {Array.from({length: totalPages}, (_, i) => (
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
                <div className="relative w-full h-[800px] bg-gray-200 rounded-xl flex items-center justify-center">
                    <div className="relative w-full h-full">
                        {/* Use the ref for the map container */}
                        <div id="map" ref={mapContainerRef} className="w-full h-full rounded-xl"/>
                        <button
                            className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
                            onClick={locateUser}
                        >
                            <LocateFixed className="w-5 h-5 text-blue-500"/>
                        </button>
                        {selectedHostel && (
                            <div ref={detailsRef}
                                 className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60">
                                <h3 className="text-md font-semibold">{selectedHostel.title}</h3>
                                <p className="text-xs text-gray-600">{selectedHostel.location}</p>
                                <p className="text-xs text-green-600 font-medium">Price: ₹{selectedHostel.rent}</p>
                                <Button className="mt-2 w-full bg-blue-500 text-white text-xs py-1"
                                        onClick={handleGetDirections}>
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

export default UserHostels;