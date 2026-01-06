import { Plus, Search, Filter, X } from "lucide-react";

export const ControlsBar = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  showFilterPanel,
  setShowFilterPanel,
  filterType,
  filterStatus,
  onAddMaterial,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onAddMaterial}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
          >
            <Plus size={20} />
            New Material
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                viewMode === "grid"
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                viewMode === "list"
                  ? "bg-orange-100 text-orange-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} />
            Filters
            {(filterType !== "all" || filterStatus !== "all") && (
              <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                2
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
