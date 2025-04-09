import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { format } from "date-fns";

const BookingTable = ({ bookings, onViewBooking, onPrintBooking }) => {
  const formatDate = (dateString) => format(new Date(dateString), "MMMM d, yyyy");

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'confirmed':
        return "bg-green-100 text-green-800 border-green-300";
      case 'pending':
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 'cancelled':
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[180px]">Hostel Name</TableHead>
            <TableHead>Guest Name</TableHead>
            <TableHead>Check-In</TableHead>
            <TableHead>Check-Out</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <TableRow key={booking.id} className="hover:bg-slate-50">
                <TableCell className="font-medium">{booking.hostelName}</TableCell>
                <TableCell>{booking.guestName}</TableCell>
                <TableCell>{formatDate(booking.checkIn)}</TableCell>
                <TableCell>{formatDate(booking.checkOut)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">₹{booking.revenue}</TableCell>
                <TableCell>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onViewBooking(booking)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="default" size="sm" onClick={() => onPrintBooking(booking)}>
                      <Printer className="h-4 w-4 mr-1" />
                      Print
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No bookings found matching your search.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BookingTable;
