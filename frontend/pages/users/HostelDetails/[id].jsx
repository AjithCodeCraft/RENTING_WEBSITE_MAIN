"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, MapPinIcon, Share2Icon, HeartIcon, CameraIcon, MessageCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import UserHeader from "../UserHeader"
import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { addDays } from "date-fns"

const DEFAULT_THUMBNAIL = "/default-image.jpg" // Default thumbnail image

// Function to convert hex to Base64
const hexToBase64 = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)))
  return Buffer.from(bytes).toString("base64")
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
  const [selectedDates, setSelectedDates] = useState({ from: new Date(), to: addDays(new Date(), 7) })
  const [apartment_id, setApartmentId] = useState(null) // State to store apartment_id

  // Fetch apartment_id from localStorage on the client side
  useEffect(() => {
    const apartmentId = localStorage.getItem("apartment_id")
    if (apartmentId) {
      setApartmentId(apartmentId)
    } else {
      setError("Apartment ID not found in localStorage")
      setLoading(false)
    }
  }, [])

  // Fetch apartment details and images
  useEffect(() => {
    if (!apartment_id) return // Ensure apartment_id is available

    const fetchApartmentDetails = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        if (!accessToken) {
          throw new Error("No access token found")
        }

        // Fetch apartment details
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

        // Fetch apartment images
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

        // Convert hex images to Base64
        const imagesWithBase64 = imagesData.images.map((image) => {
          if (image.image_data.startsWith("ffd8")) { // Check if it's a hex string
            return {
              ...image,
              image_url: `data:image/jpeg;base64,${hexToBase64(image.image_data)}`,
            }
          }
          return image
        })

        // Combine apartment details and images
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
  }, [apartment_id]) // Fetch data when apartment_id changes

  const toggleMessagePopup = () => {
    setIsMessagePopupOpen(!isMessagePopupOpen)
  }

  const handleSendMessage = () => {
    setTimeout(() => {
      setIsMessagePopupOpen(false)
      setIsSuccessPopupOpen(true)
      setMessage("")
    }, 1000)
  }

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false)
  }

  const handleReviewClick = (review) => {
    setSelectedReview(review)
  }

  const closeReviewPopup = () => {
    setSelectedReview(null)
  }

  const calculateTotalAmount = () => {
    const baseAmount = hostel?.rent || 0
    if (duration === "short-term") {
      return baseAmount * 7 // 1 week
    } else {
      return baseAmount * 30 // 1 month
    }
  }

  const handleDateSelect = (date) => {
    if (duration === "short-term") {
      setSelectedDates({ from: date, to: addDays(date, 7) })
    } else {
      setSelectedDates({ from: date, to: addDays(date, 30) })
    }
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

  return (
    <>
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <UserHeader />
      </div>
      <div className="container mx-auto py-8 px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
          {/* Left Side: Hostel Details */}
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

            {/* Image Layout */}
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

            {/* Reviews Section */}
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

          {/* Right Side: Sticky Booking Card */}
          <div className="lg:sticky lg:top-4 lg:self-start py-20">
            <Card className="p-6">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl font-bold">
                  ₹{hostel.rent} <span className="text-lg font-normal">night</span>
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-2">
                  <StarIcon className="h-4 w-4 text-yellow-400" />
                  <span>
                    {hostel.rating} · {hostel.reviews} reviews
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="p-1 mt- space-y-4">
                {/* Duration Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={duration === "short-term" ? "default" : "outline"}
                    onClick={() => setDuration("short-term")}
                  >
                    Short-term
                  </Button>
                  <Button
                    variant={duration === "long-term" ? "default" : "outline"}
                    onClick={() => setDuration("long-term")}
                  >
                    Long-term
                  </Button>
                </div>

                {/* Calendar */}
                <div className="border rounded p-2">
                  <Calendar
                    mode="range"
                    selected={selectedDates}
                    onSelect={handleDateSelect}
                    numberOfMonths={duration === "short-term" ? 1 : 2}
                  />
                </div>

                {/* Guests */}
                <div className="border rounded p-2">
                  <div className="text-xs font-semibold">Guests</div>
                  <div>1 guest</div>
                </div>

                {/* Reserve Button */}
                <Button className="w-full">Reserve</Button>
                <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>

                {/* Total Amount */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>₹{hostel.rent} x {duration === "short-term" ? "7 nights" : "30 nights"}</span>
                    <span>₹{calculateTotalAmount()}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total before taxes</span>
                    <span>₹{calculateTotalAmount()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Message Popup Card */}
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

      {/* Success Popup */}
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
    </>
  )
}

export default HostelDetails