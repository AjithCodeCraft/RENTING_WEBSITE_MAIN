import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import {
  CircleUser,
  Home,
  BarChart3,
  Building2,
  Clock,
  Users,
  Settings,
  FileCheck,
  Clock3,
  AlertTriangle,
} from "lucide-react";
import PendingApprovalsList from "./PendingApprovalsList";
import RecentActivityList from "./RecentActivityList";
import StatCard from "./StatCard";
import AdminLayout from "./adminsidebar";
import axios from "axios";
import useApartmentStore from "@/store/apartmentStore";
import { useRouter } from "next/router";
import { Spinner } from "@/components/ui/Spinner";
import useLoginValidation from "@/hooks/useLoginValidation";
import { ISOLanguage } from "@maptiler/client";

const AdminDashboard = () => {
  const route = useRouter();
  const [pendingCount, setPendingCount] = useState("-");
  const [totalApartments, setTotalApartments] = useState("-");
  const [limit, setLimit] = useState(4);
  const [activeUsers, setActiveUsers] = useState("-");
  const [loading, setLoading] = useState(true);
  const pendingSection = useRef(null);
  const { setApprovedApartments, setAllUsers } = useApartmentStore();

  useLoginValidation(setLoading, "/admin/dashboard");

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const updateTotalApartmentCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/apartments/approved`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setApprovedApartments(response.data);
      setTotalApartments(response.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const pendingApprovalListProps = {
    limit,
    setPendingCount,
    updateTotalApartmentCount,
  };

  const scrollToPendingSection = () => {
    pendingSection.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getTotalUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/get-users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setActiveUsers(response.data.length);
      const ownerData = response.data.reduce((acc, item) => {
        acc[item.id] = item;
        return acc;
      }, {});
      setAllUsers(ownerData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getTotalUser();
  }, []);

  return loading ? <Spinner /> : (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 lg:ml-[20%]">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-muted-foreground font-bold text-black-100">
              Welcome back, Admin
            </span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="overview" className="w-full md:w-auto">
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="overview"
              onClick={scrollToPendingSection}
              className="w-full md:w-auto"
            >
              Pending Approvals
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Hostels"
                value={totalApartments}
                description="+12% from last month"
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Pending Approvals"
                value={pendingCount}
                description="4 urgent review needed"
                icon={<Clock className="h-4 w-4 text-muted-foreground" />}
                trend="negative"
              />
              <StatCard
                title="Active Users"
                value={activeUsers}
                description="+5.2% from last week"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />
              <StatCard
                title="Total Revenue"
                value="$34,567"
                description="+18% from last month"
                icon={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
              />
            </div>

            <div
              className="grid gap-4 grid-cols-1 lg:grid-cols-7"
              ref={pendingSection}
            >
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <PendingApprovalsList props={pendingApprovalListProps} />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentActivityList limit={5} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;