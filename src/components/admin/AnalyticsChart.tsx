"use client";

import React from "react";
import type { AnalyticsChartProps } from "@/types/admin/analytics";

export function AnalyticsChart({
  chart,
  className = "",
  height = 300,
  interactive = true,
  onDataPointClick,
}: AnalyticsChartProps) {
  const maxValue = Math.max(...chart.data.map((d) => d.value));

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
        className="card rounded-xl bg-white dark:bg-neutral-900"
        role="img"
        aria-label={`Line chart: ${chart.title}`}
      >
        <title>{chart.title}</title>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="40"
            y1={50 + i * 50}
            x2="380"
            y2={50 + i * 50}
            stroke="rgb(var(--border) / 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={i}
            x="35"
            y={55 + i * 50}
            textAnchor="end"
            fontSize="12"
            fill="rgb(var(--foreground-secondary) / 1)"
            className="text-code"
          >
            {Math.round(maxValue - (i * maxValue) / 4)}
          </text>
        ))}

        {/* Line path */}
        {chart.data.length > 1 && (
          <path
            d={chart.data
              .map((point, index) => {
                const x = 40 + index * (340 / (chart.data.length - 1));
                const y = 250 - (point.value / maxValue) * 200;
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ")}
            fill="none"
            stroke={chart.options?.colors?.[0] || "rgb(14 165 233)"}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="drop-shadow(0 2px 4px rgb(14 165 233 / 0.1))"
          />
        )}

        {/* Data points */}
        {chart.data.map((point, index) => {
          const x = 40 + index * (340 / Math.max(chart.data.length - 1, 1));
          const y = 250 - (point.value / maxValue) * 200;

          return (
            <g key={index}>
              <circle
                cx={x}
                cy={y}
                r="6"
                fill="white"
                stroke={chart.options?.colors?.[0] || "rgb(14 165 233)"}
                strokeWidth="3"
                className={
                  interactive
                    ? "cursor-pointer hover:scale-125 transition-transform"
                    : ""
                }
                onClick={() => handleDataPointClick(point)}
                role={interactive ? "button" : undefined}
                aria-label={`${point.label}: ${point.value}`}
                filter="drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))"
              />
              {interactive && (
                <circle
                  cx={x}
                  cy={y}
                  r="12"
                  fill="transparent"
                  className="cursor-pointer"
                  onClick={() => handleDataPointClick(point)}
                />
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {chart.data.map((point, index) => {
          const x = 40 + index * (340 / Math.max(chart.data.length - 1, 1));
          return (
            <text
              key={index}
              x={x}
              y="285"
              textAnchor="middle"
              fontSize="11"
              fill="rgb(var(--foreground-secondary) / 1)"
              className="text-code"
            >
              {point.label.length > 8
                ? `${point.label.slice(0, 8)}...`
                : point.label}
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
        className="card rounded-xl bg-white dark:bg-neutral-900"
        role="img"
        aria-label={`Bar chart: ${chart.title}`}
      >
        <title>{chart.title}</title>

        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="40"
            y1={50 + i * 50}
            x2="380"
            y2={50 + i * 50}
            stroke="rgb(var(--border) / 0.3)"
            strokeWidth="1"
          />
        ))}

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4].map((i) => (
          <text
            key={i}
            x="35"
            y={55 + i * 50}
            textAnchor="end"
            fontSize="12"
            fill="rgb(var(--foreground-secondary) / 1)"
            className="text-code"
          >
            {Math.round(maxValue - (i * maxValue) / 4)}
          </text>
        ))}

        {/* Bars */}
        {chart.data.map((point, index) => {
          const barWidth = Math.max(300 / chart.data.length - 10, 20);
          const x = 50 + index * (300 / chart.data.length);
          const barHeight = (point.value / maxValue) * 200;
          const y = 250 - barHeight;
          const barColor =
            chart.options?.colors?.[
              index % (chart.options?.colors?.length || 1)
            ] || "rgb(14 165 233)";

          return (
            <g key={index}>
              {/* Bar gradient definition */}
              <defs>
                <linearGradient
                  id={`barGradient-${index}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: barColor, stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: barColor, stopOpacity: 0.7 }}
                  />
                </linearGradient>
              </defs>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={`url(#barGradient-${index})`}
                rx="4"
                ry="4"
                className={
                  interactive
                    ? "cursor-pointer hover:opacity-80 transition-opacity"
                    : ""
                }
                onClick={() => handleDataPointClick(point)}
                role={interactive ? "button" : undefined}
                aria-label={`${point.label}: ${point.value}`}
                filter="drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))"
              />
              <text
                x={x + barWidth / 2}
                y="285"
                textAnchor="middle"
                fontSize="11"
                fill="rgb(var(--foreground-secondary) / 1)"
                className="text-code"
              >
                {point.label.length > 8
                  ? `${point.label.slice(0, 8)}...`
                  : point.label}
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
          className="card rounded-xl bg-white dark:bg-neutral-900"
          role="img"
          aria-label={`Pie chart: ${chart.title}`}
        >
          <title>{chart.title}</title>

          {/* Pie slices */}
          {chart.data.map((point, index) => {
            const percentage = (point.value / total) * 100;
            const angle = (point.value / total) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startX =
              200 + 80 * Math.cos(((startAngle - 90) * Math.PI) / 180);
            const startY =
              150 + 80 * Math.sin(((startAngle - 90) * Math.PI) / 180);
            const endX = 200 + 80 * Math.cos(((endAngle - 90) * Math.PI) / 180);
            const endY = 150 + 80 * Math.sin(((endAngle - 90) * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = [
              "M",
              200,
              150,
              "L",
              startX,
              startY,
              "A",
              80,
              80,
              0,
              largeArcFlag,
              1,
              endX,
              endY,
              "Z",
            ].join(" ");

            const sliceColor =
              chart.options?.colors?.[
                index % (chart.options?.colors?.length || 1)
              ] || `hsl(${(index * 360) / chart.data.length}, 70%, 60%)`;

            currentAngle += angle;

            return (
              <g key={index}>
                <path
                  d={pathData}
                  fill={sliceColor}
                  stroke="white"
                  strokeWidth="2"
                  className={
                    interactive
                      ? "cursor-pointer hover:brightness-110 transition-all"
                      : ""
                  }
                  onClick={() => handleDataPointClick(point)}
                  role={interactive ? "button" : undefined}
                  aria-label={`${point.label}: ${point.value} (${percentage.toFixed(1)}%)`}
                  filter="drop-shadow(0 2px 4px rgb(0 0 0 / 0.1))"
                />
              </g>
            );
          })}

          {/* Center circle for donut effect */}
          <circle
            cx="200"
            cy="150"
            r="40"
            fill="white"
            stroke="rgb(var(--border) / 0.2)"
            strokeWidth="1"
          />

          {/* Legend */}
          {chart.data.map((point, index) => {
            const legendY = 50 + index * 25;
            const sliceColor =
              chart.options?.colors?.[
                index % (chart.options?.colors?.length || 1)
              ] || `hsl(${(index * 360) / chart.data.length}, 70%, 60%)`;
            const percentage = ((point.value / total) * 100).toFixed(1);

            return (
              <g key={`legend-${index}`}>
                <rect
                  x="320"
                  y={legendY - 8}
                  width="12"
                  height="12"
                  fill={sliceColor}
                  rx="2"
                />
                <text
                  x="340"
                  y={legendY}
                  fontSize="11"
                  fill="rgb(var(--foreground) / 1)"
                  className="text-code"
                >
                  {point.label} ({percentage}%)
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderAreaChart = () => {
    const areaPath =
      chart.data
        .map((point, index) => {
          const x = 40 + index * (340 / Math.max(chart.data.length - 1, 1));
          const y = 250 - (point.value / maxValue) * 200;
          return `${index === 0 ? "M" : "L"} ${x} ${y}`;
        })
        .join(" ") +
      ` L ${40 + (chart.data.length - 1) * (340 / Math.max(chart.data.length - 1, 1))} 250 L 40 250 Z`;

    return (
      <div className="relative" style={{ height }}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 300"
          className="card rounded-xl bg-white dark:bg-neutral-900"
          role="img"
          aria-label={`Area chart: ${chart.title}`}
        >
          <title>{chart.title}</title>

          {/* Gradient definition */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{
                  stopColor: chart.options?.colors?.[0] || "rgb(14 165 233)",
                  stopOpacity: 0.3,
                }}
              />
              <stop
                offset="100%"
                style={{
                  stopColor: chart.options?.colors?.[0] || "rgb(14 165 233)",
                  stopOpacity: 0.05,
                }}
              />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="40"
              y1={50 + i * 50}
              x2="380"
              y2={50 + i * 50}
              stroke="rgb(var(--border) / 0.3)"
              strokeWidth="1"
            />
          ))}

          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4].map((i) => (
            <text
              key={i}
              x="35"
              y={55 + i * 50}
              textAnchor="end"
              fontSize="12"
              fill="rgb(var(--foreground-secondary) / 1)"
              className="text-code"
            >
              {Math.round(maxValue - (i * maxValue) / 4)}
            </text>
          ))}

          {/* Area fill */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Line */}
          {chart.data.length > 1 && (
            <path
              d={chart.data
                .map((point, index) => {
                  const x = 40 + index * (340 / (chart.data.length - 1));
                  const y = 250 - (point.value / maxValue) * 200;
                  return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                })
                .join(" ")}
              fill="none"
              stroke={chart.options?.colors?.[0] || "rgb(14 165 233)"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data points */}
          {chart.data.map((point, index) => {
            const x = 40 + index * (340 / Math.max(chart.data.length - 1, 1));
            const y = 250 - (point.value / maxValue) * 200;

            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={chart.options?.colors?.[0] || "rgb(14 165 233)"}
                stroke="white"
                strokeWidth="2"
                className={
                  interactive
                    ? "cursor-pointer hover:scale-125 transition-transform"
                    : ""
                }
                onClick={() => handleDataPointClick(point)}
                role={interactive ? "button" : undefined}
                aria-label={`${point.label}: ${point.value}`}
              />
            );
          })}

          {/* X-axis labels */}
          {chart.data.map((point, index) => {
            const x = 40 + index * (340 / Math.max(chart.data.length - 1, 1));
            return (
              <text
                key={index}
                x={x}
                y="285"
                textAnchor="middle"
                fontSize="11"
                fill="rgb(var(--foreground-secondary) / 1)"
                className="text-code"
              >
                {point.label.length > 8
                  ? `${point.label.slice(0, 8)}...`
                  : point.label}
              </text>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (chart.type) {
      case "line":
        return renderLineChart();
      case "bar":
        return renderBarChart();
      case "pie":
        return renderPieChart();
      case "area":
        return renderAreaChart();
      default:
        return renderLineChart();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Header */}
      <div className="space-y-2">
        <h3 className="text-title text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          {chart.title}
        </h3>
        {(chart as any).description && (
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            {(chart as any).description}
          </p>
        )}
      </div>

      {/* Chart */}
      <div className="animate-fade-in-up">{renderChart()}</div>
    </div>
  );
}
