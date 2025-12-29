"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  ShoppingBag,
  FileText,
  Shield,
  Save,
  AlertCircle,
  Image as ImageIcon,
  Video,
  FileWarning,
  Clock,
  CheckCircle,
  XCircle,
  TruckIcon,
  Package,
  History,
} from "lucide-react";
import { API } from "@/lib/api-endpoints";
import { toast } from "sonner";

interface ClaimDetail {
  id: number;
  warranty_id: number;
  claim_external_id: string;
  claim_result_date: string | null;
  photo_url: string;
  video_url: string | null;
  defect_description: string;
  claim_status_id: number;
  admin_notes: string | null;
  claim_register_date: string;
  claim_status_name: string | null;
  warranty_external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number | null;
  purchase_date: string;
  purchase_price: number | null;
  purchase_from: string;
  invoice_file_url: string | null;
  warranty_card_file_url: string | null;
  warranty_status_name: string | null;
  warranty_registration_date: string;
}

interface ClaimStatus {
  id: number;
  name: string;
  description: string;
}

interface StatusHistory {
  id: number;
  status_name: string;
  changed_by: string | null;
  admin_notes: string | null;
  changed_at: string;
}

export default function ClaimDetailPage() {
  const router = useRouter();
  const params = useParams();
  const claimId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [statuses, setStatuses] = useState<ClaimStatus[]>([]);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState<string>("");

  useEffect(() => {
    fetchClaimDetail();
    fetchClaimHistory();
  }, [claimId]);

  const fetchClaimDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API.CLAIMS}/${claimId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Failed to load claim details");
        router.push("/admin/claims");
        return;
      }

      const data = await response.json();
      setClaim(data.claim);
      setStatuses(data.statuses);
      setSelectedStatus(data.claim.claim_status_id);
      setAdminNotes(data.claim.admin_notes || "");
    } catch (error) {
      console.error("Failed to fetch claim detail:", error);
      toast.error("Failed to load claim details");
      router.push("/admin/claims");
    } finally {
      setLoading(false);
    }
  };

  const fetchClaimHistory = async () => {
    try {
      const response = await fetch(`${API.CLAIMS}/${claimId}/history`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error("Failed to fetch claim history:", error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API.CLAIMS}/${claimId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status_id: selectedStatus,
          admin_notes: adminNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }

      setClaim(data.claim);
      toast.success("Claim status updated successfully!");
      
      // Refresh history after update
      await fetchClaimHistory();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "under_review":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "shipped":
        return <TruckIcon className="w-4 h-4 text-purple-600" />;
      case "completed":
        return <Package className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string | null | undefined) => {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";

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
      case "registered":
        return "bg-green-100 text-green-800 border-green-200";
      case "claimed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    const dateWithoutZ = dateString.replace("Z", "");
    const date = new Date(dateWithoutZ);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
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
  };

  const hasChanges =
    selectedStatus !== claim?.claim_status_id ||
    adminNotes !== (claim?.admin_notes || "");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!claim) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="gap-2 -ml-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
          </div>
          <div className="text-sm text-gray-500 ml-20 space-y-0.5">
            <p>
              Claim ID:{" "}
              <span className="font-mono font-medium text-gray-900">
                {claim.claim_external_id}
              </span>
            </p>
            <p>
              Warranty ID:{" "}
              <span className="font-mono font-medium text-gray-900">
                {claim.warranty_external_id}
              </span>
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`${getStatusColor(
            claim.claim_status_name
          )} capitalize text-sm px-3 py-1.5 font-medium`}
        >
          {claim.claim_status_name?.replace(/_/g, " ") || "Unknown"}
        </Badge>
      </div>

      {/* Claim Status Management with History */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileWarning className="w-5 h-5 text-gray-600" />
            Claim Status Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Update Form */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Update Claim Status
                </Label>
                <Select
                  value={selectedStatus.toString()}
                  onValueChange={(value) => setSelectedStatus(parseInt(value))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.id} value={status.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {status.name
                              .replace(/_/g, " ")
                              .charAt(0)
                              .toUpperCase() +
                              status.name.replace(/_/g, " ").slice(1)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Admin Notes
                </Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this claim (optional)"
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {hasChanges && (
                  <p className="text-sm text-amber-600 flex items-center gap-1.5">
                    <span className="w-1 h-1 bg-amber-600 rounded-full" />
                    You have unsaved changes
                  </p>
                )}
                <Button
                  onClick={handleStatusUpdate}
                  disabled={saving || !hasChanges}
                  className="gap-2 ml-auto"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Update Status
                </Button>
              </div>
            </div>

            {/* Status History */}
            <div className="border-t md:border-t-0 md:border-l pt-6 md:pl-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Status History
                </h3>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {history.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-8 bg-gray-50 rounded-lg">
                    No status history available
                  </div>
                ) : (
                  history.map((item, index) => (
                    <div
                      key={item.id}
                      className="relative pb-3"
                      style={{
                        borderLeft:
                          index !== history.length - 1
                            ? "2px solid #e5e7eb"
                            : "none",
                        marginLeft: "15px",
                      }}
                    >
                      <div
                        className="absolute left-0 top-0 -translate-x-1/2 bg-white p-0.5 rounded-full border-2 border-gray-200"
                        
                      >
                        {getStatusIcon(item.status_name)}
                      </div>

                      <div className="ml-6">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              item.status_name
                            )} capitalize text-xs`}
                          >
                            {item.status_name.replace(/_/g, " ")}
                          </Badge>
                        </div>

                        <p className="text-xs text-gray-500 mb-1">
                          {formatDateTime(item.changed_at)}
                        </p>

                        {item.changed_by && (
                          <p className="text-xs text-gray-400">
                            Updated by: {item.changed_by}
                          </p>
                        )}

                        {item.admin_notes && (
                          <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <p className="text-xs font-medium text-gray-700 mb-0.5">
                              Notes:
                            </p>
                            <p className="text-xs text-gray-600">
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
          </div>
        </CardContent>
      </Card>

      {/* Defect Information */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            Defect Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Defect Description
              </Label>
              <p className="text-base text-gray-900 mt-2 leading-relaxed whitespace-pre-wrap">
                {claim.defect_description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Claim Registration Date
                </Label>
                <p className="text-base text-gray-900 mt-1">
                  {formatDateTime(claim.claim_register_date)}
                </p>
              </div>

              {claim.claim_result_date && (
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Result Date
                  </Label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDateTime(claim.claim_result_date)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claim Evidence */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Claim Evidence
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Defect Photo */}
            <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Defect Photo
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Product defect image
                  </p>
                </div>
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              {claim.photo_url ? (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(claim.photo_url, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Photo
                </Button>
              ) : (
                <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                  No photo uploaded
                </div>
              )}
            </div>

            {/* Defect Video */}
            <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Defect Video
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Product defect video (optional)
                  </p>
                </div>
                <Video className="w-5 h-5 text-gray-400" />
              </div>
              {claim.video_url ? (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() =>
                    claim.video_url && window.open(claim.video_url, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4" />
                  View Video
                </Button>
              ) : (
                <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                  No video uploaded
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rest of the component remains the same... */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Information */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Full Name
                  </Label>
                  <p className="text-base text-gray-900 mt-1 font-medium">
                    {claim.customer_name}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Email Address
                  </Label>
                  <p className="text-base text-gray-900 mt-1 break-all">
                    {claim.customer_email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Mobile Number
                  </Label>
                  <p className="text-base text-gray-900 mt-1 font-mono">
                    {claim.customer_mobile}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Address
                  </Label>
                  <p className="text-base text-gray-900 mt-1 leading-relaxed">
                    {claim.customer_address}
                    <br />
                    {claim.customer_city} - {claim.customer_pincode || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warranty & Purchase Information */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-5 h-5 text-gray-600" />
              Warranty & Purchase Details
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Warranty Status
                  </Label>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className={`${getStatusColor(
                        claim.warranty_status_name
                      )} capitalize`}
                    >
                      {claim.warranty_status_name?.replace(/_/g, " ") ||
                        "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Purchase Date
                  </Label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDate(claim.purchase_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IndianRupee className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Purchase Price
                  </Label>
                  <p className="text-lg text-gray-900 mt-1 font-bold">
                    ₹{claim.purchase_price?.toLocaleString("en-IN") || "0"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShoppingBag className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Purchase From
                  </Label>
                  <p className="text-base text-gray-900 mt-1 capitalize">
                    {claim.purchase_from?.replace(/_/g, " ") || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Warranty Registration Date
                  </Label>
                  <p className="text-base text-gray-900 mt-1">
                    {formatDateTime(claim.warranty_registration_date)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warranty Documents */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            Original Warranty Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Invoice */}
            <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Purchase Invoice
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Original purchase document
                  </p>
                </div>
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              {claim.invoice_file_url ? (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() => window.open(claim.invoice_file_url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Invoice
                </Button>
              ) : (
                <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                  No invoice available
                </div>
              )}
            </div>

            {/* Warranty Card */}
            <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Label className="text-sm font-semibold text-gray-900">
                    Warranty Card
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Product warranty card
                  </p>
                </div>
                <Shield className="w-5 h-5 text-gray-400" />
              </div>
              {claim.warranty_card_file_url ? (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2 w-full"
                  onClick={() =>
                    window.open(claim.warranty_card_file_url!, "_blank")
                  }
                >
                  <ExternalLink className="w-4 h-4" />
                  View Warranty Card
                </Button>
              ) : (
                <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                  No warranty card available
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
