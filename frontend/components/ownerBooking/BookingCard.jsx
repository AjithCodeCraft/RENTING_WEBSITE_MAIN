import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ArrowUpDown, ChevronsUpDown } from "lucide-react";

const BookingCard = ({ title, value, icon, subtext }) => {
  return (
    <Card className="w-full h-32 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-white">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtext}</p>
      </CardContent>
    </Card>
  );
};

export default BookingCard;
