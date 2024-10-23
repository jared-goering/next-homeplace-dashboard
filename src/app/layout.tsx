import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Head from 'next/head';
import DashboardSidebar from "@/components/sidebar"
import { Inter } from "next/font/google"


const inter = Inter({ subsets: ["latin"] })

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Homeplace Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex">
        {/* Sidebar */}
        {/* <DashboardSidebar /> */}

        {/* Main Content */}
        <main className="flex-1 min-h-screen transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  );
}