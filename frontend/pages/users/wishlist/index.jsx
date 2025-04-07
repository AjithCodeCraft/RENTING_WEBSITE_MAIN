import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import UserHeader from '../UserHeader'

// Mock data - replace with actual API calls
const mockWishlist = [
  {
    id: 'e8bd55ae-10f5-4936-afa0-eb0313ae4c0f',
    name: 'Sunset Hostel',
    location: 'Bali, Indonesia',
    price: '$25/night',
    rating: 4.8,
    image: '/hostel1.jpg',
    amenities: ['Free WiFi', 'Swimming Pool', 'Breakfast']
  },
  {
    id: 'a1b2c3d4-e5f6-7890-ghij-klmnopqrstuv',
    name: 'Mountain View Hostel',
    location: 'Kathmandu, Nepal',
    price: '$18/night',
    rating: 4.5,
    image: '/hostel2.jpg',
    amenities: ['Free WiFi', 'Common Kitchen', 'Tour Desk']
  }
]

const WishlistPage = () => {
  const router = useRouter()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    const fetchWishlist = async () => {
      try {
        // Replace with actual API call
        // const response = await axios.get('/api/user/wishlist')
        // setWishlist(response.data)
        
        // Using mock data for now
        setTimeout(() => {
          setWishlist(mockWishlist)
          setLoading(false)
        }, 800)
      } catch (error) {
        console.error('Error fetching wishlist:', error)
        setLoading(false)
      }
    }

    fetchWishlist()
  }, [])

  const removeFromWishlist = (hostelId) => {
    setWishlist(wishlist.filter(item => item.id !== hostelId))
    // In a real app, you would also call API to update backend
  }

  return (
    <div>
      <UserHeader/>
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Your Wishlist</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, index) => (
            <Skeleton key={index} className="h-[350px] w-full rounded-lg" />
          ))}
        </div>
      ) : wishlist.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold">Your wishlist is empty</h2>
          <p className="text-gray-500 mt-2">Save hostels you like to see them here</p>
          <Button className="mt-4" onClick={() => router.push('/users/hostels')}>
            Browse Hostels
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((hostel) => (
            <Card key={hostel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="truncate">{hostel.name}</CardTitle>
                <CardDescription>{hostel.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-48 w-full mb-4 rounded-md overflow-hidden">
                  <img 
                    src={hostel.image} 
                    alt={hostel.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{hostel.price}</span>
                  <Badge variant="secondary" className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 fill-current" />
                    {hostel.rating}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {hostel.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">{amenity}</Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => removeFromWishlist(hostel.id)}
                >
                  Remove
                </Button>
                <Link href={`/users/HostelDetails/${hostel.id}`} passHref>
                  <Button>View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
    </div>
  )
}

export default WishlistPage