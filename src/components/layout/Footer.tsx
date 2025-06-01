import React from "react";
import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/solid";
import {
  CodeBracketIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
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
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/about", label: "About Us" },
        { href: "/contact", label: "Contact" },
        { href: "/blog", label: "Blog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { href: "/docs", label: "Documentation" },
        { href: "/api", label: "API Reference" },
        { href: "/changelog", label: "Changelog" },
      ],
    },
  ];

  const features = [
    {
      icon: ShieldCheckIcon,
      title: "Privacy First",
      description: "All processing happens in your browser when possible",
    },
    {
      icon: CodeBracketIcon,
      title: "Modern & Fast",
      description:
        "Built with cutting-edge web technologies for optimal performance",
    },
    {
      icon: SparklesIcon,
      title: "Always Free",
      description: "Essential tools accessible to everyone, everywhere",
    },
  ];

  return (
    <footer
      className={cn(
        // Enhanced background hierarchy following design philosophy
        "bg-background-secondary border-t border-border mt-auto",
        className,
      )}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container-wide">
        {/* Main footer content with enhanced spacing following 8px grid */}
        <div className="section-spacing-lg">
          {/* Brand section with enhanced layout and spacing */}
          <div className="mb-16 lg:mb-20 text-center">
            <div className="mb-8">
              <Link
                href="/"
                className={cn(
                  "inline-flex items-center text-4xl lg:text-5xl font-bold",
                  "text-primary hover:text-brand-600 transition-all duration-200",
                  // Enhanced touch targets following design philosophy
                  "touch-target-generous rounded-lg",
                  "hover:scale-105 hover:bg-background-tertiary/80",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                )}
                aria-label="tool-chest home - Navigate to homepage"
              >
                <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                  &lt;tool-chest&gt;
                </span>
              </Link>
            </div>
            <div className="mb-12">
              <h2 className="text-xl lg:text-2xl font-semibold text-primary mb-4">
                Essential utility tools for everyday tasks
              </h2>
              <p
                className={cn(
                  "text-lg text-foreground-secondary leading-relaxed max-w-3xl mx-auto",
                )}
              >
                Crafted with modern web technologies, focusing on privacy,
                accessibility, and performance. All tools work entirely in your
                browser for maximum security and speed.
              </p>
            </div>

            {/* Feature highlights with enhanced card design */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={cn(
                    "card text-center p-8",
                    "hover:shadow-medium hover:scale-105 transition-all duration-200",
                  )}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                      <feature.icon className="h-8 w-8" aria-hidden="true" />
                    </div>
                  </div>
                  <h3 className="text-base font-semibold text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation links with improved organization and spacing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
            {footerLinks.map((section, index) => (
              <div key={index} className="text-center sm:text-left">
                <h3
                  className={cn(
                    "text-sm font-semibold text-primary uppercase tracking-wider",
                    "mb-6 lg:mb-8",
                  )}
                >
                  {section.title}
                </h3>
                <nav aria-label={`${section.title} links`}>
                  <ul className="space-y-4">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link
                          href={link.href}
                          className={cn(
                            "text-foreground-secondary hover:text-brand-600 transition-colors duration-200",
                            "text-base py-2 px-3 -mx-3 rounded-lg",
                            "hover:bg-background-tertiary",
                            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
                            "inline-block",
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

        {/* Copyright section with enhanced styling and spacing */}
        <div
          className={cn(
            "section-spacing-sm border-t border-border",
            "flex flex-col sm:flex-row items-center justify-between gap-6",
          )}
        >
          <div className="flex items-center gap-2 text-base text-foreground-secondary">
            <span>&copy; {currentYear} tool-chest. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-2 text-base text-foreground-secondary">
            <span>Made with</span>
            <HeartIcon
              className="h-5 w-5 text-error-500 animate-pulse-gentle"
              aria-label="love"
            />
            <span>and passion for great tools</span>
          </div>
        </div>

        {/* Enhanced footer info with better accessibility context */}
        <div
          className={cn("py-6 border-t border-border-secondary", "text-center")}
        >
          <p className="text-sm text-foreground-tertiary leading-relaxed max-w-4xl mx-auto">
            This site follows modern web standards and best practices for
            <Link
              href="/accessibility"
              className="ml-1 text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset rounded px-1"
            >
              accessibility (WCAG 2.1 AA)
            </Link>
            ,
            <Link
              href="/privacy"
              className="ml-1 text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset rounded px-1"
            >
              privacy protection
            </Link>
            , and
            <Link
              href="/performance"
              className="ml-1 text-brand-600 hover:text-brand-700 underline underline-offset-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset rounded px-1"
            >
              optimal performance
            </Link>
            . Built to serve the global community of developers and digital
            professionals.
          </p>
        </div>
      </div>
    </footer>
  );
}
