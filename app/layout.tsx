import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // 🚩 iPhone Notch fix
  themeColor: "#2563eb", 
};

export const metadata: Metadata = {
  title: "Modern Enterprises | Security Portal",
  description: "Advanced CCTV & Inventory Management System",
  icons: { icon: "/logo.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden touch-pan-y overscroll-none">
        
        {/* ✨ PREMIUM LIQUID BACKGROUND */}
        <div className="fixed inset-0 -z-10 h-full w-full bg-white [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20 pointer-events-none"></div>

        {/* 📱 MOBILE OPTIMIZED WRAPPER */}
        <main className="flex-1 flex flex-col relative z-10 pb-[env(safe-area-inset-bottom)]">
          {children}
        </main>

        <footer className="py-6 text-center shrink-0">
          <p className="text-[10px] font-[1000] text-slate-300 uppercase tracking-[5px] italic">
            Modern Enterprises © 2026
          </p>
        </footer>

      </body>
    </html>
  );
}