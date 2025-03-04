"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, MapPinIcon, Share2Icon, HeartIcon, MessageCircleIcon, XIcon, AlertCircleIcon, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import UserHeader from "../UserHeader"
import { useState, useEffect } from "react"
import { addDays, format, differenceInDays } from "date-fns"
import 'react-modern-calendar-datepicker/lib/DatePicker.css'
import { Calendar } from 'react-modern-calendar-datepicker'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const DEFAULT_THUMBNAIL = "/default-image.jpg"

const hexToBase64 = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
  return Buffer.from(bytes).toString("base64")
}

// Helper functions for date handling
const dateToCalendarFormat = (date) => ({
  year: date.getFullYear(),
  month: date.getMonth() + 1,
  day: date.getDate()
})

const calendarFormatToDate = (calendarDate) => {
  if (!calendarDate) return null
  return new Date(calendarDate.year, calendarDate.month - 1, calendarDate.day)
}

const HostelDetails = () => {
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false)
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedReview, setSelectedReview] = useState(null)
  const [duration, setDuration] = useState("short-term")
  const [selectedDayRange, setSelectedDayRange] = useState({ from: null, to: null })
  const [apartment_id, setApartmentId] = useState(null)
  const [isBookingPopupOpen, setIsBookingPopupOpen] = useState(false)
  const [bookingDetails, setBookingDetails] = useState(null)
  const [bookingExpiryDate, setBookingExpiryDate] = useState(null)

  // Fetch apartment_id from localStorage on the client side
  useEffect(() => {
    const apartmentId = localStorage.getItem("apartment_id");
    if (apartmentId) {
      setApartmentId(apartmentId)
    } else {
      setError("Apartment ID not found in localStorage")
      setLoading(false)
    }
  }, [])

  // Fetch apartment details and images
  useEffect(() => {
    if (!apartment_id) return

    const fetchApartmentDetails = async () => {
      try {
        const accessToken = localStorage.getItem("access_token_user")
        if (!accessToken) {
          throw new Error("No access token found")
        }

        const apartmentResponse = await fetch(
          `http://127.0.0.1:8000/api/apartments_by_id/${apartment_id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        if (!apartmentResponse.ok) {
          throw new Error("Failed to fetch apartment details")
        }
        const apartmentData = await apartmentResponse.json()

        const imagesResponse = await fetch(
          `http://127.0.0.1:8000/api/apartment-images/${apartment_id}/`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        if (!imagesResponse.ok) {
          throw new Error("Failed to fetch apartment images")
        }
        const imagesData = await imagesResponse.json()

        const imagesWithBase64 = imagesData.images.map((image) => {
          if (image.image_data.startsWith("ffd8")) {
            return {
              ...image,
              image_url: `data:image/jpeg;base64,${hexToBase64(image.image_data)}`,
            }
          }
          return image
        })

        const apartmentWithImages = {
          ...apartmentData,
          images: imagesWithBase64.length > 0 ? imagesWithBase64 : [{ image_url: DEFAULT_THUMBNAIL }],
        }

        setHostel(apartmentWithImages)
        setLoading(false)
      } catch (error) {
        setError(error.message)
        setLoading(false)
      }
    }

    fetchApartmentDetails()
  }, [apartment_id])

  const toggleMessagePopup = () => {
    setIsMessagePopupOpen(!isMessagePopupOpen)
  }

  const handleSendMessage = async () => {
    if (!message || message.trim() === "") return;
  
    try {
      const accessToken = localStorage.getItem("access_token_user");
      const receiverId = Number(localStorage.getItem("owner_id_number"));
  
      if (isNaN(receiverId)) {
        console.error("Invalid receiver ID");
        return;
      }
  
      const requestBody = JSON.stringify({ message: message });
      console.log("Sending:", requestBody);
  
      const response = await fetch(
        `http://127.0.0.1:8000/api/chat/send-message/${receiverId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: requestBody,
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
        throw new Error(errorData.message || "Failed to send message");
      }
  
      // Close the message popup and show success popup
      setIsMessagePopupOpen(false);
      setIsSuccessPopupOpen(true);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false)
  }

  const handleReviewClick = (review) => {
    setSelectedReview(review)
  }

  const closeReviewPopup = () => {
    setSelectedReview(null)
  }

  const handleDateSelection = (newValue) => {
    if (newValue.from) {
      const startDate = calendarFormatToDate(newValue.from)
      let endDate

      if (duration === "short-term") {
        endDate = dateToCalendarFormat(addDays(startDate, 7))
      } else {
        endDate = dateToCalendarFormat(addDays(startDate, 30))
      }

      setSelectedDayRange({ from: newValue.from, to: endDate })
      setBookingExpiryDate(addDays(startDate, 30))
    }
  }

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration)
    if (selectedDayRange.from) {
      const startDate = calendarFormatToDate(selectedDayRange.from)
      const endDate = dateToCalendarFormat(
        addDays(startDate, newDuration === "short-term" ? 7 : 30)
      )
      setSelectedDayRange(prev => ({ ...prev, to: endDate }))
    }
  }

  const handleBooking = async () => {
    if (!selectedDayRange.from || !selectedDayRange.to) {
      setError("Please select your stay dates")
      return
    }

    try {
      setLoading(true)
      const startDate = calendarFormatToDate(selectedDayRange.from)
      const endDate = calendarFormatToDate(selectedDayRange.to)
      const expiryDate = addDays(startDate, 30)

      await new Promise(resolve => setTimeout(resolve, 1000))

      setBookingDetails({
        startDate,
        endDate,
        expiryDate,
        amount: calculateTotalAmount(),
        duration: duration
      })

      setIsBookingPopupOpen(true)
    } catch (err) {
      setError("Failed to process booking")
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalAmount = () => {
    if (!selectedDayRange.from || !selectedDayRange.to || !hostel?.rent) return 0
    const startDate = calendarFormatToDate(selectedDayRange.from)
    const endDate = calendarFormatToDate(selectedDayRange.to)
    const days = differenceInDays(endDate, startDate) + 1
    return hostel.rent * days
  }

  const getRemainingDays = () => {
    if (!bookingExpiryDate) return null
    return differenceInDays(bookingExpiryDate, new Date())
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>
  }

  if (!hostel) {
    return <div className="flex justify-center items-center h-screen">No data found</div>
  }

  const renderBookingCard = () => (
    <Card className="p-6">
      <CardHeader className="p-0">
        <CardTitle className="text-2xl font-bold">
          ₹{hostel?.rent} <span className="text-lg font-normal">night</span>
        </CardTitle>
        <CardDescription className="flex items-center gap-2 mt-2">
          <StarIcon className="h-4 w-4 text-yellow-400" />
          <span>{hostel?.rating} · {hostel?.reviews} reviews</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="p-1 mt-4 space-y-4">
        {bookingExpiryDate && (
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircleIcon className="h-4 w-4 text-blue-500" />
            <AlertTitle className="text-blue-700">Payment Deadline</AlertTitle>
            <AlertDescription className="text-blue-600">
              Complete payment by {format(bookingExpiryDate, 'PPP')}
              <div className="mt-1 text-sm font-medium">
                {getRemainingDays()} days remaining
              </div>
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

        <div className="border rounded p-2">
          <Calendar
            value={selectedDayRange}
            onChange={handleDateSelection}
            shouldHighlightWeekends
            minimumDate={new Date()}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span>₹{hostel?.rent} x {selectedDayRange.to ? 
              `${differenceInDays(calendarFormatToDate(selectedDayRange.to), 
              calendarFormatToDate(selectedDayRange.from)) + 1} nights` : 
              "Select dates"}</span>
            <span>₹{calculateTotalAmount()}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total before taxes</span>
            <span>₹{calculateTotalAmount()}</span>
          </div>
        </div>

        <Button 
          className="w-full" 
          onClick={handleBooking}
          disabled={!selectedDayRange.from || !selectedDayRange.to}
        >
          Book Now
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Complete payment within 30 days to confirm booking
        </p>
      </CardContent>
    </Card>
  )

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
                  <StarIcon className="h-5 w-5 text-yellow-400" />
                  <span className="font-semibold">{hostel.rating}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="underline">{hostel.reviews} reviews</span>
                  <span className="text-muted-foreground">·</span>
                  <MapPinIcon className="h-5 w-5" />
                  <span>{hostel.location}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Share2Icon className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm">
                    <HeartIcon className="h-4 w-4 mr-2" />
                    Save
                  </Button>
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
                  {hostel.guests} guests · {hostel.bedrooms} bedroom · {hostel.beds} bed · {hostel.bathrooms} private
                  bathroom
                </p>
              </div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src="/placeholder-user.jpg" alt={`Host ${hostel.host?.name}`} fill className="object-cover" />
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
                {hostel.amenities?.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <StarIcon className="h-5 w-5" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Reviews</h3>
              <div className="space-y-4">
                {hostel.reviewsData?.map((review, index) => (
                  <div
                    key={index}
                    className="cursor-pointer hover:bg-gray-50 p-2 rounded-lg"
                    onClick={() => handleReviewClick(review)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={review.userImage || "/placeholder-user.jpg"}
                          alt={`User ${review.username}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-semibold">{review.username}</span>
                    </div>
                    <p className="text-muted-foreground mt-2">{review.review}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-4 lg:self-start py-20">
            {renderBookingCard()}
          </div>
        </div>
      </div>

      {isMessagePopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-2"
              onClick={toggleMessagePopup}
            >
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
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-2"
              onClick={closeSuccessPopup}
            >
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
            <CardHeader>
              <CardTitle>Booking Confirmed!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">Booking Details:</p>
                <p>Check-in: {format(bookingDetails.startDate, 'PPP')}</p>
                <p>Check-out: {format(bookingDetails.endDate, 'PPP')}</p>
                <p>Duration: {bookingDetails.duration === 'short-term' ? '7 days' : '30 days'}</p>
                <p>Total Amount: ₹{bookingDetails.amount}</p>
              </div>
              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-800">Important Notice</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  Complete your payment before {format(bookingDetails.expiryDate, 'PPP')} to confirm your booking.
                  Booking will be automatically cancelled if payment is not received.
                </AlertDescription>
              </Alert>
              <Button className="w-full" onClick={() => setIsBookingPopupOpen(false)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

export default HostelDetails