// "use client";
// import { useEffect, useState, useRef } from "react";
// import maplibregl from "maplibre-gl";
// import "maplibre-gl/dist/maplibre-gl.css";
// import { Button } from "@/components/ui/button";
// import { LocateFixed } from "lucide-react";

// const HOSTEL_LOCATIONS = [
//   { lng: 76.88013843230549, lat: 8.55855167721169, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
//   { lng: 76.87899888341339, lat: 8.556990221115427, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
//   { lng: 76.87645772879704, lat: 8.558444894438177, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
//   { lng: 76.87603094023191, lat: 8.555420290444625, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
//   { lng: 76.87802262020246, lat: 8.554576210624122, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
//   { lng: 76.86806422034977, lat: 8.560906763671213, name: "Hostel Near You", address: "XYZ Street, Your City", price: "₹5000/month" },
// ];

// const DEFAULT_ZOOM = 7;
// const CLOSE_ZOOM = 13.5; // Closer zoom level

// const HOSTEL_ICON_URL = "hostel.png";
// const USER_ICON_URL = "user.png";

// const createCustomMarker = (iconUrl, size = [30, 30]) => {
//   const el = document.createElement("div");
//   el.style.backgroundImage = `url(${iconUrl})`;
//   el.style.width = `${size[0]}px`;
//   el.style.height = `${size[1]}px`;
//   el.style.backgroundSize = "cover";
//   return el;
// };

// const MapCard = () => {
//   const [map, setMap] = useState(null);
//   const [userLocation, setUserLocation] = useState(null);
//   const [selectedHostel, setSelectedHostel] = useState(null);
//   const detailsRef = useRef(null);

//   useEffect(() => {
//     const mapInstance = new maplibregl.Map({
//       container: "map",
//       style: "https://tiles.openfreemap.org/styles/liberty",
//       center: [76.8801, 8.5585], // Default center
//       zoom: DEFAULT_ZOOM,
//     });
  
//     setMap(mapInstance);
  
//     mapInstance.on("load", () => {
//       mapInstance._controlContainer.children[2]?.remove();
//     });
  
//     mapInstance.addControl(new maplibregl.NavigationControl({ showCompass: false, showZoom: false }), "top-right");
  
//     // Add hostel markers
//     HOSTEL_LOCATIONS.forEach((hostel) => {
//       const marker = new maplibregl.Marker({ element: createCustomMarker(HOSTEL_ICON_URL) })
//         .setLngLat([hostel.lng, hostel.lat])
//         .setPopup(new maplibregl.Popup().setText(hostel.name))
//         .addTo(mapInstance);
  
//       marker.getElement().addEventListener("click", (e) => {
//         e.stopPropagation();
//         setSelectedHostel(hostel);
//       });
//     });
  
//     // Automatically locate user on mount
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setUserLocation({ lat: latitude, lng: longitude });
  
//           const userMarker = new maplibregl.Marker({ element: createCustomMarker(USER_ICON_URL, [35, 35]) })
//             .setLngLat([longitude, latitude])
//             .setPopup(new maplibregl.Popup().setText("Your Location"))
//             .addTo(mapInstance);
  
//           // Center the map on user's location with a closer zoom
//           mapInstance.setCenter([longitude, latitude]);
//           mapInstance.setZoom(CLOSE_ZOOM);
//         },
//         (error) => console.error("Geolocation error:", error),
//         { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
//       );
//     }
  
//     const handleClickOutside = (event) => {
//       if (detailsRef.current && !detailsRef.current.contains(event.target)) {
//         setSelectedHostel(null);
//       }
//     };
  
//     document.addEventListener("click", handleClickOutside);
  
//     return () => {
//       mapInstance.remove();
//       document.removeEventListener("click", handleClickOutside);
//     };
//   }, []);
  

//   const handleGetDirections = () => {
//     if (selectedHostel && userLocation) {
//       const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${selectedHostel.lat},${selectedHostel.lng}`;
//       window.open(url, "_blank");
//     }
//   };

//   const locateUser = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setUserLocation({ lat: latitude, lng: longitude });

//           // Add or update the user location marker
//           if (map) {
//             const userMarker = new maplibregl.Marker({ element: createCustomMarker(USER_ICON_URL, [35, 35]) })
//               .setLngLat([longitude, latitude])
//               .setPopup(new maplibregl.Popup().setText("Your Location"))
//               .addTo(map);

//             // Center the map on the user's location and set a closer zoom level
//             map.setCenter([longitude, latitude]);
//             map.setZoom(CLOSE_ZOOM);
//           }
//         },
//         (error) => console.error("Geolocation error:", error),
//         { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 } // Force fresh GPS data
//       );
//     }
//   };

//   return (
//     <div className="relative w-full h-full bg-gray-200 rounded-xl flex items-center justify-center">
//       {/* Map Container - Fills the Right Section */}
//       <div className="relative w-full h-full">
//         <div id="map" className="w-full h-full rounded-xl" /> {/* Map fits container fully */}

//         {/* GPS Button */}
//         <button
//           className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-10"
//           onClick={locateUser}
//         >
//           <LocateFixed className="w-5 h-5 text-blue-500" />
//         </button>

//         {/* Popup Hostel Details */}
//         {selectedHostel && (
//           <div ref={detailsRef} className="absolute top-2 right-2 bg-white shadow-lg p-2 rounded-md w-60">
//             <h3 className="text-md font-semibold">{selectedHostel.name}</h3>
//             <p className="text-xs text-gray-600">{selectedHostel.address}</p>
//             <p className="text-xs text-green-600 font-medium">Price: {selectedHostel.price}</p>
//             <Button className="mt-2 w-full bg-blue-500 text-white text-xs py-1" onClick={handleGetDirections}>
//               Get Directions
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default MapCard;