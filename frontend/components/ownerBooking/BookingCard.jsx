import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar, ArrowUpDown, ChevronsUpDown } from "lucide-react";

export const BookingCard = ({ title, value, description, icon }) => {
  const Icon = icon === "Calendar" ? Calendar : 
               icon === "ArrowUpDown" ? ArrowUpDown : ChevronsUpDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};