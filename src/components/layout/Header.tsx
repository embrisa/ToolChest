'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { cn } from '@/utils';

export interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        // TODO: Implement search functionality in Phase 3
    };

    return (
        <nav
            className={cn(
                'sticky top-0 z-50 transition-all duration-300',
                'bg-white/80 backdrop-blur-md border-b border-gray-200/50',
                isScrolled && 'bg-white/95 shadow-sm',
                className
            )}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4 lg:py-5">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl lg:text-3xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
                >
                    &lt;tool-chest&gt;
                </Link>

                <div className="flex items-center space-x-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search tools…"
                            className={cn(
                                'w-64 lg:w-80 pl-10 pr-4 py-3 rounded-2xl text-sm',
                                'bg-gray-50 border border-gray-200',
                                'transition-all duration-300',
                                'focus:w-96 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                                'focus:outline-none'
                            )}
                            autoComplete="off"
                            aria-label="Search tools"
                        />
                        <MagnifyingGlassIcon
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                            aria-hidden="true"
                        />
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        aria-label="Open navigation menu"
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
} 