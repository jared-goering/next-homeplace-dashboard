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
      <SidebarGroupLabel className="border-b border-sidebar-border flex items-center font-bold ">
        Homeplace Dashboard
      </SidebarGroupLabel>

      {/* Sidebar Menu */}
      <SidebarContent>
        <SidebarMenu>
          {/* Non-collapsible Menu Item: Order Calendar */}
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <a className="flex items-center gap-3">
                  <CalendarClock className="h-4 w-4" />
                  <span>Order Calendar</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Order Analytics */}
          <SidebarMenuItem>
            <Link href="/order-analytics" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/order-analytics"}
              >
                <a className="flex items-center gap-3">
                  <ChartArea className="h-4 w-4" />
                  <span>Order Analytics</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Accounts Receivable */}
          <SidebarMenuItem>
            <Link href="/accounts-receivable" passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/accounts-receivable"}
              >
                <a className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4" />
                  <span>Accounts Receivable</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Add more menu items as needed */}
        </SidebarMenu>
      </SidebarContent>

      {/* Sidebar Rail and Mobile Trigger */}
      <SidebarRail />
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
