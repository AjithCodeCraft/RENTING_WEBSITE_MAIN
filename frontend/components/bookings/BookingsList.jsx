import React, { useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import BookingDetailsDialog from "./BookingDetailsDialog";
import { getStatusColor } from "@/utils/bookingHelpers";
import UserHeader from "@/pages/users/UserHeader";
import { generateBookingPdf } from "@/utils/pdfGenerator";
const BookingsList = ({ bookings }) => {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const handleViewClick = (booking) => {
    setSelectedBooking(booking);
    setOpenDetailsDialog(true);
  };

  const handleDownloadPdf = (booking) => {
    // This will directly trigger the download without preview
    generateBookingPdf(booking, false);
  };

  return (
    <div style={{ padding: "24px" }}>
      <UserHeader />

      <Card elevation={3} style={{ marginTop: "24px" }}>
        <CardContent style={{ padding: "24px" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <div>
              <Typography variant="h5" fontWeight="bold">
                Bookings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See all you booking history here!
              </Typography>
            </div>
          </Box>

          <TableContainer component={Paper} elevation={0}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                    Booking ID
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                    Apartment
                  </TableCell>
                  {/* <TableCell sx={{ fontWeight: "bold", py: 2 }}>User</TableCell> */}
                  <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                    Booking Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 2 }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold", py: 2 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bookings.map((booking) => (
                  <TableRow key={booking.booking_id} hover>
                    <TableCell sx={{ py: 2 }}>{booking.booking_id}</TableCell>
                    <TableCell sx={{ py: 2 }}>{booking.apartment}</TableCell>
                    {/* <TableCell sx={{ py: 2 }}>{booking.user}</TableCell> */}
                    <TableCell sx={{ py: 2 }}>{booking.booking_date}</TableCell>
                    <TableCell sx={{ py: 2 }}>
                      <Box
                        sx={{
                          display: "inline-block",
                          backgroundColor: `${getStatusColor(booking.status)}20`,
                          color: getStatusColor(booking.status),
                          borderRadius: "16px",
                          px: 2,
                          py: 0.5,
                          fontWeight: "medium",
                          textTransform: "capitalize",
                        }}
                      >
                        {booking.status}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ py: 2 }} align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        sx={{ mr: 1 }}
                        onClick={() => handleViewClick(booking)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={() => handleDownloadPdf(booking)}
                      >
                        Download PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        open={openDetailsDialog}
        onClose={() => setOpenDetailsDialog(false)}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingsList;
