"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  FileBox,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { API } from "@/lib/api-endpoints";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Warranties", href: "/admin/warranties", icon: FileText },
  { name: "Claims", href: "/admin/claims", icon: FileBox },
];

interface Admin {
  id: number;
  email: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (pathname !== "/admin/login") {
      fetchAdminProfile();
    } else {
      setLoadingAdmin(false);
    }
  }, [pathname]);

  const fetchAdminProfile = async () => {
    try {
      setLoadingAdmin(true);
      const response = await fetch(API.PROFILE, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        // Unauthorized - redirect to login
        router.replace("/admin/login");
      }
    } catch (error) {
      console.error("Failed to fetch admin profile:", error);
      router.replace("/admin/login");
    } finally {
      setLoadingAdmin(false);
    }
  };

  // ✅ COMPREHENSIVE CLEANUP FUNCTION
  const clearAllAuthData = useCallback(() => {
    // 1. Clear localStorage
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-user");
    
    // 2. Clear sessionStorage
    sessionStorage.clear();
    
    // 3. Clear ALL cookies (client-side accessible)
    if (typeof window !== "undefined") {
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
      });
    }
    
    // 4. Clear state
    setAdmin(null);
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      setLoggingOut(true);

      // 1. Call logout API (server-side cookie cleanup)
      const response = await fetch(API.LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 2. Clear ALL client-side data regardless of API response
      clearAllAuthData();

      // 3. Prevent back navigation
      if (typeof window !== "undefined") {
        window.history.pushState(null, "", "/admin/login");
        
        // Block browser back button
        const handlePopState = () => {
          window.history.pushState(null, "", "/admin/login");
        };
        window.addEventListener("popstate", handlePopState);
        
        // Cleanup listener after timeout
        setTimeout(() => {
          window.removeEventListener("popstate", handlePopState);
        }, 1000);
      }

      toast.success("Logged out successfully");

      // 4. Force complete redirect
      router.replace("/admin/login");
      router.refresh();

      // 5. Hard redirect as final fallback
      setTimeout(() => {
        window.location.href = "/admin/login";
      }, 100);

    } catch (error) {
      console.error("Logout error:", error);
      
      // Even on error, clear client-side data
      clearAllAuthData();
      toast.error("Logged out (manual cleanup)");
      router.replace("/admin/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Skip layout for login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Show loading state while checking auth
  if (loadingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center gap-2">
              <img
                src="/ikigai-logo.png"
                alt="IKIGAI Travel Gear"
                className="h-6 w-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1 lg:ml-0 ml-4">
            <h1 className="text-lg font-semibold text-gray-900">
              {navigation.find((item) => pathname.startsWith(item.href))
                ?.name || "Dashboard"}
            </h1>
          </div>

          {/* Admin Profile Dropdown */}
          <div className="flex items-center gap-3">
            {admin ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex gap-2 cursor-pointer">
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all">
                        <AvatarFallback className="bg-primary text-white font-semibold">
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {admin.name}
                        </p>
                        <p className="text-xs text-gray-500">Administrator</p>
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {admin.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {admin.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => router.push("/admin/profile")}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogoutClick}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-gray-300 animate-pulse"></div>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? You&apos;ll need to log in again
              to access the admin panel.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              disabled={loggingOut}
              className="bg-red-600 hover:bg-red-700"
            >
              {loggingOut ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Logging out...
                </div>
              ) : (
                "Log out"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
