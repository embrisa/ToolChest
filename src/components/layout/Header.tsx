"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MagnifyingGlassIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

import { cn } from "@/utils";

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // TODO: Implement search functionality in Phase 3
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        role="banner"
        className={cn(
          // Enhanced background hierarchy and spacing
          "sticky top-0 z-50 w-full transition-all duration-300",
          "bg-neutral-25/95 backdrop-blur-lg border-b border-neutral-150",
          // Enhanced shadow system
          isScrolled && "shadow-medium bg-neutral-25/98",
          className,
        )}
      >
        <div className="container-wide">
          <nav
            className="flex items-center justify-between h-16 sm:h-18 lg:h-20"
            aria-label="Main navigation"
          >
            {/* Logo with improved accessibility */}
            <Link
              href="/"
              className={cn(
                // Enhanced brand typography and spacing
                "flex items-center text-2xl sm:text-3xl font-bold",
                "text-primary hover:text-brand-600 transition-all duration-200",
                // Improved touch targets (minimum 44px)
                "py-2 px-1 -ml-1 rounded-lg",
                // Enhanced hover states
                "hover:scale-105 hover:bg-neutral-50/80",
                "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              )}
              aria-label="tool-chest home"
            >
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                &lt;tool-chest&gt;
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {/* Enhanced Search Bar */}
              <div className="relative">
                <label htmlFor="header-search" className="sr-only">
                  Search tools and utilities
                </label>
                <input
                  id="header-search"
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search tools…"
                  className={cn(
                    // Enhanced contrast and backgrounds
                    "w-64 xl:w-80 pl-11 pr-4 py-3 text-sm",
                    "bg-neutral-50 border border-neutral-200 rounded-lg",
                    "text-primary placeholder:text-neutral-400",
                    // Improved focus states
                    "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                    "focus:bg-neutral-25 focus:w-72 xl:focus:w-96",
                    "transition-all duration-300 ease-out"
                  )}
                  autoComplete="off"
                />
                <MagnifyingGlassIcon
                  className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none"
                  aria-hidden="true"
                />
              </div>


            </div>

            {/* Mobile Controls */}
            <div className="flex items-center space-x-3 lg:hidden">
              {/* Mobile Search Button */}
              <button
                className={cn(
                  // Enhanced touch targets and spacing
                  "p-3 rounded-lg transition-all duration-200",
                  "text-secondary hover:text-primary hover:bg-neutral-50",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                  // Minimum touch target size
                  "min-h-[44px] min-w-[44px] flex items-center justify-center"
                )}
                aria-label="Search tools"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>



              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  // Enhanced touch targets and accessibility
                  "p-3 rounded-lg transition-all duration-200",
                  "text-secondary hover:text-primary hover:bg-neutral-50",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                  // Minimum touch target size
                  "min-h-[44px] min-w-[44px] flex items-center justify-center"
                )}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          aria-hidden="true"
        >
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />

          {/* Mobile menu panel */}
          <div
            id="mobile-menu"
            className={cn(
              "fixed top-16 sm:top-18 inset-x-0 z-50",
              "bg-neutral-25 border-b border-neutral-150",
              "shadow-large animate-fade-in-down"
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="container-wide py-6">
              {/* Mobile Search */}
              <div className="mb-6">
                <label htmlFor="mobile-search" className="sr-only">
                  Search tools and utilities
                </label>
                <div className="relative">
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tools…"
                    className={cn(
                      "w-full pl-11 pr-4 py-4 text-base",
                      "bg-neutral-50 border border-neutral-200 rounded-lg",
                      "text-primary placeholder:text-neutral-400",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500",
                      "focus:bg-neutral-25"
                    )}
                    autoComplete="off"
                  />
                  <MagnifyingGlassIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Mobile Navigation Links */}
              <nav aria-label="Mobile navigation">
                <div className="space-y-2">
                  <Link
                    href="/tools"
                    className={cn(
                      "block px-4 py-4 text-base font-medium rounded-lg",
                      "text-primary hover:text-brand-600 hover:bg-neutral-50",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    All Tools
                  </Link>
                  <Link
                    href="/about"
                    className={cn(
                      "block px-4 py-4 text-base font-medium rounded-lg",
                      "text-primary hover:text-brand-600 hover:bg-neutral-50",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
                    )}
                    onClick={toggleMobileMenu}
                  >
                    About
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
