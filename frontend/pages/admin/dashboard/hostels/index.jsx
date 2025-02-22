"use client";
import React, {useEffect, useState, useRef} from "react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import AdminLayout from "../adminsidebar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {StarIcon, MapPinIcon, Share2Icon, HeartIcon, MessageCircleIcon, XIcon} from "lucide-react";
import useApartmentStore from "@/store/apartmentStore";
import axios from "axios";

const DEFAULT_THUMBNAIL = "/loginhome.jpg";

export function AdminHostels() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedHostel, setSelectedHostel] = useState(null);
    const [apartmentImage, setApartmentImage] = useState("/loginhome.jpg");
    const {approvedApartments, setApprovedApartments, allUsers} = useApartmentStore();
    const API_URL = process.env.REACT_APP_API_URL;

    // Filter hostels based on the search query
    const filteredHostels = approvedApartments.filter(
        (hostel) =>
            hostel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hostel.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const retrievedHostelImages = useRef({});

    const handleRowClick = async (hostel) => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        if (retrievedHostelImages.current[hostel.apartment_id]) {
            setApartmentImage(retrievedHostelImages.current[hostel.apartment_id]);
            setSelectedHostel(hostel);
            return;
        }
        try {
            const response = await axios.get(`${API_URL}/apartment-images/${hostel.apartment_id}`);
            const imageData = response.data.images[0]?.image_data;
            const imageUrl = imageData?.startsWith("ffd8")
                ? `data:image/jpeg;base64,${btoa(
                    String.fromCharCode(...new Uint8Array(imageData.match(/.{1,2}/g).map(
                        byte => parseInt(byte, 16))
                    ))
                )}`
                : imageData;
            setApartmentImage(imageUrl);
            retrievedHostelImages.current[hostel.apartment_id] = imageUrl;
        } catch (error) {
            console.log(error);
            setApartmentImage(DEFAULT_THUMBNAIL);
        }
        setSelectedHostel(hostel);
    };

    const closePopup = () => {
        setSelectedHostel(null);
    };

    useEffect(() => {

    }, [approvedApartments]);

    return (
        <AdminLayout>
            <div className="pt-6 px-10">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search by hostel name or location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />

                {/* Hostel List */}
                <div className="space-y-4">
                    {filteredHostels.map((hostel) => (
                        <div
                            key={hostel.id}
                            onClick={() => handleRowClick({...hostel, owner: allUsers[hostel.owner]})}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                            <div className="space-y-2 mb-4 sm:mb-0">
                                <h4 className="font-medium">{hostel.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    Location: {hostel.location} | Price: {hostel.rent}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Address: {`${hostel.title}, ${hostel.location}`}
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" className="flex items-center gap-2">
                                    <MapPinIcon className="h-4 w-4"/>
                                    View Details
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hostel Details Popup */}
                {selectedHostel && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-2xl relative">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute top-2 right-2 p-2"
                                onClick={closePopup}
                            >
                                <XIcon className="h-4 w-4"/>
                            </Button>
                            <CardHeader>
                                <CardTitle>{selectedHostel.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <MapPinIcon className="h-4 w-4"/>
                                    <span>{selectedHostel.location}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                        <Image
                                            src={apartmentImage}
                                            alt={`${selectedHostel.name} - Main Image`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{`${selectedHostel.title}, ${selectedHostel.location}`}</p>
                                        <p className="text-lg font-semibold mt-2">{selectedHostel.rent}</p>
                                        <div className="mt-4">
                                            <Button variant="outline" className="mr-2">
                                                <Share2Icon className="h-4 w-4 mr-2"/>
                                                Share
                                            </Button>
                                            <Button variant="outline">
                                                <HeartIcon className="h-4 w-4 mr-2"/>
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Owner Details Section */}
                                <Separator className="my-6"/>
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Owner Details</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                                            <Image
                                                src="/download.png"
                                                alt={`${selectedHostel.owner?.name} - Profile Image`}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedHostel.owner?.name}</p>
                                            <p className="text-sm text-muted-foreground">{selectedHostel.owner?.email}</p>
                                            <p className="text-sm text-muted-foreground">{selectedHostel.owner?.phone}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Status:{" "}
                                                <span
                                                    className={cn(
                                                        "px-2 py-1 rounded-full text-xs font-semibold",
                                                        selectedHostel.owner?.is_active === true
                                                            ? "bg-green-100 text-green-800"
                                                            : "bg-red-100 text-red-800"
                                                    )}
                                                >
                          {selectedHostel.owner?.is_active ? "Active" : "Inactive"}
                        </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

export default AdminHostels;