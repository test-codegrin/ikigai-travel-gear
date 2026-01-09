"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  FileWarning,
  Eye,
  AlertCircle,
} from "lucide-react";
import { API } from "@/lib/api-endpoints";
import { toast } from "sonner";
import { convertToIST } from "@/lib/convertToIST";

interface WarrantyDetail {
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
  invoice_id:string;
  invoice_file_url: string;
  warranty_card_file_url: string;
  warranty_status_id: number;
  status_name: string;
  registration_date: string;
}

interface WarrantyStatus {
  id: number;
  name: string;
}

interface ClaimInfo {
  id: number;
  claim_external_id: string;
  claim_status_id: number;
  claim_status_name: string;
  claim_register_date: string;
  claim_result_date: string | null;
  defect_description: string;
  admin_notes: string | null;
}

export default function WarrantyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const warrantyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [warranty, setWarranty] = useState<WarrantyDetail | null>(null);
  const [claims, setClaims] = useState<ClaimInfo[]>([]);
  const [statuses, setStatuses] = useState<WarrantyStatus[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);

  useEffect(() => {
    fetchWarrantyDetail();
  }, [warrantyId]);

  const fetchWarrantyDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API.WARRANTIES}/${warrantyId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        toast.error("Failed to load warranty details");
        router.push("/admin/warranties");
        return;
      }

      const data = await response.json();
      setWarranty(data.warranty);
      setClaims(data.claims || []);
      setStatuses(data.statuses);
      setSelectedStatus(data.warranty.warranty_status_id);
    } catch (error) {
      console.error("Failed to fetch warranty detail:", error);
      toast.error("Failed to load warranty details");
      router.push("/admin/warranties");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch(`${API.WARRANTIES}/${warrantyId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_id: selectedStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update status");
        return;
      }

      setWarranty(data.warranty);
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "registered":
        return "bg-green-100 text-green-800 border-green-200";
      case "claimed":
        return "bg-orange-100 text-orange-800 border-orange-200";
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
      case "repaired":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "replaced":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!warranty) {
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
            <h1 className="text-2xl font-bold text-gray-900">
              Warranty Details
            </h1>
          </div>
          <p className="text-sm text-gray-500 ml-20">
            Warranty ID:{" "}
            <span className="font-mono font-medium text-gray-900">
              {warranty.external_id}
            </span>
          </p>
        </div>
        <Badge
          variant="outline"
          className={`${getStatusColor(
            warranty.status_name
          )} capitalize text-sm px-3 py-1.5 font-medium`}
        >
          {warranty.status_name}
        </Badge>
      </div>

      {/* Status Update & Claims Card */}
      <Card>
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600" />
            Warranty Status Management
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Update Section */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Update Warranty Status
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
                        {status.name.charAt(0).toUpperCase() +
                          status.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStatusUpdate}
                disabled={
                  saving || selectedStatus === warranty.warranty_status_id
                }
                className="gap-2 w-full"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Update Status
              </Button>

              {selectedStatus !== warranty.warranty_status_id && (
                <p className="text-sm text-amber-600 flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-amber-600 rounded-full" />
                  You have unsaved changes
                </p>
              )}
            </div>

            {/* Claims List Section */}
            <div className="border-l pl-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Associated Claims
                    {claims.length > 0 && (
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({claims.length})
                      </span>
                    )}
                  </h3>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {claims.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      No claims filed
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      This warranty has no associated claims
                    </p>
                  </div>
                ) : (
                  claims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-mono font-medium text-gray-900 truncate">
                            {claim.claim_external_id}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Filed: {convertToIST(claim.claim_register_date)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(
                            claim.claim_status_name
                          )} capitalize text-xs shrink-0`}
                        >
                          {claim.claim_status_name.replace(/_/g, " ")}
                        </Badge>
                      </div>

                      {claim.defect_description && (
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {claim.defect_description}
                        </p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 h-8 text-xs"
                        onClick={() =>
                          router.push(`/admin/claims/${claim.claim_external_id}`)
                        }
                      >
                        <Eye className="w-3 h-3" />
                        View Claim Details
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                    {warranty.customer_name}
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
                    {warranty.customer_email}
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
                    {warranty.customer_mobile}
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
                    {warranty.customer_address}
                    <br />
                    {warranty.customer_city} - {warranty.customer_pincode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Information */}
        <Card>
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-600" />
              Purchase Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Purchase Date
                  </Label>
                  <p className="text-base text-gray-900 mt-1">
                    {convertToIST(warranty.purchase_date, false)}
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
                    ₹{warranty.purchase_price.toLocaleString("en-IN")}
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
                    {warranty.purchase_from.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

            <div className="flex items-start gap-3">
                <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Invoice Id
                  </Label>
                  <p className="text-base text-gray-900 mt-1 capitalize">
                    {warranty.invoice_id}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Registration Date
                  </Label>
                  <p className="text-base text-gray-900 mt-1">
                    {convertToIST(warranty.registration_date)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b bg-gray-50">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Uploaded Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Invoice */}
              <div className="border rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Label className="text-sm font-semibold text-gray-900">
                      Invoice
                    </Label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Purchase invoice document
                    </p>
                  </div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                {warranty.invoice_file_url ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() =>
                      window.open(warranty.invoice_file_url, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Invoice
                  </Button>
                ) : (
                  <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                    No invoice uploaded
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
                {warranty.warranty_card_file_url ? (
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2 w-full"
                    onClick={() =>
                      window.open(warranty.warranty_card_file_url, "_blank")
                    }
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Warranty Card
                  </Button>
                ) : (
                  <div className="text-center py-3 text-sm text-gray-400 bg-gray-50 rounded border border-dashed">
                    No warranty card uploaded
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
