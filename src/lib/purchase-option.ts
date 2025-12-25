export interface PurchaseOption {
  value: string;
  label: string;
}

export const purchaseFromOptions: PurchaseOption[] = [
  { value: "official_website", label: "Official Website" },
  { value: "official_store", label: "Official Store" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "meesho", label: "Meesho" },
  { value: "other", label: "Other" },
];
