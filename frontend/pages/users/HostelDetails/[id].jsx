"use client";

import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StarIcon, MapPinIcon, Share2Icon, HeartIcon, MessageCircleIcon, XIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import UserHeader from "../UserHeader";
import { useState, useEffect } from "react";
import { addDays, format, differenceInDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/Spinner";
import usePaymentConfirmation from "@/hooks/usePaymentConfirmation";
import axios from "axios";


const DEFAULT_THUMBNAIL = "/default-image.jpg";

const hexToBase64 = (hex) => {
   const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
   return Buffer.from(bytes).toString("base64");
};




const dateToCalendarFormat = (date) => ({
   year: date.getFullYear(),
   month: date.getMonth() + 1,
   day: date.getDate(),
});

const calendarFormatToDate = (calendarDate) => {
   if (!calendarDate) return null;
   return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day);
};

const HostelDetails = () => {
   const [hostel, setHostel] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
   const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false);
   const [message, setMessage] = useState("");
   const [selectedReview, setSelectedReview] = useState(null);
   const [duration, setDuration] = useState("short-term");
   const ratingCounts = {
      5: Math.floor(Math.random() * 200) + 50,  // 50 to 249
      4: Math.floor(Math.random() * 150) + 30,  // 30 to 179
      3: Math.floor(Math.random() * 100) + 10,  // 10 to 109
      2: Math.floor(Math.random() * 50) + 5,    // 5 to 54
      1: Math.floor(Math.random() * 30) + 1     // 1 to 30
   };
   const [modalMessage, setModalMessage] = useState("");
   const [showModal, setShowModal] = useState(false);
   const [selectedDayRange, setSelectedDayRange] = useState({
      from: null,
      to: null,
   });
   const [apartment_id, setApartmentId] = useState(null);
   const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false);
   const [bookingDetails, setBookingDetails] = useState(null);
   const [bookingExpiryDate, setBookingExpiryDate] = useState(null);
   const [paymentLink, setPaymentLink] = useState(null);
   const [paymentLoading, setPaymentLoading] = useState(false);
   const [bookingId, setBookingId] = useState(null);
   const [razorpayOrderId, setRazorpayOrderId] = useState(null);
   const [paymentStatus, setPaymentStatus] = useState(false);
   const [paymentFailed, setPaymentFailed] = useState(false);
   const [saved, setSaved] = useState(false);
   const [saving, setSaving] = useState(false);
   const [userLocation, setUserLocation] = useState({ lat: null, lng: null });


   const openRazorpayGatway = () => {
      setPaymentLoading(true);
      window.open(paymentLink, "_blank");
   };

   useEffect(() => {
      if (paymentStatus || paymentFailed) {
         const timer = setTimeout(() => {
            setIsBookingPopupOpen(false);
         }, 2000);

         return () => clearTimeout(timer);
      }
   }, [paymentStatus, paymentFailed]);

   useEffect(() => {
      const apartmentId = localStorage.getItem("apartment_id");
      if (apartmentId) {
         setApartmentId(apartmentId);
      } else {
         setError("Apartment ID not found in localStorage");
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (!apartment_id) return;

      const fetchApartmentDetails = async () => {
         try {
            const accessToken = localStorage.getItem("access_token_user");
            if (!accessToken) {
               throw new Error("No access token found");
            }

            // Fetch apartment details
            const apartmentResponse = await fetch(`http://127.0.0.1:8000/api/apartments_by_id/${apartment_id}/`, {
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
            if (!apartmentResponse.ok) {
               throw new Error("Failed to fetch apartment details");
            }
            const apartmentData = await apartmentResponse.json();

            // Fetch apartment images
            const imagesResponse = await fetch(`http://127.0.0.1:8000/api/apartment-images/${apartment_id}/`, {
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });
            if (!imagesResponse.ok) {
               throw new Error("Failed to fetch apartment images");
            }
            const imagesData = await imagesResponse.json();

            // Process images
            const imagesWithBase64 =
               imagesData.images?.map((image) => {
                  if (image.image_data?.startsWith("ffd8")) {
                     return {
                        ...image,
                        image_url: `data:image/jpeg;base64,${hexToBase64(image.image_data)}`,
                     };
                  }
                  return image;
               }) || [];

            // Combine apartment data with images
            const apartmentWithImages = {
               ...apartmentData,
               images: imagesWithBase64.length > 0 ? imagesWithBase64 : [{ image_url: DEFAULT_THUMBNAIL }],
            };

            // Fetch owner details
            const ownerResponse = await fetch(`http://localhost:8000/api/owner-by-apartment/${apartment_id}/`, {
               headers: {
                  Authorization: `Bearer ${accessToken}`,
               },
            });

            if (!ownerResponse.ok) {
               throw new Error("Failed to fetch owner details");
            }

            const ownerData = await ownerResponse.json();

            if (ownerData.success) {
               // Store owner information in localStorage
               localStorage.setItem("selected_owner_id", ownerData.user.id);
            } else {
               console.error("Failed to get owner details:", ownerData.error);
            }

            // Set the hostel data
            setHostel(apartmentWithImages);
            setLoading(false);
         } catch (error) {
            console.error("Error in fetchApartmentDetails:", error);
            setError(error.message);
            setLoading(false);

            // If we have apartment data but owner fetch failed, still store the basic owner ID
            if (apartmentData?.owner) {
               console.log("Error fallback owner ID stored:", apartmentData.owner);
            }
         }
      };

      fetchApartmentDetails();
   }, [apartment_id]);



   const toggleMessagePopup = () => {
      setIsMessagePopupOpen(!isMessagePopupOpen);
   };

   const closeModal = () => {
      setShowModal(false);
      setModalMessage("");
   };

   useEffect(() => {
      const checkWishlist = async () => {
         const apartmentId = localStorage.getItem("apartment_id");
         const token = localStorage.getItem("access_token_user");
   
         if (!apartmentId || !token) {
            console.log("Apartment ID or token is missing.");
            return;
         }
   
         try {
            const response = await axios.get("http://localhost:8000/api/wishlist/get-item", {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            });
   
            const items = response.data || [];
   
            if (items.length === 0) {
               console.log("Wishlist is empty.");
               setSaved(false);
               return;
            }
   
            const found = items.some((item) => item.apartment === apartmentId);
   
            if (found) {
               console.log("Apartment is in the wishlist.");
            } else {
               console.log("Apartment is not in the wishlist.");
            }
   
            setSaved(found);
         } catch (err) {
            console.error("Error checking wishlist:", err);
         }
      };
   
      checkWishlist();
   }, []);

   useEffect(() => {
      // This code runs only on the client side
      const lat = parseFloat(localStorage.getItem("user_lat"));
      const lng = parseFloat(localStorage.getItem("user_lng"));
      setUserLocation({ lat, lng });
   }, []);

   const handleGetDirections = () => {
      if (hostel && userLocation) {
         const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hostel.latitude},${hostel.longitude}`;
         window.open(url, "_blank");
      } else {
         console.error("Hostel or user location is not available");
      }
   };

   const handleAddToWishlist = async () => {
      const apartmentId = localStorage.getItem("apartment_id");
      const token = localStorage.getItem("access_token_user");

      if (!apartmentId || !token) {
         setModalMessage("Missing apartment ID or token");
         return;
      }

      setSaving(true);

      try {
         await axios.post(
            `http://localhost:8000/api/wishlist/add-item/${apartmentId}`,
            {},
            {
               headers: {
                  Authorization: `Bearer ${token}`,
               },
            }
         );

         setSaved(true);
         setModalMessage("Apartment saved to wishlist successfully!");
      } catch (error) {
         console.log("Error saving to wishlist:", error);
         setModalMessage(error.response?.data || "Something went wrong");
      } finally {
         setSaving(false);
      }
   };


   const handleSendMessage = async () => {
      if (!message || message.trim() === "") return;

      try {
         const accessToken = localStorage.getItem("access_token_user");
         const receiverId = Number(localStorage.getItem("selected_owner_id"));

         if (isNaN(receiverId)) {
            console.error("Invalid receiver ID");
            return;
         }

         const requestBody = JSON.stringify({ message: message });
         console.log("Sending:", requestBody);

         const response = await fetch(`http://127.0.0.1:8000/api/chat/send-message/${receiverId}`, {
            method: "POST",
            headers: {
               Authorization: `Bearer ${accessToken}`,
               "Content-Type": "application/json",
            },
            body: requestBody,
         });

         if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to send message:", errorData);
            throw new Error(errorData.message || "Failed to send message");
         }

         setIsMessagePopupOpen(false);
         setIsSuccessPopupOpen(true);
         setMessage("");
      } catch (error) {
         console.error("Error sending message:", error);
      }
   };

   const closeSuccessPopup = () => {
      setIsSuccessPopupOpen(false);
   };

   const handleReviewClick = (review) => {
      setSelectedReview(review);
   };

   const closeReviewPopup = () => {
      setSelectedReview(null);
   };

   const handleDateSelection = (dates) => {
      const [start, end] = dates;
      if (start) {
         const startDate = dateToCalendarFormat(start);
         let endDate;

         if (duration === "short-term") {
            endDate = dateToCalendarFormat(addDays(start, 7));
         } else {
            endDate = dateToCalendarFormat(addDays(start, 30));
         }

         setSelectedDayRange({ from: startDate, to: endDate });
         setBookingExpiryDate(addDays(start, 30));
      }
   };

   const handleDurationChange = (newDuration) => {
      setDuration(newDuration);
      if (selectedDayRange.from) {
         const startDate = calendarFormatToDate(selectedDayRange.from);
         const endDate = dateToCalendarFormat(addDays(startDate, newDuration === "short-term" ? 7 : 30));
         setSelectedDayRange((prev) => ({ ...prev, to: endDate }));
      }
   };

   const handleBooking = async () => {
      if (!selectedDayRange.from || !selectedDayRange.to) {
         setError("Please select your stay dates");
         return;
      }

      try {
         setLoading(true);
         const startDate = calendarFormatToDate(selectedDayRange.from);
         const endDate = calendarFormatToDate(selectedDayRange.to);
         const expiryDate = addDays(startDate, 30);
         const amount = calculateTotalAmount();

         const accessToken = localStorage.getItem("access_token_user");
         const user_id = localStorage.getItem("user_id_number");

         const bookingResponse = await fetch("http://127.0.0.1:8000/api/booking/create/", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
               user: user_id,
               apartment: apartment_id,
            }),
         });

         if (!bookingResponse.ok) {
            throw new Error("Failed to create booking");
         }

         const bookingData = await bookingResponse.json();
         const booking_id = bookingData.booking_id; // Retrieve the booking_id
         setBookingId(booking_id);

         // Step 2: Generate the payment link using the booking_id
         const paymentResponse = await fetch("http://127.0.0.1:8000/api/payment/url/", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
               user_id: user_id,
               apartment_id: apartment_id,
               amount: amount,
               booking_id: booking_id,
            }),
         });

         if (!paymentResponse.ok) {
            throw new Error("Failed to generate payment link");
         }

         const paymentData = await paymentResponse.json();
         setPaymentLink(paymentData.payment_url); // Store the payment link
         setRazorpayOrderId(paymentData.razorpay_order_id);

         setBookingDetails({
            startDate,
            endDate,
            expiryDate,
            amount: amount,
            duration: duration,
         });

         setIsBookingPopupOpen(true);
      } catch (err) {
         setError("Failed to process booking");
      } finally {
         setLoading(false);
      }
   };

   usePaymentConfirmation(razorpayOrderId, setPaymentStatus, setPaymentFailed);

   const calculateTotalAmount = () => {
      if (!selectedDayRange.from || !selectedDayRange.to || !hostel?.rent) return 0;
      const startDate = calendarFormatToDate(selectedDayRange.from);
      const endDate = calendarFormatToDate(selectedDayRange.to);
      const days = differenceInDays(endDate, startDate) + 1;
      return hostel.rent * days;
   };

   const getRemainingDays = () => {
      if (!bookingExpiryDate) return null;
      return differenceInDays(bookingExpiryDate, new Date());
   };

   if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
   }

   if (error) {
      return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
   }

   if (!hostel) {
      return <div className="flex justify-center items-center h-screen">No data found</div>;
   }



   const Modal = ({ message, onClose }) => {
      let displayMessage = "Something went wrong";

      if (typeof message === "string") {
         displayMessage = message;
      } else if (typeof message === "object") {
         if (message.error) {
            displayMessage = message.error;
         } else if (message.message?.apartment?.[0]) {
            displayMessage = message.message.apartment[0];
         }
      }

      return (
         <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
               <p className="text-gray-800">{displayMessage}</p>
               <button
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={onClose}
               >
                  OK
               </button>
            </div>
         </div>
      );
   };





   const renderBookingCard = () => (
      <Card className="p-6">
         <CardHeader className="p-0">
            <CardTitle className="text-2xl font-bold">
               ₹{hostel?.rent} <span className="text-lg font-normal">night</span>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-2">
               <StarIcon className="h-4 w-4 text-yellow-400" />
               <span>
                  {hostel?.rating} · {hostel?.reviews} reviews
               </span>
            </CardDescription>
         </CardHeader>

         <CardContent className="p-1 mt-4 space-y-4">
            {bookingExpiryDate && (
               <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircleIcon className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Payment Deadline</AlertTitle>
                  <AlertDescription className="text-blue-600">
                     Complete payment by {format(bookingExpiryDate, "PPP")}
                     <div className="mt-1 text-sm font-medium">{getRemainingDays()} days remaining</div>
                  </AlertDescription>
               </Alert>
            )}

            <div className="grid grid-cols-2 gap-2">
               <Button
                  variant={duration === "short-term" ? "default" : "outline"}
                  onClick={() => handleDurationChange("short-term")}
               >
                  Short-term (7 days)
               </Button>
               <Button
                  variant={duration === "long-term" ? "default" : "outline"}
                  onClick={() => handleDurationChange("long-term")}
               >
                  Long-term (30 days)
               </Button>
            </div>

            <div className="border rounded p-2 flex justify-center content-center">
               <DatePicker
                  selected={selectedDayRange.from ? calendarFormatToDate(selectedDayRange.from) : null}
                  onChange={handleDateSelection}
                  startDate={selectedDayRange.from ? calendarFormatToDate(selectedDayRange.from) : null}
                  endDate={selectedDayRange.to ? calendarFormatToDate(selectedDayRange.to) : null}
                  selectsRange
                  inline
                  minDate={new Date()}
                  calendarClassName="custom-calendar"
                  renderCustomHeader={({
                     monthDate,
                     decreaseMonth,
                     increaseMonth,
                     prevMonthButtonDisabled,
                     nextMonthButtonDisabled,
                  }) => (
                     <div className="flex items-center justify-between px-4 py-2">
                        <button
                           onClick={decreaseMonth}
                           disabled={prevMonthButtonDisabled}
                           className="p-2 rounded-full hover:bg-gray-100"
                        >
                           {"<"}
                        </button>
                        <span className="font-semibold text-lg">{format(monthDate, "MMMM yyyy")}</span>
                        <button
                           onClick={increaseMonth}
                           disabled={nextMonthButtonDisabled}
                           className="p-2 rounded-full hover:bg-gray-100"
                        >
                           {">"}
                        </button>
                     </div>
                  )}
               />
            </div>

            <div className="space-y-2">
               <div className="flex justify-between">
                  <span>
                     ₹{hostel?.rent} x{" "}
                     {selectedDayRange.to
                        ? `${differenceInDays(
                           calendarFormatToDate(selectedDayRange.to),
                           calendarFormatToDate(selectedDayRange.from)
                        ) + 1
                        } nights`
                        : "Select dates"}
                  </span>
                  <span>₹{calculateTotalAmount()}</span>
               </div>
               <div className="flex justify-between font-semibold">
                  <span>Total before taxes</span>
                  <span>₹{calculateTotalAmount()}</span>
               </div>
            </div>
            {hostel?.available_beds === 0 && (
               <p className="text-red-500 text-center">No rooms available</p>
            )}

            <Button
               className="w-full"
               onClick={handleBooking}
               disabled={!selectedDayRange.from || !selectedDayRange.to || hostel?.available_beds === 0}
            >
               Book Now
            </Button>
            <p className="text-center text-sm text-muted-foreground">
               Complete payment within 30 days to confirm booking
            </p>
         </CardContent>
      </Card>
   );

   return (
      <>
         <div className="sticky top-0 z-50 bg-white shadow-md">
            <UserHeader />
         </div>
         <div className="container mx-auto py-8 px-10">
            <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
               <div className="space-y-6">
                  <div>
                     <h1 className="text-3xl font-bold">{hostel.title}</h1>
                     <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                           <MapPinIcon
                              className="h-5 w-5 cursor-pointer text-blue-600 hover:text-blue-800"
                              onClick={handleGetDirections}
                              title="Get Directions"
                           />
                           <span>{hostel.location}</span>
                        </div>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="sm">
                              <Share2Icon className="h-4 w-4 mr-2" />
                              Share
                           </Button>
                           <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleAddToWishlist}
                              disabled={saving || saved}
                           >
                              <HeartIcon
                                 className={`h-4 w-4 mr-2 ${saved ? "text-green-500" : ""}`}
                                 strokeWidth={2}
                                 fill={saved ? "currentColor" : "none"}
                              />
                              {saving ? "Saving..." : saved ? "Saved" : "Save"}
                           </Button>
                           {modalMessage && (
                              <Modal
                                 message={modalMessage}
                                 onClose={() => setModalMessage(null)}
                              />
                           )}
                           <Button variant="ghost" size="sm" onClick={toggleMessagePopup}>
                              <MessageCircleIcon className="h-4 w-4 mr-2" />
                              Message
                           </Button>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                     <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                        <Image
                           src={hostel.images[0]?.image_url || DEFAULT_THUMBNAIL}
                           alt={`${hostel.title} - Main Image`}
                           fill
                           className="object-cover"
                        />
                     </div>
                     <div className="grid grid-rows-2 gap-2">
                        <div className="relative w-full h-[195px] rounded-lg overflow-hidden">
                           <Image
                              src={hostel.images[1]?.image_url || DEFAULT_THUMBNAIL}
                              alt={`${hostel.title} - Image 2`}
                              fill
                              className="object-cover"
                           />
                        </div>
                        <div className="relative w-full h-[195px] rounded-lg overflow-hidden">
                           <Image
                              src={hostel.images[2]?.image_url || DEFAULT_THUMBNAIL}
                              alt={`${hostel.title} - Image 3`}
                              fill
                              className="object-cover"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between">
                     <div>
                        <h2 className="text-xl font-semibold">Private room in hostel hosted by {hostel.host?.name}</h2>
                        <p className="text-muted-foreground">
                           {hostel.guests} guests · {hostel.bedrooms} bedroom · {hostel.beds} bed · {hostel.bathrooms}{" "}
                           private bathroom
                        </p>
                     </div>
                     <div className="relative w-12 h-12 rounded-full">
                        <p></p>
                     </div>
                  </div>

                  <Separator />

                  <div>
                     <h3 className="text-lg font-semibold mb-2">About this space</h3>
                     <p className="text-muted-foreground">{hostel.description}</p>
                  </div>

                  <Separator />

                  <div>
                     <h3 className="text-lg font-semibold mb-2">What this place offers</h3>
                     <div className="grid grid-cols-2 gap-4">
                        {/* Display food options */}
                        {hostel.food?.map((foodOption, index) => (
                           <div key={`food-${index}`} className="flex items-center gap-2">
                              <StarIcon className="h-5 w-5" />
                              <span>
                                 {foodOption === 1 ? 'Breakfast' :
                                    foodOption === 2 ? 'Lunch' :
                                       foodOption === 3 ? 'Dinner' : 'Unknown'}
                              </span>
                           </div>
                        ))}

                        {/* Display amenities */}
                        {hostel.amenities?.map((amenity, index) => (
                           <div key={`amenity-${index}`} className="flex items-center gap-2">
                              <StarIcon className="h-5 w-5" />
                              <span>{amenity}</span>
                           </div>
                        ))}

                        {/* Display other features */}
                        <div className="flex items-center gap-2">
                           <StarIcon className="h-5 w-5" />
                           <span>{hostel.bhk}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           <StarIcon className="h-5 w-5" />
                           <span>{hostel.hostel_type === 'boys' ? 'Boys Hostel' : 'Girls Hostel'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           <StarIcon className="h-5 w-5" />
                           <span>{hostel.parking_available ? 'Parking Available' : 'No Parking'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                           <StarIcon className="h-5 w-5" />
                           <span>{hostel.room_sharing_type === 'shared' ? 'Shared Room' : 'Private Room'}</span>
                        </div>
                     </div>
                  </div>
                  <Separator />
                  <div>
                     <div>
                        <h3 className="text-lg font-semibold mb-2">Customer Reviews</h3>

                        <div className="space-y-2">
                           {[5, 4, 3, 2, 1].map((rating) => (
                              <div key={rating} className="flex items-center gap-2">
                                 <span className="font-semibold">{rating} Stars:</span>
                                 <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                       <svg
                                          key={i}
                                          className={`w-4 h-4 fill-current ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                          xmlns="http://www.w3.org/2000/svg"
                                          viewBox="0 0 20 20"
                                       >
                                          <path d="M10 1l2.44 6.9h6.56l-5.4 4.23 2.1 6.97-5.4-4.23-5.4 4.23 2.1-6.97-5.4-4.23h6.56L10 1z" />
                                       </svg>
                                    ))}
                                 </div>
                                 <span className="ml-2">{ratingCounts[rating]} reviews</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>


               <div className="lg:sticky lg:top-4 lg:self-start py-20">{renderBookingCard()}</div>
            </div>
         </div>

         {isMessagePopupOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <Card className="w-full max-w-md relative">
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 p-2" onClick={toggleMessagePopup}>
                     <XIcon className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                     <CardTitle>Message Host</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <textarea
                        className="w-full p-2 border rounded"
                        rows={4}
                        placeholder="Enter your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                     />
                     <Button className="w-full mt-4" onClick={handleSendMessage}>
                        Send
                     </Button>
                  </CardContent>
               </Card>
            </div>
         )}

         {isSuccessPopupOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <Card className="w-full max-w-md relative">
                  <Button variant="ghost" size="sm" className="absolute top-2 right-2 p-2" onClick={closeSuccessPopup}>
                     <XIcon className="h-4 w-4" />
                  </Button>
                  <CardHeader>
                     <CardTitle>Message Sent Successfully</CardTitle>
                  </CardHeader>
                  <CardContent>
                     <p>Your message has been sent successfully.</p>
                     <Button className="w-full mt-4" onClick={closeSuccessPopup}>
                        That's All
                     </Button>
                  </CardContent>
               </Card>
            </div>
         )}

         {isBookingPopupOpen && bookingDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
               <Card className="w-full max-w-md">
                  {!paymentLoading && (
                     <CardHeader>
                        <CardTitle>Pay to Confirm Booking!</CardTitle>
                     </CardHeader>
                  )}
                  <CardContent className={"space-y-4 " + (paymentLoading ? "pt-6" : "")}>
                     {paymentLoading ? (
                        <div className="flex flex-col h-12 justify-center items-center overflow-hidden">
                           {paymentStatus && !paymentFailed && (
                              <>
                                 <p>✅</p>
                                 <p>Payment Complete</p>
                              </>
                           )}
                           {!paymentStatus && !paymentFailed && (
                              <>
                                 <Spinner />
                                 <p>Waiting for payment...</p>
                              </>
                           )}
                           {paymentFailed && (
                              <>
                                 <p>❌</p>
                                 <p>Payment Failed</p>
                              </>
                           )}
                        </div>
                     ) : (
                        <>
                           <div className="space-y-2">
                              <p className="font-semibold">Booking Details:</p>
                              <p>Check-in: {format(bookingDetails.startDate, "PPP")}</p>
                              <p>Check-out: {format(bookingDetails.endDate, "PPP")}</p>
                              <p>Duration: {bookingDetails.duration === "short-term" ? "7 days" : "30 days"}</p>
                              <p>Total Amount: ₹{bookingDetails.amount}</p>
                           </div>
                           <Alert className="bg-yellow-50 border-yellow-200">
                              <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                              <AlertTitle className="text-yellow-800">Important Notice</AlertTitle>
                              <AlertDescription className="text-yellow-700">
                                 Complete your payment before {format(bookingDetails.expiryDate, "PPP")} to confirm your
                                 booking. Booking will be automatically cancelled if payment is not received.
                              </AlertDescription>
                           </Alert>
                           {paymentLink && (
                              <Button
                                 className="w-full bg-white border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                                 onClick={openRazorpayGatway}
                              >
                                 Open Payment Gateway
                              </Button>
                           )}
                           <Button className="w-full" onClick={() => setIsBookingPopupOpen(false)}>
                              Close
                           </Button>
                        </>
                     )}
                  </CardContent>
               </Card>
            </div>
         )}
      </>
   );
};

export default HostelDetails;
