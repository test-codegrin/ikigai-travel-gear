"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Warranty {
  id: number;
  external_id: string;
  customer_name: string;
  customer_email: string;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
  warranty_status_name: string;
}

interface FindWarrantyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onWarrantySelect: (externalId: string) => void;
}

function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function FindWarrantyDialog({
  open,
  onOpenChange,
  onWarrantySelect,
}: FindWarrantyDialogProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await fetch(
        `/api/warranty/search-by-email?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to find warranties");
      }

      setWarranties(data.warranties);
      setShowResults(true);
      
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to search warranties";
      toast.error(message);
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (externalId: string) => {
    onWarrantySelect(externalId);
    // Reset dialog state
    setEmail("");
    setWarranties([]);
    setShowResults(false);
    onOpenChange(false);

  };

  const handleClose = () => {
    setEmail("");
    setWarranties([]);
    setShowResults(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Find Your Warranty ID
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter your email address to view all warranties registered under it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Input Section */}
          <div className="space-y-2">
            <Label htmlFor="search-email" className="text-sm">
              Email Address
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search-email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-10 h-10 w-full"
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={loading || !email.trim()}
                className="bg-primary hover:bg-primary/80 text-white px-6 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Found {warranties.length} {warranties.length !== 1 ? 'warranties' : 'warranty'}
                </h3>
              </div>

              {warranties.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">
                    No warranties found for this email address
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {warranties.map((warranty) => (
                    <div
                      key={warranty.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                            <span className="text-xs font-medium text-gray-500 shrink-0">
                              Warranty ID:
                            </span>
                            <span className="text-sm font-bold text-primary break-all">
                              {warranty.external_id}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-gray-600">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium">Purchase Date:</span>
                              <span>{formatDateShort(warranty.purchase_date)}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium">Price:</span>
                              <span>₹{warranty.purchase_price}</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium">From:</span>
                              <span className="capitalize">
                                {warranty.purchase_from.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="font-medium">Status:</span>
                              <span className="capitalize">
                                {warranty.warranty_status_name}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleSelect(warranty.external_id)}
                          className="bg-primary hover:bg-primary/80 text-white w-full sm:w-auto sm:self-end"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
