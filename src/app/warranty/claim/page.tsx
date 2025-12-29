"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  CheckCircle,
  X,
  Eye,
  ImageIcon,
  Search,
  AlertCircle,
  Video,
  LocateFixed,
  FileSearch,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FindWarrantyDialog } from "@/components/FindWarrantyDialog";
import { useRouter } from "next/navigation";

// File size limits
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_PHOTO_SIZE_MB = (MAX_PHOTO_SIZE / (1024 * 1024)).toFixed(1);
const MAX_VIDEO_SIZE_MB = (MAX_VIDEO_SIZE / (1024 * 1024)).toFixed(1);

// Utility functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Main Component
export default function WarrantyClaimPage() {
  const router = useRouter();
  const [searchLoading, setSearchLoading] = useState(false);
  const [warrantyFound, setWarrantyFound] = useState(false);
  const [warrantyId, setWarrantyId] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [claimExternalId, setClaimExternalId] = useState("");
  const [agreePolicy, setAgreePolicy] = useState(false);
  const [findDialogOpen, setFindDialogOpen] = useState(false);

  // Preview states
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewContent, setPreviewContent] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewType, setPreviewType] = useState<"image" | "video">("image");

  // Warranty data (auto-filled)
  const [warrantyData, setWarrantyData] = useState({
    id: 0,
    customer_name: "",
    customer_mobile: "",
    customer_email: "",
    customer_address: "",
    customer_city: "",
    customer_pincode: "",
    purchase_date: "",
    purchase_from: "",
    purchase_price: "",
    warranty_status: "",
    registration_date: "",
  });

  // Existing claim data
  const [existingClaim, setExistingClaim] = useState<{
    claim_external_id: string;
    claim_status: string;
    claim_register_date: string;
    claim_result_date?: string | null;
    admin_notes?: string | null;
  } | null>(null);

  // Claim form data
  const [claimData, setClaimData] = useState({
    defect_description: "",
  });

  const [files, setFiles] = useState({
    photo_file: null as File | null,
    video_file: null as File | null,
  });

  const [filePreviews, setFilePreviews] = useState({
    photo_preview: null as string | null,
    video_preview: null as string | null,
  });

  // Handler for when a warranty is selected from the dialog
  const handleWarrantySelect = (externalId: string) => {
    setWarrantyId(externalId);
    // Directly search with the external ID
    searchWarrantyById(externalId);
  };

  const handleTrackClaim = ()=>{
    router.push("/warranty/track-claim");
  }

  // Separate search function that accepts ID parameter
  const searchWarrantyById = async (id: string) => {
    if (!id.trim()) {
      toast.error("Please enter a warranty ID");
      return;
    }

    setSearchLoading(true);
    setWarrantyFound(false);
    setExistingClaim(null);

    try {
      const response = await fetch(`/api/warranty/search?external_id=${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Warranty not found");
      }

      // Set warranty data
      setWarrantyData({
        id: data.warranty.id,
        customer_name: data.warranty.customer_name,
        customer_mobile: data.warranty.customer_mobile,
        customer_email: data.warranty.customer_email,
        customer_address: data.warranty.customer_address,
        customer_city: data.warranty.customer_city,
        customer_pincode: data.warranty.customer_pincode,
        purchase_date: data.warranty.purchase_date,
        purchase_from: data.warranty.purchase_from,
        purchase_price: data.warranty.purchase_price,
        warranty_status: data.warranty.warranty_status_name,
        registration_date: data.warranty.registration_date,
      });

      // Check if there's ANY existing claim (regardless of status)
      if (data.existing_claim) {
        setExistingClaim({
          claim_external_id: data.existing_claim.claim_external_id,
          claim_status: data.existing_claim.claim_status,
          claim_register_date: data.existing_claim.claim_register_date,
          claim_result_date: data.existing_claim.claim_result_date,
          admin_notes: data.existing_claim.admin_notes,
        });

        toast.info(
          "This warranty already has a claim. Only one claim per warranty is allowed."
        );
      }

      setWarrantyFound(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to find warranty";
      toast.error(message);
    } finally {
      setSearchLoading(false);
    }
  };

  // Original search function (calls searchWarrantyById with current state)
  const handleSearchWarranty = () => {
    searchWarrantyById(warrantyId);
  };

  const validateFile = (file: File, type: "photo" | "video"): boolean => {
    const maxSize = type === "photo" ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);

    if (file.size > maxSize) {
      toast.error(
        `File size exceeds ${maxSizeMB}MB limit. Current size: ${formatFileSize(
          file.size
        )}`
      );
      return false;
    }

    const allowedTypes =
      type === "photo"
        ? ["image/jpeg", "image/jpg", "image/png", "image/webp"]
        : ["video/mp4", "video/webm", "video/quicktime"];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        type === "photo"
          ? "Invalid file type. Only JPEG, PNG, and WEBP are allowed"
          : "Invalid file type. Only MP4, WEBM, and MOV are allowed"
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photo_file" | "video_file"
  ) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const type = field === "photo_file" ? "photo" : "video";

      if (!validateFile(file, type)) {
        input.value = "";
        return;
      }

      setFiles({ ...files, [field]: file });

      const previewUrl = URL.createObjectURL(file);
      const previewField =
        field === "photo_file" ? "photo_preview" : "video_preview";
      setFilePreviews({ ...filePreviews, [previewField]: previewUrl });
    }
  };

  const handleRemoveFile = (field: "photo_file" | "video_file") => {
    const inputId = field;
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }

    setFiles({ ...files, [field]: null });
    const previewField =
      field === "photo_file" ? "photo_preview" : "video_preview";

    if (filePreviews[previewField]) {
      URL.revokeObjectURL(filePreviews[previewField]!);
    }

    setFilePreviews({ ...filePreviews, [previewField]: null });
  };

  const handleViewFile = (field: "photo_file" | "video_file") => {
    const previewField =
      field === "photo_file" ? "photo_preview" : "video_preview";
    const preview = filePreviews[previewField];
    const file = files[field];

    if (preview && file) {
      setPreviewContent(preview);
      setPreviewTitle(
        field === "photo_file" ? "Photo Preview" : "Video Preview"
      );
      setPreviewType(field === "photo_file" ? "image" : "video");
      setPreviewDialog(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block if there's ANY existing claim
    if (existingClaim) {
      toast.error(
        "This warranty already has a claim. Only one claim per warranty is allowed."
      );
      return;
    }

    if (!claimData.defect_description.trim()) {
      toast.error("Please describe the defect");
      return;
    }

    if (!files.photo_file) {
      toast.error("Please upload a photo of the defect");
      return;
    }

    if (!agreePolicy) {
      toast.error("Please agree to the warranty claim policy");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("warranty_id", warrantyData.id.toString());
      formData.append("defect_description", claimData.defect_description);
      formData.append("photo_file", files.photo_file);

      if (files.video_file) {
        formData.append("video_file", files.video_file);
      }

      const response = await fetch("/api/warranty/claim", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit claim");
      }

      setClaimExternalId(result.claim_external_id);
      setSuccess(true);
      toast.success("Claim submitted successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit claim";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-start h-screen justify-center p-3 sm:p-4">
        <Card className="max-w-md bg-primary/5 w-full mt-10">
          <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">
              Claim Submitted!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your warranty claim has been registered successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pt-0">
            <div className="bg-orange-50 p-3 sm:p-4 rounded-md border border-orange-200 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Your Claim ID
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary break-all">
                {claimExternalId}
              </p>
            </div>
            <div className="bg-blue-50 p-2.5 sm:p-3 rounded-md border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-800 text-center">
                A confirmation email has been sent to <br />
                <strong className="break-all">
                  {warrantyData.customer_email}
                </strong>
              </p>
            </div>
            <div className="bg-yellow-50 p-2.5 sm:p-3 rounded-md border border-yellow-200">
              <p className="text-xs sm:text-sm text-yellow-800 text-center">
                Our team will review your claim and contact you within 2-3
                business days.
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 text-sm sm:text-base"
            >
              Submit Another Claim
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary/5 py-4 sm:py-6 lg:py-8 px-3 sm:px-4">
      <div className="max-w-5xl mx-auto">
        <div className="pb-3 sm:pb-4 border-b p-4 sm:p-6">
          <div className="text-base sm:text-lg font-semibold">
            Warranty Claim
          </div>
          <div className="text-xs sm:text-sm mt-1 text-gray-600">
            Submit a claim for your registered warranty
          </div>
        </div>

        <div className="pt-4 sm:pt-6 p-4 sm:p-6">
          {/* Search Warranty Section */}
          <div className="space-y-3 sm:space-y-4 pb-4 sm:pb-6 border-b">
            <Label htmlFor="warranty_id" className="text-xs sm:text-sm">
              Warranty ID <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="warranty_id"
                value={warrantyId}
                onChange={(e) => setWarrantyId(e.target.value.toUpperCase())}
                placeholder="IKG-XXXXXXXXXXXX"
                className="h-9 sm:h-10 flex-1 text-sm sm:text-base"
                disabled={warrantyFound}
              />
              {!warrantyFound ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSearchWarranty}
                    disabled={searchLoading || !warrantyId.trim()}
                    className="hidden sm:flex bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 px-4 sm:px-6 shrink-0 text-xs sm:text-sm"
                  >
                    {searchLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFindDialogOpen(true)}
                    disabled={searchLoading}
                    className="hidden sm:flex h-9 sm:h-10 px-4 sm:px-6 shrink-0 text-xs sm:text-sm"
                  >
                    <FileSearch/>
                    Find Warranty ID
                  </Button>
                   <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleTrackClaim()}
                    disabled={searchLoading}
                    className="hidden sm:flex h-9 sm:h-10 px-4 sm:px-6 shrink-0 text-xs sm:text-sm"
                  >
                  <LocateFixed/>
                    Track Your Claim
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  onClick={() => {
                    setWarrantyFound(false);
                    setWarrantyId("");
                    setExistingClaim(null);
                    setClaimData({ defect_description: "" });
                    setFiles({ photo_file: null, video_file: null });
                    setFilePreviews({
                      photo_preview: null,
                      video_preview: null,
                    });
                    setAgreePolicy(false);
                  }}
                  variant="outline"
                  className="hidden sm:flex h-9 sm:h-10 px-4 text-xs sm:text-sm"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Mobile Buttons */}
            {!warrantyFound ? (
              <div className="sm:hidden flex flex-col gap-2">
                <Button
                  type="button"
                  onClick={handleSearchWarranty}
                  disabled={searchLoading || !warrantyId.trim()}
                  className="w-full bg-primary hover:bg-primary/80 text-white h-9 text-sm"
                >
                  {searchLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search Warranty
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFindDialogOpen(true)}
                  disabled={searchLoading}
                  className="w-full h-9 text-sm"
                >
                  Find Warranty ID
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => {
                  setWarrantyFound(false);
                  setWarrantyId("");
                  setExistingClaim(null);
                  setClaimData({ defect_description: "" });
                  setFiles({ photo_file: null, video_file: null });
                  setFilePreviews({
                    photo_preview: null,
                    video_preview: null,
                  });
                  setAgreePolicy(false);
                }}
                variant="outline"
                className="sm:hidden w-full h-9 text-sm"
              >
                Reset Search
              </Button>
            )}
          </div>

          {/* Existing Claim Warning - Show for ANY claim status */}
         {existingClaim && (
  <div
    className={`mt-4 rounded-lg p-3 sm:p-4 ${
      existingClaim.claim_status === "pending" ||
      existingClaim.claim_status === "under_review"
        ? "bg-yellow-50 border border-yellow-300"
        : existingClaim.claim_status === "rejected"
        ? "bg-red-50 border border-red-300"
        : "bg-green-50 border border-green-300"
    }`}
  >
    <div className="flex items-start gap-2 sm:gap-3">
      <AlertCircle
        className={`w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-0.5 ${
          existingClaim.claim_status === "pending" ||
          existingClaim.claim_status === "under_review"
            ? "text-yellow-600"
            : existingClaim.claim_status === "rejected"
            ? "text-red-600"
            : "text-green-600"
        }`}
      />
      <div className="flex-1 min-w-0">
        <h3
          className={`font-semibold text-xs sm:text-sm ${
            existingClaim.claim_status === "pending" ||
            existingClaim.claim_status === "under_review"
              ? "text-yellow-900"
              : existingClaim.claim_status === "rejected"
              ? "text-red-900"
              : "text-green-900"
          }`}
        >
          {existingClaim.claim_status === "pending" ||
          existingClaim.claim_status === "under_review"
            ? "Claim Under Review"
            : existingClaim.claim_status === "rejected"
            ? "Claim Rejected"
            : existingClaim.claim_status === "approved"
            ? "Claim Approved"
            : existingClaim.claim_status === "shipped"
            ? "Product Shipped"
            : existingClaim.claim_status === "completed"
            ? "Claim Completed"
            : "Claim Exists"}
        </h3>
        <p
          className={`text-xs sm:text-sm mt-1 ${
            existingClaim.claim_status === "pending" ||
            existingClaim.claim_status === "under_review"
              ? "text-yellow-800"
              : existingClaim.claim_status === "rejected"
              ? "text-red-800"
              : "text-green-800"
          }`}
        >
          {existingClaim.claim_status === "pending" ||
          existingClaim.claim_status === "under_review"
            ? "Your claim is currently being reviewed by our team."
            : existingClaim.claim_status === "rejected"
            ? "Your claim has been rejected. Please contact support for more details."
            : existingClaim.claim_status === "approved"
            ? "Your claim has been approved. You will receive further instructions shortly."
            : existingClaim.claim_status === "shipped"
            ? "Your product has been shipped to our service center for repair/replacement."
            : existingClaim.claim_status === "completed"
            ? "Your claim has been successfully completed. Thank you for your patience."
            : "A claim has been registered for this warranty."}
        </p>
        <div className="mt-2 space-y-1">
          <p
            className={`text-xs ${
              existingClaim.claim_status === "pending" ||
              existingClaim.claim_status === "under_review"
                ? "text-yellow-700"
                : existingClaim.claim_status === "rejected"
                ? "text-red-700"
                : "text-green-700"
            }`}
          >
            <span className="font-medium">Claim ID:</span>{" "}
            <strong className="break-all">
              {existingClaim.claim_external_id}
            </strong>
          </p>
          <p
            className={`text-xs ${
              existingClaim.claim_status === "pending" ||
              existingClaim.claim_status === "under_review"
                ? "text-yellow-700"
                : existingClaim.claim_status === "rejected"
                ? "text-red-700"
                : "text-green-700"
            }`}
          >
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`font-medium capitalize px-2 py-1 rounded border inline-block ${
                existingClaim.claim_status === "pending" ||
                existingClaim.claim_status === "under_review"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                  : existingClaim.claim_status === "rejected"
                  ? "bg-red-100 text-red-800 border-red-200"
                  : "bg-green-100 text-green-800 border-green-200"
              }`}
            >
              {existingClaim.claim_status.replace("_", " ")}
            </span>
          </p>
          <p
            className={`text-xs ${
              existingClaim.claim_status === "pending" ||
              existingClaim.claim_status === "under_review"
                ? "text-yellow-700"
                : existingClaim.claim_status === "rejected"
                ? "text-red-700"
                : "text-green-700"
            }`}
          >
            <span className="font-medium">Registered on:</span>{" "}
            {formatDate(existingClaim.claim_register_date)}
          </p>
          
          {/* Show Claim Result Date if exists */}
          {existingClaim.claim_result_date && (
            <p
              className={`text-xs ${
                existingClaim.claim_status === "pending" ||
                existingClaim.claim_status === "under_review"
                  ? "text-yellow-700"
                  : existingClaim.claim_status === "rejected"
                  ? "text-red-700"
                  : "text-green-700"
              }`}
            >
              <span className="font-medium">Result Date:</span>{" "}
              {formatDate(existingClaim.claim_result_date)}
            </p>
          )}
        </div>

        {/* Show Admin Notes if exists */}
        {existingClaim.admin_notes && (
          <div
            className={`mt-3 p-2 rounded border ${
              existingClaim.claim_status === "pending" ||
              existingClaim.claim_status === "under_review"
                ? "bg-yellow-100 border-yellow-200"
                : existingClaim.claim_status === "rejected"
                ? "bg-red-100 border-red-200"
                : "bg-green-100 border-green-200"
            }`}
          >
            <p
              className={`text-xs font-medium mb-1 ${
                existingClaim.claim_status === "pending" ||
                existingClaim.claim_status === "under_review"
                  ? "text-yellow-900"
                  : existingClaim.claim_status === "rejected"
                  ? "text-red-900"
                  : "text-green-900"
              }`}
            >
              Admin Notes:
            </p>
            <p
              className={`text-xs ${
                existingClaim.claim_status === "pending" ||
                existingClaim.claim_status === "under_review"
                  ? "text-yellow-800"
                  : existingClaim.claim_status === "rejected"
                  ? "text-red-800"
                  : "text-green-800"
              }`}
            >
              {existingClaim.admin_notes}
            </p>
          </div>
        )}

        <p
          className={`text-xs mt-3 font-semibold ${
            existingClaim.claim_status === "pending" ||
            existingClaim.claim_status === "under_review"
              ? "text-yellow-800"
              : existingClaim.claim_status === "rejected"
              ? "text-red-800"
              : "text-green-800"
          }`}
        >
          Only ONE claim per warranty is allowed. You cannot submit a new
          claim.
        </p>
      </div>
    </div>
  </div>
)}


          {/* Warranty Details (Auto-filled) */}
          {warrantyFound && (
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Customer Information Section */}
              <div className="space-y-4 sm:space-y-5 pt-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  Warranty Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Full Name</Label>
                    <Input
                      value={warrantyData.customer_name}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Mobile Number</Label>
                    <Input
                      value={warrantyData.customer_mobile}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Email Address</Label>
                  <Input
                    value={warrantyData.customer_email}
                    disabled
                    className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                  />
                </div>

                <div>
                  <Label className="text-xs sm:text-sm">Address</Label>
                  <Textarea
                    value={warrantyData.customer_address}
                    disabled
                    className="mt-1 min-h-[80px] bg-gray-50 text-sm sm:text-base resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">City</Label>
                    <Input
                      value={warrantyData.customer_city}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Pincode</Label>
                    <Input
                      value={warrantyData.customer_pincode}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">Purchase Date</Label>
                    <Input
                      value={formatDate(warrantyData.purchase_date)}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">Purchase From</Label>
                    <Input
                      value={warrantyData.purchase_from}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base capitalize"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Purchase Price
                    </Label>
                    <Input
                      value={`₹${warrantyData.purchase_price}`}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-xs sm:text-sm">
                      Warranty Status
                    </Label>
                    <Input
                      value={warrantyData.warranty_status}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base capitalize"
                    />
                  </div>

                  <div>
                    <Label className="text-xs sm:text-sm">
                      Registration Date
                    </Label>
                    <Input
                      value={formatDate(warrantyData.registration_date)}
                      disabled
                      className="mt-1 h-9 sm:h-10 bg-gray-50 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Claim Form Section - Only show if NO existing claim */}
              {!existingClaim && (
                <>
                  <div className="border-t pt-4 sm:pt-6">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
                      Claim Details
                    </h3>

                    {/* Defect Description */}
                    <div>
                      <Label
                        htmlFor="defect_description"
                        className="text-xs sm:text-sm"
                      >
                        Defect Description{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="defect_description"
                        name="defect_description"
                        required
                        value={claimData.defect_description}
                        onChange={(e) =>
                          setClaimData({
                            ...claimData,
                            defect_description: e.target.value,
                          })
                        }
                        placeholder="Please describe the defect or issue in detail..."
                        className="mt-1 min-h-[120px] text-sm sm:text-base resize-none"
                        rows={5}
                      />
                    </div>

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                      {/* Photo Upload */}
                      <div>
                        <Label
                          htmlFor="photo_file"
                          className="text-xs sm:text-sm"
                        >
                          Photo of Defect{" "}
                          <span className="text-red-500">*</span>
                          <span className="text-gray-500 ml-1">
                            (Max {MAX_PHOTO_SIZE_MB}MB)
                          </span>
                        </Label>
                        {!files.photo_file ? (
                          <label
                            htmlFor="photo_file"
                            className="flex flex-col items-center justify-center bg-gray-50 w-full h-20 sm:h-24 px-3 mt-1 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <Upload className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400" />
                            <span className="text-xs text-gray-600 text-center">
                              Click to upload
                            </span>
                            <span className="text-xs text-gray-500">
                              PNG, JPG or WEBP
                            </span>
                          </label>
                        ) : (
                          <div className="mt-1 border bg-gray-50 border-gray-300 rounded-md p-3 sm:p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                  {files.photo_file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(files.photo_file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-xs"
                                onClick={() => handleViewFile("photo_file")}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-xs"
                                onClick={() => handleRemoveFile("photo_file")}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        <Input
                          id="photo_file"
                          type="file"
                          required
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={(e) => handleFileChange(e, "photo_file")}
                          className="hidden"
                        />
                      </div>

                      {/* Video Upload (Optional) */}
                      <div>
                        <Label
                          htmlFor="video_file"
                          className="text-xs sm:text-sm"
                        >
                          Video of Defect (Optional)
                          <span className="text-gray-500 ml-1">
                            (Max {MAX_VIDEO_SIZE_MB}MB)
                          </span>
                        </Label>
                        {!files.video_file ? (
                          <label
                            htmlFor="video_file"
                            className="flex flex-col items-center justify-center bg-gray-50 w-full h-20 sm:h-24 px-3 mt-1 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <Video className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400" />
                            <span className="text-xs text-gray-600 text-center">
                              Click to upload
                            </span>
                            <span className="text-xs text-gray-500">
                              MP4, WEBM or MOV
                            </span>
                          </label>
                        ) : (
                          <div className="mt-1 bg-gray-50 border border-gray-300 rounded-md p-3 sm:p-4 flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-primary shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                  {files.video_file.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(files.video_file.size)}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-xs"
                                onClick={() => handleViewFile("video_file")}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="flex-1 h-7 sm:h-8 text-xs"
                                onClick={() => handleRemoveFile("video_file")}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove
                              </Button>
                            </div>
                          </div>
                        )}
                        <Input
                          id="video_file"
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          onChange={(e) => handleFileChange(e, "video_file")}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Policy Agreement */}
                    <div className="flex items-start gap-2 mt-4 p-3 bg-gray-50 rounded-md">
                      <Checkbox
                        id="policy"
                        checked={agreePolicy}
                        onCheckedChange={(checked) =>
                          setAgreePolicy(checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <label
                        htmlFor="policy"
                        className="text-xs sm:text-sm text-gray-700 cursor-pointer"
                      >
                        I agree to the{" "}
                        <a
                          href="/terms-conditions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline"
                        >
                          warranty claim terms and conditions
                        </a>
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex justify-center">
                    <Button
                      type="submit"
                      disabled={loading || !agreePolicy}
                      className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white h-10 sm:h-11 disabled:opacity-50 text-sm sm:text-base px-8"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          <span className="text-sm sm:text-base">
                            Submitting...
                          </span>
                        </>
                      ) : !agreePolicy ? (
                        <span className="text-sm sm:text-base">
                          Agree to Policy to Continue
                        </span>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="text-sm sm:text-base">
                            Submit Claim
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Find Warranty Dialog */}
      <FindWarrantyDialog
        open={findDialogOpen}
        onOpenChange={setFindDialogOpen}
        onWarrantySelect={handleWarrantySelect}
      />

      {/* Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {previewTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto">
            {previewContent && previewType === "image" && (
              <img
                src={previewContent}
                alt="Preview"
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-md"
              />
            )}
            {previewContent && previewType === "video" && (
              <video
                src={previewContent}
                controls
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] rounded-md"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
