import React from 'react';
import { Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const bookings = [
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174000',
    apartment: 'Apartment A',
    user: 'John Doe',
    booking_date: '2023-10-01 14:30:00',
    status: 'active',
  },
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174001',
    apartment: 'Apartment B',
    user: 'Jane Smith',
    booking_date: '2023-10-02 10:15:00',
    status: 'completed',
  },
  {
    booking_id: '123e4567-e89b-12d3-a456-426614174002',
    apartment: 'Apartment C',
    user: 'Alice Johnson',
    booking_date: '2023-10-03 16:45:00',
    status: 'cancelled',
  },
];

const Index = () => {
  return (
    <Card>
      <CardContent>
        <div className="text-2xl font-bold">Bookings</div>
        <p className="text-xs text-muted-foreground">-3 from last month</p>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Booking ID</TableCell>
                <TableCell>Apartment</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Booking Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.booking_id}>
                  <TableCell>{booking.booking_id}</TableCell>
                  <TableCell>{booking.apartment}</TableCell>
                  <TableCell>{booking.user}</TableCell>
                  <TableCell>{booking.booking_date}</TableCell>
                  <TableCell>{booking.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default Index;