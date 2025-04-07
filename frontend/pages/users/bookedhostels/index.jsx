import React from 'react';
import BookingsList from '@/components/bookings/BookingsList';

// Sample data - in a real app, this would come from an API
const bookings = [
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174000',
    apartment: 'Apartment A',
    user: 'John Doe',
    booking_date: '2023-10-01 14:30:00',
    status: 'active',
    start_date: '2023-10-05',
    end_date: '2023-10-12',
    payment_method: 'Credit Card',
    payment_id: 'PAY-12345678',
    room_number: 'D-101',
    email: 'john.doe@example.com',
    phone: '+1 (234) 567-8901',
    total_amount: '$980.00',
    guests: 2
  },
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174001',
    apartment: 'Apartment B',
    user: 'Jane Smith',
    booking_date: '2023-10-02 10:15:00',
    status: 'completed',
    start_date: '2023-10-10',
    end_date: '2023-10-17',
    payment_method: 'PayPal',
    payment_id: 'PAY-87654321',
    room_number: 'D-203',
    email: 'jane.smith@example.com',
    phone: '+1 (345) 678-9012',
    total_amount: '$1,120.00',
    guests: 3
  },
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174002',
    apartment: 'Apartment C',
    user: 'Alice Johnson',
    booking_date: '2023-10-03 16:45:00',
    status: 'cancelled',
    start_date: '2023-10-15',
    end_date: '2023-10-22',
    payment_method: 'Bank Transfer',
    payment_id: 'PAY-98765432',
    room_number: 'D-305',
    email: 'alice.johnson@example.com',
    phone: '+1 (456) 789-0123',
    total_amount: '$840.00',
    guests: 1
  },
];

const BookingsPage = () => {
  return <BookingsList bookings={bookings} />;
};

export default BookingsPage;