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

// 📱 MOBILE ZOOM FIX: Mobile par input focus hone par screen jump nahi karegi
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
      // 🚩 FIXED: Added data-scroll-behavior for Next.js 15+ scroll warning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
        
        {/* ✨ PREMIUM BACKGROUND (Liquid Glass Style)
            Ye background aapke "Liquid Glass" buttons ke saath bohot premium lagega.
        */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20 pointer-events-none"></div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>

        {/* Global Footer / Watermark (Optional) */}
        <footer className="py-6 text-center shrink-0">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[4px]">
            Modern Enterprises © 2026
          </p>
        </footer>

      </body>
    </html>
  );
}