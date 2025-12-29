"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  Search,
  Download,
  Eye,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Check,
  ChevronsUpDown,
  ClipboardList,
  Clock,
  CheckCircle2,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API } from "@/lib/api-endpoints";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { useDebounce } from "@/hooks/useDebounce";

interface Claim {
  id: number;
  warranty_id: number;
  claim_external_id: string;
  warranty_external_id: string;
  customer_name: string;
  customer_email: string;
  customer_mobile: string;
  customer_address: string;
  customer_city: string;
  customer_pincode: number;
  defect_description: string;
  photo_url: string;
  video_url: string | null;
  claim_status_name: string;
  admin_notes: string | null;
  claim_register_date: string;
  claim_result_date: string | null;
  purchase_date: string;
  purchase_price: number;
  purchase_from: string;
}

interface ClaimStatus {
  id: number;
  name: string;
  description: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface Stats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  shipped: number;
  completed: number;
  thisMonth: number;
}

interface Filters {
  cities: string[];
  statuses: string[];
  purchaseFromOptions: string[];
}

export default function ClaimsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [claimStatuses, setClaimStatuses] = useState<ClaimStatus[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    shipped: 0,
    completed: 0,
    thisMonth: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    limit: 25,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFilters] = useState<Filters>({
    cities: [],
    statuses: [],
    purchaseFromOptions: [],
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPurchaseFrom, setSelectedPurchaseFrom] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [showFilters, setShowFilters] = useState(false);
  const [openCityCombobox, setOpenCityCombobox] = useState(false);

  // Debounced search query - 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchClaimStatuses();
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [
    pagination.currentPage,
    pagination.limit,
    debouncedSearchQuery,
    selectedStatus,
    selectedCity,
    selectedPurchaseFrom,
    dateFrom,
    dateTo,
  ]);

  const fetchClaimStatuses = async () => {
    try {
      const response = await fetch(API.CLAIM_STATUSES);
      if (response.ok) {
        const data = await response.json();
        setClaimStatuses(data.statuses);
      }
    } catch (error) {
      console.error("Failed to fetch claim statuses:", error);
    }
  };

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
      });

      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (selectedStatus && selectedStatus.trim())
        params.append("status", selectedStatus);
      if (selectedCity && selectedCity.trim())
        params.append("city", selectedCity);
      if (selectedPurchaseFrom && selectedPurchaseFrom.trim())
        params.append("purchase_from", selectedPurchaseFrom);
      if (dateFrom) params.append("date_from", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) params.append("date_to", format(dateTo, "yyyy-MM-dd"));

      const response = await fetch(`${API.CLAIMS}?${params.toString()}`);

      if (!response.ok) {
        router.push(API.LOGIN);
        return;
      }

      const data = await response.json();
      setClaims(data.claims);
      setPagination(data.pagination);
      setFilters(data.filters);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    try {
      setExporting(true);

      const params = new URLSearchParams({
        page: "1",
        limit: "10000",
      });

      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (selectedStatus && selectedStatus.trim())
        params.append("status", selectedStatus);
      if (selectedCity && selectedCity.trim())
        params.append("city", selectedCity);
      if (selectedPurchaseFrom && selectedPurchaseFrom.trim())
        params.append("purchase_from", selectedPurchaseFrom);
      if (dateFrom) params.append("date_from", format(dateFrom, "yyyy-MM-dd"));
      if (dateTo) params.append("date_to", format(dateTo, "yyyy-MM-dd"));

      const response = await fetch(`${API.CLAIMS}?${params.toString()}`);
      const data = await response.json();

      const exportData = data.claims.map((claim: Claim) => ({
        "Claim ID": claim.claim_external_id,
        "Warranty ID": claim.warranty_external_id,
        "Customer Name": claim.customer_name,
        Email: claim.customer_email,
        Mobile: claim.customer_mobile,
        Address: claim.customer_address,
        City: claim.customer_city,
        Pincode: claim.customer_pincode,
        "Defect Description": claim.defect_description,
        "Purchase Date": new Date(claim.purchase_date).toLocaleDateString(
          "en-IN"
        ),
        "Purchase Price": claim.purchase_price,
        "Purchase From": claim.purchase_from.replace(/_/g, " "),
        "Claim Status": claim.claim_status_name.replace(/_/g, " "),
        "Claim Date": new Date(claim.claim_register_date).toLocaleDateString(
          "en-IN"
        ),
        "Result Date": claim.claim_result_date
          ? new Date(claim.claim_result_date).toLocaleDateString("en-IN")
          : "N/A",
        "Admin Notes": claim.admin_notes || "N/A",
        "Has Photo": claim.photo_url ? "Yes" : "No",
        "Has Video": claim.video_url ? "Yes" : "No",
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Claims");

      const maxWidth = 50;
      if (exportData.length > 0) {
        const colWidths = Object.keys(exportData[0]).map((key) => ({
          wch: Math.min(
            Math.max(
              key.length,
              ...exportData.map(
                (row: Record<string, string | number>) =>
                  String(row[key]).length
              )
            ),
            maxWidth
          ),
        }));
        worksheet["!cols"] = colWidths;
      }

      const fileName = `claims_${format(new Date(), "yyyy-MM-dd_HHmmss")}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleLimitChange = (newLimit: string) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(newLimit),
      currentPage: 1,
    }));
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedStatus("");
    setSelectedCity("");
    setSelectedPurchaseFrom("");
    setDateFrom(undefined);
    setDateTo(undefined);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const hasActiveFilters = Boolean(
    (searchQuery && searchQuery.trim()) ||
      (selectedStatus && selectedStatus.trim()) ||
      (selectedCity && selectedCity.trim()) ||
      (selectedPurchaseFrom && selectedPurchaseFrom.trim()) ||
      dateFrom ||
      dateTo
  );

  const activeFilterCount = [
    searchQuery && searchQuery.trim(),
    selectedStatus && selectedStatus.trim(),
    selectedCity && selectedCity.trim(),
    selectedPurchaseFrom && selectedPurchaseFrom.trim(),
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

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

  if (loading && claims.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards - Smaller Version */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Claims</p>
                <p className="text-xl font-bold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-yellow-600 mt-1">
                  {stats.pending}
                </p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Approved</p>
                <p className="text-xl font-bold text-green-600 mt-1">
                  {stats.approved}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">This Month</p>
                <p className="text-xl font-bold text-primary mt-1">
                  {stats.thisMonth}
                </p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Bar with Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by claim ID, warranty ID, name, email, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && debouncedSearchQuery !== searchQuery && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="default"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="default" className="ml-1 px-1.5 py-0 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={handleExportToExcel}
            disabled={exporting || claims.length === 0}
            className="gap-2"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select
                  value={selectedStatus}
                  onValueChange={(value) =>
                    setSelectedStatus(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">All statuses</SelectItem>
                    {claimStatuses.map((status) => (
                      <SelectItem key={status.id} value={status.name}>
                        {status.name.replace(/_/g, " ").charAt(0).toUpperCase() +
                          status.name.replace(/_/g, " ").slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City Filter - Searchable Combobox */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  City
                </label>
                <Popover
                  open={openCityCombobox}
                  onOpenChange={setOpenCityCombobox}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCityCombobox}
                      className="w-full justify-between"
                    >
                      {selectedCity || "All cities"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search city..." />
                      <CommandEmpty>No city found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setSelectedCity("");
                            setOpenCityCombobox(false);
                          }}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCity === "" ? "opacity-100" : "opacity-0"
                            )}
                          />
                          All cities
                        </CommandItem>
                        {filters.cities.map((city) => (
                          <CommandItem
                            className="cursor-pointer"
                            key={city}
                            value={city}
                            onSelect={(currentValue: string) => {
                              setSelectedCity(
                                currentValue === selectedCity ? "" : currentValue
                              );
                              setOpenCityCombobox(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCity === city
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Purchase From Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Purchase From
                </label>
                <Select
                  value={selectedPurchaseFrom}
                  onValueChange={(value) =>
                    setSelectedPurchaseFrom(value === "all" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent className="w-full">
                    <SelectItem value="all">All sources</SelectItem>
                    {filters.purchaseFromOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option.replace(/_/g, " ").charAt(0).toUpperCase() +
                          option.replace(/_/g, " ").slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From - Calendar Popover */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date From
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Date To - Calendar Popover */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Date To
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <div className="flex items-end">
                  <Button
                    variant="destructive"
                    size="default"
                    onClick={clearFilters}
                    className="gap-2 w-full"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                {pagination.totalRecords} {pagination.totalRecords<=1 ?"Claim":"Claims"}
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Showing {claims.length} of {pagination.totalRecords} results
              </p>
            </div>

            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <Select
                value={pagination.limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
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
                      Claim ID
                    </th>
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
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                      </td>
                    </tr>
                  ) : claims.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No claims found
                      </td>
                    </tr>
                  ) : (
                    claims.map((claim) => (
                      <tr
                        key={claim.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            {claim.claim_external_id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs text-gray-600">
                            {claim.warranty_external_id}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">
                              {claim.customer_name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {claim.customer_email}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-700">
                            {claim.customer_city}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(
                              claim.claim_status_name
                            )} capitalize`}
                          >
                            {claim.claim_status_name.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(
                            claim.claim_register_date
                          ).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
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
                                `/admin/claims/${claim.claim_external_id}`
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  )
                    .filter((page) => {
                      const current = pagination.currentPage;
                      return (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= current - 1 && page <= current + 1)
                      );
                    })
                    .map((page, index, array) => {
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;

                      return (
                        <>
                          {showEllipsis && (
                            <span
                              key={`ellipsis-${page}`}
                              className="px-3 py-1 text-gray-500"
                            >
                              ...
                            </span>
                          )}
                          <Button
                            key={page}
                            variant={
                              page === pagination.currentPage
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className="w-9"
                          >
                            {page}
                          </Button>
                        </>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
