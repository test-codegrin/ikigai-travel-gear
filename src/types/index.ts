export interface Customer {
  id: number;
  name: string;
  email: string;
  mobile: string;
  is_deleted: boolean;
  created_at: Date;
}

export interface Warranty {
  id: number;
  external_id: string | null;
  customer_id: number;
  purchase_date: Date;
  invoice_file_url: string | null;
  warranty_card_number: string | null;
  warranty_card_file_url: string | null;
  product_description: string;
  serial_number: string | null;
  warranty_status_id: number;
  registration_date: Date;
  is_deleted: boolean;
}

export interface WarrantyStatus {
  id: number;
  name: string;
  description: string | null;
  is_deleted: boolean;
}

export interface Claim {
  id: number;
  warranty_id: number;
  claim_date: Date;
  defect_description: string;
  photos_json: string[] | null;
  claim_status_id: number;
  admin_notes: string | null;
  assigned_admin_id: number | null;
  service_location: string | null;
  is_deleted: boolean;
}

export interface ClaimStatus {
  id: number;
  name: string;
  description: string | null;
  is_deleted: boolean;
}

export interface Admin {
  id: number;
  email: string;
  name: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface WarrantyFormData {
  name: string;
  email: string;
  mobile: string;
  purchase_date: string;
  product_description: string;
  serial_number?: string;
  warranty_card_number?: string;
  invoice_file: File;
  warranty_card_file: File;
}
