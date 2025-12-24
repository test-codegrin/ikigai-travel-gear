"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, FileText, AlertCircle } from "lucide-react";

interface Warranty {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  product_description: string;
  status_name: string;
  registration_date: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warranties, setWarranties] = useState<Warranty[]>([]);

  useEffect(() => {
    fetchWarranties();
  }, []);

  const fetchWarranties = async () => {
    try {
      const response = await fetch("/api/admin/warranties");
      
      if (!response.ok) {
        router.push("/admin/login");
        return;
      }

      const data = await response.json();
      setWarranties(data.warranties);
    } catch (error) {
      console.error("Failed to fetch warranties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: warranties.length,
    registered: warranties.filter((w) => w.status_name === "registered").length,
    claimed: warranties.filter((w) => w.status_name === "claimed").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">IKIGAI Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="outline" className="bg-primary">
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Warranties</CardTitle>
              <Package className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Registered</CardTitle>
              <FileText className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.registered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Claims</CardTitle>
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.claimed}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Warranties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Warranty ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Product</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {warranties.slice(0, 10).map((warranty) => (
                    <tr key={warranty.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{warranty.external_id}</td>
                      <td className="py-3 px-4">
                        <div>{warranty.customer_name}</div>
                        <div className="text-sm text-gray-500">{warranty.customer_email}</div>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{warranty.product_description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                          {warranty.status_name}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {new Date(warranty.registration_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
