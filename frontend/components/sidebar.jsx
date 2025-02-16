

// components/ui/sidebar.js
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const Sidebar = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "flex flex-col h-screen w-64 border-r bg-background",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarHeader = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "h-14 flex items-center border-b px-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarBody = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "flex-1 overflow-auto py-2",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const SidebarNavItem = ({ 
  className, 
  children, 
  Icon, 
  href = '#', 
  active, 
  ...props 
}) => {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-accent text-accent-foreground",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{children}</span>
    </Link>
  );
};

export const SidebarFooter = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "mt-auto border-t py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};