import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { calculateDays, formatDate } from './bookingHelpers';

// Company information
const COMPANY_NAME = 'Hostelio';
const COMPANY_ADDRESS = '123 Resort Avenue, Beach City, CA 90210';
const COMPANY_CONTACT = '+1 (555) 123-4567 | bookings@luxuryaccommodations.com';
const COMPANY_LOGO_PATH = '/g88.png';

export const generateBookingPdf = (booking, isPreview) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    margins: { top: 20, bottom: 20, left: 20, right: 20 }
  });
  
  // Add margins
  const margin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - (margin * 2);
  
  // Add logo
  const logoImg = new Image();
  logoImg.src = COMPANY_LOGO_PATH;
  
  // Create a function to add logo after it's loaded
  const addLogo = () => {
    try {
      doc.addImage(logoImg, 'PNG', pageWidth / 2 - 20, margin, 40, 40);
      completeDocument();
    } catch (error) {
      console.error("Error adding logo to PDF:", error);
      // Continue without logo if there's an error
      completeDocument();
    }
  };
  
  // Complete the rest of the document
  const completeDocument = () => {
    // Add company header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(COMPANY_NAME, pageWidth / 2, margin + 55, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_ADDRESS, pageWidth / 2, margin + 62, { align: 'center' });
    doc.text(COMPANY_CONTACT, pageWidth / 2, margin + 68, { align: 'center' });
    
    // Add divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, margin + 72, pageWidth - margin, margin + 72);
    
    // Booking title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`BOOKING CONFIRMATION`, pageWidth / 2, margin + 82, { align: 'center' });
    
    // Booking reference
    doc.setFontSize(12);
    doc.text(`Reference: ${booking.booking_id}`, pageWidth / 2, margin + 90, { align: 'center' });
    
    // Status indicator
    doc.setFillColor(booking.status === 'active' ? 76 : booking.status === 'completed' ? 33 : 244, 
                      booking.status === 'active' ? 175 : booking.status === 'completed' ? 150 : 67, 
                      booking.status === 'active' ? 80 : booking.status === 'completed' ? 243 : 54);
    doc.roundedRect(pageWidth / 2 - 15, margin + 95, 30, 10, 5, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(booking.status.toUpperCase(), pageWidth / 2, margin + 101, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    
    // Customer info section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Guest Information', margin, margin + 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${booking.user}`, margin, margin + 123);
    doc.text(`Email: ${booking.email}`, margin, margin + 130);
    doc.text(`Phone: ${booking.phone}`, margin, margin + 137);
    
    // Accommodation details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accommodation Details', margin, margin + 152);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Property: ${booking.apartment}`, margin, margin + 160);
    doc.text(`Room/Dormitory: ${booking.room_number}`, margin, margin + 167);
    doc.text(`Number of Guests: ${booking.guests}`, margin, margin + 174);
    
    // Booking period
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Period', margin, margin + 189);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Check-in: ${booking.start_date}`, margin, margin + 197);
    doc.text(`Check-out: ${booking.end_date}`, margin, margin + 204);
    doc.text(`Duration: ${calculateDays(booking.start_date, booking.end_date)} days`, margin, margin + 211);
    
    // Payment information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', pageWidth / 2 + 10, margin + 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Method: ${booking.payment_method}`, pageWidth / 2 + 10, margin + 123);
    doc.text(`Payment ID: ${booking.payment_id}`, pageWidth / 2 + 10, margin + 130);
    doc.text(`Total Amount: ${booking.total_amount}`, pageWidth / 2 + 10, margin + 137);
    doc.text(`Booking Date: ${formatDate(booking.booking_date)}`, pageWidth / 2 + 10, margin + 144);
    
    // Terms and conditions
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Terms & Conditions', margin, margin + 230);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const terms = [
      '1. Check-in time is from 3:00 PM, and check-out time is by 11:00 AM.',
      '2. A valid ID is required at check-in.',
      '3. No smoking allowed inside the accommodations.',
      '4. Pets are not permitted without prior approval.',
      '5. Cancellations must be made 48 hours prior to arrival for a full refund.'
    ];
    
    let yPos = margin + 238;
    terms.forEach(term => {
      doc.text(term, margin, yPos);
      yPos += 5;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for choosing ' + COMPANY_NAME + '. We look forward to hosting you!', 
             pageWidth / 2, pageHeight - margin, { align: 'center' });
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);
    
    if (isPreview) {
      // For preview, return as data URL
      return doc.output('datauristring');
    } else {
      // For direct download
      doc.save(`Booking-${booking.booking_id.substring(0, 8)}.pdf`);
    }
  };
  
  // Try to load the logo image
  try {
    // If the logo is available, add it, otherwise complete without logo
    if (logoImg.complete) {
      addLogo();
    } else {
      logoImg.onload = addLogo;
      logoImg.onerror = completeDocument; // Continue without logo if there's an error
    }
  } catch (error) {
    console.error("Error loading logo:", error);
    completeDocument(); // Continue without logo
  }
  
  // Fallback in case the image loading doesn't trigger events properly
  setTimeout(completeDocument, 500);
  
  // Return empty data URI for initial render in preview mode
  if (isPreview) {
    return doc.output('datauristring');
  }
};