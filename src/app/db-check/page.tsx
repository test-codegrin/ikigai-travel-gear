"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, RefreshCw } from "lucide-react";

interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
  error?: string;
}

export default function DatabaseCheckPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      setHealth({
        status: "error",
        database: "disconnected",
        timestamp: new Date().toISOString(),
        error: "Failed to reach API",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Database Health Check</CardTitle>
          <CardDescription>IKIGAI Travel Gear - System Status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {loading ? (
            <div className="flex flex-col items-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-gray-600">Checking database connection...</p>
            </div>
          ) : health ? (
            <>
              <div className="flex items-center justify-center">
                {health.database === "connected" ? (
                  <div className="text-center">
                    <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-700">Database Connected</h3>
                    <p className="text-gray-600 mt-2">All systems operational</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-red-700">Database Disconnected</h3>
                    <p className="text-gray-600 mt-2">Connection failed</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={health.status === "ok" ? "text-green-600" : "text-red-600"}>
                    {health.status.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Database:</span>
                  <span className={health.database === "connected" ? "text-green-600" : "text-red-600"}>
                    {health.database.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Timestamp:</span>
                  <span className="text-gray-600">
                    {new Date(health.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {health.error && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="text-red-600 text-xs mt-1">{health.error}</p>
                  </div>
                )}
              </div>

              <Button
                onClick={checkDatabase}
                className="w-full bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Recheck Connection
              </Button>

              <div className="text-center text-xs text-gray-500">
                <p>Database: {process.env.NEXT_PUBLIC_DB_NAME}</p>
                <p>Host: {process.env.NEXT_PUBLIC_DB_HOST}</p>
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
