import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";

const COMPANY_NAME = "Hostel Management System";
const COMPANY_ADDRESS = "123 Accommodation Street, Tourism City, 90210";
const COMPANY_CONTACT = "+1 (555) 123-4567 | info@hostelmanagement.com";
const COMPANY_WEBSITE = "www.hostelmanagement.com";

export const PdfPreview = ({ booking, innerRef }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  const calculateDays = (checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const generatePDF = (booking) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      margins: { top: 20, bottom: 20, left: 20, right: 20 }
    });
    
    // Header with company info
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_ADDRESS, doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });
    doc.text(COMPANY_CONTACT, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
    doc.text(COMPANY_WEBSITE, doc.internal.pageSize.getWidth() / 2, 44, { align: 'center' });
    
    // Add divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 48, doc.internal.pageSize.getWidth() - 20, 48);
    
    // Booking title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`BOOKING CONFIRMATION`, doc.internal.pageSize.getWidth() / 2, 58, { align: 'center' });
    
    // Booking reference
    doc.setFontSize(12);
    doc.text(`Reference: #${booking.id}`, doc.internal.pageSize.getWidth() / 2, 66, { align: 'center' });
    
    // Status badge
    const statusColor = booking.status === 'Confirmed' ? [76, 175, 80] : 
                       booking.status === 'Pending' ? [255, 152, 0] : [244, 67, 54];
    doc.setFillColor(...statusColor);
    doc.roundedRect(doc.internal.pageSize.getWidth() / 2 - 15, 70, 30, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(booking.status.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 76, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Guest info section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Guest Information', 20, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${booking.guestName}`, 20, 98);
    doc.text(`Email: ${booking.guestEmail}`, 20, 105);
    doc.text(`Phone: ${booking.guestPhone}`, 20, 112);
    doc.text(`Number of Guests: ${booking.guestCount}`, 20, 119);
    
    // Accommodation details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accommodation Details', 20, 134);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Property: ${booking.hostelName}`, 20, 142);
    doc.text(`Room/Dormitory: ${booking.roomNumber}`, 20, 149);
    
    // Booking period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Period', doc.internal.pageSize.getWidth() / 2 + 10, 90);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Check-in: ${formatDate(booking.checkIn)}`, doc.internal.pageSize.getWidth() / 2 + 10, 98);
    doc.text(`Check-out: ${formatDate(booking.checkOut)}`, doc.internal.pageSize.getWidth() / 2 + 10, 105);
    doc.text(`Duration: ${calculateDays(booking.checkIn, booking.checkOut)} days`, doc.internal.pageSize.getWidth() / 2 + 10, 112);
    
    // Payment information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', doc.internal.pageSize.getWidth() / 2 + 10, 134);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Method: ${booking.paymentMethod}`, doc.internal.pageSize.getWidth() / 2 + 10, 142);
    doc.text(`Payment ID: ${booking.paymentId}`, doc.internal.pageSize.getWidth() / 2 + 10, 149);
    doc.text(`Total Amount: $${booking.revenue.toFixed(2)}`, doc.internal.pageSize.getWidth() / 2 + 10, 156);
    
    // Add a box with important notes
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, 170, doc.internal.pageSize.getWidth() - 40, 40, 3, 3, 'FD');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Important Information', 25, 178);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('• Check-in time: 2:00 PM - 8:00 PM', 25, 186);
    doc.text('• Check-out time: Before 11:00 AM', 25, 193);
    doc.text('• Please present ID and booking confirmation upon arrival', 25, 200);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing our accommodation. We look forward to your stay!', 
             doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, doc.internal.pageSize.getHeight() - 25, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 25);
    
    return doc.output('datauristring');
  };

  if (!booking) return null;
  const pdfDataUri = generatePDF(booking);
  
  return (
    <div className="h-[70vh] w-full overflow-auto">
      <iframe
        ref={innerRef}
        src={pdfDataUri}
        className="w-full h-full border-none"
        title="PDF Preview"
      />
    </div>
  );
};