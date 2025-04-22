// components/dashboard/PendingApprovalsList.js
import React, { useState, useEffect, useRef } from "react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import useApartmentStore from "@/store/apartmentStore";
import { ownerDocument } from "@mui/material";
import Cookies from 'js-cookie';

const PendingApprovalsList = ({
  limit, setPendingCount, updateTotalApartmentCount
}) => {
  const [unapprovedApartments, setUnapprovedApartments] = useState([]);

  const [approvals, setApprovals] = useState([]);

  const [revealAll, setRevealAll] = useState(false);

  const { allUsers, setAllUsers } = useApartmentStore();

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/get-pending-apartments/`;
  const API_URL_GET_OWNER = `${process.env.NEXT_PUBLIC_API_URL}/house-owner/by-id`;

  const get_owner_name = (owner_id) => {
    return allUsers[owner_id];
  };
  const get_pending_data = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      const data =
        response.data.map((item) => {
          const date = new Date(item.created_at).toLocaleDateString();
          return {
            id: item.apartment_id,
            name: item.title,
            owner_id: item.owner,
            location: item.location,
            submittedDate: date,
            status: "pending",
            urgent: true,
          }
        });
      setUnapprovedApartments(data);
      setPendingCount(data.length);
      if (revealAll) {
        setApprovals(data);
      } else {
        setApprovals(data.slice(0, limit));
      }

    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    get_pending_data();
    updateTotalApartmentCount();
  }, []);

  const handleReject = async (apartment_id) => {
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/apartments/${apartment_id}`;
    try {
      await axios.delete(API_URL, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
        },
        withCredentials: true,
      });
      get_pending_data();
      updateTotalApartmentCount();
    } catch (error) {
      console.log(error);
    }
  };

  const handleApprove = async (apartment_id) => {
    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/approve-hostel/${apartment_id}`;
    try {
      await axios.patch(API_URL, {
        headers: {
          Authorization: `Bearer ${Cookies.get("access_token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      get_pending_data();
      updateTotalApartmentCount();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="space-y-4">
      {approvals.length > 0 &&
        approvals.map((approval) => (
          <div
            key={approval.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg"
          >
            <div className="space-y-2 mb-4 sm:mb-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium">{approval.name}</h4>
                {approval.urgent && <Badge variant="destructive">Urgent</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">
                Owner: {allUsers[approval.owner_id]?.name} | Location: {approval.location}
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted: {approval.submittedDate}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleApprove(approval.id)}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => handleReject(approval.id)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      {approvals.length === 0 && "Such emptiness..."}
      {!revealAll && (
        <Button
          variant="link"
          className="w-full"
          onClick={() => {
            setApprovals(unapprovedApartments);
            setRevealAll(!revealAll);
          }}
        >
          View all {unapprovedApartments.length} pending approvals
        </Button>
      )}
      {revealAll && (
        <Button
          variant="link"
          className="w-full"
          onClick={() => {
            setApprovals(unapprovedApartments.slice(0, limit));
            setRevealAll(!revealAll);
          }}
        >
          Show Less pending approvals
        </Button>
      )}
    </div>
  );
};

export default PendingApprovalsList;
