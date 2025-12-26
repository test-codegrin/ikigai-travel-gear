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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Upload,
  CheckCircle,
  CalendarIcon,
  X,
  Eye,
  FileText,
  ImageIcon,
} from "lucide-react";
import { countryCodes } from "@/lib/country-codes";
import { purchaseFromOptions } from "@/lib/purchase-option";
import { API } from "@/lib/api-endpoints";

// File size limit from environment variable (default 5MB)
const MAX_FILE_SIZE = 5242880;
const MAX_FILE_SIZE_MB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);

function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export default function WarrantyPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warrantyId, setWarrantyId] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // Date picker state
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    new Date()
  );
  const [month, setMonth] = useState<Date | undefined>(new Date());
  const [dateValue, setDateValue] = useState(formatDate(new Date()));

  // Image preview states
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [previewType, setPreviewType] = useState<"image" | "pdf">("image");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    city: "",
    pincode: "",
    purchase_from: "",
    purchase_price: "",
  });

  const [files, setFiles] = useState({
    invoice_file: null as File | null,
    warranty_card_file: null as File | null,
  });

  const [filePreviews, setFilePreviews] = useState({
    invoice_preview: null as string | null,
    warranty_card_preview: null as string | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (e.target.name === "email" && emailVerified) {
      setEmailVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setFormData({ ...formData, mobile: value });
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) {
      setFormData({ ...formData, pincode: value });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.]/g, "");
    const parts = value.split(".");
    if (parts.length > 2) return;

    setFormData({ ...formData, purchase_price: value });
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File size exceeds ${MAX_FILE_SIZE_MB}MB limit. Current size: ${formatFileSize(
          file.size
        )}`
      );
      return false;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Invalid file type. Only JPEG, PNG, WEBP, and PDF are allowed"
      );
      return false;
    }

    return true;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "invoice_file" | "warranty_card_file"
  ) => {
    const input = e.target;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validate file before setting
      if (!validateFile(file)) {
        input.value = ""; // Reset input
        return;
      }

      setFiles({ ...files, [field]: file });

      const previewUrl = URL.createObjectURL(file);
      const previewField =
        field === "invoice_file" ? "invoice_preview" : "warranty_card_preview";
      setFilePreviews({ ...filePreviews, [previewField]: previewUrl });
    }
  };

  const handleRemoveFile = (field: "invoice_file" | "warranty_card_file") => {
    const inputId =
      field === "invoice_file" ? "invoice_file" : "warranty_card_file";
    const inputElement = document.getElementById(inputId) as HTMLInputElement;
    if (inputElement) {
      inputElement.value = "";
    }

    setFiles({ ...files, [field]: null });
    const previewField =
      field === "invoice_file" ? "invoice_preview" : "warranty_card_preview";

    if (filePreviews[previewField]) {
      URL.revokeObjectURL(filePreviews[previewField]!);
    }

    setFilePreviews({ ...filePreviews, [previewField]: null });
  };

  const handleViewFile = (field: "invoice_file" | "warranty_card_file") => {
    const previewField =
      field === "invoice_file" ? "invoice_preview" : "warranty_card_preview";
    const preview = filePreviews[previewField];
    const file = files[field];

    if (preview && file) {
      setPreviewImage(preview);
      setPreviewTitle(
        field === "invoice_file"
          ? "Invoice/Bill Preview"
          : "Warranty Card Preview"
      );

      setPreviewType(file.type === "application/pdf" ? "pdf" : "image");
      setPreviewDialog(true);
    }
  };

  const handleSendOTP = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          action: "send",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      toast.success(`OTP sent to ${formData.email}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch("/api/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
          action: "verify",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      setEmailVerified(true);
      setOtpSent(false);
      toast.success("Email verified successfully!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to verify OTP";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      toast.error("Please verify your email address first");
      return;
    }

    if (!purchaseDate) {
      toast.error("Please select a purchase date");
      return;
    }

    if (!formData.purchase_from) {
      toast.error("Please select where you purchased from");
      return;
    }

    if (!formData.purchase_price || parseFloat(formData.purchase_price) <= 0) {
      toast.error("Please enter a valid purchase price");
      return;
    }

    if (!files.invoice_file || !files.warranty_card_file) {
      toast.error("Please upload both invoice and warranty card files");
      return;
    }

    // Final file validation before submit
    if (
      !validateFile(files.invoice_file) ||
      !validateFile(files.warranty_card_file)
    ) {
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "mobile") {
          data.append(key, `${countryCode}${value}`);
        } else if (key === "purchase_price") {
          data.append(key, parseFloat(value).toFixed(2));
        } else {
          data.append(key, value);
        }
      });

      const year = purchaseDate.getFullYear();
      const month = String(purchaseDate.getMonth() + 1).padStart(2, "0");
      const day = String(purchaseDate.getDate()).padStart(2, "0");
      data.append("purchase_date", `${year}-${month}-${day}`);

      if (files.invoice_file) data.append("invoice_file", files.invoice_file);
      if (files.warranty_card_file)
        data.append("warranty_card_file", files.warranty_card_file);

      const response = await fetch(API.ACTIVATE_WARRANT, {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to activate warranty");
      }

      setWarrantyId(result.warranty_id);
      setSuccess(true);
      toast.success("Success! Your warranty has been activated.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to activate warranty";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-start justify-center p-3 sm:p-4">
        <Card className="max-w-md bg-primary/5 w-full mt-10">
          <CardHeader className="text-center space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-green-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-semibold">
              Activation Successful!
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Your warranty has been registered with IKIGAI Travel Gear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="bg-orange-50 p-3 sm:p-4 rounded-md border border-orange-200 text-center">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                Your Warranty ID
              </p>
              <p className="text-xl sm:text-2xl font-bold text-primary break-all">
                {warrantyId}
              </p>
            </div>
            <div className="bg-blue-50 p-2.5 sm:p-3 rounded-md border border-blue-200">
              <p className="text-xs sm:text-sm text-blue-800 text-center">
                A confirmation email has been sent to <br />
                <strong className="break-all">{formData.email}</strong>
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 text-sm sm:text-base"
            >
              Activate Another Warranty
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
            Activate Your Warranty
          </div>
          <div className="text-xs sm:text-sm mt-1 text-gray-600">
            Complete the form below to activate your 3-year warranty coverage
          </div>
        </div>

        <div className="pt-4 sm:pt-6 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Customer Information Section */}
            <div className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Full Name */}
                <div>
                  <Label htmlFor="name" className="text-xs sm:text-sm">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="mt-1 h-9 sm:h-10 text-sm sm:text-base"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <Label htmlFor="mobile" className="text-xs sm:text-sm">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Select value={countryCode} onValueChange={setCountryCode}>
                      <SelectTrigger className="w-20 sm:w-24 h-9 sm:h-10 text-xs sm:text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map((country) => (
                          <SelectItem
                            key={country.code}
                            value={country.code}
                            className="text-xs sm:text-sm"
                          >
                            {country.flag} {country.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleMobileChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className="h-9 sm:h-10 flex-1 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address with OTP Verification */}
              <div>
                <Label htmlFor="email" className="text-xs sm:text-sm">
                  Email Address <span className="text-red-500">*</span>
                </Label>

                {/* Email input row */}
                <div className="flex gap-2 mt-1">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="h-9 sm:h-10 flex-1 text-sm sm:text-base"
                    disabled={emailVerified || otpSent}
                  />

                  {/* Send OTP button - desktop only */}
                  {!emailVerified && !otpSent && (
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={otpLoading || !formData.email}
                      className="hidden sm:flex bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 px-3 sm:px-4 shrink-0 text-xs sm:text-sm"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                      ) : (
                        "Send OTP"
                      )}
                    </Button>
                  )}

                  {/* Verified badge */}
                  {emailVerified && (
                    <div className="flex items-center gap-1 px-2 sm:px-3 bg-green-50 text-green-700 rounded-md border border-green-300 h-9 sm:h-10 shrink-0">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-xs sm:text-sm font-medium">
                        Verified
                      </span>
                    </div>
                  )}
                </div>

                {/* Send OTP button - mobile only (below input) */}
                {!emailVerified && !otpSent && (
                  <Button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={otpLoading || !formData.email}
                    className="sm:hidden w-full mt-2 bg-primary hover:bg-primary/80 text-white h-9 text-sm"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                )}

                {/* OTP Input */}
                {otpSent && !emailVerified && (
                  <div className="mt-3">
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                        className="justify-center sm:justify-start"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot
                            index={0}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                          <InputOTPSlot
                            index={1}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                          <InputOTPSlot
                            index={2}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                          <InputOTPSlot
                            index={3}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                          <InputOTPSlot
                            index={4}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                          <InputOTPSlot
                            index={5}
                            className="h-9 w-9 sm:h-10 sm:w-10 text-sm sm:text-base"
                          />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="bg-primary hover:bg-primary/80 text-white h-9 sm:h-10 px-4 shrink-0 w-full sm:w-auto text-sm sm:text-base"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2">
                      OTP sent to {formData.email}. Valid for 10 minutes.
                    </p>
                  </div>
                )}
              </div>

              {/* Address Field */}
              <div>
                <Label htmlFor="address" className="text-xs sm:text-sm">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your complete address"
                  className="mt-1 min-h-[80px] text-sm sm:text-base resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* City */}
                <div>
                  <Label htmlFor="city" className="text-xs sm:text-sm">
                    City <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="city"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                    className="mt-1 h-9 sm:h-10 text-sm sm:text-base"
                  />
                </div>

                {/* Pincode */}
                <div>
                  <Label htmlFor="pincode" className="text-xs sm:text-sm">
                    Pincode <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="pincode"
                    name="pincode"
                    type="tel"
                    required
                    value={formData.pincode}
                    onChange={handlePincodeChange}
                    placeholder="123456"
                    maxLength={6}
                    className="mt-1 h-9 sm:h-10 text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* Purchase Date */}
                <div>
                  <Label
                    htmlFor="purchase-date"
                    className="text-xs sm:text-sm"
                  >
                    Purchase Date <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative mt-1">
                    <Input
                      id="purchase-date"
                      value={dateValue}
                      placeholder="Select date"
                      className="h-9 sm:h-10 pr-10 text-sm sm:text-base"
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        setDateValue(e.target.value);
                        if (isValidDate(date)) {
                          setPurchaseDate(date);
                          setMonth(date);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                          e.preventDefault();
                          setDatePickerOpen(true);
                        }
                      }}
                    />
                    <Popover
                      open={datePickerOpen}
                      onOpenChange={setDatePickerOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          className="absolute top-1/2 right-2 size-6 -translate-y-1/2 p-0"
                        >
                          <CalendarIcon className="size-3.5" />
                          <span className="sr-only">Select date</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 bg-white"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                      >
                        <Calendar
                          mode="single"
                          selected={purchaseDate}
                          captionLayout="dropdown"
                          month={month}
                          onMonthChange={setMonth}
                          onSelect={(date) => {
                            setPurchaseDate(date);
                            setDateValue(formatDate(date));
                            setDatePickerOpen(false);
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Purchase Price */}
                <div>
                  <Label
                    htmlFor="purchase_price"
                    className="text-xs sm:text-sm"
                  >
                    Purchase Price (₹) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="purchase_price"
                    name="purchase_price"
                    type="text"
                    required
                    value={formData.purchase_price}
                    onChange={handlePriceChange}
                    placeholder="2999.00"
                    className="mt-1 h-9 sm:h-10 text-sm sm:text-base"
                  />
                </div>

                {/* Purchase From */}
                <div>
                  <Label
                    htmlFor="purchase_from"
                    className="text-xs sm:text-sm"
                  >
                    Purchase From <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.purchase_from}
                    onValueChange={(value) =>
                      setFormData({ ...formData, purchase_from: value })
                    }
                    required
                  >
                    <SelectTrigger className="mt-1 h-9 w-full sm:h-10 text-sm sm:text-sm">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {purchaseFromOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-xs sm:text-sm"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Invoice File Upload */}
                <div>
                  <Label htmlFor="invoice_file" className="text-xs sm:text-sm">
                    Invoice/Bill <span className="text-red-500">*</span>
                    <span className="text-gray-500 ml-1">
                      (Max {MAX_FILE_SIZE_MB}MB)
                    </span>
                  </Label>
                  {!files.invoice_file ? (
                    <label
                      htmlFor="invoice_file"
                      className="flex flex-col items-center justify-center bg-gray-50 w-full h-20 sm:h-24 px-3 mt-1 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400" />
                      <span className="text-xs text-gray-600 text-center">
                        Click to upload
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG or PDF
                      </span>
                    </label>
                  ) : (
                    <div className="mt-1 border bg-gray-50 border-gray-300 rounded-md p-3 sm:p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {files.invoice_file.type === "application/pdf" ? (
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">
                            {files.invoice_file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(files.invoice_file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 sm:h-8 text-xs"
                          onClick={() => handleViewFile("invoice_file")}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-7 sm:h-8 text-xs"
                          onClick={() => handleRemoveFile("invoice_file")}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  <Input
                    id="invoice_file"
                    type="file"
                    required
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileChange(e, "invoice_file")}
                    className="hidden"
                  />
                </div>

                {/* Warranty Card File Upload */}
                <div>
                  <Label
                    htmlFor="warranty_card_file"
                    className="text-xs sm:text-sm"
                  >
                    Warranty Card <span className="text-red-500">*</span>
                    <span className="text-gray-500 ml-1">
                      (Max {MAX_FILE_SIZE_MB}MB)
                    </span>
                  </Label>
                  {!files.warranty_card_file ? (
                    <label
                      htmlFor="warranty_card_file"
                      className="flex flex-col items-center justify-center bg-gray-50 w-full h-20 sm:h-24 px-3 mt-1 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <Upload className="w-5 h-5 sm:w-6 sm:h-6 mb-1 text-gray-400" />
                      <span className="text-xs text-gray-600 text-center">
                        Click to upload
                      </span>
                      <span className="text-xs text-gray-500">
                        PNG, JPG or PDF
                      </span>
                    </label>
                  ) : (
                    <div className="mt-1 bg-gray-50 border border-gray-300 rounded-md p-3 sm:p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {files.warranty_card_file.type ===
                        "application/pdf" ? (
                          <FileText className="w-4 h-4 text-primary shrink-0" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-600 truncate">
                            {files.warranty_card_file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(files.warranty_card_file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 h-7 sm:h-8 text-xs"
                          onClick={() => handleViewFile("warranty_card_file")}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-7 sm:h-8 text-xs"
                          onClick={() =>
                            handleRemoveFile("warranty_card_file")
                          }
                        >
                          <X className="w-3 h-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  )}
                  <Input
                    id="warranty_card_file"
                    type="file"
                    required
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    onChange={(e) => handleFileChange(e, "warranty_card_file")}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex justify-center">
              <Button
                type="submit"
                disabled={loading || !emailVerified}
                className="w-full sm:w-auto bg-primary hover:bg-primary/80 text-white h-10 sm:h-11 disabled:opacity-50 text-sm sm:text-base px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span className="text-sm sm:text-base">
                      Activating...
                    </span>
                  </>
                ) : !emailVerified ? (
                  <span className="text-sm sm:text-base">
                    Verify Email to Continue
                  </span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm sm:text-base">
                      Submit Registration
                    </span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Terms & Conditions */}
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-gray-600 p-2.5 sm:p-3 rounded-md">
            By registering, you agree to the{" "}
            <a
              href="/terms-conditions"
              className="text-primary font-medium hover:underline"
            >
              IKIGAI Travel Gear warranty terms and conditions
            </a>
          </p>
        </div>
      </div>

      {/* Image/PDF Preview Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] bg-white p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {previewTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center overflow-auto">
            {previewImage && previewType === "image" && (
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[60vh] sm:max-h-[70vh] object-contain rounded-md"
              />
            )}
            {previewImage && previewType === "pdf" && (
              <iframe
                src={previewImage}
                className="w-full h-[60vh] sm:h-[70vh] rounded-md border"
                title="PDF Preview"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
