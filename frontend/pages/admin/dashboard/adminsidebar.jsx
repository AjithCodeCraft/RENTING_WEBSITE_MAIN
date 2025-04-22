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
import { useRouter } from 'next/router';
import Image from 'next/image';
import { motion } from "framer-motion";
import Cookies from 'js-cookie';

const AdminLayout = ({ children }) => {
  const router = useRouter();
  const sidebarItems = [
    { icon: Home, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Building2, label: 'Hostels', href: '/admin/dashboard/hostels' },
    { icon: Users, label: 'Users', href: '/admin/dashboard/users' }
  ];

  const logout = () => {
    Cookies.remove("access_token");
    router.push("/admin/login");
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex fixed">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <Image
              src="/logo.png"
              alt="Hostelio Logo"
              width={50}
              height={50}
              className="h-6 w-6"
            />
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-green-800 text-xl font-bold"
            >
              Hostelio
            </motion.span>
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
          <Button type="button" variant="ghost" className="w-full justify-start gap-2 mt-2" onClick={logout}>
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden absolute top-4 left-4 z-50">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 bg-white">
          <Sidebar className="w-full bg-white">
            <SidebarHeader className="bg-white">
              <div className="flex items-center gap-2 px-2">
                <Image
                  src="/logo.png"
                  alt="Hostelio Logo"
                  width={50}
                  height={50}
                  className="h-6 w-6"
                />
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-green-800 text-xl font-bold"
                >
                  Hostelio
                </motion.span>
              </div>
            </SidebarHeader>
            <SidebarBody className="bg-white">
              {sidebarItems.map((item, index) => (
                <SidebarNavItem key={index} Icon={item.icon} href={item.href} className="bg-white hover:bg-gray-100">
                  {item.label}
                </SidebarNavItem>
              ))}
            </SidebarBody>
            <SidebarFooter className="bg-white">
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
              <Button type="button" variant="ghost" className="w-full justify-start gap-2 mt-2" onClick={logout}>
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
