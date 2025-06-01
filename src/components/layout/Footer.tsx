import React from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/solid";
import { CodeBracketIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { cn } from "@/utils";

export interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/cookies", label: "Cookie Policy" },
      ]
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/blog", label: "Blog" },
      ]
    },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Documentation" },
        { href: "/api", label: "API Reference" },
        { href: "/changelog", label: "Changelog" },
      ]
    }
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Privacy First",
      description: "All processing happens in your browser"
    },
    {
      icon: CodeBracketIcon,
      title: "Modern & Fast",
      description: "Built with cutting-edge web technologies"
    },
    {
      icon: SparklesIcon,
      title: "Always Free",
      description: "Essential tools accessible to everyone"
    }
  ];

  return (
    <footer
      className={cn(
        // Enhanced background hierarchy
        "bg-neutral-50 border-t border-neutral-150 mt-auto",
        className
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-wide">
        {/* Main footer content with improved spacing */}
        <div className="py-12 lg:py-16">
          {/* Brand section with enhanced layout */}
          <div className="mb-12 lg:mb-16 text-center">
            <div className="mb-6">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center text-3xl lg:text-4xl font-bold",
                  "text-primary hover:text-brand-600 transition-all duration-200",
                  "py-2 px-2 -mx-2 rounded-lg",
                  "hover:scale-105 hover:bg-neutral-25/80",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                )}
                aria-label="tool-chest home"
              >
                <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  &lt;tool-chest&gt;
                </span>
              </Link>
            </div>
            <p className={cn(
              "text-lg text-secondary leading-relaxed max-w-2xl mx-auto",
              "mb-8"
            )}>
              Essential utility tools for everyday tasks.
              Crafted with modern web technologies, focusing on privacy, accessibility, and performance.
            </p>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex flex-col items-center text-center p-6",
                    "bg-neutral-25 rounded-lg border border-neutral-200",
                    "hover:bg-neutral-0 hover:shadow-soft transition-all duration-200"
                  )}
                >
                  <feature.icon
                    className="h-8 w-8 text-brand-600 mb-3"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-semibold text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-secondary">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation links with improved organization */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {footerLinks.map((section, index) => (
              <div key={index} className="text-center sm:text-left">
                <h3 className={cn(
                  "text-sm font-semibold text-primary uppercase tracking-wider",
                  "mb-4 lg:mb-6"
                )}>
                  {section.title}
                </h3>
                <nav aria-label={`${section.title} links`}>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className={cn(
                            "text-secondary hover:text-brand-600 transition-colors duration-200",
                            "text-sm py-1 px-2 -mx-2 rounded",
                            "hover:bg-neutral-25",
                            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset"
                          )}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Copyright section with enhanced styling */}
        <div className={cn(
          "py-6 lg:py-8 border-t border-neutral-200",
          "flex flex-col sm:flex-row items-center justify-between gap-4"
        )}>
          <div className="flex items-center gap-2 text-sm text-secondary">
            <span>&copy; {currentYear} tool-chest. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-secondary">
            <span>Made with</span>
            <HeartIcon
              className="h-4 w-4 text-error-500 animate-pulse-gentle"
              aria-label="love"
            />
            <span>and passion</span>
          </div>
        </div>

        {/* Additional footer info */}
        <div className={cn(
          "py-4 border-t border-neutral-150",
          "text-center text-xs text-muted"
        )}>
          <p>
            This site uses modern web technologies and follows best practices for
            <Link
              href="/accessibility"
              className="ml-1 text-brand-600 hover:text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset rounded"
            >
              accessibility
            </Link>,
            <Link
              href="/privacy"
              className="ml-1 text-brand-600 hover:text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset rounded"
            >
              privacy
            </Link>, and
            <Link
              href="/performance"
              className="ml-1 text-brand-600 hover:text-brand-700 underline focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-inset rounded"
            >
              performance
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
