import React, { useState, useEffect, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import { Calendar, ArrowUpDown, ChevronsUpDown } from "lucide-react";
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
import Cookies from 'js-cookie';


const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const pdfPreviewRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const ownerId = Cookies.get('owner_id_number');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await axios.get(`${apiUrl}/owner/${ownerId}/payments/`);
        const payments = response.data.payments;

        const formattedBookings = payments.map((payment, index) => ({
          id: index + 1,
          hostelName: payment.apartment_name,
          guestName: payment.user_name,
          checkIn: new Date(payment.check_in).toISOString().split('T')[0],
          checkOut: new Date(payment.check_out).toISOString().split('T')[0],
          status: payment.payment_status === "paid" ? "Confirmed" : "Pending",
          revenue: parseFloat(payment.amount),
          roomNumber: "Room Number", // Replace with actual room number if available
          paymentMethod: payment.payment_method,
          paymentId: payment.payment_id,
          guestEmail: payment.user_email,
          guestPhone: payment.user_phone, // Replace with actual guest phone if available
          guestCount: 1, // Replace with actual guest count if available
          room_number: Math.floor(Math.random() * 100) + 1,
        }));

        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
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
    doc.text(`Reference: #${booking.id}`, pageWidth / 2, margin + 46, { align: 'center' });

    const statusColor = booking.status === 'Confirmed' ? [76, 175, 80] :
                         booking.status === 'Pending' ? [255, 152, 0] : [244, 67, 54];
    doc.setFillColor(...statusColor);
    doc.roundedRect(pageWidth / 2 - 15, margin + 50, 30, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(booking.status.toUpperCase(), pageWidth / 2, margin + 56, { align: 'center' });
    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Guest Information', margin, margin + 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${booking.guestName}`, margin, margin + 78);
    doc.text(`Email: ${booking.guestEmail}`, margin, margin + 85);
    doc.text(`Phone: ${booking.guestPhone}`, margin, margin + 92);
    doc.text(`Number of Guests: ${booking.guestCount}`, margin, margin + 99);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accommodation Details', margin, margin + 114);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Property: ${booking.hostelName}`, margin, margin + 122);
    doc.text(`Room/Dormitory: ${booking.room_number}`, margin, margin + 129);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Period', pageWidth / 2 + 10, margin + 70);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Check-in: ${formatDate(booking.checkIn)}`, pageWidth / 2 + 10, margin + 78);
    doc.text(`Check-out: ${formatDate(booking.checkOut)}`, pageWidth / 2 + 10, margin + 85);
    doc.text(`Duration: ${calculateDays(booking.checkIn, booking.checkOut)} days`, pageWidth / 2 + 10, margin + 92);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', pageWidth / 2 + 10, margin + 114);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Method: ${booking.paymentMethod}`, pageWidth / 2 + 10, margin + 122);
    doc.text(`Payment ID: ${booking.paymentId}`, pageWidth / 2 + 10, margin + 129);
    doc.text(`Total Amount: ₹${booking.revenue.toFixed(2)}`, pageWidth / 2 + 10, margin + 136);

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

    doc.save(`Booking-${booking.id}-${booking.guestName.replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <div>
      <OwnerHeader />
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <BookingCard
                title="Total Bookings"
                value={filteredBookings.length}
                description={`+${filteredBookings.filter(b => b.status === "Confirmed").length} confirmed`}
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              />
              <BookingCard
                title="Monthly Revenue"
                value={`₹${totalRevenueMonth}`}
                description={`From ${filteredBookings.filter(b => b.status === "Confirmed").length} bookings`}
                icon={<ArrowUpDown className="h-4 w-4 text-muted-foreground" />}
              />
              <BookingCard
                title="Yearly Revenue"
                value={`₹${totalRevenueYear}`}
                description={`+${totalRevenueYear - totalRevenueMonth} from other months`}
                icon={<ChevronsUpDown className="h-4 w-4 text-muted-foreground" />}
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
          </>
        )}
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
