

// components/dashboard/StatCard.js
import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';

const StatCard = ({ title, value, description, icon, trend = 'positive' }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium">{title}</p>
          {icon}
        </div>
        <div className="flex items-baseline pb-1">
          <h3 className="text-2xl font-semibold">{value}</h3>
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {trend === 'positive' ? (
            <ArrowUp className="mr-1 h-3 w-3 text-green-500" />
          ) : (
            <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default StatCard;