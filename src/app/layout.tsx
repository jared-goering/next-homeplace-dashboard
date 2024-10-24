// layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SidebarLayout from "@/components/SidebarLayout"; // Import the new component

export const metadata: Metadata = {
  title: "Homeplace Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex">
        <SidebarLayout>{children}</SidebarLayout>
      </body>
    </html>
  );
}
