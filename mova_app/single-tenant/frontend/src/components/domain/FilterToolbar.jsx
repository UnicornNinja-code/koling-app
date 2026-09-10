import React from "react";
import { Search, Filter, RefreshCw, Download, Plus, RotateCcw } from "lucide-react";
import { Input } from "../ui/Input.jsx";
import { Select } from "../ui/Select.jsx";
import { Button } from "../ui/Button.jsx";

export function FilterToolbar({
  searchValue = "",
  onSearchChange = () => {},
  searchPlaceholder = "Cari data...",
  filters = [], // Array of { id, label, value, onChange, options }
  onReset = () => {},
  onExport = null,
  onAdd = null,
  addLabel = "+ Tambah Data",
  children,
  className = "",
}) {
  return (
    <div className={`bg-white dark:bg-slate-900 p-4 rounded-[12px] border border-slate-200 dark:border-slate-800 shadow-xs font-['Inter'] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${className}`}>
      {/* Left: Search & Filter Dropdowns */}
      <div className="flex flex-1 flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="w-full sm:w-64">
          <Input
            icon={Search}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full text-xs"
          />
        </div>

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <div key={filter.id} className="w-full sm:w-44">
            <Select
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              options={filter.options}
              className="w-full text-xs"
            />
          </div>
        ))}

        {children}

        {/* Reset Filter Button */}
        {onReset && (
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={onReset}
            title="Reset Filter"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Right: Action Buttons (Export, Add) */}
      <div className="flex items-center gap-2 justify-end">
        {onExport && (
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={onExport}
            className="text-xs"
          >
            Ekspor
          </Button>
        )}

        {onAdd && (
          <Button
            variant="accent"
            size="sm"
            icon={Plus}
            onClick={onAdd}
            className="text-xs"
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

export default FilterToolbar;
