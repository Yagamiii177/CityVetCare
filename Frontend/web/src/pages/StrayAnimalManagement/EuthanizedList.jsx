import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
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
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              {/* Table Header */}
              <div className="flex-shrink-0 bg-red-50">
                <table className="min-w-full">
                  <thead>
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
                </table>
              </div>

              {/* Table Body */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8]">
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
        </div>
      </main>

      {/* Detail Modal (optional - you can expand this) */}
      {selectedAnimal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setSelectedAnimal(null)}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">
              Euthanized Animal Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">#{selectedAnimal.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">RFID</p>
                <p className="font-medium">{selectedAnimal.rfid || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{selectedAnimal.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Species</p>
                <p className="font-medium">{selectedAnimal.species}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Breed</p>
                <p className="font-medium">{selectedAnimal.breed || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Had Owner</p>
                <p className="font-medium">
                  {selectedAnimal.hadOwner ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Captured</p>
                <p className="font-medium">
                  {formatDate(selectedAnimal.dateCaptured)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Euthanized</p>
                <p className="font-medium">
                  {formatDate(selectedAnimal.dateEuthanized)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Location Captured</p>
                <p className="font-medium">{selectedAnimal.locationCaptured}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Reason</p>
                <p className="font-medium">{selectedAnimal.reason || "N/A"}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedAnimal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
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
