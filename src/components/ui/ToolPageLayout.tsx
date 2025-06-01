import React from "react";
import { cn } from "@/utils";

export interface ToolPageLayoutProps {
    children: React.ReactNode;
    className?: string;
}

export function ToolPageLayout({ children, className }: ToolPageLayoutProps) {
    return (
        <main
            className={cn(
                "min-h-screen bg-background relative overflow-hidden",
                className
            )}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-mesh opacity-30 dark:opacity-20" />
            <div className="absolute inset-0 bg-noise" />

            <div className="relative">
                <div className="container-wide py-8 sm:py-12">{children}</div>
            </div>
        </main>
    );
} 