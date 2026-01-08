import { X } from "lucide-react";

export const FilterPanel = ({
  showFilterPanel,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
  materialTypes,
  statusOptions,
  clearFilters,
}) => {
  if (!showFilterPanel) return null;

  return (
    <div className="mt-4 p-4 border-t border-gray-100">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {materialTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(filterType !== "all" || filterStatus !== "all") && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filterType !== "all" && (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
              Type: {materialTypes.find((t) => t.value === filterType)?.label}
              <button
                onClick={() => setFilterType("all")}
                className="text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            </span>
          )}
          {filterStatus !== "all" && (
            <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
              Status:{" "}
              {statusOptions.find((s) => s.value === filterStatus)?.label}
              <button
                onClick={() => setFilterStatus("all")}
                className="text-orange-500 hover:text-orange-700"
              >
                <X size={14} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

