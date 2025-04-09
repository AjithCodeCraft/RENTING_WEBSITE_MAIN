import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download, Printer } from "lucide-react";
import { format } from "date-fns";

const BookingDetailsDialog = ({ booking, isOpen, onClose, onPreviewPDF, onDownloadPDF }) => {
  const formatDate = (dateString) => format(new Date(dateString), "MMMM d, yyyy");

  const calculateDays = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle className="flex justify-between items-center">
          <span>Booking #{booking.id} Details</span>
          <Badge variant="outline" className={getStatusColor(booking.status)}>
            {booking.status}
          </Badge>
        </DialogTitle>
      </DialogHeader>
      <DialogContent className="sm:max-w-[600px] bg-white">
        <div className="bg-slate-50 p-4 rounded-lg mb-4">
          <h3 className="font-semibold text-lg">{booking.hostelName}</h3>
          <p className="text-sm text-muted-foreground">Room/Dormitory: {booking.roomNumber}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Guest Information</h4>
            <p className="font-medium">{booking.guestName}</p>
            <p className="text-sm">{booking.guestEmail}</p>
            <p className="text-sm">{booking.guestPhone}</p>
            <p className="text-sm">Guests: {booking.guestCount}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Booking Period</h4>
            <div className="flex items-center space-x-2">
              <div>
                <p className="text-xs text-muted-foreground">Check-in</p>
                <p className="font-medium">{formatDate(booking.checkIn)}</p>
              </div>
              <span className="text-muted-foreground">→</span>
              <div>
                <p className="text-xs text-muted-foreground">Check-out</p>
                <p className="font-medium">{formatDate(booking.checkOut)}</p>
              </div>
            </div>
            <p className="text-sm mt-2">
              Duration: {calculateDays(booking.checkIn, booking.checkOut)} days
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Payment Details</h4>
            <p className="font-medium">{booking.paymentMethod}</p>
            <p className="text-sm">ID: {booking.paymentId}</p>
            <p className="text-sm">Total: ₹{booking.revenue}</p>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button variant="outline" onClick={onPreviewPDF}>
          <Eye className="h-4 w-4 mr-1" />
          Preview PDF
        </Button>
        <Button onClick={onDownloadPDF}>
          <Download className="h-4 w-4 mr-1" />
          Download PDF
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default BookingDetailsDialog;
