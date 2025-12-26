"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/warranty/register", label: "Register Warranty" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent) => {
    // If we're already on the home page, scroll to top
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="bg-black text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 lg:h-24">
            {/* Logo */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex items-center flex-shrink-0"
            >
              <img
                src="/ikigai-logo-white.png"
                alt="IKIGAI Travel Gear"
                className="h-6 sm:h-7 lg:h-8 w-auto transition-transform duration-300 "
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm xl:text-base font-medium hover:text-primary transition-colors duration-200 relative group whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
                </Link>
              ))}
            </div>

            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white hover:bg-white/10 h-10 w-10 sm:h-11 sm:w-11 relative group"
              aria-label="Toggle navigation menu"
            >
              {/* Animated Hamburger Icon */}
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex flex-col justify-center items-center">
                <span
                  className={`bg-white block transition-all duration-300 ease-out h-0.5 w-5 sm:w-6 rounded-sm ${
                    isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
                  }`}
                ></span>
                <span
                  className={`bg-white block transition-all duration-300 ease-out h-0.5 w-5 sm:w-6 rounded-sm my-0.5 ${
                    isOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`bg-white block transition-all duration-300 ease-out h-0.5 w-5 sm:w-6 rounded-sm ${
                    isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
                  }`}
                ></span>
              </div>
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Shutter/Dropdown Style */}
      <div
        className={`lg:hidden fixed left-0 right-0 bg-black text-white z-40 overflow-hidden transition-all duration-500 ease-in-out shadow-2xl ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          top: "var(--navbar-height, 64px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-6">
          {/* Menu Links with Simple Dividers */}
          <nav className="flex flex-col">
            {navLinks.map((link, index) => (
              <div key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg sm:text-xl font-medium text-white hover:text-primary transition-all duration-300 py-5 transform ${
                    isOpen
                      ? "translate-y-0 opacity-100"
                      : "-translate-y-4 opacity-0"
                  }`}
                  style={{
                    transitionDelay: isOpen ? `${(index + 1) * 100}ms` : "0ms",
                  }}
                >
                  {link.label}
                </Link>
                {/* Simple Divider Line */}
                {index < navLinks.length - 1 && (
                  <div className="h-px bg-white/20" />
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          style={{
            top: "var(--navbar-height, 64px)",
          }}
        />
      )}
    </>
  );
}
