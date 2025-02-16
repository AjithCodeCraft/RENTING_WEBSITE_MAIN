// pages/admin/index.js
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../.../../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../.../../../../components/ui/tabs';
import { 
  CircleUser, Home, BarChart3, Building2, Clock, Users, 
  Settings, FileCheck, Clock3, AlertTriangle
} from 'lucide-react';
// import StatCard from '../../components/dashboard/StatCard';
import PendingApprovalsList from './PendingApprovalsList';
import RecentActivityList from './RecentActivityList';
import StatCard from './StatCard';
import AdminLayout from './adminsidebar';

const AdminDashboard = () => {
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
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
            <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Hostels" 
                value="243" 
                description="+12% from last month" 
                icon={<Building2 className="h-4 w-4 text-muted-foreground" />} 
              />
              <StatCard 
                title="Pending Approvals" 
                value="12" 
                description="4 urgent review needed" 
                icon={<Clock className="h-4 w-4 text-muted-foreground" />} 
                trend="negative" 
              />
              <StatCard 
                title="Active Users" 
                value="2,345" 
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
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  <PendingApprovalsList limit={5} />
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
          
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Analytics dashboard will be displayed here...</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approvals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Hostel Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <PendingApprovalsList />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="recent" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <RecentActivityList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;





