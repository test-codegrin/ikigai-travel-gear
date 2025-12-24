"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, Shield, Phone } from "lucide-react";

export default function WarrantyPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [warrantyId, setWarrantyId] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    purchase_date: "",
    product_description: "",
    warranty_card_number: "",
  });

  const [files, setFiles] = useState({
    invoice_file: null as File | null,
    warranty_card_file: null as File | null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // Reset mobile verification if mobile number changes
    if (e.target.name === "mobile" && mobileVerified) {
      setMobileVerified(false);
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "invoice_file" | "warranty_card_file"
  ) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [field]: e.target.files[0] });
    }
  };

  const handleSendOTP = async () => {
    if (!formData.mobile || formData.mobile.length < 10) {
      toast.error("Please enter a valid mobile number");
      return;
    }

    setOtpLoading(true);
    try {
      const response = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP");
      }

      setOtpSent(true);
      toast.success(`OTP sent to ${formData.mobile}. Check console for OTP: ${data.otp}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP";
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
      const response = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: formData.mobile, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid OTP");
      }

      setMobileVerified(true);
      setOtpSent(false);
      toast.success("Mobile number verified successfully!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to verify OTP";
      toast.error(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mobileVerified) {
      toast.error("Please verify your mobile number first");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (files.invoice_file) data.append("invoice_file", files.invoice_file);
      if (files.warranty_card_file) data.append("warranty_card_file", files.warranty_card_file);

      const response = await fetch("/api/warranty/register", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to register warranty");
      }

      setWarrantyId(result.warranty_id);
      setSuccess(true);
      toast.success("Success! Your warranty has been registered.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to register warranty";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 p-4">
        <Card className="max-w-md w-full shadow-2xl border-primary/20">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-primary to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Your warranty has been registered with IKIGAI Travel Gear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-primary/20 text-center">
              <p className="text-sm font-medium text-gray-600 mb-2">Your Warranty ID</p>
              <p className="text-3xl font-bold text-primary tracking-wide">{warrantyId}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 text-center">
                📧 A confirmation email has been sent to <strong className="block mt-1">{formData.email}</strong>
              </p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              Register Another Warranty
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <Shield className="w-16 h-16 text-primary mx-auto mb-2" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent mb-3">
            IKIGAI Travel Gear
          </h1>
          <p className="text-2xl text-gray-700 font-medium">3-Year Warranty Registration</p>
          <p className="text-gray-600 mt-2">Protect your investment with our comprehensive warranty</p>
        </div>

        <Card className="shadow-2xl border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-orange-100/50 border-b">
            <CardTitle className="text-2xl">Register Your Warranty</CardTitle>
            <CardDescription className="text-base">
              Complete the form below to activate your 3-year domestic warranty coverage
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Customer Information */}
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Customer Information</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="name" className="text-base font-semibold">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className="mt-2 h-12 border-gray-300 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-base font-semibold">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="mt-2 h-12 border-gray-300 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="mobile" className="text-base font-semibold">Mobile Number *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="h-12 border-gray-300 focus:border-primary"
                      disabled={mobileVerified}
                    />
                    {!mobileVerified && !otpSent && (
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpLoading || !formData.mobile}
                        className="bg-primary hover:bg-primary/90 px-6 h-12 whitespace-nowrap"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Phone className="w-4 h-4 mr-2" />
                            Verify
                          </>
                        )}
                      </Button>
                    )}
                    {mobileVerified && (
                      <div className="flex items-center gap-2 px-4 bg-green-100 text-green-700 rounded-lg border border-green-300">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-semibold">Verified</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* OTP Input */}
                {otpSent && !mobileVerified && (
                  <div className="bg-blue-50 p-5 rounded-lg border border-blue-200 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="otp" className="text-base font-semibold text-blue-900">
                      Enter OTP *
                    </Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        id="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="h-12 text-center text-2xl tracking-widest font-bold"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOTP}
                        disabled={otpLoading || otp.length !== 6}
                        className="bg-green-600 hover:bg-green-700 px-6 h-12"
                      >
                        {otpLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      OTP sent to {formData.mobile}. Valid for 5 minutes.
                    </p>
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="space-y-5 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Product Details</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="purchase_date" className="text-base font-semibold">Purchase Date *</Label>
                    <Input
                      id="purchase_date"
                      name="purchase_date"
                      type="date"
                      required
                      value={formData.purchase_date}
                      onChange={handleInputChange}
                      className="mt-2 h-12 border-gray-300 focus:border-primary"
                    />
                  </div>

                  <div>
                    <Label htmlFor="warranty_card_number" className="text-base font-semibold">
                      Warranty Card Number
                    </Label>
                    <Input
                      id="warranty_card_number"
                      name="warranty_card_number"
                      value={formData.warranty_card_number}
                      onChange={handleInputChange}
                      placeholder="WC123456 (Optional)"
                      className="mt-2 h-12 border-gray-300 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_description" className="text-base font-semibold">
                    Product Description *
                  </Label>
                  <Textarea
                    id="product_description"
                    name="product_description"
                    required
                    value={formData.product_description}
                    onChange={handleInputChange}
                    placeholder="e.g., IKIGAI 28-inch Hard Shell Luggage - Black"
                    rows={4}
                    className="mt-2 border-gray-300 focus:border-primary"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="space-y-5 pt-6 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">Upload Documents</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <Label htmlFor="invoice_file" className="text-base font-semibold">
                      Invoice/Bill *
                    </Label>
                    <label
                      htmlFor="invoice_file"
                      className="flex flex-col items-center justify-center w-full h-32 px-4 mt-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-all"
                    >
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600 text-center">
                        {files.invoice_file ? (
                          <span className="text-primary font-semibold">{files.invoice_file.name}</span>
                        ) : (
                          "Click to upload invoice"
                        )}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (max 5MB)</span>
                    </label>
                    <Input
                      id="invoice_file"
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "invoice_file")}
                      className="hidden"
                    />
                  </div>

                  <div>
                    <Label htmlFor="warranty_card_file" className="text-base font-semibold">
                      Warranty Card *
                    </Label>
                    <label
                      htmlFor="warranty_card_file"
                      className="flex flex-col items-center justify-center w-full h-32 px-4 mt-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-primary transition-all"
                    >
                      <Upload className="w-8 h-8 mb-2 text-gray-400" />
                      <span className="text-sm text-gray-600 text-center">
                        {files.warranty_card_file ? (
                          <span className="text-primary font-semibold">{files.warranty_card_file.name}</span>
                        ) : (
                          "Click to upload warranty card"
                        )}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">PNG, JPG or PDF (max 5MB)</span>
                    </label>
                    <Input
                      id="warranty_card_file"
                      type="file"
                      required
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileChange(e, "warranty_card_file")}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <Button
                  type="submit"
                  disabled={loading || !mobileVerified}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Registering Your Warranty...
                    </>
                  ) : !mobileVerified ? (
                    <>
                      <Shield className="w-5 h-5 mr-2" />
                      Verify Mobile to Continue
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Warranty Registration
                    </>
                  )}
                </Button>

                {!mobileVerified && (
                  <p className="text-sm text-amber-600 text-center mt-3 flex items-center justify-center gap-2">
                    <Phone className="w-4 h-4" />
                    Please verify your mobile number to enable registration
                  </p>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 bg-white p-4 rounded-lg shadow-sm border">
            🔒 By registering, you agree to the{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              IKIGAI Travel Gear warranty terms and conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
