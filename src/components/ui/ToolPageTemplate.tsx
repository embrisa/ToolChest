import React from "react";
import { ToolPageLayout } from "./ToolPageLayout";
import { ToolPageHero } from "./ToolPageHero";
import { PrivacyBadge } from "./PrivacyBadge";
import { FeatureGrid, FeatureGridProps } from "./FeatureGrid";
import { ToolInfoSection, ToolInfoSectionProps } from "./ToolInfoSection";

export interface ToolPageTemplateProps {
    // Hero section props
    title: string;
    description: React.ReactNode;
    icon?: React.ReactNode;
    iconText?: string;
    iconClassName?: string;
    titleClassName?: string;

    // Privacy badge props
    privacyMessage?: string;
    privacyColors?: {
        iconColor?: string;
        textColor?: string;
        borderColor?: string;
    };

    // Feature grid (optional)
    featureGrid?: Omit<FeatureGridProps, "animationDelay">;

    // Tool component
    children: React.ReactNode;

    // Info section (optional)
    infoSection?: Omit<ToolInfoSectionProps, "animationDelay">;

    // Layout props
    className?: string;
}

export function ToolPageTemplate({
    title,
    description,
    icon,
    iconText,
    iconClassName,
    titleClassName,
    privacyMessage,
    privacyColors,
    featureGrid,
    children,
    infoSection,
    className,
}: ToolPageTemplateProps) {
    return (
        <ToolPageLayout className={className}>
            {/* Hero Section */}
            <ToolPageHero
                title={title}
                description={description}
                icon={icon}
                iconText={iconText}
                iconClassName={iconClassName}
                titleClassName={titleClassName}
            />

            {/* Privacy Badge */}
            <PrivacyBadge
                message={privacyMessage}
                iconColor={privacyColors?.iconColor}
                textColor={privacyColors?.textColor}
                borderColor={privacyColors?.borderColor}
            />

            {/* Feature Grid (if provided) */}
            {featureGrid && (
                <FeatureGrid
                    {...featureGrid}
                    animationDelay="0.4s"
                />
            )}

            {/* Tool Component */}
            <div
                className="animate-fade-in-up"
                style={{ animationDelay: featureGrid ? "0.6s" : "0.4s" }}
            >
                {children}
            </div>

            {/* Information Section (if provided) */}
            {infoSection && (
                <ToolInfoSection
                    {...infoSection}
                    animationDelay={featureGrid ? "0.8s" : "0.6s"}
                />
            )}
        </ToolPageLayout>
    );
} 