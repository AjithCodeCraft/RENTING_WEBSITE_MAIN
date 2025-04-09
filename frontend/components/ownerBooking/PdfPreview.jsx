import React, { useRef } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";

const PdfPreview = ({ booking }) => {
  const pdfPreviewRef = useRef(null);

  const generatePDF = () => {
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
    doc.text(`Room/Dormitory: ${booking.roomNumber}`, margin, margin + 129);

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
    doc.text(`Total Amount: $${booking.revenue.toFixed(2)}`, pageWidth / 2 + 10, margin + 136);

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

    return doc.output('datauristring');
  };

  const formatDate = (dateString) => format(new Date(dateString), "MMMM d, yyyy");

  const calculateDays = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pdfDataUri = generatePDF();

  return (
    <div className="h-[70vh] w-full overflow-auto">
      <iframe
        ref={pdfPreviewRef}
        src={pdfDataUri}
        className="w-full h-full border-none"
        title="PDF Preview"
      />
    </div>
  );
};

export default PdfPreview;
