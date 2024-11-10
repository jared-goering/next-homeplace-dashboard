// components/DashboardSidebar.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, DollarSign, ChartArea, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

const MobileTrigger = () => {
  const { isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-6 right-6 z-30">
      <SidebarTrigger asChild>
        <Button size="icon" className="rounded-full">
          <Menu className="h-6 w-6" />
        </Button>
      </SidebarTrigger>
    </div>
  );
};

const DashboardSidebarContent = () => {
    const pathname = usePathname();
    const { open } = useSidebar();
  
   
  return (
    <>
      {/* Sidebar Header */}
      <SidebarGroupLabel
        className={`border-b border-sidebar-border flex ${
          open ? "items-center pl-4 py-4" : "justify-center py-4"
        } font-bold`}
      >
        {open && "Homeplace Dashboard"}
      </SidebarGroupLabel>

      {/* Sidebar Menu */}
      <SidebarContent>
        <SidebarMenu>
          {/* Sidebar Menu Item: Order Calendar */}
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <a
                  className={`flex items-center ${
                    open ? "gap-3 pl-4 py-2" : "flex-col justify-center py-4 w-full"
                  } ${
                    pathname === "/"
                      ? "bg-blue-600 text-white px-4 py-2 rounded-full mx-2"
                      : "text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full mx-2"
                  }`}
                >
                  <CalendarClock className="h-6 w-6" />
                  {open && <span>Order Calendar</span>}
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Sidebar Menu Item: Order Analytics */}
          <SidebarMenuItem>
            <Link href="/production-analytics" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/production-analytics"}
              >
                <a
                  className={`flex items-center ${
                    open ? "gap-3 pl-4 py-2" : "flex-col justify-center py-4 w-full"
                  } ${
                    pathname === "/production-analytics"
                      ? "bg-blue-600 text-white px-4 py-2 rounded-full mx-2"
                      : "text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full mx-2"
                  }`}
                >
                  <ChartArea className="h-6 w-6" />
                  {open && <span>Order Analytics</span>}
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Sidebar Menu Item: Accounts Receivable */}
          <SidebarMenuItem>
            <Link href="/accounts-receivable" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/accounts-receivable"}
              >
                <a
                  className={`flex items-center ${
                    open ? "gap-3 pl-4 py-2" : "flex-col justify-center py-4 w-full"
                  } ${
                    pathname === "/accounts-receivable"
                      ? "bg-blue-600 text-white px-4 py-2 rounded-full mx-2"
                      : "text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-full mx-2"
                  }`}
                >
                  <DollarSign className="h-6 w-6" />
                  {open && <span>Accounts Receivable</span>}
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      
          {/* Sidebar Rail and Mobile Trigger */}
          <SidebarRail className={`${!open && "flex flex-col items-center"}`} />
          <MobileTrigger />
        </>
      );
      
  };
  
  
  
export default function DashboardSidebar() {
  return (
    <Sidebar
      collapsible="icon"
      className={`transition-all duration-300 h-screen fixed top-0 left-0 bg-white shadow-lg z-20 w-48`} // Adjusted width
    >
      <DashboardSidebarContent />
    </Sidebar>
  );
}
