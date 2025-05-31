'use client';

import { Base64Progress } from '@/types/tools/base64';

interface ProgressIndicatorProps {
    progress: Base64Progress;
    label?: string;
    className?: string;
}

export function ProgressIndicator({ progress, label = 'Processing', className = '' }: ProgressIndicatorProps) {
    const { stage, progress: percent, bytesProcessed, totalBytes, estimatedTimeRemaining } = progress;

    const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getStageLabel = (stage: string): string => {
        switch (stage) {
            case 'reading': return 'Reading file';
            case 'processing': return 'Processing data';
            case 'complete': return 'Complete';
            default: return 'Processing';
        }
    };

    const formatTimeRemaining = (seconds?: number): string => {
        if (!seconds || seconds <= 0) return '';
        if (seconds < 60) return `${Math.round(seconds)}s remaining`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.round(seconds % 60);
        return `${minutes}m ${remainingSeconds}s remaining`;
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Screen reader friendly progress announcement */}
            <div className="sr-only" role="status" aria-live="polite">
                {label}: {percent}% complete. {getStageLabel(stage)}.
                {estimatedTimeRemaining ? ` ${formatTimeRemaining(estimatedTimeRemaining)}` : ''}
            </div>

            {/* Visual progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-gray-700">{getStageLabel(stage)}</span>
                    <span className="text-gray-500">{Math.round(percent)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2" role="progressbar"
                    aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}
                    aria-label={`${label} progress`}>
                    <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${percent}%` }}
                    />
                </div>

                {/* Progress details */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                        {formatBytes(bytesProcessed)} / {formatBytes(totalBytes)}
                    </span>
                    {estimatedTimeRemaining && estimatedTimeRemaining > 1 && (
                        <span>{formatTimeRemaining(estimatedTimeRemaining)}</span>
                    )}
                </div>
            </div>
        </div>
    );
} 