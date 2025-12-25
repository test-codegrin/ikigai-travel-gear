"use client";
import { Mulish } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";


const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mulish",
  display: "swap",
});


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
     <html lang="en" className={mulish.variable} suppressHydrationWarning>
      <body>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}

// Client component to check pathname
function NavbarWrapper() {
  "use client";
  const pathname = usePathname();
  
  // Hide navbar on admin routes
  const isAdminRoute = pathname?.startsWith("/admin");
  
  if (isAdminRoute) return null;
  
  return <Navbar />;
}
