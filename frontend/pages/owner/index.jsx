import React, { useState, useEffect, useRef } from 'react'
import Link from "next/link"
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import OwnerHeader from "./OwnerHeader"
import axios from "axios";

export default function OwnerHome() {
  const [ownedApartmentCount, setOwnedApartmentCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const ownerId = useRef(0);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  async function callApi(url) {
    const response = await axios.get(`${API_URL}${url}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token_owner")}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response;
  }

	async function fetchData() {
		try {
      const response_total_aparment = await callApi(`/apartment/by-owner/${ownerId.current}`);
      setOwnedApartmentCount(response_total_aparment.data.total_apartments);
      const response_total_booking = await callApi(`/get-all-received-booking`);
      setBookingCount(response_total_booking.data?.length);
      const response_notification = await callApi('/get-notifications/');
      setNotificationCount(response_notification?.data?.length);
      const response_pending = await callApi(`/pending_apartments_for_owner/`);
      const data = response_pending.data.filter((item) => item.owner === Number(ownerId.current));
      setPendingApprovalCount(data.length);      
		} catch(error) {
			console.error("An error occured: ", error);
		}
	}
	
	useEffect(() => { 
    ownerId.current = localStorage.getItem("id");
    fetchData();
  }, []);


  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 bg-white shadow-md">
        <OwnerHeader/>
        </header>
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Listed Apartments</CardTitle>
              <BuildingIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ownedApartmentCount}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookingCount}</div>
              <p className="text-xs text-muted-foreground">+10% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircleIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovalCount}</div>
              <p className="text-xs text-muted-foreground">Waiting for admin approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <BellIcon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notificationCount}</div>
              <p className="text-xs text-muted-foreground">New bookings, complaints, and approvals</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Hostel Approvals</CardTitle>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">Resubmit Request</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hostel Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Sunrise Hostel</TableCell>
                    <TableCell>New York</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost">Resubmit</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Green Valley Hostel</TableCell>
                    <TableCell>San Francisco</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost">Resubmit</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recent Notifications</CardTitle>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <BellIcon className="h-4 w-4" />
                <span className="sr-only">View All</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Booking</TableCell>
                    <TableCell>New booking request from John Doe</TableCell>
                    <TableCell>2023-06-01</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Complaint</TableCell>
                    <TableCell>New complaint from Jane Smith</TableCell>
                    <TableCell>2023-06-02</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Approval</TableCell>
                    <TableCell>Hostel approval request rejected</TableCell>
                    <TableCell>2023-06-03</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 mt-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Apartment Management</CardTitle>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">Add Apartment</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Rent</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Cozy Studio</TableCell>
                    <TableCell>New York</TableCell>
                    <TableCell>$1200</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Available</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Luxury Apartment</TableCell>
                    <TableCell>San Francisco</TableCell>
                    <TableCell>$2500</TableCell>
                    <TableCell>
                      <Badge variant="outline">Occupied</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Booking Management</CardTitle>
              <Button size="icon" variant="outline" className="h-8 w-8">
                <PlusIcon className="h-4 w-4" />
                <span className="sr-only">Add Booking</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Guest</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Check-out</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>John Doe</TableCell>
                    <TableCell>2023-06-01</TableCell>
                    <TableCell>2023-06-05</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Confirmed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Jane Smith</TableCell>
                    <TableCell>2023-06-10</TableCell>
                    <TableCell>2023-06-15</TableCell>
                    <TableCell>
                      <Badge variant="outline">Pending</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

function BuildingIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  )
}

function AlertCircleIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  )
}

function BellIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function HotelIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 22v-6.57" />
      <path d="M12 11h.01" />
      <path d="M12 7h.01" />
      <path d="M14 15.43V22" />
      <path d="M15 16a5 5 0 0 0-6 0" />
      <path d="M16 11h.01" />
      <path d="M16 7h.01" />
      <path d="M8 11h.01" />
      <path d="M8 7h.01" />
      <rect x="4" y="2" width="16" height="20" rx="2" />
    </svg>
  )
}

function PlusIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}