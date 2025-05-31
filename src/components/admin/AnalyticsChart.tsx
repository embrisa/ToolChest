'use client';

import React from 'react';
import type { AnalyticsChartProps } from '@/types/admin/analytics';

export function AnalyticsChart({
    chart,
    className = '',
    height = 300,
    interactive = true,
    onDataPointClick,
}: AnalyticsChartProps) {
    const maxValue = Math.max(...chart.data.map(d => d.value));

    const handleDataPointClick = (dataPoint: any) => {
        if (interactive && onDataPointClick) {
            onDataPointClick(dataPoint);
        }
    };

    const renderLineChart = () => (
        <div className="relative" style={{ height }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                className="border border-gray-200 rounded-lg bg-white"
                role="img"
                aria-label={`Line chart: ${chart.title}`}
            >
                <title>{chart.title}</title>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line
                        key={i}
                        x1="40"
                        y1={50 + i * 50}
                        x2="380"
                        y2={50 + i * 50}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                    />
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                    <text
                        key={i}
                        x="35"
                        y={55 + i * 50}
                        textAnchor="end"
                        fontSize="12"
                        fill="#6b7280"
                    >
                        {Math.round(maxValue - (i * maxValue / 4))}
                    </text>
                ))}

                {/* Line path */}
                {chart.data.length > 1 && (
                    <path
                        d={chart.data.map((point, index) => {
                            const x = 40 + (index * (340 / (chart.data.length - 1)));
                            const y = 250 - ((point.value / maxValue) * 200);
                            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke={chart.options?.colors?.[0] || '#3B82F6'}
                        strokeWidth="2"
                    />
                )}

                {/* Data points */}
                {chart.data.map((point, index) => {
                    const x = 40 + (index * (340 / Math.max(chart.data.length - 1, 1)));
                    const y = 250 - ((point.value / maxValue) * 200);

                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill={chart.options?.colors?.[0] || '#3B82F6'}
                            className={interactive ? 'cursor-pointer hover:r-6' : ''}
                            onClick={() => handleDataPointClick(point)}
                            role={interactive ? 'button' : undefined}
                            aria-label={`${point.label}: ${point.value}`}
                        />
                    );
                })}

                {/* X-axis labels */}
                {chart.data.map((point, index) => {
                    const x = 40 + (index * (340 / Math.max(chart.data.length - 1, 1)));
                    return (
                        <text
                            key={index}
                            x={x}
                            y="280"
                            textAnchor="middle"
                            fontSize="10"
                            fill="#6b7280"
                        >
                            {point.label.length > 8 ? `${point.label.slice(0, 8)}...` : point.label}
                        </text>
                    );
                })}
            </svg>
        </div>
    );

    const renderBarChart = () => (
        <div className="relative" style={{ height }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 400 300"
                className="border border-gray-200 rounded-lg bg-white"
                role="img"
                aria-label={`Bar chart: ${chart.title}`}
            >
                <title>{chart.title}</title>

                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => (
                    <line
                        key={i}
                        x1="40"
                        y1={50 + i * 50}
                        x2="380"
                        y2={50 + i * 50}
                        stroke="#f3f4f6"
                        strokeWidth="1"
                    />
                ))}

                {/* Y-axis labels */}
                {[0, 1, 2, 3, 4].map(i => (
                    <text
                        key={i}
                        x="35"
                        y={55 + i * 50}
                        textAnchor="end"
                        fontSize="12"
                        fill="#6b7280"
                    >
                        {Math.round(maxValue - (i * maxValue / 4))}
                    </text>
                ))}

                {/* Bars */}
                {chart.data.map((point, index) => {
                    const barWidth = Math.max(300 / chart.data.length - 10, 20);
                    const x = 50 + (index * (300 / chart.data.length));
                    const barHeight = (point.value / maxValue) * 200;
                    const y = 250 - barHeight;

                    return (
                        <g key={index}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                fill={chart.options?.colors?.[index % (chart.options?.colors?.length || 1)] || '#3B82F6'}
                                className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
                                onClick={() => handleDataPointClick(point)}
                                role={interactive ? 'button' : undefined}
                                aria-label={`${point.label}: ${point.value}`}
                            />
                            <text
                                x={x + barWidth / 2}
                                y="280"
                                textAnchor="middle"
                                fontSize="10"
                                fill="#6b7280"
                            >
                                {point.label.length > 8 ? `${point.label.slice(0, 8)}...` : point.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );

    const renderPieChart = () => {
        const total = chart.data.reduce((sum, point) => sum + point.value, 0);
        let currentAngle = 0;

        return (
            <div className="relative" style={{ height }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 400 300"
                    className="border border-gray-200 rounded-lg bg-white"
                    role="img"
                    aria-label={`Pie chart: ${chart.title}`}
                >
                    <title>{chart.title}</title>

                    {chart.data.map((point, index) => {
                        const percentage = point.value / total;
                        const angle = percentage * 360;
                        const startAngle = currentAngle;
                        const endAngle = currentAngle + angle;

                        const startX = 200 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                        const startY = 150 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                        const endX = 200 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                        const endY = 150 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const pathData = [
                            `M 200 150`,
                            `L ${startX} ${startY}`,
                            `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            'Z'
                        ].join(' ');

                        currentAngle += angle;

                        return (
                            <path
                                key={index}
                                d={pathData}
                                fill={chart.options?.colors?.[index % (chart.options?.colors?.length || 1)] || '#3B82F6'}
                                className={interactive ? 'cursor-pointer hover:opacity-80' : ''}
                                onClick={() => handleDataPointClick(point)}
                                role={interactive ? 'button' : undefined}
                                aria-label={`${point.label}: ${point.value} (${(percentage * 100).toFixed(1)}%)`}
                            />
                        );
                    })}
                </svg>

                {/* Legend */}
                {chart.options?.showLegend && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {chart.data.map((point, index) => (
                            <div key={index} className="flex items-center gap-1">
                                <div
                                    className="w-3 h-3 rounded"
                                    style={{
                                        backgroundColor: chart.options?.colors?.[index % (chart.options?.colors?.length || 1)] || '#3B82F6'
                                    }}
                                />
                                <span className="text-sm text-gray-600">{point.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`analytics-chart ${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>

            {chart.type === 'line' && renderLineChart()}
            {chart.type === 'bar' && renderBarChart()}
            {chart.type === 'pie' && renderPieChart()}
            {chart.type === 'area' && renderLineChart()} {/* Use line chart for area for now */}

            {/* Screen reader description */}
            <div className="sr-only">
                <p>Chart data for {chart.title}:</p>
                <ul>
                    {chart.data.map((point, index) => (
                        <li key={index}>
                            {point.label}: {point.value}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
} 