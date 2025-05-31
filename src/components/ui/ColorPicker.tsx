'use client';

import { useState, useCallback } from 'react';
import { Button } from './Button';

export interface ColorPickerProps {
    value?: string;
    onChange: (color: string) => void;
    presetColors?: { name: string; value: string; description?: string }[];
    allowCustom?: boolean;
    disabled?: boolean;
    label?: string;
    className?: string;
}

const DEFAULT_PRESET_COLORS = [
    { name: 'Transparent', value: 'transparent', description: 'No background' },
    { name: 'White', value: '#ffffff', description: 'White background' },
    { name: 'Black', value: '#000000', description: 'Black background' },
    { name: 'Light Gray', value: '#f5f5f5', description: 'Light gray background' },
    { name: 'Dark Gray', value: '#333333', description: 'Dark gray background' },
    { name: 'Blue', value: '#2563eb', description: 'Blue background' },
    { name: 'Green', value: '#16a34a', description: 'Green background' },
    { name: 'Red', value: '#dc2626', description: 'Red background' },
    { name: 'Purple', value: '#9333ea', description: 'Purple background' },
    { name: 'Orange', value: '#ea580c', description: 'Orange background' }
];

export function ColorPicker({
    value = 'transparent',
    onChange,
    presetColors = DEFAULT_PRESET_COLORS,
    allowCustom = true,
    disabled = false,
    label = 'Background Color',
    className = ''
}: ColorPickerProps) {
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [customColor, setCustomColor] = useState(
        value && !presetColors.some(color => color.value === value) ? value : '#ffffff'
    );

    const handlePresetSelect = useCallback((color: string) => {
        onChange(color);
        setShowCustomPicker(false);
    }, [onChange]);

    const handleCustomColorChange = useCallback((color: string) => {
        setCustomColor(color);
        onChange(color);
    }, [onChange]);

    const toggleCustomPicker = useCallback(() => {
        setShowCustomPicker(prev => !prev);
        if (!showCustomPicker) {
            onChange(customColor);
        }
    }, [showCustomPicker, customColor, onChange]);

    const isCustomColor = !presetColors.some(color => color.value === value);

    return (
        <div className={`space-y-3 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            {/* Preset Colors */}
            <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                    <button
                        key={color.value}
                        type="button"
                        onClick={() => handlePresetSelect(color.value)}
                        disabled={disabled}
                        className={`
                            relative w-12 h-12 rounded-lg border-2 transition-all duration-200
                            ${value === color.value
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-300 hover:border-gray-400'
                            }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                        style={{
                            backgroundColor: color.value === 'transparent' ? 'transparent' : color.value,
                            backgroundImage: color.value === 'transparent'
                                ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                                : undefined,
                            backgroundSize: color.value === 'transparent' ? '8px 8px' : undefined,
                            backgroundPosition: color.value === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : undefined
                        }}
                        aria-label={`${color.name}${color.description ? ` - ${color.description}` : ''}`}
                        title={color.description || color.name}
                    >
                        {value === color.value && (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                </div>
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* Custom Color Option */}
            {allowCustom && (
                <div className="space-y-2">
                    <Button
                        type="button"
                        variant={showCustomPicker || isCustomColor ? 'primary' : 'outline'}
                        size="sm"
                        onClick={toggleCustomPicker}
                        disabled={disabled}
                        className="w-full"
                    >
                        {showCustomPicker || isCustomColor ? 'Using Custom Color' : 'Choose Custom Color'}
                    </Button>

                    {(showCustomPicker || isCustomColor) && (
                        <div className="flex items-center space-x-3 p-3 border rounded-lg bg-gray-50">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="custom-color-input" className="text-sm font-medium text-gray-700">
                                    Custom:
                                </label>
                                <input
                                    id="custom-color-input"
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                    disabled={disabled}
                                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer disabled:cursor-not-allowed"
                                    aria-label="Choose custom color"
                                />
                            </div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => {
                                        const color = e.target.value;
                                        if (/^#[0-9A-Fa-f]{6}$/.test(color) || color === '') {
                                            handleCustomColorChange(color);
                                        }
                                    }}
                                    placeholder="#ffffff"
                                    disabled={disabled}
                                    className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                                    aria-label="Custom color hex value"
                                />
                            </div>
                            <div
                                className="w-8 h-8 rounded border border-gray-300"
                                style={{ backgroundColor: customColor }}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Current Selection Display */}
            <div className="text-xs text-gray-600">
                Current: {
                    presetColors.find(color => color.value === value)?.name ||
                    (value === 'transparent' ? 'Transparent' : value)
                }
            </div>
        </div>
    );
} 