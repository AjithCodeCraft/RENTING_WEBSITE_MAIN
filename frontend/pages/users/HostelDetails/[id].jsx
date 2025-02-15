"use client"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StarIcon, MapPinIcon, Share2Icon, HeartIcon, CameraIcon, MessageCircleIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import UserHeader from "../UserHeader"
import { useState } from "react"

// Dummy hostel data
const hostel = {
  id: 1,
  title: "Private Room K-Mansion Deluxe Room",
  description:
    "Escape to our charming room in Munnar and experience the true essence of this beautiful hill station. Whether you're a couple seeking a romantic getaway or a solo traveler on a nature retreat, our accommodation provides a serene and comfortable base for your Munnar adventure.",
  location: "Munnar, India",
  rent: 4000,
  rating: 4.94,
  reviews: 16,
  images: ["/download.png", "/tree-house.jpg", "/loginhome.jpg"],
  host: {
    name: "Mathew",
    isSuperhost: true,
    yearsHosting: 3,
  },
  guests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  amenities: [
    "Valley view",
    "Wifi",
    "Dedicated workspace",
    "Free parking on premises",
    "TV",
    "Washing machine",
    "Dryer",
    "Luggage drop-off allowed",
  ],
  reviewsData: [
    {
      id: 1,
      username: "John Doe",
      userImage: "/user1.jpg",
      review: "Great place to stay! The view was amazing and the host was very friendly.",
      rating: 5,
    },
    {
      id: 2,
      username: "Jane Smith",
      userImage: "/user2.jpg",
      review: "The room was clean and cozy. Highly recommended!",
      rating: 4.5,
    },
  ],
}

const HostelDetails = () => {
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false)
  const [isSuccessPopupOpen, setIsSuccessPopupOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [selectedReview, setSelectedReview] = useState(null) // State to track the selected review

  const toggleMessagePopup = () => {
    setIsMessagePopupOpen(!isMessagePopupOpen)
  }

  const handleSendMessage = () => {
    // Simulate sending a message (e.g., API call)
    setTimeout(() => {
      setIsMessagePopupOpen(false) // Close the message popup
      setIsSuccessPopupOpen(true) // Show the success popup
      setMessage("") // Clear the message input
    }, 1000) // Simulate a delay for sending the message
  }

  const closeSuccessPopup = () => {
    setIsSuccessPopupOpen(false)
  }

  const handleReviewClick = (review) => {
    setSelectedReview(review) // Set the selected review to show in the popup
  }

  const closeReviewPopup = () => {
    setSelectedReview(null) // Close the review popup
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
            <div className="grid grid-cols-2 gap-2 ">
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
                <Image
                  src={hostel.images[0] || "/placeholder.svg"}
                  alt={`${hostel.title} - Main Image`}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="grid grid-rows-2 gap-2">
                <div className="relative w-full h-[195px] rounded-lg overflow-hidden">
                  <Image
                    src={hostel.images[1] || "/placeholder.svg"}
                    alt={`${hostel.title} - Image 2`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative w-full h-[195px] rounded-lg overflow-hidden">
                  <Image
                    src={hostel.images[2] || "/placeholder.svg"}
                    alt={`${hostel.title} - Image 3`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Private room in hostel hosted by {hostel.host.name}</h2>
                <p className="text-muted-foreground">
                  {hostel.guests} guests · {hostel.bedrooms} bedroom · {hostel.beds} bed · {hostel.bathrooms} private
                  bathroom
                </p>
              </div>
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src="/placeholder-user.jpg" alt={`Host ${hostel.host.name}`} fill className="object-cover" />
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
                {hostel.amenities.map((amenity, index) => (
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
                {hostel.reviewsData.map((review, index) => (
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
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded p-2">
                    <div className="text-xs font-semibold">Check-in</div>
                    <div>4/16/2025</div>
                  </div>
                  <div className="border rounded p-2">
                    <div className="text-xs font-semibold">Checkout</div>
                    <div>4/17/2025</div>
                  </div>
                </div>
                <div className="border rounded p-2">
                  <div className="text-xs font-semibold">Guests</div>
                  <div>1 guest</div>
                </div>

                <Button className="w-full">Reserve</Button>
                <p className="text-center text-sm text-muted-foreground">You won't be charged yet</p>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>₹{hostel.rent} x 1 night</span>
                    <span>₹{hostel.rent}</span>
                  </div>
                  <div className="flex justify-between font-semibold">
                    <span>Total before taxes</span>
                    <span>₹{hostel.rent}</span>
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

      {/* Review Popup */}
      {/* {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md relative">
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 p-2"
              onClick={closeReviewPopup}
            >
              <XIcon className="h-4 w-4" />
            </Button>
            <CardHeader>
              <CardTitle>Review by {selectedReview.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={selectedReview.userImage || "/placeholder-user.jpg"}
                    alt={`User ${selectedReview.username}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="font-semibold">{selectedReview.username}</span>
              </div>
              <p className="text-muted-foreground mt-2">{selectedReview.review}</p>
            </CardContent>
          </Card>
        </div>
      )} */}
    </>
  )
}

export default HostelDetails