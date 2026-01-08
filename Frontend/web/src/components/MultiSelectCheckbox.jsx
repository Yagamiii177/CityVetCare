import { useState, useRef, useEffect } from "react";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/react/24/solid";

/**
 * MultiSelectCheckbox Component
 * A user-friendly multi-select dropdown with checkboxes
 * No keyboard shortcuts required - just click to select
 */
const MultiSelectCheckbox = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select items...",
  label = "",
  required = false,
  error = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle checkbox selection
  const handleToggle = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  // Remove individual tag
  const handleRemoveTag = (value, e) => {
    e.stopPropagation();
    const newValues = selectedValues.filter((v) => v !== value);
    onChange(newValues);
  };

  // Clear all selections
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // Get selected option labels
  const getSelectedLabels = () => {
    return options
      .filter((opt) => selectedValues.includes(opt.value))
      .map((opt) => opt.label);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Dropdown Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`
          min-h-[120px] w-full px-3 py-3 border rounded-lg 
          cursor-pointer transition-all bg-white
          ${isOpen ? "border-[#FA8630] ring-2 ring-[#FA8630]/20" : "border-gray-300 hover:border-gray-400"}
          ${error ? "border-red-500" : ""}
        `}
      >
        {/* Selected Tags */}
        {selectedLabels.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label, index) => {
              const value = selectedValues[index];
              return (
                <span
                  key={value}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FA8630] text-white text-sm rounded-md font-medium"
                >
                  {label}
                  <button
                    onClick={(e) => handleRemoveTag(value, e)}
                    className="hover:bg-[#E87928] rounded-full p-0.5 transition-colors"
                    type="button"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              );
            })}
            {selectedLabels.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-gray-500 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors font-medium"
                type="button"
              >
                Clear All
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-gray-400">
            <span>{placeholder}</span>
            <ChevronDownIcon
              className={`h-5 w-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}

        {/* Chevron Icon (when items selected) */}
        {selectedLabels.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDownIcon
              className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </div>

      {/* Helper Text */}
      {!error && selectedValues.length > 0 && (
        <p className="text-xs text-gray-600 mt-1.5 font-medium">
          ✓ {selectedValues.length} member{selectedValues.length !== 1 ? "s" : ""} selected
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">
          {error}
        </p>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-auto">
          {options.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">
              No options available
            </div>
          ) : (
            <div className="py-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    onClick={() => handleToggle(option.value)}
                    className={`
                      px-4 py-3 cursor-pointer transition-colors flex items-start gap-3
                      hover:bg-gray-50
                      ${isSelected ? "bg-orange-50" : ""}
                    `}
                  >
                    {/* Custom Checkbox */}
                    <div
                      className={`
                        mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                        transition-all
                        ${isSelected 
                          ? "bg-[#FA8630] border-[#FA8630]" 
                          : "bg-white border-gray-300"
                        }
                      `}
                    >
                      {isSelected && (
                        <CheckIcon className="h-3.5 w-3.5 text-white font-bold" />
                      )}
                    </div>

                    {/* Option Content */}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 text-sm">
                        {option.label}
                      </div>
                      {option.sublabel && (
                        <div className="text-xs text-gray-600 mt-0.5">
                          {option.sublabel}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectCheckbox;
