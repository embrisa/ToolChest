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
    <div className="form-group">
      {/* Label */}
      {label && (
        <label htmlFor={listId.current} className="form-label">
          {label}
          {required && (
            <span className="text-error-500 ml-1 font-medium">*</span>
          )}
        </label>
      )}

      {/* Description */}
      {description && <p className="form-help mb-3">{description}</p>}

      {/* Selected Items Display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-200 text-sm rounded-lg border border-brand-200 dark:border-brand-700"
            >
              {option.label}
              <button
                type="button"
                onClick={(e) => handleRemoveSelection(option.id, e)}
                disabled={disabled}
                className="hover:bg-brand-200 dark:hover:bg-brand-800 rounded-sm p-0.5 transition-colors focus-ring"
                aria-label={`Remove ${option.label}`}
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Main Select Container */}
      <div ref={containerRef} className="relative">
        <div
          className={cn(
            "input-field cursor-pointer flex items-center justify-between",
            state.isExpanded && "ring-2 ring-brand-500/50 border-brand-500",
            error && "input-error",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          onClick={handleToggleExpanded}
          onKeyDown={handleKeyDown}
          tabIndex={disabled ? -1 : 0}
          role="combobox"
          aria-expanded={state.isExpanded}
          aria-haspopup="listbox"
          aria-labelledby={label ? `${listId.current}-label` : undefined}
        >
          <div className="flex-1 flex items-center gap-2">
            {searchable && state.isExpanded ? (
              <input
                ref={inputRef}
                type="text"
                value={state.searchQuery}
                onChange={handleSearchChange}
                placeholder="Search options..."
                className="w-full bg-transparent border-none outline-none text-body placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
                disabled={disabled}
              />
            ) : (
              <span
                className={cn(
                  "text-body",
                  selectedIds.length === 0
                    ? "text-neutral-400 dark:text-neutral-500"
                    : "text-neutral-900 dark:text-neutral-100",
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
              "w-5 h-5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200",
              state.isExpanded && "rotate-180",
            )}
          />
        </div>

        {/* Dropdown Options */}
        {state.isExpanded && (
          <div className="absolute z-50 w-full mt-2 surface-elevated rounded-xl shadow-large border border-neutral-200/50 dark:border-neutral-700/50 max-h-60 overflow-auto">
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
                        "px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-150",
                        isFocused && "bg-brand-50 dark:bg-brand-900/20",
                        isSelected && "bg-brand-100 dark:bg-brand-900/30",
                        isDisabled && "opacity-50 cursor-not-allowed",
                      )}
                      onClick={() => !isDisabled && handleOptionSelect(option)}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 border-2 rounded-sm flex items-center justify-center",
                          isSelected
                            ? "bg-brand-500 border-brand-500"
                            : "border-neutral-300 dark:border-neutral-600",
                        )}
                      >
                        {isSelected && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-body text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-neutral-600 dark:text-neutral-400">
                No options found
              </div>
            )}
          </div>
        )}
      </div>

      {/* Max Selection Warning */}
      {isMaxSelected && (
        <p className="form-help text-warning-600 dark:text-warning-400 mt-2">
          Maximum {maxSelections} selections allowed
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
