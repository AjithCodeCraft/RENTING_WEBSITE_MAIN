import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import {
  getStatusColor,
  calculateDays,
  formatDate,
} from "../../utils/bookingHelpers";
import { generateBookingPdf } from "@/utils/pdfGenerator";
const BookingDetailsDialog = ({ open, onClose, booking }) => {
  if (!booking) return null;

  const handleDownloadPdf = () => {
    generateBookingPdf(booking, false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ borderBottom: "1px solid #eee", px: 3, py: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            Booking Details
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box
          sx={{
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            p: 3,
            mb: 3,
            border: "1px solid #eee",
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold">
                Reservation #{booking.booking_id.substring(0, 8)}
              </Typography>
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
                  mt: 1,
                }}
              >
                {booking.status}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" color="text.secondary">
              Guest Information
            </Typography>
            <Typography variant="body1" fontWeight="medium" mt={1}>
              {booking.user}
            </Typography>
            <Typography variant="body2">Email: {booking.email}</Typography>
            <Typography variant="body2">Phone: {booking.phone}</Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" color="text.secondary">
              Accommodation
            </Typography>
            <Typography variant="body1" fontWeight="medium" mt={1}>
              {booking.apartment}
            </Typography>
            <Typography variant="body2">
              Room/Dormitory: {booking.room_number}
            </Typography>
            <Typography variant="body2">Guests: {booking.guests}</Typography>
          </Grid>

          <Grid item xs={12} md={7}>
            <Typography variant="subtitle2" color="text.secondary">
              Booking Period
            </Typography>
            <Box sx={{ display: "flex", mt: 1 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Check-in
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(booking.start_date)}
                </Typography>
              </Box>
              <Box sx={{ mx: 2, display: "flex", alignItems: "center" }}>→</Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Check-out
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatDate(booking.end_date)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" mt={1}>
              Duration: {calculateDays(booking.start_date, booking.end_date)}{" "}
              days
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="subtitle2" color="text.secondary">
              Payment Information
            </Typography>
            <Typography variant="body1" fontWeight="medium" mt={1}>
              {booking.payment_method}
            </Typography>
            <Typography variant="body2">ID: {booking.payment_id}</Typography>
            <Typography variant="body2">
              Amount: {booking.total_amount}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid #eee" }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={handleDownloadPdf}
        >
          Download Invoice
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;
