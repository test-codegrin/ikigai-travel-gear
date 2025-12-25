// lib/country-codes.ts
export interface CountryCode {
  code: string;
  flag: string;
  country: string;
}

export const countryCodes: CountryCode[] = [
  { code: "+91", flag: "IN", country: "India" },
  { code: "+1", flag: "US", country: "USA" },
  { code: "+44", flag: "GB", country: "UK" },
  { code: "+971", flag: "AE", country: "UAE" },
  { code: "+65", flag: "SG", country: "Singapore" },
  { code: "+61", flag: "AU", country: "Australia" },
  { code: "+81", flag: "JP", country: "Japan" },
  { code: "+86", flag: "CN", country: "China" },
  { code: "+49", flag: "DE", country: "Germany" },
  { code: "+33", flag: "FR", country: "France" },
];
