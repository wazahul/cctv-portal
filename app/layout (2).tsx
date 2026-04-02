import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 📱 MOBILE ZOOM FIX: Isse input focus hone par auto-zoom band ho jayega
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#2563eb", // Modern Enterprises Blue
};

export const metadata: Metadata = {
  title: "Modern Enterprises | Security Portal",
  description: "Advanced CCTV & Inventory Management System",
  icons: {
    icon: "/logo.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] selection:bg-blue-100 selection:text-blue-900">
        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>

        {/* Global UI Overlays (If needed in future) */}
      </body>
    </html>
  );
}