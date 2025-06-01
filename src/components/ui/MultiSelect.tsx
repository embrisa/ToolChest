"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
} from "@heroicons/react/20/solid";
import {
  MultiSelectProps,
  MultiSelectState,
  MultiSelectOption,
} from "@/types/admin/relationship";
import { cn } from "@/utils";

export function MultiSelect({
  options,
  selectedIds,
  onSelectionChange,
  placeholder = "Select options...",
  maxSelections,
  searchable = true,
  required = false,
  disabled = false,
  error,
  label,
  description,
}: MultiSelectProps) {
  const [state, setState] = useState<MultiSelectState>({
    selectedIds: selectedIds,
    searchQuery: "",
    isExpanded: false,
    focusedIndex: -1,
    mode: "multiple",
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const listId = useRef(
    `multiselect-${Math.random().toString(36).slice(2, 11)}`,
  );

  // Filter options based on search query
  const filteredOptions =
    searchable && state.searchQuery
      ? options.filter(
          (option) =>
            option.label
              .toLowerCase()
              .includes(state.searchQuery.toLowerCase()) ||
            option.description
              ?.toLowerCase()
              .includes(state.searchQuery.toLowerCase()),
        )
      : options;

  // Get selected options for display
  const selectedOptions = options.filter((option) =>
    selectedIds.includes(option.id),
  );

  const handleToggleExpanded = useCallback(() => {
    if (disabled) return;

    setState((prev) => ({
      ...prev,
      isExpanded: !prev.isExpanded,
      focusedIndex: prev.isExpanded ? -1 : 0,
    }));

    if (!state.isExpanded && searchable) {
      // Focus search input when expanding
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [disabled, state.isExpanded, searchable]);

  const handleOptionSelect = useCallback(
    (option: MultiSelectOption) => {
      if (disabled) return;

      const isSelected = selectedIds.includes(option.id);
      let newSelectedIds: string[];

      if (isSelected) {
        // Remove from selection
        newSelectedIds = selectedIds.filter((id) => id !== option.id);
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
    },
    [disabled, selectedIds, onSelectionChange, maxSelections, searchable],
  );

  const handleRemoveSelection = useCallback(
    (optionId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const newSelectedIds = selectedIds.filter((id) => id !== optionId);
      onSelectionChange(newSelectedIds);
    },
    [selectedIds, onSelectionChange],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          if (!state.isExpanded) {
            handleToggleExpanded();
          } else {
            setState((prev) => ({
              ...prev,
              focusedIndex: Math.min(
                prev.focusedIndex + 1,
                filteredOptions.length - 1,
              ),
            }));
          }
          break;

        case "ArrowUp":
          event.preventDefault();
          if (state.isExpanded) {
            setState((prev) => ({
              ...prev,
              focusedIndex: Math.max(prev.focusedIndex - 1, 0),
            }));
          }
          break;

        case "Enter":
        case " ":
          event.preventDefault();
          if (!state.isExpanded) {
            handleToggleExpanded();
          } else if (
            state.focusedIndex >= 0 &&
            state.focusedIndex < filteredOptions.length
          ) {
            handleOptionSelect(filteredOptions[state.focusedIndex]);
          }
          break;

        case "Escape":
          event.preventDefault();
          setState((prev) => ({
            ...prev,
            isExpanded: false,
            focusedIndex: -1,
          }));
          break;

        case "Backspace":
          if (
            searchable &&
            state.searchQuery === "" &&
            selectedIds.length > 0
          ) {
            // Remove last selected item
            const newSelectedIds = selectedIds.slice(0, -1);
            onSelectionChange(newSelectedIds);
          }
          break;
      }
    },
    [
      disabled,
      state.isExpanded,
      state.focusedIndex,
      state.searchQuery,
      filteredOptions,
      selectedIds,
      handleToggleExpanded,
      handleOptionSelect,
      onSelectionChange,
      searchable,
    ],
  );

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setState((prev) => ({
        ...prev,
        searchQuery: event.target.value,
        focusedIndex: 0,
      }));
    },
    [],
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setState((prev) => ({
          ...prev,
          isExpanded: false,
          focusedIndex: -1,
        }));
      }
    };

    if (state.isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [state.isExpanded]);

  // Scroll focused option into view
  useEffect(() => {
    if (state.isExpanded && state.focusedIndex >= 0 && listboxRef.current) {
      const focusedElement = listboxRef.current.children[
        state.focusedIndex
      ] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [state.isExpanded, state.focusedIndex]);

  const isMaxSelected = maxSelections && selectedIds.length >= maxSelections;

  return (
    <div className="space-y-4">
      {/* Label with enhanced contrast */}
      {label && (
        <label
          htmlFor={listId.current}
          className="text-primary text-sm font-medium block"
        >
          {label}
          {required && (
            <span className="text-error-500 ml-1 font-medium">*</span>
          )}
        </label>
      )}

      {/* Description with proper contrast */}
      {description && (
        <p className="text-secondary text-sm leading-relaxed">{description}</p>
      )}

      {/* Selected Items Display with enhanced styling */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className={cn(
                // Enhanced tag styling following design system
                "inline-flex items-center gap-2 px-3 py-2",
                "bg-brand-100 text-brand-800 text-sm rounded-lg",
                "border border-brand-200 shadow-soft",
                "transition-all duration-200",
              )}
            >
              <span className="text-sm font-medium">{option.label}</span>
              <button
                type="button"
                onClick={(e) => handleRemoveSelection(option.id, e)}
                disabled={disabled}
                className={cn(
                  // Enhanced remove button with proper touch target
                  "hover:bg-brand-200 rounded-sm p-1 transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
                aria-label={`Remove ${option.label}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Select Container */}
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            // Using design system input styling
            "input-field cursor-pointer flex items-center justify-between min-h-[48px]",
            // Enhanced focus states following design philosophy
            state.isExpanded && "ring-2 ring-brand-500 border-brand-500",
            // Error state with enhanced contrast
            error && "border-error-500 ring-2 ring-error-500/20",
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleToggleExpanded}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={state.isExpanded}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${listId.current}-label` : undefined}
          aria-invalid={error ? "true" : "false"}
        >
          <div className="flex-1 flex items-center gap-3">
            {searchable && state.isExpanded ? (
              <input
                ref={inputRef}
                type="text"
                value={state.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search options..."
                className={cn(
                  "w-full bg-transparent border-none outline-none",
                  "text-primary placeholder:text-muted text-sm",
                  "disabled:cursor-not-allowed",
                )}
                disabled={disabled}
              />
            ) : (
              <span
                className={cn(
                  "text-sm",
                  selectedIds.length === 0
                    ? "text-muted"
                    : "text-primary font-medium",
                )}
              >
                {selectedIds.length === 0
                  ? placeholder
                  : `${selectedIds.length} selected`}
              </span>
            )}
          </div>

          <ChevronDownIcon
            className={cn(
              "w-5 h-5 text-muted transition-transform duration-200 flex-shrink-0",
              state.isExpanded && "rotate-180",
            )}
          />
        </div>

        {/* Dropdown Options with enhanced styling */}
        {state.isExpanded && (
          <div
            className={cn(
              // Enhanced dropdown styling following design system
              "absolute z-50 w-full mt-2 card shadow-large border border-neutral-200",
              "max-h-60 overflow-auto",
            )}
          >
            {filteredOptions.length > 0 ? (
              <ul
                ref={listboxRef}
                role="listbox"
                aria-multiselectable="true"
                className="py-2"
              >
                {filteredOptions.map((option, index) => {
                  const isSelected = selectedIds.includes(option.id);
                  const isFocused = index === state.focusedIndex;
                  const isDisabled = disabled || (isMaxSelected && !isSelected);

                  return (
                    <li
                      key={option.id}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        // Enhanced option styling with proper spacing
                        "px-4 py-3 cursor-pointer flex items-center gap-4",
                        "transition-colors duration-150",
                        // Focus and selection states with enhanced contrast
                        isFocused && "bg-brand-50",
                        isSelected && "bg-brand-100",
                        // Disabled state
                        isDisabled && "opacity-50 cursor-not-allowed",
                        // Hover state for non-disabled items
                        !isDisabled && "hover:bg-neutral-50",
                      )}
                      onClick={() => !isDisabled && handleOptionSelect(option)}
                    >
                      {/* Enhanced checkbox indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 border-2 rounded-md flex items-center justify-center flex-shrink-0",
                          "transition-all duration-200",
                          isSelected
                            ? "bg-brand-500 border-brand-500"
                            : "border-neutral-300 hover:border-neutral-400",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>

                      {/* Option content with enhanced typography */}
                      <div className="flex-1 min-w-0">
                        <div className="text-primary text-sm font-medium leading-tight">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-secondary text-xs mt-1 leading-relaxed">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-secondary">
                <p className="text-sm">No options found</p>
                {state.searchQuery && (
                  <p className="text-xs text-muted mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Max Selection Warning with enhanced styling */}
      {isMaxSelected && (
        <p className="text-warning-600 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-warning-500 rounded-full flex-shrink-0"></span>
          Maximum {maxSelections} selections allowed
        </p>
      )}

      {/* Error Message with enhanced contrast */}
      {error && (
        <p
          className="text-error-600 text-sm flex items-center gap-2"
          role="alert"
        >
          <span className="w-1.5 h-1.5 bg-error-500 rounded-full flex-shrink-0"></span>
          {error}
        </p>
      )}
    </div>
  );
}
