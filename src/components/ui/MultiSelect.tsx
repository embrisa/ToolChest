'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDownIcon, XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';
import { MultiSelectProps, MultiSelectState, MultiSelectOption } from '@/types/admin/relationship';
import { classNames } from '@/utils';

export function MultiSelect({
    options,
    selectedIds,
    onSelectionChange,
    placeholder = 'Select options...',
    maxSelections,
    searchable = true,
    required = false,
    disabled = false,
    error,
    label,
    description
}: MultiSelectProps) {
    const [state, setState] = useState<MultiSelectState>({
        selectedIds: selectedIds,
        searchQuery: '',
        isExpanded: false,
        focusedIndex: -1,
        mode: 'multiple'
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const listId = useRef(`multiselect-${Math.random().toString(36).substr(2, 9)}`);

    // Filter options based on search query
    const filteredOptions = searchable && state.searchQuery
        ? options.filter(option =>
            option.label.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            option.description?.toLowerCase().includes(state.searchQuery.toLowerCase())
        )
        : options;

    // Get selected options for display
    const selectedOptions = options.filter(option => selectedIds.includes(option.id));

    const handleToggleExpanded = useCallback(() => {
        if (disabled) return;

        setState(prev => ({
            ...prev,
            isExpanded: !prev.isExpanded,
            focusedIndex: prev.isExpanded ? -1 : 0
        }));

        if (!state.isExpanded && searchable) {
            // Focus search input when expanding
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [disabled, state.isExpanded, searchable]);

    const handleOptionSelect = useCallback((option: MultiSelectOption) => {
        if (disabled) return;

        const isSelected = selectedIds.includes(option.id);
        let newSelectedIds: string[];

        if (isSelected) {
            // Remove from selection
            newSelectedIds = selectedIds.filter(id => id !== option.id);
        } else {
            // Add to selection (check max limit)
            if (maxSelections && selectedIds.length >= maxSelections) {
                return; // Don't allow more selections
            }
            newSelectedIds = [...selectedIds, option.id];
        }

        onSelectionChange(newSelectedIds);

        // Keep dropdown open for multiple selections
        if (searchable) {
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    }, [disabled, selectedIds, onSelectionChange, maxSelections, searchable]);

    const handleRemoveSelection = useCallback((optionId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        const newSelectedIds = selectedIds.filter(id => id !== optionId);
        onSelectionChange(newSelectedIds);
    }, [selectedIds, onSelectionChange]);

    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (disabled) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                if (!state.isExpanded) {
                    handleToggleExpanded();
                } else {
                    setState(prev => ({
                        ...prev,
                        focusedIndex: Math.min(prev.focusedIndex + 1, filteredOptions.length - 1)
                    }));
                }
                break;

            case 'ArrowUp':
                event.preventDefault();
                if (state.isExpanded) {
                    setState(prev => ({
                        ...prev,
                        focusedIndex: Math.max(prev.focusedIndex - 1, 0)
                    }));
                }
                break;

            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!state.isExpanded) {
                    handleToggleExpanded();
                } else if (state.focusedIndex >= 0 && state.focusedIndex < filteredOptions.length) {
                    handleOptionSelect(filteredOptions[state.focusedIndex]);
                }
                break;

            case 'Escape':
                event.preventDefault();
                setState(prev => ({
                    ...prev,
                    isExpanded: false,
                    focusedIndex: -1
                }));
                break;

            case 'Backspace':
                if (searchable && state.searchQuery === '' && selectedIds.length > 0) {
                    // Remove last selected item
                    const newSelectedIds = selectedIds.slice(0, -1);
                    onSelectionChange(newSelectedIds);
                }
                break;
        }
    }, [disabled, state.isExpanded, state.focusedIndex, state.searchQuery, filteredOptions, selectedIds, handleToggleExpanded, handleOptionSelect, onSelectionChange, searchable]);

    const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setState(prev => ({
            ...prev,
            searchQuery: event.target.value,
            focusedIndex: 0
        }));
    }, []);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setState(prev => ({
                    ...prev,
                    isExpanded: false,
                    focusedIndex: -1
                }));
            }
        };

        if (state.isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [state.isExpanded]);

    // Scroll focused option into view
    useEffect(() => {
        if (state.isExpanded && state.focusedIndex >= 0 && listboxRef.current) {
            const focusedElement = listboxRef.current.children[state.focusedIndex] as HTMLElement;
            if (focusedElement) {
                focusedElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [state.isExpanded, state.focusedIndex]);

    const isMaxSelected = maxSelections && selectedIds.length >= maxSelections;

    return (
        <div className="space-y-2">
            {/* Label */}
            {label && (
                <label
                    htmlFor={listId.current}
                    className="block text-sm font-medium text-gray-700"
                >
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            {/* Description */}
            {description && (
                <p className="text-sm text-gray-600">
                    {description}
                </p>
            )}

            {/* Multi-select container */}
            <div ref={containerRef} className="relative">
                {/* Main trigger/display */}
                <div
                    onClick={handleToggleExpanded}
                    onKeyDown={handleKeyDown}
                    className={classNames(
                        'relative w-full cursor-pointer rounded-md border py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500',
                        disabled
                            ? 'border-gray-200 bg-gray-50 text-gray-500'
                            : error
                                ? 'border-red-300 bg-white'
                                : 'border-gray-300 bg-white',
                        'min-h-[38px]'
                    )}
                    tabIndex={disabled ? -1 : 0}
                    role="combobox"
                    aria-expanded={state.isExpanded}
                    aria-haspopup="listbox"
                    aria-owns={listId.current}
                    aria-labelledby={label ? `${listId.current}-label` : undefined}
                    aria-invalid={error ? 'true' : undefined}
                >
                    {/* Selected items display */}
                    <div className="flex flex-wrap gap-1 min-h-[22px]">
                        {selectedOptions.length === 0 ? (
                            <span className="text-gray-500 text-sm leading-5">
                                {placeholder}
                            </span>
                        ) : (
                            selectedOptions.map((option) => (
                                <span
                                    key={option.id}
                                    className={classNames(
                                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                                        option.color
                                            ? 'text-white'
                                            : 'bg-blue-100 text-blue-800'
                                    )}
                                    style={option.color ? { backgroundColor: option.color } : {}}
                                >
                                    {option.label}
                                    {!disabled && (
                                        <button
                                            onClick={(e) => handleRemoveSelection(option.id, e)}
                                            className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                                            aria-label={`Remove ${option.label}`}
                                            tabIndex={-1}
                                        >
                                            <XMarkIcon className="h-3 w-3" />
                                        </button>
                                    )}
                                </span>
                            ))
                        )}

                        {/* Search input */}
                        {searchable && state.isExpanded && (
                            <input
                                ref={inputRef}
                                type="text"
                                value={state.searchQuery}
                                onChange={handleSearchChange}
                                className="flex-1 min-w-[120px] border-none outline-none text-sm bg-transparent"
                                placeholder="Search..."
                                autoComplete="off"
                            />
                        )}
                    </div>

                    {/* Dropdown indicator */}
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                        <ChevronDownIcon
                            className={classNames(
                                'h-5 w-5 text-gray-400 transition-transform',
                                state.isExpanded && 'rotate-180'
                            )}
                        />
                    </div>
                </div>

                {/* Dropdown */}
                {state.isExpanded && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                        {/* Max selections warning */}
                        {isMaxSelected && (
                            <div className="px-3 py-2 text-sm text-amber-600 bg-amber-50 border-b border-amber-200">
                                Maximum {maxSelections} selection{maxSelections !== 1 ? 's' : ''} reached
                            </div>
                        )}

                        {/* Options list */}
                        <ul
                            ref={listboxRef}
                            role="listbox"
                            id={listId.current}
                            aria-multiselectable="true"
                        >
                            {filteredOptions.length === 0 ? (
                                <li className="px-3 py-2 text-sm text-gray-500 italic">
                                    {state.searchQuery ? 'No matching options found' : 'No options available'}
                                </li>
                            ) : (
                                filteredOptions.map((option, index) => {
                                    const isSelected = selectedIds.includes(option.id);
                                    const isFocused = index === state.focusedIndex;
                                    const isDisabled = isMaxSelected && !isSelected;

                                    return (
                                        <li
                                            key={option.id}
                                            onClick={() => !isDisabled && handleOptionSelect(option)}
                                            className={classNames(
                                                'relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm',
                                                isFocused
                                                    ? 'bg-blue-600 text-white'
                                                    : isDisabled
                                                        ? 'text-gray-400 cursor-not-allowed'
                                                        : 'text-gray-900 hover:bg-blue-50'
                                            )}
                                            role="option"
                                            aria-selected={isSelected}
                                            aria-disabled={isDisabled ? 'true' : undefined}
                                        >
                                            {/* Selection indicator */}
                                            {isSelected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <CheckIcon
                                                        className={classNames(
                                                            'h-5 w-5',
                                                            isFocused ? 'text-white' : 'text-blue-600'
                                                        )}
                                                    />
                                                </span>
                                            )}

                                            {/* Option content */}
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium">
                                                        {option.label}
                                                        {option.isActive === false && (
                                                            <span className="ml-2 text-xs text-gray-400">(inactive)</span>
                                                        )}
                                                    </div>
                                                    {option.description && (
                                                        <div className={classNames(
                                                            'text-xs mt-1',
                                                            isFocused ? 'text-blue-100' : 'text-gray-600'
                                                        )}>
                                                            {option.description}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Color indicator */}
                                                {option.color && (
                                                    <div
                                                        className="w-3 h-3 rounded-full border border-gray-300"
                                                        style={{ backgroundColor: option.color }}
                                                        aria-hidden="true"
                                                    />
                                                )}
                                            </div>
                                        </li>
                                    );
                                })
                            )}
                        </ul>
                    </div>
                )}
            </div>

            {/* Selection summary */}
            {selectedIds.length > 0 && (
                <div className="text-xs text-gray-600">
                    {selectedIds.length} of {options.length} selected
                    {maxSelections && ` (max ${maxSelections})`}
                </div>
            )}

            {/* Error message */}
            {error && (
                <p className="text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
} 