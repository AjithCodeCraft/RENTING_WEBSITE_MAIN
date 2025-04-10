import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import { format } from "date-fns";

const COMPANY_NAME = "Hostelio";
const COMPANY_ADDRESS = "Industrial Development Area, Muppathadam Rd, Edayar, Kochi, Kerala 683110";
const COMPANY_CONTACT = "+91 478 2839756 | bookings@hostelio.com";
const COMPANY_LOGO_PATH = "/g88.png";

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
      format: 'a4'
    });

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add logo first
    const logoImg = new Image();
    logoImg.src = COMPANY_LOGO_PATH;
    
    // Try to add logo immediately if available
    try {
      doc.addImage(logoImg, "PNG", pageWidth / 2 - 15, margin, 30, 30);
    } catch (e) {
      console.warn("Couldn't add logo:", e);
    }

    // Company header (positioned below logo)
    let yPos = margin + 45; // Start below logo

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(COMPANY_NAME, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(COMPANY_ADDRESS, pageWidth / 2, yPos, { align: "center" });
    yPos += 6;
    doc.text(COMPANY_CONTACT, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Add divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // Booking title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`BOOKING CONFIRMATION`, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Booking reference
    doc.setFontSize(12);
    doc.text(`Reference: ${booking.paymentId}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Status indicator
    doc.setFillColor(
      booking.status === "active" ? 76 :
      booking.status === "completed" ? 33 : 244,
      booking.status === "active" ? 175 :
      booking.status === "completed" ? 150 : 67,
      booking.status === "active" ? 80 :
      booking.status === "completed" ? 243 : 54
    );
    doc.roundedRect(pageWidth / 2 - 15, yPos, 30, 10, 5, 5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.text(booking.status.toUpperCase(), pageWidth / 2, yPos + 6, { align: "center" });
    doc.setTextColor(0, 0, 0);
    yPos += 25; // Extra space after status

    // Two column layout
    const col1 = margin;
    const col2 = pageWidth / 2 + 10;

    // Left Column Content
    // Guest Information
    let leftColumnY = yPos;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Guest Information", col1, leftColumnY);
    leftColumnY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Name: ${booking.guestName}`, col1, leftColumnY);
    leftColumnY += 7;
    doc.text(`Email: ${booking.guestEmail}`, col1, leftColumnY);
    leftColumnY += 7;
    doc.text(`Phone: ${booking.guestPhone}`, col1, leftColumnY);
    leftColumnY += 7;
    doc.text(`Number of Guests: ${booking.guestCount}`, col1, leftColumnY);
    leftColumnY += 15;

    // Accommodation Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Accommodation Details', col1, leftColumnY);
    leftColumnY += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Property: ${booking.hostelName}`, col1, leftColumnY);
    leftColumnY += 7;
    doc.text(`Room/Dormitory: ${booking.room_number}`, col1, leftColumnY);
    leftColumnY += 15;

    // Right Column Content (starts at same position as left column)
    let rightColumnY = yPos;
    
    // Booking Period
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Period", col2, rightColumnY);
    rightColumnY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Check-in: ${formatDate(booking.checkIn)}`, col2, rightColumnY);
    rightColumnY += 7;
    doc.text(`Check-out: ${formatDate(booking.checkOut)}`, col2, rightColumnY);
    rightColumnY += 7;
    doc.text(`Duration: ${calculateDays(booking.checkIn, booking.checkOut)} days`, col2, rightColumnY);
    rightColumnY += 15;

    // Payment Information
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Payment Information", col2, rightColumnY);
    rightColumnY += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Method: ${booking.paymentMethod}`, col2, rightColumnY);
    rightColumnY += 7;
    doc.text(`Payment ID: ${booking.paymentId}`, col2, rightColumnY);
    rightColumnY += 7;
    doc.text(`Total Amount: $${booking.revenue.toFixed(2)}`, col2, rightColumnY);
    rightColumnY += 15;

    // Terms and conditions (full width)
    yPos = Math.max(leftColumnY, rightColumnY) + 15;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", margin, yPos);
    yPos += 10;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const terms = [
      "1. Check-in time is from 3:00 PM, and check-out time is by 11:00 AM.",
      "2. A valid ID is required at check-in.",
      "3. No smoking allowed inside the accommodations.",
      "4. Pets are not permitted without prior approval.",
      "5. Cancellations must be made 48 hours prior to arrival for a full refund.",
    ];

    terms.forEach((term) => {
      doc.text(term, margin, yPos);
      yPos += 5;
    });

    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(
      `Thank you for choosing ${COMPANY_NAME}. We look forward to hosting you!`,
      pageWidth / 2,
      pageHeight - margin,
      { align: "center" }
    );

    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, pageHeight - margin - 5, pageWidth - margin, pageHeight - margin - 5);

    return doc.output("datauristring");
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