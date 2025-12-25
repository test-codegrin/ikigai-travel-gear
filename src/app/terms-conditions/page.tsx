"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";


export default function WarrantyTermsPage() {
  return (
    <div className="min-h-screen bg-white">
      

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Title Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12 pb-4 sm:pb-6 border-b">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight">
            IKIGAI TRAVEL GEAR LLP
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-primary font-semibold leading-snug">
            3-Year Domestic Warranty – Terms &amp; Conditions
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-3">
            Last updated: December 25, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Intro */}
          <section className="bg-gray-50 border-l-4 border-primary p-3 sm:p-4 lg:p-6 rounded-r-lg">
            <p className="font-medium text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
              Thank you for choosing IKIGAI Travel Gear LLP.
            </p>
            <p className="text-gray-700 mb-1.5 sm:mb-2 text-sm sm:text-base leading-relaxed">
              This page explains the terms and conditions applicable to the{" "}
              <span className="font-semibold text-gray-900">
                3-Year Domestic Warranty
              </span>{" "}
              offered on select IKIGAI products.
            </p>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              By registering your product, you confirm that you have read,
              understood, and agreed to the terms stated below.
            </p>
          </section>

          {/* 1. Warranty Coverage */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                1
              </span>
              <span className="leading-tight">Warranty Coverage</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  IKIGAI Travel Gear LLP (&quot;Company&quot;) provides a limited domestic
                  warranty for a period of three (3) years from the date of
                  purchase, as mentioned on the purchase invoice, to the
                  original purchaser or first gift recipient (&quot;Customer&quot;).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  This warranty covers manufacturing defects in materials and
                  workmanship only, under normal domestic travel usage.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">This warranty is valid within India only.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  International warranty or service is{" "}
                  <span className="font-semibold">not</span> applicable.
                </span>
              </li>
            </ul>
          </section>

          {/* 2. Warranty Registration */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                2
              </span>
              <span className="leading-tight">Warranty Registration</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Warranty registration is{" "}
                  <span className="font-semibold">mandatory</span> to avail
                  warranty benefits.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Registration must be completed through the official IKIGAI
                  website within the prescribed time after purchase.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Registration does not extend or renew the warranty period.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  The warranty period is calculated strictly from the{" "}
                  <span className="font-semibold">date of purchase</span>, not
                  from the date of registration.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  The Company reserves the right to reject claims for
                  unregistered or improperly registered products.
                </span>
              </li>
            </ul>
          </section>

          {/* 3. What Is Covered */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                3
              </span>
              <span className="leading-tight">What Is Covered</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">Manufacturing defects in materials.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">Manufacturing defects in workmanship.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Structural or functional defects arising under normal usage
                  conditions.
                </span>
              </li>
            </ul>
          </section>

          {/* 4. What Is Not Covered */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                4
              </span>
              <span className="leading-tight">What Is Not Covered</span>
            </h2>
            <p className="ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base leading-relaxed">This warranty does not cover:</p>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Normal wear and tear, including scratches, dents, abrasions,
                  stains, fading, or cosmetic changes.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Damage caused by misuse, abuse, overloading, negligence,
                  accidents, or improper handling.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Damage during airline, rail, road, or third-party transit
                  (claims must be raised directly with the carrier).
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Exposure to water, moisture, extreme temperatures, solvents,
                  acids, or chemicals.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Zip bursts, lining tears, fabric damage, cracks, dents, or
                  impact-related damage.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Loss or theft of the Product, parts, accessories, or contents.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Repairs, alterations, or servicing performed by unauthorized
                  persons or service centers.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Labour charges or incidental expenses incurred without Company
                  approval.
                </span>
              </li>
            </ul>
          </section>

          {/* 5. Warranty Claim Process */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                5
              </span>
              <span className="leading-tight">Warranty Claim Process</span>
            </h2>
            <p className="ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base leading-relaxed">To raise a warranty claim:</p>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">Register your product on the IKIGAI website.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Contact IKIGAI customer support through the official warranty
                  channel.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <div className="leading-relaxed">
                  <span>Submit:</span>
                  <ul className="space-y-1 ml-3 sm:ml-4 mt-1">
                    <li className="flex gap-2">
                      <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">◦</span>
                      <span>Purchase invoice.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">◦</span>
                      <span>Warranty registration details.</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">◦</span>
                      <span>
                        Clear photographs/videos of the Product and defect.
                      </span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Upon approval, send the Product securely packed to the service
                  location communicated by the Company.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  All shipping, packaging, insurance, and applicable taxes shall
                  be borne by the Customer.
                </span>
              </li>
            </ul>
          </section>

          {/* 6. Nature of Remedy */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                6
              </span>
              <span className="leading-tight">Nature of Remedy</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <div className="leading-relaxed">
                  <span>
                    Upon verification, the Company may, at its sole discretion:
                  </span>
                  <ul className="space-y-1 ml-3 sm:ml-4 mt-1">
                    <li className="flex gap-2">
                      <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">◦</span>
                      <span>Repair the defective Product or component, or</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">◦</span>
                      <span>
                        Replace the Product or component with the same or an
                        equivalent model.
                      </span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  If the original model or parts are unavailable, the Company
                  may provide a product of comparable value and specifications.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Cash refunds are <span className="font-semibold">not</span>{" "}
                  provided under this warranty.
                </span>
              </li>
            </ul>
          </section>

          {/* 7. Limitation of Liability */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                7
              </span>
              <span className="leading-tight">Limitation of Liability</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  The Company&apos;s liability under this warranty is strictly
                  limited to repair or replacement only.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Under no circumstances shall the Company&apos;s liability exceed
                  the original invoice value of the Product.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  The Company shall not be liable for any indirect, incidental,
                  or consequential damages, including loss of use, travel
                  inconvenience, or loss of contents.
                </span>
              </li>
            </ul>
          </section>

          {/* 8. Locks and Security Disclaimer */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                8
              </span>
              <span className="leading-tight">Locks and Security Disclaimer</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  All locks, zippers, and security mechanisms are deterrent
                  devices only and cannot guarantee protection against theft,
                  forced entry, or damage by third parties or authorities.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  Customers are advised to inspect the Product immediately after
                  transit or third-party handling.
                </span>
              </li>
            </ul>
          </section>

          {/* 9. Product Modifications */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                9
              </span>
              <span className="leading-tight">Product Modifications</span>
            </h2>
            <p className="ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base leading-relaxed">
              The Company reserves the right to modify product specifications,
              materials, or design without prior notice. Such changes do not
              entitle the Customer to replacement or upgrade.
            </p>
          </section>

          {/* 10. Governing Law and Jurisdiction */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                10
              </span>
              <span className="leading-tight">Governing Law and Jurisdiction</span>
            </h2>
            <ul className="space-y-1.5 sm:space-y-2 ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base">
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  This warranty shall be governed by the laws of India.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary mt-1 sm:mt-1.5 flex-shrink-0">•</span>
                <span className="leading-relaxed">
                  All disputes shall be subject to the exclusive jurisdiction of
                  courts in Rajkot, Gujarat, India.
                </span>
              </li>
            </ul>
          </section>

          {/* 11. Acceptance of Terms */}
          <section className="space-y-2 sm:space-y-3">
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold flex-shrink-0">
                11
              </span>
              <span className="leading-tight">Acceptance of Terms</span>
            </h2>
            <p className="ml-9 sm:ml-10 text-gray-700 text-sm sm:text-base leading-relaxed">
              By registering your Product, you acknowledge and agree to all
              the above terms and conditions. Failure to comply with these
              terms may result in denial of warranty service.
            </p>
          </section>
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-primary/5 border border-primary/20 rounded-lg text-center">
          <p className="text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">
            Ready to register your IKIGAI product?
          </p>
          <Link href="/warranty/register">
            <Button className="bg-primary hover:bg-primary/90 text-sm sm:text-base h-9 sm:h-10 px-4 sm:px-6">
              Register Warranty Now
            </Button>
          </Link>
        </div>
      </main>

    </div>
  );
}
