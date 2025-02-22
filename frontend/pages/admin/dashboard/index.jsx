// pages/admin/index.js
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../.../../../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../.../../../../components/ui/tabs";
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
// import StatCard from '../../components/dashboard/StatCard';
import PendingApprovalsList from "./PendingApprovalsList";
import RecentActivityList from "./RecentActivityList";
import StatCard from "./StatCard";
import AdminLayout from "./adminsidebar";
import axios from "axios";

const AdminDashboard = () => {
  const [pendingCount, setPendingCount] = useState("-");
  const [totalApartments, setTotalApartments] = useState("-");
  const [limit, setLimit] = useState(4);
  const [activeUsers, setActiveUsers] = useState("-");
  const pendingSection = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const updateTotalApartmentCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/apartments/approved`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setTotalApartments(response.data.length);
    } catch (error) {
      console.log(error);
    }
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

  useEffect(() => {
    getTotalUser();
  }, []);

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, Admin
            </span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="overview" onClick={scrollToPendingSection}>Pending Approvals</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7" ref={pendingSection}>
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <PendingApprovalsList props={pendingApprovalListProps} />
                </CardContent>
              </Card>
              <Card className="col-span-3">
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
