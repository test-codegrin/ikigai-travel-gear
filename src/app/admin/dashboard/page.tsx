"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Package,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  Shield,
  CheckCircle,
  Clock,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api-endpoints";
import { convertToIST } from "@/lib/convertToIST";

interface Warranty {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  warranty_status_id: number;
  registration_date: string;
  is_deleted: number;
  status_name: string;
}

interface Stats {
  total: number;
  active: number;
  claimed: number;
  thisMonth: number;
  growthPercentage: number;
  totalClaims: number;
  pendingClaims: number;
  approvedClaimsThisMonth: number;
}

interface CityData {
  customer_city: string;
  count: number;
}

interface RecentClaim {
  claim_external_id: string;
  claim_register_date: string;
  status_name: string;
  customer_name: string;
  warranty_id: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [topCities, setTopCities] = useState<CityData[]>([]);
  const [recentClaims, setRecentClaims] = useState<RecentClaim[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    claimed: 0,
    thisMonth: 0,
    growthPercentage: 0,
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaimsThisMonth: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(API.DASHBOARD, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // ✅ Comprehensive unauthorized detection
      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403 ||
          response.statusText === "Unauthorized" ||
          response.statusText.toLowerCase().includes("token") ||
          response.statusText.toLowerCase().includes("unauthorized")
        ) {
          // Clear cookies
          document.cookie.split(";").forEach((c) => {
            document.cookie = c
              .replace(/^ +/, "")
              .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
          });
          
          router.push("/admin/login");
          router.refresh();
          return;
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // ✅ Validate response structure
      if (!data || typeof data !== "object") {
        console.error("Invalid dashboard response structure");
        router.push("/admin/login");
        return;
      }

      if (!data.warranties || !data.stats) {
        console.error("Missing required dashboard data");
        router.push("/admin/login");
        return;
      }

      setWarranties(data.warranties);
      setStats(data.stats);
      setTopCities(data.topCities || []);
      setRecentClaims(data.recentClaims || []);
      
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (
          errorMessage.includes("401") ||
          errorMessage.includes("unauthorized") ||
          errorMessage.includes("token") ||
          errorMessage.includes("network")
        ) {
          router.push("/admin/login");
          return;
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Extra auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(API.DASHBOARD, {
          method: "HEAD",
          credentials: "include",
        });

        if (!response.ok || response.status === 401) {
          router.push("/admin/login");
        }
      } catch {
        // Silently fail - main fetch will handle
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "registered":
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "claimed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Warranties */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Warranties
            </CardTitle>
            <Package className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time registrations</p>
          </CardContent>
        </Card>

        {/* Active Warranties */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Warranties
            </CardTitle>
            <Shield className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.active.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-xs text-green-600 font-medium">
                {((stats.active / stats.total) * 100).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">of total</span>
            </div>
          </CardContent>
        </Card>

        {/* Claimed Warranties */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Claims Filed
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalClaims.toLocaleString()}
            </div>
            <p className="text-xs text-orange-600 font-medium mt-1">
              {stats.pendingClaims} pending review
            </p>
          </CardContent>
        </Card>

        {/* This Month Growth */}
        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            {stats.growthPercentage >= 0 ? (
              <TrendingUp className="w-5 h-5 text-purple-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.thisMonth.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {stats.growthPercentage >= 0 ? (
                <>
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    +{stats.growthPercentage}%
                  </span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                  <span className="text-xs text-red-600 font-medium">
                    {stats.growthPercentage}%
                  </span>
                </>
              )}
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Approved Claims
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.approvedClaimsThisMonth}
            </div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Review
            </CardTitle>
            <Clock className="w-4 h-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.pendingClaims}
            </div>
            <p className="text-xs text-gray-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Claim Rate
            </CardTitle>
            <FileText className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total > 0
                ? ((stats.totalClaims / stats.total) * 100).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500 mt-1">Of total warranties</p>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Cities */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-600" />
                Top Cities
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/warranties")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No data available
                </p>
              ) : (
                topCities.map((city, index) => (
                  <div
                    key={city.customer_city}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {city.customer_city}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {city.count}
                      </span>
                      <span className="text-xs text-gray-500">warranties</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileWarning className="w-5 h-5 text-gray-600" />
                Recent Claims
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/claims")}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClaims.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No recent claims
                </p>
              ) : (
                recentClaims.map((claim) => (
                  <div
                    key={claim.claim_external_id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/admin/claims/${claim.claim_external_id}`)
                    }
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {claim.customer_name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {claim.claim_external_id}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {convertToIST(claim.claim_register_date, false)}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(claim.status_name)} capitalize`}
                    >
                      {claim.status_name.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Warranties Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Recent Warranties</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Latest warranty registrations
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push("/admin/warranties")}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Warranty ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      City
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {warranties.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        No warranties found
                      </td>
                    </tr>
                  ) : (
                    warranties.map((warranty) => (
                      <tr
                        key={warranty.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {warranty.external_id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {warranty.customer_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {warranty.customer_email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {warranty.customer_city}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm font-medium text-gray-900">
                            ₹{warranty.purchase_price.toLocaleString("en-IN")}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              warranty.status_name
                            )} capitalize`}
                          >
                            {warranty.status_name.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {convertToIST(warranty.registration_date, false)}
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2"
                            onClick={() =>
                              router.push(
                                `/admin/warranties/${warranty.external_id}`
                              )
                            }
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {warranties.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {Math.min(warranties.length, 10)} of {stats.total} total
              warranties
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
