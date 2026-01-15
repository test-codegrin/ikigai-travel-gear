"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";
import { API } from "@/lib/api-endpoints";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // ✅ FIXED: Proper API-based auth check (NOT localStorage)
  const validateAuth = useCallback(async () => {
    try {
      const response = await fetch(API.PROFILE, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        // ✅ Already logged in - go to dashboard
        router.push("/admin/dashboard");
        return;
      }
    } catch {
      // Any error = not authenticated
    }
    
    // ✅ Not authenticated - stay on login
    setCheckingAuth(false);
  }, [router]);

  // Prevent back navigation
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", window.location.href);
      const handlePopState = () => {
        window.history.pushState(null, "", window.location.href);
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, []);

  // ✅ FIXED: Check real authentication on mount
  useEffect(() => {
    validateAuth();
  }, [validateAuth]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(API.ADMIN_LOGIN, {
        method: "POST",
        credentials: "include", // ✅ Send cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      toast.success("OTP sent! Check your email.");
      setStep("otp");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API.ADMIN_LOGIN, {
        method: "PUT",
        credentials: "include", // ✅ Send cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      // ✅ Store ONLY admin data (token is in httpOnly cookie)
      localStorage.setItem("admin-user", JSON.stringify(data.admin));

      toast.success("Login successful!");
      router.push("/admin/dashboard");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary/10">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-600">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/10 p-3 sm:p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Admin Login</CardTitle>
          <CardDescription className="text-xs sm:text-sm mt-1">
            Ikigai Travel Gear - Warranty Management
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pt-0">
          {step === "email" ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@ikigai.com"
                    className="pl-10 h-9 sm:h-10 text-sm sm:text-base"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-3 flex flex-col items-center">
                <Label htmlFor="otp" className="text-sm font-medium">
                  Enter 6-Digit OTP
                </Label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={(value) => setOtp(value)}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                      <InputOTPSlot index={1} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                      <InputOTPSlot index={2} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                      <InputOTPSlot index={3} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                      <InputOTPSlot index={4} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                      <InputOTPSlot index={5} className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 text-center break-all px-2">
                  OTP sent to <strong>{email}</strong>
                </p>
              </div>
              <Button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-primary hover:bg-primary/90 h-9 sm:h-10 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify & Login"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                }}
                className="w-full h-9 sm:h-10 text-sm sm:text-base"
              >
                Back to Email
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
