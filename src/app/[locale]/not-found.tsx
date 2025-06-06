"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui";
import {
  MagnifyingGlassIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function NotFound() {
  const t = useTranslations("pages.error.notFound");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Code and Icon */}
        <div className="mb-8 animate-fade-in-up">
          <div
            className="text-6xl sm:text-7xl md:text-8xl font-bold text-gradient-brand mb-6"
            aria-hidden="true"
          >
            {t("errorCode")}
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-800/30 rounded-2xl flex items-center justify-center shadow-soft animate-float">
              <MagnifyingGlassIcon
                className="w-12 h-12 text-brand-500 dark:text-brand-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div
          className="mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <h1 className="text-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
            {t("title")}
          </h1>
          <p className="text-body text-lg text-foreground-secondary mb-8 max-w-lg mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Suggestions */}
        <div
          className="mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-heading text-xl font-semibold text-foreground mb-6">
            {t("suggestions.title")}
          </h2>
          <ul className="text-left space-y-4 text-foreground-secondary max-w-md mx-auto">
            <li className="flex items-start group">
              <span
                className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-brand-600 transition-all duration-200 group-hover:scale-125"
                aria-hidden="true"
              ></span>
              <span className="text-body group-hover:text-foreground transition-colors duration-200">
                {t("suggestions.checkUrl")}
              </span>
            </li>
            <li className="flex items-start group">
              <span
                className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-brand-600 transition-all duration-200 group-hover:scale-125"
                aria-hidden="true"
              ></span>
              <span className="text-body group-hover:text-foreground transition-colors duration-200">
                {t("suggestions.useNavigation")}
              </span>
            </li>
            <li className="flex items-start group">
              <span
                className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-brand-600 transition-all duration-200 group-hover:scale-125"
                aria-hidden="true"
              ></span>
              <span className="text-body group-hover:text-foreground transition-colors duration-200">
                {t("suggestions.returnHome")}
              </span>
            </li>
            <li className="flex items-start group">
              <span
                className="inline-block w-2 h-2 bg-brand-500 rounded-full mt-2.5 mr-4 flex-shrink-0 group-hover:bg-brand-600 transition-all duration-200 group-hover:scale-125"
                aria-hidden="true"
              ></span>
              <span className="text-body group-hover:text-foreground transition-colors duration-200">
                {t("suggestions.searchTools")}
              </span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto focus-ring"
            >
              <HomeIcon className="w-5 h-5 mr-2" aria-hidden="true" />
              {t("actions.goToHome")}
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            className="w-full sm:w-auto focus-ring"
            onClick={() => window.history.back()}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" aria-hidden="true" />
            {t("actions.goBack")}
          </Button>
        </div>

        {/* Popular Tools Section */}
        <div
          className="border-t border-border pt-10 animate-fade-in-up"
          style={{ animationDelay: "0.4s" }}
        >
          <h2 className="text-heading text-lg font-semibold text-foreground mb-6">
            {t("popularTools.title")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link
              href="/tools/base64"
              className="card-interactive p-6 group focus-ring"
            >
              <div className="flex items-start space-x-4">
                <div className="tool-icon tool-icon-base64 w-10 h-10 text-sm group-hover:scale-110 transition-transform duration-200">
                  B64
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-200">
                    {t("popularTools.base64.title")}
                  </div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    {t("popularTools.base64.description")}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/tools/hash-generator"
              className="card-interactive p-6 group focus-ring"
            >
              <div className="flex items-start space-x-4">
                <div className="tool-icon tool-icon-hash w-10 h-10 text-sm group-hover:scale-110 transition-transform duration-200">
                  #
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors duration-200">
                    {t("popularTools.hashGenerator.title")}
                  </div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    {t("popularTools.hashGenerator.description")}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/tools/favicon-generator"
              className="card-interactive p-6 group focus-ring"
            >
              <div className="flex items-start space-x-4">
                <div className="tool-icon tool-icon-favicon w-10 h-10 text-sm group-hover:scale-110 transition-transform duration-200">
                  ⭐
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground group-hover:text-success-600 dark:group-hover:text-success-400 transition-colors duration-200">
                    {t("popularTools.faviconGenerator.title")}
                  </div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    {t("popularTools.faviconGenerator.description")}
                  </div>
                </div>
              </div>
            </Link>
            <Link
              href="/tools/markdown-to-pdf"
              className="card-interactive p-6 group focus-ring"
            >
              <div className="flex items-start space-x-4">
                <div className="tool-icon tool-icon-markdown w-10 h-10 text-sm group-hover:scale-110 transition-transform duration-200">
                  MD
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-foreground group-hover:text-warning-600 dark:group-hover:text-warning-400 transition-colors duration-200">
                    {t("popularTools.markdownToPdf.title")}
                  </div>
                  <div className="text-sm text-foreground-secondary mt-1">
                    {t("popularTools.markdownToPdf.description")}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Contact Support */}
        <div
          className="mt-10 pt-6 border-t border-border animate-fade-in-up"
          style={{ animationDelay: "0.5s" }}
        >
          <p className="text-sm text-foreground-secondary">
            {t("contact.prompt")}{" "}
            <a
              href="mailto:support@tool-chest.com"
              className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 underline focus-ring rounded-sm transition-colors duration-200"
            >
              {t("contact.link")}
            </a>
          </p>
        </div>

        {/* Screen Reader Announcement */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {t("screenReader.announcement")}
        </div>
      </div>
    </div>
  );
}
