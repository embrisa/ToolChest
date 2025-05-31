import React, { HTMLAttributes } from 'react';
import { cn } from '@/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'outlined' | 'elevated';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

const cardVariants = {
    default: 'bg-white border border-gray-200',
    outlined: 'bg-white border-2 border-gray-300',
    elevated: 'bg-white shadow-lg border border-gray-100'
};

const cardPadding = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
};

export function Card({
    className,
    variant = 'default',
    padding = 'md',
    children,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                // Base styles
                'rounded-lg',
                // Variant styles
                cardVariants[variant],
                // Padding styles
                cardPadding[padding],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
    return (
        <div
            className={cn('border-b border-gray-200 pb-3 mb-4', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function CardTitle({
    className,
    children,
    as: Component = 'h3',
    ...props
}: CardTitleProps) {
    return (
        <Component
            className={cn('text-lg font-semibold text-gray-900', className)}
            {...props}
        >
            {children}
        </Component>
    );
}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardContent({ className, children, ...props }: CardContentProps) {
    return (
        <div
            className={cn('text-gray-700', className)}
            {...props}
        >
            {children}
        </div>
    );
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
    return (
        <div
            className={cn('border-t border-gray-200 pt-3 mt-4', className)}
            {...props}
        >
            {children}
        </div>
    );
} 