import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

/**
 * Filter controls for clinic map
 */
const MapFilters = ({
  searchTerm,
  setSearchTerm,
  barangayFilter,
  setBarangayFilter,
  serviceFilter,
  setServiceFilter,
  statusFilter,
  setStatusFilter,
  inspectionFilter,
  setInspectionFilter,
  barangayOptions,
  serviceOptions,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search clinics by name, address, or barangay..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500 hover:text-gray-700" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FunnelIcon className="h-5 w-5" />
          <span className="font-medium">Filters</span>
          {showFilters ? (
            <ChevronUpIcon className="h-4 w-4" />
          ) : (
            <ChevronDownIcon className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Barangay Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Barangay
            </label>
            <select
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
            >
              <option value="all">All Barangays</option>
              {barangayOptions.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
          </div>

          {/* Service Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
            >
              <option value="all">All Services</option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Temporarily Closed">Temporarily Closed</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Inspection Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inspection Status
            </label>
            <select
              value={inspectionFilter}
              onChange={(e) => setInspectionFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
            >
              <option value="all">All Inspections</option>
              <option value="Passed">Passed</option>
              <option value="Pending">Pending</option>
              <option value="Needs Follow-up">Needs Follow-up</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;
