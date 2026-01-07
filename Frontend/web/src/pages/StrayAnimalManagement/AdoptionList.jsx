import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/StrayAnimalManagement/Drawer";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import AdoptionProfile from "../../components/StrayAnimalManagement/AdoptionList/AdoptionProfile";
import { apiService } from "../../utils/api";

const PLACEHOLDER_IMAGE =
  "https://via.placeholder.com/120x120.png?text=No+Image";

const AdoptionList = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    status: "",
  });
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const extractImageUrls = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
        if (parsed && typeof parsed === "object")
          return Object.values(parsed).filter(Boolean);
      } catch (e) {
        return [];
      }
    }
    if (typeof images === "object") {
      return Object.values(images).filter(Boolean);
    }
    return [];
  };

  useEffect(() => {
    const loadAdoptionRequests = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await apiService.strayAnimals.list({ status: "adoption" });
        const animals = res?.data?.data || res?.data || [];
        const mapped = animals.map((animal) => {
          const imageUrls = extractImageUrls(animal.images);
          const primaryImage = imageUrls[0] || PLACEHOLDER_IMAGE;
          const statusValue = (animal.status || "Adoption").toString();
          return {
            id: animal.id || animal.animal_id,
            name: animal.name || `Stray #${animal.id}`,
            species: animal.species || "Unknown",
            breed: animal.breed || "Mixed Breed",
            gender: animal.sex || animal.gender || "Unknown",
            color: animal.color || "",
            age: "Unknown",
            dateAddedToAdoption:
              animal.dateCaptured || animal.date_captured || "",
            status:
              statusValue.charAt(0).toUpperCase() +
              statusValue.slice(1).toLowerCase(),
            notes: animal.notes || "",
            image: primaryImage,
            imageUrls,
          };
        });
        setAdoptionList(mapped);
      } catch (err) {
        setError("Failed to load adoption requests");
        setAdoptionList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdoptionRequests();
  }, []);
  const refresh = async () => {
    const res = await apiService.strayAnimals.list({ status: "adoption" });
    const animals = res?.data?.data || res?.data || [];
    const mapped = animals.map((animal) => {
      const imageUrls = extractImageUrls(animal.images);
      const primaryImage = imageUrls[0] || PLACEHOLDER_IMAGE;
      const statusValue = (animal.status || "Adoption").toString();
      return {
        id: animal.id || animal.animal_id,
        name: animal.name || `Stray #${animal.id}`,
        species: animal.species || "Unknown",
        breed: animal.breed || "Mixed Breed",
        gender: animal.sex || animal.gender || "Unknown",
        color: animal.color || "",
        age: "Unknown",
        dateAddedToAdoption: animal.dateCaptured || animal.date_captured || "",
        status:
          statusValue.charAt(0).toUpperCase() +
          statusValue.slice(1).toLowerCase(),
        notes: animal.notes || "",
        image: primaryImage,
        imageUrls,
      };
    });
    setAdoptionList(mapped);
  };

  const [adoptionList, setAdoptionList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearAllFilters = () => {
    setFilters({
      species: "",
      status: "",
    });
    setSearchTerm("");
  };

  const openAnimalProfile = (animal) => {
    setSelectedAnimal(animal);
    setIsProfileOpen(true);
  };

  const closeAnimalProfile = () => {
    setIsProfileOpen(false);
    setSelectedAnimal(null);
  };

  const filteredAnimals = adoptionList.filter((animal) => {
    if (!animal) return false;

    const matchesSearch =
      searchTerm === "" ||
      animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.breed?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filters.status === "" || animal.status === filters.status;

    const matchesSpecies =
      filters.species === "" || animal.species === filters.species;

    return matchesSearch && matchesStatus && matchesSpecies;
  });

  const hasFilters =
    filters.status !== "" || filters.species !== "" || searchTerm !== "";

  const handleBringBackToCaptured = (animalId) => {
    setActionLoading(animalId);
    apiService.strayAnimals
      .update(animalId, { status: "captured" })
      .then(refresh)
      .catch(() => setError("Failed to bring back to captured"))
      .finally(() => setActionLoading(null));
  };

  const handleEuthanize = (animalId) => {
    setActionLoading(animalId);
    apiService.strayAnimals
      .euthanize(animalId, { reason: "Euthanized from adoption list" })
      .then(refresh)
      .catch(() => setError("Failed to euthanize animal"))
      .finally(() => setActionLoading(null));
  };

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
        <div className="px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Adoption Requests</h1>
          </div>

          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative flex-1 min-w-[250px] max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or breed"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <div className="relative flex-1 min-w-[120px]">
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                  >
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Pending">Pending</option>
                    <option value="Adopted">Adopted</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg
                      className="fill-current h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {hasFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center whitespace-nowrap ml-auto mr-100"
                >
                  <XMarkIcon className="h-6 w-6 mr-1" />
                  Clear all filters
                </button>
              )}
            </div>
          </div>

          {/* Adoption List Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-[#E8E8E8]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#E8E8E8]">
                <thead className="bg-[#FA8630]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Species/Breed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Gender/Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#E8E8E8]">
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Loading adoption requests...
                      </td>
                    </tr>
                  ) : filteredAnimals.length > 0 ? (
                    filteredAnimals.map((animal) => (
                      <tr
                        key={animal.id}
                        className="hover:bg-[#FA8630]/5 cursor-pointer"
                        onClick={() => openAnimalProfile(animal)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="h-12 w-12 rounded-md overflow-hidden border border-gray-200 bg-gray-50">
                            <img
                              src={animal.image || PLACEHOLDER_IMAGE}
                              alt={animal.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {animal.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.species} ({animal.breed})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.gender}, {animal.age}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {animal.dateAddedToAdoption}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              animal.status === "Available"
                                ? "bg-green-100 text-green-800"
                                : animal.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {animal.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span className="truncate max-w-xs inline-block">
                            {animal.notes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleBringBackToCaptured(animal.id);
                              }}
                              disabled={actionLoading === animal.id}
                              className="px-3 py-1 rounded-md bg-white border border-[#FA8630] text-[#FA8630] hover:bg-[#FA8630]/10 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {actionLoading === animal.id
                                ? "Processing..."
                                : "Bring back to Captured"}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEuthanize(animal.id);
                              }}
                              disabled={actionLoading === animal.id}
                              className="px-3 py-1 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {actionLoading === animal.id
                                ? "Processing..."
                                : "Euthanize"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        No animals available for adoption matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Adoption Profile Modal */}
      {isProfileOpen && selectedAnimal && (
        <AdoptionProfile animal={selectedAnimal} onClose={closeAnimalProfile} />
      )}
    </div>
  );
};

export default AdoptionList;
