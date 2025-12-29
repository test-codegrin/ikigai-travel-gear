"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Package,
  XCircle,
  TruckIcon,
} from "lucide-react";
import { API } from "@/lib/api-endpoints";
import { toast } from "sonner";
import { useParams } from "next/navigation";

interface ClaimInfo {
  claim_external_id: string;
  warranty_external_id: string;
  customer_name: string;
  current_status: string;
  claim_register_date: string;
}

interface StatusHistory {
  id: number;
  status_name: string;
  changed_by: string | null;
  admin_notes: string | null;
  changed_at: string;
}

function formatDate(dateString: string): string {
  const dateWithoutZ = dateString.replace("Z", "");
  const date = new Date(dateWithoutZ);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateTime(dateString: string): string {
  const dateWithoutZ = dateString.replace("Z", "");
  const date = new Date(dateWithoutZ);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function TrackClaimPage() {
  const params = useParams();
  const urlClaimId = params?.id as string | undefined;

  const [claimId, setClaimId] = useState(urlClaimId || "");
  const [loading, setLoading] = useState(false);
  const [claim, setClaim] = useState<ClaimInfo | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);

  // Auto-fetch if claim ID is in URL
  useEffect(() => {
    if (urlClaimId) {
      handleTrack(urlClaimId);
    }
  }, [urlClaimId]);

  const handleTrack = async (id?: string) => {
    const searchId = id || claimId;
    
    if (!searchId.trim()) {
      toast.error("Please enter a claim ID");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API.CLAIMS}/${searchId}/history`);

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("Claim not found. Please check your Claim ID.");
        } else {
          toast.error("Failed to fetch claim details");
        }
        setClaim(null);
        setHistory([]);
        return;
      }

      const data = await response.json();
      setClaim(data.claim);
      setHistory(data.history);
      
      if (!id) { // Only show success toast if manually searched
        toast.success("Claim found!");
      }
    } catch (error) {
      console.error("Failed to track claim:", error);
      toast.error("Failed to track claim");
      setClaim(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case "under_review":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "shipped":
        return <TruckIcon className="w-5 h-5 text-purple-600" />;
      case "completed":
        return <Package className="w-5 h-5 text-gray-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 border-yellow-300";
      case "under_review":
        return "bg-blue-50 border-blue-300";
      case "approved":
        return "bg-green-50 border-green-300";
      case "rejected":
        return "bg-red-50 border-red-300";
      case "shipped":
        return "bg-purple-50 border-purple-300";
      case "completed":
        return " border-gray-300";
      default:
        return "bg-blue-50 border-blue-300";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "text-yellow-900";
      case "under_review":
        return "text-blue-900";
      case "approved":
        return "text-green-900";
      case "rejected":
        return "text-red-900";
      case "shipped":
        return "text-purple-900";
      case "completed":
        return "text-gray-900";
      default:
        return "text-blue-900";
    }
  };

  const getStatusTitle = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Claim Pending";
      case "under_review":
        return "Claim Under Review";
      case "approved":
        return "Claim Approved";
      case "rejected":
        return "Claim Rejected";
      case "shipped":
        return "Product Shipped";
      case "completed":
        return "Claim Completed";
      default:
        return "Claim Status";
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "Your claim has been received and is awaiting review.";
      case "under_review":
        return "Your claim is currently being reviewed by our team.";
      case "approved":
        return "Your claim has been approved. You will receive further instructions shortly.";
      case "rejected":
        return "Your claim has been rejected. Please contact support for more details.";
      case "shipped":
        return "Your replacement product has been shipped.";
      case "completed":
        return "Your claim has been successfully completed. Thank you for your patience.";
      default:
        return "Claim status information";
    }
  };

  return (
    <div className="min-h-screen bg-primary/5 py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="pb-3 sm:pb-4 border-b p-4 sm:p-6 rounded-t-lg">
          <div className="text-base sm:text-lg font-semibold">
            Track Your Claim
          </div>
          <div className="text-xs sm:text-sm mt-1 text-gray-600">
            Enter your claim ID to view the current status and history
          </div>
        </div>

        {/* Search Section */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-b">
          <Label htmlFor="claim-id" className="text-xs sm:text-sm">
            Claim ID <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="claim-id"
              placeholder="CLM-XXXXXXXXXXXX"
              value={claimId}
              onChange={(e) => setClaimId(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              className="h-9 sm:h-10 flex-1 text-sm sm:text-base font-mono"
              disabled={loading}
            />
            <Button
              onClick={() => handleTrack()}
              disabled={loading || !claimId.trim()}
              className="hidden sm:flex bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 px-4 sm:px-6 shrink-0 text-xs sm:text-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Track Claim
                </>
              )}
            </Button>
          </div>

          {/* Mobile Button */}
          <Button
            onClick={() => handleTrack()}
            disabled={loading || !claimId.trim()}
            className="sm:hidden w-full bg-primary hover:bg-primary/80 text-white h-9 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Track Claim
              </>
            )}
          </Button>
        </div>

        {claim && (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Current Status Banner */}
            <div
              className={`rounded-lg p-3 sm:p-4 border ${getStatusBgColor(
                claim.current_status
              )}`}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {getStatusIcon(claim.current_status)}
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-semibold text-xs sm:text-sm ${getStatusTextColor(
                      claim.current_status
                    )}`}
                  >
                    {getStatusTitle(claim.current_status)}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mt-1 ${getStatusTextColor(
                      claim.current_status
                    )}`}
                  >
                    {getStatusDescription(claim.current_status)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(
                    claim.current_status
                  )} capitalize text-xs sm:text-sm px-2 sm:px-3 py-1`}
                >
                  {claim.current_status.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>

            {/* Claim Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <Label className="text-xs sm:text-sm text-gray-500">
                  Claim ID
                </Label>
                <div className="text-sm sm:text-base font-mono font-medium text-gray-900 mt-1 break-all">
                  {claim.claim_external_id}
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-500">
                  Warranty ID
                </Label>
                <div className="text-sm sm:text-base font-mono font-medium text-gray-900 mt-1 break-all">
                  {claim.warranty_external_id}
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-500">
                  Customer Name
                </Label>
                <div className="text-sm sm:text-base font-medium text-gray-900 mt-1">
                  {claim.customer_name}
                </div>
              </div>

              <div>
                <Label className="text-xs sm:text-sm text-gray-500">
                  Claim Submitted On
                </Label>
                <div className="text-sm sm:text-base text-gray-900 mt-1">
                  {formatDate(claim.claim_register_date)}
                </div>
              </div>
            </div>

            {/* Status History Timeline */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
                Status History
              </h3>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4  rounded-lg">
                    No status history available
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-3 sm:gap-4 relative pb-4"
                      style={{
                        borderLeft:
                          index !== history.length - 1
                            ? "2px solid #e5e7eb"
                            : "none",
                        marginLeft: "12px",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 -translate-x-1/2 bg-white p-1 rounded-full border-2 border-gray-200"
                       
                      >
                        {getStatusIcon(item.status_name)}
                      </div>

                      <div className="flex-1 ml-6 sm:ml-8">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1">
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(
                                item.status_name
                              )} capitalize mb-2 text-xs sm:text-sm`}
                            >
                              {item.status_name.replace(/_/g, " ")}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {formatDateTime(item.changed_at)}
                            </p>
                            {item.changed_by && (
                              <p className="text-xs text-gray-400 mt-1">
                                Updated by: {item.changed_by}
                              </p>
                            )}
                          </div>
                        </div>

                        {item.admin_notes && (
                          <div className="mt-3 p-2 sm:p-3  rounded-lg border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-1">
                              Admin Notes:
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {item.admin_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reset Button */}
            <div className="pt-2 flex justify-center">
              <Button
                onClick={() => {
                  setClaimId("");
                  setClaim(null);
                  setHistory([]);
                  window.history.pushState({}, '', '/warranty/track-claim');
                }}
                variant="outline"
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm px-6"
              >
                Track Another Claim
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
