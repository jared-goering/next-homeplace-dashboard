"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "m3-32"
        }`}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
