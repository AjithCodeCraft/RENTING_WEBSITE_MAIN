import React, { useState, useEffect, useCallback } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Dialog } from '@headlessui/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import UserHeader from '../UserHeader';
import Cookies from 'js-cookie';

const hexToBase64 = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
  return Buffer.from(bytes).toString("base64");
};

const WishlistPage = () => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedWishlistId, setSelectedWishlistId] = useState(null);

  const fetchWishlist = useCallback(async () => {
    try {
      const accessToken = Cookies.get("access_token_user");
      if (!accessToken) throw new Error("No access token found");

      const wishlistResponse = await fetch('http://localhost:8000/api/wishlist/get-item', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!wishlistResponse.ok) {
        throw new Error('Failed to fetch wishlist');
      }

      const wishlistData = await wishlistResponse.json();

      if (!Array.isArray(wishlistData)) {
        throw new Error('Wishlist data is not an array');
      }

      const wishlistWithDetails = await Promise.all(
        wishlistData.map(async (item) => {
          if (!item || !item.apartment) {
            throw new Error('Invalid wishlist item');
          }

          const apartmentResponse = await fetch(
            `http://127.0.0.1:8000/api/apartments_by_id/${item.apartment}/`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!apartmentResponse.ok) {
            throw new Error(`Failed to fetch details for apartment ${item.apartment}`);
          }

          const apartmentData = await apartmentResponse.json();

          const imagesResponse = await fetch(
            `http://127.0.0.1:8000/api/apartment-images/${item.apartment}/`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );

          if (!imagesResponse.ok) {
            throw new Error(`Failed to fetch apartment images for ${item.apartment}`);
          }

          const imagesData = await imagesResponse.json();

          const imagesWithBase64 = imagesData.images?.map((image) => {
            if (image.image_data?.startsWith("ffd8")) {
              return {
                ...image,
                image_url: `data:image/jpeg;base64,${hexToBase64(image.image_data)}`,
              };
            }
            return image;
          }) || [];

          const hostelImage = imagesWithBase64.length > 0 ? imagesWithBase64[0].image_url : DEFAULT_THUMBNAIL;

          const foodOptions = {
            1: 'Breakfast',
            2: 'Lunch',
            3: 'Dinner',
          };

          const amenities = [
            ...(apartmentData.food || []).map(foodId => foodOptions[foodId]),
            apartmentData.parking_available ? 'Parking Available' : '',
            apartmentData.bhk ? apartmentData.bhk : '',
          ].filter(Boolean);

          return {
            id: item.apartment,
            wishlist_id: item.wishlist_id,
            name: apartmentData.title,
            location: apartmentData.location,
            price: `$${apartmentData.rent}/night`,
            rating: apartmentData.rating,
            image: hostelImage,
            amenities: amenities,
          };
        })
      );

      setWishlist(wishlistWithDetails);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeFromWishlist = async (wishlistId) => {
    try {
      setWishlist(prev => prev.filter(item => item.wishlist_id !== wishlistId));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/delete-item/${wishlistId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${Cookies.get('access_token_user')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await removeFromWishlist(selectedWishlistId);
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div>
      <UserHeader />
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
          <>
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
                    {hostel.amenities && Array.isArray(hostel.amenities) && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {hostel.amenities.map((amenity, index) => (
                          <Badge key={index} variant="outline">{amenity}</Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedWishlistId(hostel.wishlist_id);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Remove
                    </Button>
                    <Button onClick={() => router.push(`/users/HostelDetails/${hostel.id}`)}>
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Dialog
              open={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="fixed inset-0 bg-black/30" />
              <div className="bg-white rounded-lg p-6 z-10 max-w-md w-full">
                <Dialog.Title className="text-lg font-bold">
                  Confirm Removal
                </Dialog.Title>
                <Dialog.Description className="mt-2">
                  Are you sure you want to remove this item from your wishlist?
                </Dialog.Description>

                <div className="mt-6 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Remove'}
                  </Button>
                </div>
              </div>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
};

export default WishlistPage;
