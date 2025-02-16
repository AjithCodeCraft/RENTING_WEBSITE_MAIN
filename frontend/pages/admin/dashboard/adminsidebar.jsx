import React from 'react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarBody, 
  SidebarNavItem, 
  SidebarFooter 
} from '../../../components/sidebar';
import { 
  Home, Building2, Users, Settings, FileCheck, 
  Clock, LogOut, Menu, X 
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../../../components/ui/sheet';

const AdminLayout = ({ children }) => {
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Building2, label: 'Hostels', href: '/admin/dashboard/hostels' },
    // { icon: FileCheck, label: 'Approvals', href: '/admin/approvals' },
    { icon: Users, label: 'Users', href: '/admin/dashboard/users' },
    { icon: Clock, label: 'Activity Log', href: '/admin/activity' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">Rental Admin</span>
          </div>
        </SidebarHeader>
        <SidebarBody>
          {sidebarItems.map((item, index) => (
            <SidebarNavItem key={index} Icon={item.icon} href={item.href}>
              {item.label}
            </SidebarNavItem>
          ))}
        </SidebarBody>
        <SidebarFooter>
          <div className="flex items-center gap-3 px-4 py-2">
            <Avatar>
              <AvatarImage src="/avatars/admin.png" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-muted-foreground">admin@example.com</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start gap-2 mt-2">
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sidebar */}
      <Sheet >
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <Sidebar className="w-full">
            <SidebarHeader>
              <div className="flex items-center gap-2 px-2">
                <Building2 className="h-6 w-6" />
                <span className="font-bold">Rental Admin</span>
              </div>
            </SidebarHeader>
            <SidebarBody>
              {sidebarItems.map((item, index) => (
                <SidebarNavItem key={index} Icon={item.icon} href={item.href}>
                  {item.label}
                </SidebarNavItem>
              ))}
            </SidebarBody>
            <SidebarFooter>
              <div className="flex items-center gap-3 px-4 py-2">
                <Avatar>
                  <AvatarImage src="/avatars/admin.png" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@example.com</span>
                </div>
              </div>
              <Button variant="ghost" className="w-full justify-start gap-2 mt-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </SidebarFooter>
          </Sidebar>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default AdminLayout;