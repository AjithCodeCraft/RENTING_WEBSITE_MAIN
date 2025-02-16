// components/dashboard/RecentActivityList.js
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '@/components/ui/button';
const RecentActivityList = ({ limit }) => {
  // Mock data - in a real app, this would come from an API
  const mockActivities = [
    {
      id: 1,
      user: {
        name: "Admin User",
        avatar: "/avatars/admin.png",
        initials: "AU"
      },
      action: "approved",
      subject: "Sunset Beach Hostel",
      timestamp: "10 minutes ago"
    },
    {
      id: 2,
      user: {
        name: "John Doe",
        avatar: "/avatars/john.png",
        initials: "JD"
      },
      action: "submitted",
      subject: "Mountain View Lodge",
      timestamp: "2 hours ago"
    },
    {
      id: 3,
      user: {
        name: "Admin User",
        avatar: "/avatars/admin.png",
        initials: "AU"
      },
      action: "rejected",
      subject: "Urban Stay Hostel",
      timestamp: "4 hours ago"
    },
    {
      id: 4,
      user: {
        name: "Jane Smith",
        avatar: "/avatars/jane.png",
        initials: "JS"
      },
      action: "updated",
      subject: "Lakeside Retreat",
      timestamp: "Yesterday"
    },
    {
      id: 5,
      user: {
        name: "Mike Johnson",
        avatar: "/avatars/mike.png",
        initials: "MJ"
      },
      action: "submitted",
      subject: "City Center Suites",
      timestamp: "Yesterday"
    },
    {
      id: 6,
      user: {
        name: "Admin User",
        avatar: "/avatars/admin.png",
        initials: "AU"
      },
      action: "approved",
      subject: "Downtown Lofts",
      timestamp: "2 days ago"
    },
  ];

  const activities = limit ? mockActivities.slice(0, limit) : mockActivities;

  const getActionColor = (action) => {
    switch (action) {
      case 'approved': return 'text-green-500';
      case 'rejected': return 'text-red-500';
      case 'submitted': return 'text-blue-500';
      case 'updated': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-4">
          <Avatar>
            <AvatarImage src={activity.user.avatar} />
            <AvatarFallback>{activity.user.initials}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{' '}
              <span className={getActionColor(activity.action)}>
                {activity.action}
              </span>{' '}
              <span className="font-medium">{activity.subject}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {activity.timestamp}
            </p>
          </div>
        </div>
      ))}
      {limit && mockActivities.length > limit && (
        <Button variant="link" className="w-full">View all activity</Button>
      )}
    </div>
  );
};
export default RecentActivityList;