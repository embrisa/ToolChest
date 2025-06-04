import React from "react";
import { cn } from "@/utils";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";

export interface InfoListItem {
  text: string;
  icon?: React.ReactNode;
}

export interface InfoSection {
  title: string;
  items: InfoListItem[];
  className?: string;
  titleIcon?: {
    color: string;
    className?: string;
  };
}

export interface ToolInfoSectionProps {
  title: string;
  description: string;
  sections: InfoSection[];
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  animationDelay?: string;
}

const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

export function ToolInfoSection({
  title,
  description,
  sections,
  icon,
  iconBg = "bg-gradient-to-br from-brand-500 to-brand-600",
  className,
  animationDelay = "0.6s",
}: ToolInfoSectionProps) {
  return (
    <div
      className={cn("mt-16 animate-fade-in-up", className)}
      style={{ animationDelay }}
    >
      <Card variant="elevated" padding="lg" className="space-y-8">
        <CardHeader className="pb-8">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                iconBg,
              )}
            >
              {icon || (
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <CardTitle as="h2" className="text-2xl mb-0">
              {title}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <p className="text-lg text-foreground-secondary leading-relaxed">
            {description}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      section.titleIcon?.color || "bg-brand-500",
                      section.titleIcon?.className,
                    )}
                  />
                  {section.title}
                </h3>
                <div className={cn("space-y-3", section.className)}>
                  <ul className="space-y-3 text-foreground-secondary">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        {item.icon || <CheckIcon />}
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
