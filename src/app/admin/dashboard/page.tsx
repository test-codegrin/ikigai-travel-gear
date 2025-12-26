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
  Search,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api-endpoints";

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
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    claimed: 0,
    thisMonth: 0,
  });

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await fetch(API.DASHBOARD);

      if (!response.ok) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setWarranties(data.warranties);
      setStats(data.stats); // Set stats from API response
    } catch (error) {
      console.error("Failed to fetch warranties:", error);
    } finally {
      setLoading(false);
    }
  };

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
        return "bg-green-100 text-green-800 border-green-200";
      case "claimed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "expired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Warranties
            </CardTitle>
            <Package className="w-5 h-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <p className="text-xs text-gray-500 mt-1">All time registrations</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Warranties
            </CardTitle>
            <FileText className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.active}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              Claims Filed
            </CardTitle>
            <AlertCircle className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.claimed}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pending review</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Month
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats.thisMonth}
            </div>
            <p className="text-xs text-gray-500 mt-1">New registrations</p>
          </CardContent>
        </Card>
      </div>

      {/* Warranties Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Recent Warranties</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Manage and track warranty registrations
              </p>
            </div>
            <div>
              <Button variant="outline" onClick={()=>router.push("/admin/warranties")}>View All</Button>
            </div>
           
          </div>
        </CardHeader>
        <CardContent>
      
          {/* Table */}
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
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
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
                            ₹{warranty.purchase_price}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              warranty.status_name
                            )} capitalize`}
                          >
                            {warranty.status_name}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(
                            warranty.registration_date
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
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

          {/* Pagination info */}
          {warranties.length > 0 && (
            <div className="mt-4 text-sm text-gray-500 text-center">
              Showing {Math.min(warranties.length, 10)} of {stats.total}{" "}
              total warranties
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
