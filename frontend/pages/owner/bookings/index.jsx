import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Printer, Download } from "lucide-react";
import OwnerHeader from "../OwnerHeader";
import { BookingCard } from '@/components/ownerBooking/BookingCard';
import { BookingTable } from '@/components/ownerBooking/BookingTable';
import { BookingDetailsDialog } from '@/components/ownerBooking/BookingDetailsDialog';
import { PdfPreview } from '@/components/ownerBooking/PdfPreview';
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

// Sample booking data
const sampleBookings = [
    {
        id: 1,
        hostelName: "Sunshine Hostel",
        guestName: "John Doe",
        checkIn: "2023-10-01",
        checkOut: "2023-10-05",
        status: "Confirmed",
        revenue: 200,
        roomNumber: "D-101",
        paymentMethod: "Credit Card",
        paymentId: "PAY-12345-ABCDE",
        guestEmail: "john.doe@example.com",
        guestPhone: "+1 (234) 567-8901",
        guestCount: 2,
      },
      {
        id: 2,
        hostelName: "Moonlight Hostel",
        guestName: "Jane Smith",
        checkIn: "2023-10-10",
        checkOut: "2023-10-15",
        status: "Pending",
        revenue: 150,
        roomNumber: "D-203",
        paymentMethod: "PayPal",
        paymentId: "PAY-67890-FGHIJ",
        guestEmail: "jane.smith@example.com",
        guestPhone: "+1 (345) 678-9012",
        guestCount: 1,
      },
      {
        id: 3,
        hostelName: "Ocean View Hostel",
        guestName: "Alice Johnson",
        checkIn: "2023-10-15",
        checkOut: "2023-10-20",
        status: "Confirmed",
        revenue: 250,
        roomNumber: "D-305",
        paymentMethod: "Bank Transfer",
        paymentId: "PAY-54321-KLMNO",
        guestEmail: "alice.johnson@example.com",
        guestPhone: "+1 (456) 789-0123",
        guestCount: 3,
      },
      {
        id: 4,
        hostelName: "Mountain Retreat",
        guestName: "Bob Williams",
        checkIn: "2023-10-18",
        checkOut: "2023-10-25",
        status: "Cancelled",
        revenue: 320,
        roomNumber: "D-401",
        paymentMethod: "Credit Card",
        paymentId: "PAY-09876-PQRST",
        guestEmail: "bob.williams@example.com",
        guestPhone: "+1 (567) 890-1234",
        guestCount: 2,
      },
      {
        id: 5,
        hostelName: "City Center Hostel",
        guestName: "Charlie Brown",
        checkIn: "2023-10-20",
        checkOut: "2023-10-23",
        status: "Confirmed",
        revenue: 180,
        roomNumber: "D-102",
        paymentMethod: "Cash",
        paymentId: "PAY-24680-UVWXY",
        guestEmail: "charlie.brown@example.com",
        guestPhone: "+1 (678) 901-2345",
        guestCount: 1,
      },
  // ... (your sample bookings data)
];

const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const pdfPreviewRef = useRef(null);

  useEffect(() => {
    setBookings(sampleBookings);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) =>
      booking.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.hostelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [bookings, searchTerm]);

  const totalRevenueMonth = useMemo(() => {
    return filteredBookings.reduce((total, booking) => {
      const bookingMonth = new Date(booking.checkIn).getMonth();
      const currentMonth = new Date().getMonth();
      if (bookingMonth === currentMonth && booking.status === "Confirmed") {
        return total + booking.revenue;
      }
      return total;
    }, 0);
  }, [filteredBookings]);

  const totalRevenueYear = useMemo(() => {
    return filteredBookings.reduce((total, booking) => {
      const bookingYear = new Date(booking.checkIn).getFullYear();
      const currentYear = new Date().getFullYear();
      if (bookingYear === currentYear && booking.status === "Confirmed") {
        return total + booking.revenue;
      }
      return total;
    }, 0);
  }, [filteredBookings]);

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setShowBookingDetails(true);
    setShowPdfPreview(false);
  };

  const handleShowPdfPreview = () => {
    setShowPdfPreview(true);
  };

  const handleCloseDialog = () => {
    setShowBookingDetails(false);
    setShowPdfPreview(false);
  };

  const calculateDays = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy");
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

  const generatePDF = (booking) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    });
    
    // ... (same PDF generation code as in PdfPreview component)
    
    doc.save(`Booking-${booking.id}-${booking.guestName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div>
      <OwnerHeader />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BookingCard 
            title="Total Bookings"
            value={filteredBookings.length}
            description={`+${filteredBookings.filter(b => b.status === "Confirmed").length} confirmed`}
            icon="Calendar"
          />
          <BookingCard 
            title="Monthly Revenue"
            value={`₹${totalRevenueMonth}`}
            description={`From ${filteredBookings.filter(b => b.status === "Confirmed").length} bookings`}
            icon="ArrowUpDown"
          />
          <BookingCard 
            title="Yearly Revenue"
            value={`₹${totalRevenueYear}`}
            description={`+${totalRevenueYear - totalRevenueMonth} from other months`}
            icon="ChevronsUpDown"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bookings Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full sm:w-[250px]"
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Confirmed</Badge>
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>
                <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Cancelled</Badge>
              </div>
            </div>

            <div className="rounded-md border">
              <BookingTable 
                bookings={filteredBookings}
                onViewBooking={handleViewBooking}
                onPrintBooking={handleShowPdfPreview}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showBookingDetails} onOpenChange={handleCloseDialog}>
        {selectedBooking && !showPdfPreview && (
          <BookingDetailsDialog 
            booking={selectedBooking}
            onClose={handleCloseDialog}
            onShowPdfPreview={handleShowPdfPreview}
            formatDate={formatDate}
            calculateDays={calculateDays}
            getStatusColor={getStatusColor}
            generatePDF={generatePDF}
          />
        )}

        {selectedBooking && showPdfPreview && (
          <>
            <DialogHeader>
              <DialogTitle>PDF Preview</DialogTitle>
            </DialogHeader>
            <DialogContent className="p-0 sm:max-w-[800px]">
              <PdfPreview booking={selectedBooking} innerRef={pdfPreviewRef} />
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (pdfPreviewRef.current) {
                    pdfPreviewRef.current.contentWindow.print();
                  }
                }}
              >
                <Printer className="h-4 w-4 mr-1" />
                Print
              </Button>
              <Button onClick={() => generatePDF(selectedBooking)}>
                <Download className="h-4 w-4 mr-1" />
                Download PDF
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </div>
  );
};

export default OwnerDashboard;