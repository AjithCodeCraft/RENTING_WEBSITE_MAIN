
// components/dashboard/PendingApprovalsList.js
import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

const PendingApprovalsList = ({ limit }) => {
  // Mock data - in a real app, this would come from an API
  const mockApprovals = [
    {
      id: 1,
      name: "Sunny Side Hostel",
      owner: "John Doe",
      location: "New York, NY",
      submittedDate: "2023-05-15",
      status: "pending",
      urgent: true,
    },
    {
      id: 2,
      name: "Mountain View Lodge",
      owner: "Jane Smith",
      location: "Denver, CO",
      submittedDate: "2023-05-14",
      status: "pending",
      urgent: false,
    },
    {
      id: 3,
      name: "Beachfront Bungalows",
      owner: "Mike Johnson",
      location: "Miami, FL",
      submittedDate: "2023-05-13",
      status: "pending",
      urgent: true,
    },
    {
      id: 4,
      name: "City Center Suites",
      owner: "Sarah Williams",
      location: "Chicago, IL",
      submittedDate: "2023-05-12",
      status: "pending",
      urgent: false,
    },
    {
      id: 5,
      name: "Lakeside Retreat",
      owner: "David Brown",
      location: "Seattle, WA",
      submittedDate: "2023-05-11",
      status: "pending",
      urgent: false,
    },
    {
      id: 6,
      name: "Downtown Lofts",
      owner: "Emily Davis",
      location: "San Francisco, CA",
      submittedDate: "2023-05-10",
      status: "pending",
      urgent: true,
    },
  ];

  const approvals = limit ? mockApprovals.slice(0, limit) : mockApprovals;

  return (
    <div className="space-y-4">
      {approvals.map((approval) => (
        <div key={approval.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2 mb-4 sm:mb-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{approval.name}</h4>
              {approval.urgent && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Owner: {approval.owner} | Location: {approval.location}
            </p>
            <p className="text-xs text-muted-foreground">
              Submitted: {approval.submittedDate}
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      ))}
      {limit && mockApprovals.length > limit && (
        <Button variant="link" className="w-full">View all {mockApprovals.length} pending approvals</Button>
      )}
    </div>
  );
};

export default PendingApprovalsList;