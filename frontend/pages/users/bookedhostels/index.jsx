import React from "react";
import BookingsList from "@/components/bookings/BookingsList";
import useBookingData from "@/hooks/useBookingData";
import { Spinner } from "@/components/ui/Spinner";
import { useState } from "react";

const BookingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState([]);
  useBookingData(setBookingData, setLoading);

  return loading ? <Spinner /> : <BookingsList bookings={bookingData} />;
};

export default BookingsPage;
