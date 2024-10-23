// components/DashboardSidebar.tsx

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, DollarSign, BarChart2, Menu, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible"; // Ensure you import Collapsible components

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

  return (
    <>
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center">
        <Link href="/" className="flex items-center gap-2 px-6">
          <BarChart2 className="h-6 w-6" />
          <span className="font-bold">Company Dashboard</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {/* Example of a non-collapsible menu item */}
          <SidebarMenuItem>
            <Link href="/" passHref legacyBehavior>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <a className="flex items-center gap-3">
                  <Home className="h-4 w-4" />
                  <span>Dashboard Home</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>

          {/* Example of a collapsible menu item */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={pathname.startsWith("/order")}>
                  <a className="flex items-center gap-3">
                    <Calendar className="h-4 w-4" />
                    <span>Orders</span>
                  </a>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/order-calendar" passHref legacyBehavior>
                      <SidebarMenuButton asChild isActive={pathname === "/order-calendar"}>
                        <a className="flex items-center gap-3 pl-6">
                          <Calendar className="h-4 w-4" />
                          <span>Order Calendar</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {/* Add more sub-items as needed */}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          {/* Repeat Collapsible structure for other expandable menu items */}
          <Collapsible defaultOpen className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={pathname.startsWith("/accounts")}>
                  <a className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4" />
                    <span>Accounts</span>
                  </a>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <Link href="/accounts-receivable" passHref legacyBehavior>
                      <SidebarMenuButton asChild isActive={pathname === "/accounts-receivable"}>
                        <a className="flex items-center gap-3 pl-6">
                          <DollarSign className="h-4 w-4" />
                          <span>Accounts Receivable</span>
                        </a>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                  {/* Add more sub-items as needed */}
                </SidebarMenu>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          {/* Add more collapsible or non-collapsible menu items as needed */}
        </SidebarMenu>
      </SidebarContent>
      <SidebarRail />
      <MobileTrigger />
    </>
  );
};

export default function DashboardSidebar() {
  // Remove isCollapsed state and related props since Sidebar doesn't accept them
  return (
    <SidebarProvider>
      <Sidebar
        collapsible="icon" // Use the accepted string value
        className={`transition-all duration-300 w-64 h-screen fixed top-0 left-0 bg-white shadow-lg z-20`}
        // Remove defaultCollapsed and onCollapsedChange props
      >
        <DashboardSidebarContent />
      </Sidebar>
    </SidebarProvider>
  );
}
