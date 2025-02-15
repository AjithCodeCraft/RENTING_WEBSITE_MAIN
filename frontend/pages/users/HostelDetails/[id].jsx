"use client"

import { useParams } from "next/navigation"
import Image from "next/image"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StarIcon, MapPinIcon } from "lucide-react"

// Dummy hostel data
const hostels = [
  {
    id: 1,
    title: "Green View Hostel",
    description: "A cozy hostel with a beautiful view of the city.",
    location: "Downtown",
    rent: 300,
    rating: 4.5,
    images: ["/download.png", "/tree-house.jpg", "/loginhome.jpg"],
  },
  // ... other hostels
]

const HostelDetails = () => {
  const params = useParams();

  // Fallback for invalid params
  if (!params || !params.id) {
    return <div className="text-center mt-10 text-xl font-semibold">Invalid Hostel ID!</div>;
  }

  const id = Number.parseInt(params.id, 10);
  const hostel = hostels.find((h) => h.id === id);

  // Fallback for hostel not found
  if (!hostel) {
    return <div className="text-center mt-10 text-xl font-semibold">Hostel not found!</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{hostel.title}</CardTitle>
          <CardDescription className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4" />
            {hostel.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Carousel for Images */}
          <Carousel className="w-full">
            <CarouselContent>
              {hostel.images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${hostel.title} - Image ${index + 1}`}
                      width={400}
                      height={300}
                      className="rounded-lg object-cover w-full h-[200px]"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </Carousel>

          {/* Key Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold">{hostel.rating}/5</span>
            </div>
            <Badge variant="secondary" className="text-lg">
              💰 Rent: ${hostel.rent}/month
            </Badge>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{hostel.description}</p>

          {/* Book Now Button */}
          <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded">
            Book Now
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HostelDetails;