import React, { useState, useEffect, useMemo } from 'react';
// import OwnerHeader from "../OwnerHeader";
// import BookingCard from "./BookingCard";
// import BookingTable from "./BookingTable";
// import BookingDetailsDialog from "./BookingDetailsDialog";
import OwnerHeader from '../OwnerHeader';
import BookingCard from '@/components/ownerBooking/BookingCard';
import BookingTable from '@/components/ownerBooking/BookingTable';
import BookingDetailsDialog from '@/components/ownerBooking/BookingDetailsDialog';
import PdfPreview from '@/components/ownerBooking/PdfPreview';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ArrowUpDown, ChevronsUpDown } from "lucide-react";

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
];

const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

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

  return (
    <div>
      <OwnerHeader />
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <BookingCard
            title="Total Bookings"
            value={filteredBookings.length}
            icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            subtext={`+${filteredBookings.filter(b => b.status === "Confirmed").length} confirmed`}
          />
          <BookingCard
            title="Monthly Revenue"
            value={`₹${totalRevenueMonth}`}
            icon={<ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
            subtext={`From ${filteredBookings.filter(b => b.status === "Confirmed").length} bookings`}
          />
          <BookingCard
            title="Yearly Revenue"
            value={`₹${totalRevenueYear}`}
            icon={<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
            subtext={`+${totalRevenueYear - totalRevenueMonth} from other months`}
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

            <BookingTable
              bookings={filteredBookings}
              onViewBooking={handleViewBooking}
              onPrintBooking={(booking) => {
                setSelectedBooking(booking);
                setShowBookingDetails(true);
                handleShowPdfPreview();
              }}
            />
          </CardContent>
        </Card>
      </div>

      <BookingDetailsDialog
        booking={selectedBooking}
        isOpen={showBookingDetails}
        onClose={handleCloseDialog}
        onPreviewPDF={handleShowPdfPreview}
        onDownloadPDF={() => {
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            margins: { top: 20, bottom: 20, left: 20, right: 20 }
          });

          const margin = 20;
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const contentWidth = pageWidth - (margin * 2);

          const COMPANY_NAME = "Hostel Management System";
          const COMPANY_ADDRESS = "123 Accommodation Street, Tourism City, 90210";
          const COMPANY_CONTACT = "+1 (555) 123-4567 | info@hostelmanagement.com";
          const COMPANY_WEBSITE = "www.hostelmanagement.com";

          doc.setFontSize(18);
          doc.setFont('helvetica', 'bold');
          doc.text(COMPANY_NAME, pageWidth / 2, margin + 5, { align: 'center' });

          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(COMPANY_ADDRESS, pageWidth / 2, margin + 12, { align: 'center' });
          doc.text(COMPANY_CONTACT, pageWidth / 2, margin + 18, { align: 'center' });
          doc.text(COMPANY_WEBSITE, pageWidth / 2, margin + 24, { align: 'center' });

          doc.setDrawColor(200, 200, 200);
          doc.line(margin, margin + 28, pageWidth - margin, margin + 28);

          doc.setFontSize(16);
          doc.setFont('helvetica', 'bold');
          doc.text(`BOOKING CONFIRMATION`, pageWidth / 2, margin + 38, { align: 'center' });

          doc.setFontSize(12);
          doc.text(`Reference: #${selectedBooking.id}`, pageWidth / 2, margin + 46, { align: 'center' });

          const statusColor = selectedBooking.status === 'Confirmed' ? [76, 175, 80] :
                               selectedBooking.status === 'Pending' ? [255, 152, 0] : [244, 67, 54];
          doc.setFillColor(...statusColor);
          doc.roundedRect(pageWidth / 2 - 15, margin + 50, 30, 10, 2, 2, 'F');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(selectedBooking.status.toUpperCase(), pageWidth / 2, margin + 56, { align: 'center' });
          doc.setTextColor(0, 0, 0);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Guest Information', margin, margin + 70);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Name: ${selectedBooking.guestName}`, margin, margin + 78);
          doc.text(`Email: ${selectedBooking.guestEmail}`, margin, margin + 85);
          doc.text(`Phone: ${selectedBooking.guestPhone}`, margin, margin + 92);
          doc.text(`Number of Guests: ${selectedBooking.guestCount}`, margin, margin + 99);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Accommodation Details', margin, margin + 114);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Property: ${selectedBooking.hostelName}`, margin, margin + 122);
          doc.text(`Room/Dormitory: ${selectedBooking.roomNumber}`, margin, margin + 129);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Booking Period', pageWidth / 2 + 10, margin + 70);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Check-in: ${formatDate(selectedBooking.checkIn)}`, pageWidth / 2 + 10, margin + 78);
          doc.text(`Check-out: ${formatDate(selectedBooking.checkOut)}`, pageWidth / 2 + 10, margin + 85);
          doc.text(`Duration: ${calculateDays(selectedBooking.checkIn, selectedBooking.checkOut)} days`, pageWidth / 2 + 10, margin + 92);

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Payment Information', pageWidth / 2 + 10, margin + 114);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text(`Method: ${selectedBooking.paymentMethod}`, pageWidth / 2 + 10, margin + 122);
          doc.text(`Payment ID: ${selectedBooking.paymentId}`, pageWidth / 2 + 10, margin + 129);
          doc.text(`Total Amount: $${selectedBooking.revenue.toFixed(2)}`, pageWidth / 2 + 10, margin + 136);

          doc.setDrawColor(200, 200, 200);
          doc.setFillColor(250, 250, 250);
          doc.roundedRect(margin, margin + 150, contentWidth, 40, 3, 3, 'FD');

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Important Information', margin + 5, margin + 158);

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text('• Check-in time: 2:00 PM - 8:00 PM', margin + 5, margin + 166);
          doc.text('• Check-out time: Before 11:00 AM', margin + 5, margin + 173);
          doc.text('• Please present ID and booking confirmation upon arrival', margin + 5, margin + 180);

          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.text('Thank you for choosing our accommodation. We look forward to your stay!',
                   pageWidth / 2, pageHeight - margin, { align: 'center' });

          doc.setDrawColor(200, 200, 200);
          doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);

          doc.save(`Booking-${selectedBooking.id}-${selectedBooking.guestName.replace(/\s+/g, '-')}.pdf`);
        }}
      />

      {showPdfPreview && (
        <PdfPreview booking={selectedBooking} />
      )}
    </div>
  );
};

export default OwnerDashboard;
