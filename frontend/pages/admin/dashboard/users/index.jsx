"use client";
import React, {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import Image from "next/image";
import AdminLayout from "../adminsidebar";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {StarIcon, MapPinIcon, Share2Icon, HeartIcon, MessageCircleIcon, XIcon} from "lucide-react";
import useApartmentStore from "@/store/apartmentStore";
import {object} from "zod";

export function UserDetails() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [owners, setOwners] = useState([]);
    const [filteredOwners, setFilteredOwners] = useState([]);

    const {approvedApartments, allUsers} = useApartmentStore();

    const handleRowClick = (user) => {
        setSelectedUser(user);
    };

    const closePopup = () => {
        setSelectedUser(null);
    };

    const getPropertiesOwned = (owner_id) => {
        let count = 0;
        console.log(approvedApartments);
        approvedApartments.forEach((item) => {
            count += item.owner === owner_id ? 1 : 0;
        });
        return count;
    }

    const getFilteredOwners = () => {
        return owners.filter((owner) =>
            owner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            owner.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    };

    useEffect(() => {
        if (!allUsers || Object.keys(allUsers).length === 0) return;
        let data = Object.values(allUsers);
        data = data.filter((user) => user.user_type?.toLowerCase() === "owner");
        data = data.sort((a, b) => a.name?.localeCompare(b.name));
        setOwners(data);
        setFilteredOwners(data);
    }, [allUsers]);

    useEffect(() => {
        setFilteredOwners(getFilteredOwners());
    }, [searchQuery, owners]);

    return (
        <AdminLayout>
            <div className="pt-6 px-10">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* User Table */}
                <div className="mt-6 overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                        <tr>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties
                                Owned
                            </th>
                            <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOwners.map((user) => (
                            <tr key={user.id} onClick={() => handleRowClick(user)}
                                className="cursor-pointer hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name ? user.name : "No Name"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getPropertiesOwned(user.id)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                            className={cn(
                                "px-2 py-1 rounded-full text-xs font-semibold",
                                user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            )}
                        >
                        {user.is_active ? "Active" : "Inactive"}
                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* User Details Popup */}
                {selectedUser && (
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
                                <CardTitle>{selectedUser.name}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-2">
                                    <span>{selectedUser.email}</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative w-full h-64 rounded-lg overflow-hidden">
                                        <Image
                                            src="/download.png"
                                            alt={`${selectedUser.name} - Profile Image`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">{selectedUser.phone}</p>
                                        <p className="text-sm text-gray-500">
                                            <a
                                                href={`https://www.google.com/maps?q=${selectedUser.latitude},${selectedUser.longitude}`}
                                                target="_blank"
                                            >
                                                Click me
                                            </a>
                                        </p>
                                        <div className="mt-4">
                                            <p className="text-lg font-semibold">Properties
                                                Owned: {getPropertiesOwned(selectedUser.id)}</p>
                                            <p className="text-lg font-semibold">Status: {selectedUser.is_active ? "Active" : "Inactive"}</p>
                                        </div>
                                        <div className="mt-4">
                                            <Button variant="outline" className="mr-2">
                                                <MessageCircleIcon className="h-4 w-4 mr-2"/>
                                                Message
                                            </Button>
                                            <Button variant="outline">
                                                <Share2Icon className="h-4 w-4 mr-2"/>
                                                Share
                                            </Button>
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

export default UserDetails;