"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { cn } from "@/utils";

export interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

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
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      router.push("/");
      return;
    }

    const query = encodeURIComponent(trimmed);
    router.push(`/?query=${query}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header
        role="banner"
        className={cn(
          // Enhanced background hierarchy following design philosophy
          "sticky top-0 z-50 w-full transition-all duration-300",
          "bg-background-tertiary/95 backdrop-blur-lg border-b border-border-secondary",
          // Enhanced shadow system from design tokens
          isScrolled && "shadow-medium bg-background-tertiary/98",
          className,
        )}
      >
        <div className="container-wide py-3">
          <nav
            className="flex items-center justify-between h-16 lg:h-18"
            aria-label="Main navigation"
          >
            {/* Logo with enhanced brand typography and accessibility */}
            <Link
              href="/"
              className={cn(
                // Enhanced brand typography following design philosophy
                "flex items-center text-2xl sm:text-3xl lg:text-4xl font-bold",
                "text-primary hover:text-brand-600 transition-all duration-200",
                // Improved touch targets (generous 52px minimum)
                "touch-target-generous rounded-lg",
                // Enhanced hover states with proper spacing
                "hover:scale-105 hover:bg-background-secondary/80",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              )}
              aria-label="tool-chest home - Navigate to homepage"
            >
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                &lt;tool-chest&gt;
              </span>
            </Link>

            {/* Desktop Navigation with enhanced layout */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Enhanced Search Bar with improved contrast */}
              <div className="relative">
                <label htmlFor="header-search" className="sr-only">
                  Search tools and utilities across all categories
                </label>
                <input
                  id="header-search"
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search tools…"
                  className={cn(
                    // Enhanced contrast and spacing following design philosophy
                    "w-64 xl:w-80 pl-12 pr-4 py-4 text-base",
                    "input-field",
                    // Improved responsive behavior
                    "focus:w-72 xl:focus:w-96",
                    "transition-all duration-300 ease-out",
                  )}
                  autoComplete="off"
                  aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">
                  Type to search through available tools and utilities
                </div>
                <MagnifyingGlassIcon
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-foreground-secondary pointer-events-none"
                  aria-hidden="true"
                />
              </div>

              {/* Desktop Navigation Links with improved spacing */}
              <nav
                className="flex items-center space-x-6"
                aria-label="Main site navigation"
              >
                <Link
                  href="/tools"
                  className={cn(
                    "btn-secondary text-base font-medium",
                    "hover:bg-background-secondary hover:text-brand-600",
                  )}
                >
                  All Tools
                </Link>
                <Link
                  href="/about"
                  className={cn(
                    "btn-secondary text-base font-medium",
                    "hover:bg-background-secondary hover:text-brand-600",
                  )}
                >
                  About
                </Link>
              </nav>
            </div>

            {/* Mobile Controls with enhanced touch targets */}
            <div className="flex items-center space-x-4 lg:hidden">
              {/* Mobile Search Button */}
              <button
                className={cn(
                  // Enhanced touch targets following design philosophy
                  "touch-target-comfortable rounded-lg transition-all duration-200",
                  "text-foreground-secondary hover:text-primary hover:bg-background-secondary",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                )}
                aria-label="Open search dialog"
                aria-describedby="mobile-search-help"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
                <div id="mobile-search-help" className="sr-only">
                  Opens search interface for finding tools
                </div>
              </button>

              {/* Mobile Menu Button with enhanced accessibility */}
              <button
                onClick={toggleMobileMenu}
                className={cn(
                  // Enhanced touch targets and accessibility
                  "touch-target-comfortable rounded-lg transition-all duration-200",
                  "text-foreground-secondary hover:text-primary hover:bg-background-secondary",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                )}
                aria-label={
                  isMobileMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-expanded={isMobileMenuOpen}
                aria-controls="mobile-menu"
                aria-describedby="mobile-menu-help"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
                <div id="mobile-menu-help" className="sr-only">
                  {isMobileMenuOpen
                    ? "Closes the mobile navigation menu"
                    : "Opens mobile navigation with all site links"}
                </div>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Menu Overlay with enhanced accessibility */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" aria-hidden="true">
          {/* Background overlay with improved backdrop */}
          <div
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />

          {/* Mobile menu panel with enhanced design philosophy */}
          <div
            id="mobile-menu"
            className={cn(
              "fixed top-16 lg:top-18 inset-x-0 z-50",
              "bg-background-tertiary border-b border-border-secondary",
              "shadow-large animate-fade-in-down",
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            <div className="container-wide py-6">
              {/* Mobile Search with improved spacing */}
              <div className="mb-8">
                <label
                  htmlFor="mobile-search"
                  className="block text-sm font-medium text-primary mb-3"
                >
                  Search Tools
                </label>
                <div className="relative">
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder="Search tools and utilities…"
                    className={cn("input-field text-lg py-4", "w-full pl-12")}
                    autoComplete="off"
                    aria-describedby="mobile-search-description"
                  />
                  <div id="mobile-search-description" className="sr-only">
                    Search through all available tools and utilities
                  </div>
                  <MagnifyingGlassIcon
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-foreground-secondary pointer-events-none"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Mobile Navigation Links with enhanced spacing */}
              <nav aria-label="Mobile site navigation">
                <div className="space-y-4">
                  <Link
                    href="/tools"
                    className={cn(
                      "card-interactive flex items-center justify-between",
                      "px-6 py-4 text-lg font-medium rounded-lg",
                      "text-primary hover:text-brand-600",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                    )}
                    onClick={toggleMobileMenu}
                  >
                    <span>All Tools</span>
                    <span className="text-foreground-secondary text-sm">
                      Browse collection
                    </span>
                  </Link>
                  <Link
                    href="/about"
                    className={cn(
                      "card-interactive flex items-center justify-between",
                      "px-6 py-4 text-lg font-medium rounded-lg",
                      "text-primary hover:text-brand-600",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                    )}
                    onClick={toggleMobileMenu}
                  >
                    <span>About</span>
                    <span className="text-foreground-secondary text-sm">
                      Learn more
                    </span>
                  </Link>
                </div>
              </nav>

              {/* Mobile menu footer with additional context */}
              <div className="mt-8 pt-6 border-t border-border-secondary">
                <p className="text-sm text-foreground-secondary text-center">
                  Essential tools for everyday computing tasks
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
