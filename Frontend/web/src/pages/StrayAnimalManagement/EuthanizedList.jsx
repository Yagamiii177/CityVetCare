import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  IdentificationIcon,
  TagIcon,
  CalendarDaysIcon,
  MapPinIcon,
  InformationCircleIcon,
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeModernIcon,
} from "@heroicons/react/24/outline";
import { apiService } from "../../utils/api";

const EuthanizedListPage = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    hadOwner: "",
  });
  const [euthanizedAnimals, setEuthanizedAnimals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [loadingOwner, setLoadingOwner] = useState(false);

  const loadEuthanizedAnimals = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.euthanizedAnimals.list();
      const animals = response?.data?.data || response?.data || [];
      setEuthanizedAnimals(animals);
    } catch (error) {
      console.error("Failed to load euthanized animals", error);
      setError("Unable to load euthanized animals");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEuthanizedAnimals();
  }, []);

  useEffect(() => {
    const fetchOwner = async () => {
      if (
        !selectedAnimal?.rfid ||
        !/^\d{9}$/.test(String(selectedAnimal.rfid))
      ) {
        setOwnerInfo(null);
        return;
      }
      try {
        setLoadingOwner(true);
        const res = await apiService.pets.getByRfid(
          String(selectedAnimal.rfid)
        );
        const ownerData = res?.data?.owner || res?.owner || null;
        setOwnerInfo(ownerData);
      } catch {
        setOwnerInfo(null);
      } finally {
        setLoadingOwner(false);
      }
    };
    fetchOwner();
  }, [selectedAnimal]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      species: "",
      hadOwner: "",
    });
    setSearchTerm("");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredAnimals = (() => {
    return euthanizedAnimals.filter((animal) => {
      const matchesSearch =
        searchTerm === "" ||
        animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.rfid?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        animal.locationCaptured
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesSpecies =
        filters.species === "" || animal.species === filters.species;

      const matchesOwnership =
        filters.hadOwner === "" ||
        (filters.hadOwner === "yes" && animal.hadOwner) ||
        (filters.hadOwner === "no" && !animal.hadOwner);

      return matchesSearch && matchesSpecies && matchesOwnership;
    });
  })();

  const hasFilters =
    filters.species !== "" || filters.hadOwner !== "" || searchTerm !== "";

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="px-6 py-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Euthanized Animals</h1>
              <div className="text-sm text-gray-500">
                Historical records of euthanized animals
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="relative flex-1 min-w-[250px] max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by breed, name, location, or RFID"
                    className="pl-10 pr-4 py-2 w-full border border-[#E8E8E8] rounded-lg focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2 flex-1 min-w-[300px] max-w-lg">
                  {/* Species Filter */}
                  <div className="relative flex-1 min-w-[120px]">
                    <select
                      name="species"
                      value={filters.species}
                      onChange={handleFilterChange}
                      className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                    >
                      <option value="">All Species</option>
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                    </select>
                  </div>

                  {/* Ownership Filter */}
                  <div className="relative flex-1 min-w-[140px]">
                    <select
                      name="hadOwner"
                      value={filters.hadOwner}
                      onChange={handleFilterChange}
                      className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                    >
                      <option value="">All Animals</option>
                      <option value="yes">Had Owner</option>
                      <option value="no">No Owner</option>
                    </select>
                  </div>
                </div>

                {hasFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap ml-auto"
                  >
                    <XMarkIcon className="h-6 w-6 mr-1" />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="px-6 -mt-2 pb-4">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Table Container */}
          <div className="flex-1 px-6 pb-8 overflow-hidden mb-15">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full overflow-auto">
              <table className="min-w-full divide-y divide-[#E8E8E8]">
                <thead className="bg-red-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      RFID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Species
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Breed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Had Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Date Euthanized
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-700 uppercase tracking-wider">
                      Reason
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8E8E8]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Loading records...
                      </td>
                    </tr>
                  ) : filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <tr
                        key={animal.id}
                        className="hover:bg-red-50 cursor-pointer"
                        onClick={() => setSelectedAnimal(animal)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                          #{animal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
                          {animal.rfid || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {animal.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {animal.species}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.breed || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {animal.hadOwner ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatDate(animal.dateEuthanized)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                          {animal.reason || "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-8 text-center text-sm text-gray-500"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-lg font-medium text-gray-600 mb-2">
                            No records found
                          </p>
                          <p className="text-sm text-gray-500">
                            {hasFilters
                              ? "Try adjusting your search or filters"
                              : "No euthanized animals on record"}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Detail Modal (optional - you can expand this) */}
      {selectedAnimal && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedAnimal(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#FA8630] to-[#E87928] p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex flex-col gap-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-3xl font-bold text-white">
                      Euthanized Animal
                    </h2>
                    <span className="inline-flex items-center rounded-full bg-white/20 text-white text-xs font-semibold px-3 py-1 backdrop-blur-sm border border-white/30">
                      ID #{selectedAnimal.id}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-red-100 text-red-700 text-xs font-semibold px-3 py-1">
                      Euthanized
                    </span>
                  </div>
                  <p className="text-sm text-white/85 flex items-center gap-1">
                    📍{" "}
                    {selectedAnimal.locationCaptured || "Location unavailable"}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedAnimal(null)}
                  className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm border border-white/40 text-white hover:bg-white/30 transition-all hover:scale-105"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <IdentificationIcon className="h-5 w-5 text-[#FA8630]" />
                      Animal Details
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">RFID</p>
                          <p className="font-medium font-mono">
                            {selectedAnimal.rfid || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Had Owner</p>
                          <p className="font-medium">
                            {selectedAnimal.hadOwner ? "Yes" : "No"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium">
                            {selectedAnimal.name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Species</p>
                          <p className="font-medium">
                            {selectedAnimal.species}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500">Breed</p>
                          <p className="font-medium">
                            {selectedAnimal.breed || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <CalendarDaysIcon className="h-5 w-5 text-[#FA8630]" />
                      Dates & Location
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            Date Captured
                          </p>
                          <p className="font-medium">
                            {formatDate(selectedAnimal.dateCaptured)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                            Date Euthanized
                          </p>
                          <p className="font-medium">
                            {formatDate(selectedAnimal.dateEuthanized)}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPinIcon className="h-4 w-4 text-gray-400" />
                            Location Captured
                          </p>
                          <p className="font-medium">
                            {selectedAnimal.locationCaptured || "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <InformationCircleIcon className="h-5 w-5 text-[#FA8630]" />
                    Reason
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                    {selectedAnimal.reason || "N/A"}
                  </div>
                </div>

                {loadingOwner && (
                  <div className="py-2 text-center text-sm text-gray-500">
                    Loading owner information...
                  </div>
                )}

                {ownerInfo && (
                  <div className="pt-2 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserCircleIcon className="h-5 w-5 text-[#FA8630]" />
                      Registered Owner
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Owner Name</p>
                          <p className="font-medium">
                            {ownerInfo.full_name || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            Contact Number
                          </p>
                          <p className="font-medium">
                            {ownerInfo.contact_number || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                            Email
                          </p>
                          <p className="font-medium">
                            {ownerInfo.email || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <HomeModernIcon className="h-4 w-4 text-gray-400" />
                            Address
                          </p>
                          <p className="font-medium">
                            {ownerInfo.address || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t flex justify-end">
              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EuthanizedListPage;
