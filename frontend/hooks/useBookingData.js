import axios from "axios";
import React, { useEffect } from "react";
import Cookies from 'js-cookie';

const useBookingData = (setBookingData, setLoading) => {
  const setData = (data) => {
    const newBookingData = [];
    data.forEach((bookingInfo) => {
      newBookingData.push({
        apartment: bookingInfo.apartment.title,
        booking_date: bookingInfo.booking.booking_date,
        booking_id: bookingInfo.booking.booking_id,
        email: bookingInfo.user.email,
        end_date: bookingInfo.booking.checkout_date,
        guests: 1,
        payment_id: bookingInfo.razorpay_payment_id,
        payment_method: bookingInfo.payment_method,
        phone: bookingInfo.user.phone,
        room_number: Math.floor(Math.random() * 100) + 1,
        start_date: bookingInfo.booking.booking_date,
        status: bookingInfo.booking.status,
        total_amount: bookingInfo.amount,
        user: bookingInfo.user.name,
      });
    });
    setBookingData(newBookingData);
  };

  const fetchBookingData = async (userId) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/user/${userId}`,
      );
      setData(response.data.payments);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userId = Cookies.get("user_id_number");
    fetchBookingData(userId);
  }, []);
};

export default useBookingData;
