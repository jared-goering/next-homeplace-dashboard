"use client";

import React, { useState } from "react";
import DashboardSidebar from "@/components/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Inter } from 'next/font/google'

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const inter = Inter({ subsets: ['latin'] })


export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start closed

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main
        className={`${inter.className} flex-1 min-h-screen transition-all duration-300 ${
          sidebarOpen ? "ml-0" : "m3-32"
        }`}
      >
        {children}
      </main>
    </SidebarProvider>
  );
}
