import { DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download } from "lucide-react";

export const BookingDetailsDialog = ({ 
  booking, 
  onClose, 
  onShowPdfPreview,
  formatDate,
  calculateDays,
  getStatusColor 
}) => {
  return (
    <>
   
      <DialogContent className="sm:max-w-[600px] bg-white">
        <div className="bg-slate-50 p-4 rounded-lg mb-4 bg">
          <h3 className="font-semibold text-lg">{booking.hostelName}</h3>
          <p className="text-sm text-muted-foreground">Room/Dormitory: {booking.room_number}</p>
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
      
    </>
  );
};