import { useState  } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/VaccinationManagement/Drawer";
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  XMarkIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/outline";
import RegisterAnimalModal from "../../components/VaccinationManagement/RegisterAnimalModal";
import ObservationProfile from "../../components/VaccinationManagement/Profile";

const PetRegistration = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("captured");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    species: "",
    breed: "",
    observationStatus: "",
  });
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(null);

  // Breed options by species
  const breedOptions = {
    Dog: [
      "Beagle",
      "Boxer",
      "Bulldog",
      "Chihuahua",
      "Dachshund",
      "German Shepherd",
      "Golden Retriever",
      "Great Dane",
      "Labrador Retriever",
      "Mixed Breed",
      "Other",
      "Poodle",
      "Rottweiler",
      "Shih Tzu",
      "Siberian Husky",
      "Yorkshire Terrier",
    ],
    Cat: [
      "Abyssinian",
      "Bengal",
      "British Shorthair",
      "Domestic Longhair",
      "Domestic Shorthair",
      "Maine Coon",
      "Mixed Breed",
      "Other",
      "Persian",
      "Ragdoll",
      "Russian Blue",
      "Scottish Fold",
      "Siamese",
      "Sphynx",
    ],
  };

  const [capturedAnimals, setCapturedAnimals] = useState([
    {
      id: 1,
      petName: "Buddy",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
     
    
      captureDate: "2023-05-15",
   
  
      images: {},
    },
    {
 
      id: 2,
           petName: "Puddy",
      species: "Cat",
      breed: "Siamese",
      sex: "Female",
      marking: "Points (Siamese pattern)",
     
     
      captureDate: "2023-05-18",
     
   
      images: {},
    },
    {
      id: 3,
           petName: "Brody",
      species: "Dog",
      breed: "German Shepherd",
      sex: "Male",
      marking: "Bi-color",
    
      captureDate: "2023-05-20",
   

      images: {},
    },
    {
      id: 4,
           petName: "Rod",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
    
      captureDate: "2023-05-15",
   

      images: {},
    },
    {
      id: 5,
           petName: "Toddy",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
     
      captureDate: "2023-05-15",

 
      images: {},
    },
    {
      id: 6,
           petName: "Teddy",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
     
      captureDate: "2023-05-15",
  
  
      images: {},
    },
    {
      id: 7,
           petName: "Rudy",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
     
      captureDate: "2023-05-15",
   
   
      images: {},
    },
    {
      id: 8,
           petName: "Bubby",
      species: "Dog",
      breed: "Golden Retriever",
      sex: "Male",
      marking: "Solid Color",
     
      captureDate: "2023-05-15",
  
   
      images: {},
    },
    {
      id: 102,
           petName: "Mingming",
      species: "Cat",
      breed: "Persian",
      sex: "Female",
      marking: "Solid Color",
     
      captureDate: "2023-05-22",


      dateObserved: "2023-05-22",
      images: {},
    },
    
  ]);

  const [observationAnimals, setObservationAnimals] = useState([
    {
      id: 101,
           petName: "Goody",
      species: "Dog",
      breed: "Labrador",
      sex: "Male",
      marking: "Solid Color",
     

      
      dateObserved: "2023-05-20",
      images: {},
    },
    {
      id: 102,
     petName: "Lingling",
      species: "Cat",
      breed: "Persian",
      sex: "Female",
      marking: "Solid Color",
     
      captureDate: "2023-05-22",
     
      dateObserved: "2023-05-22",
      images: {},
    },
  ]);

  const [adoptionList, setAdoptionList] = useState([
    {
      id: 201,
           petName: "Rexy",
      species: "Dog",
      breed: "German Shepherd",
      sex: "Male",
      marking: "Bi-color",
     
      captureDate: "2023-05-20",
      
      
      dateAddedToAdoption: "2023-05-25",
    },
  ]);

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    // If species changes, reset breed filter
    if (name === "species") {
      setFilters({ ...filters, [name]: value, breed: "" });
    } else {
      setFilters({ ...filters, [name]: value });
    }
  };

  const clearAllFilters = () => {
    setFilters({
      species: "",
      breed: "",
      observationStatus: "",
    });
    setSearchTerm("");
  };

  const handleRegisterAnimal = (formData) => {
    const commonData = {
      id:
        Math.max(
          ...capturedAnimals.map((a) => a.id),
          ...observationAnimals.map((a) => a.id),
          0
        ) + 1,
      petName: formData.petName,
      species: formData.species,
      breed: formData.breed,
      sex: formData.sex,
      marking: formData.marking,
      captureDate: formData.captureDate,
      locationCaptured: formData.locationCaptured,

      images: formData.images,
    };

    if (formData.status === "Observation") {
      const newObservationAnimal = {
        ...commonData,
        observationNotes: formData.notes || "No notes provided",
        dateObserved: formData.captureDate,
      };
      setObservationAnimals([...observationAnimals, newObservationAnimal]);
    } else {
      const newCapturedAnimal = {
        ...commonData,
      };
      setCapturedAnimals([...capturedAnimals, newCapturedAnimal]);
    }
    // Close modal and switch to the appropriate tab so the new record appears
    setIsRegisterModalOpen(false);
    setActiveTab(formData.status === "Observation" ? "observation" : "captured");
  };

  const handleRowClick = (animal) => {
    setSelectedAnimal(animal);
    setIsProfileOpen(true);
  };

  const handleSaveObservation = (updatedAnimal) => {
    setObservationAnimals(
      observationAnimals.map((animal) =>
        animal.id === updatedAnimal.id ? updatedAnimal : animal
      )
    );
  };

  const handleSaveAnimal = (updatedAnimal) => {
    if (activeTab === "captured") {
      setCapturedAnimals((prev) =>
        prev.map((animal) =>
          animal.id === updatedAnimal.id ? updatedAnimal : animal
        )
      );
    } else {
      setObservationAnimals((prev) =>
        prev.map((animal) =>
          animal.id === updatedAnimal.id ? updatedAnimal : animal
        )
      );
    }
  };

  const handleSendToObservation = (animal) => {
    const updatedAnimal = {
      ...animal,
      observationNotes: animal.notes || "No notes provided",
      dateObserved: new Date().toISOString().split("T")[0],
    };

    setCapturedAnimals(capturedAnimals.filter((a) => a.id !== animal.id));
    setObservationAnimals([...observationAnimals, updatedAnimal]);
    setShowDropdown(null);
  };

  const handleSendToCaptured = (animal) => {
    const updatedAnimal = {
      ...animal,
      notes: animal.observationNotes || "No notes provided",
    };

    setObservationAnimals(observationAnimals.filter((a) => a.id !== animal.id));
    setCapturedAnimals([...capturedAnimals, updatedAnimal]);
    setShowDropdown(null);
  };

  const handleSendToAdoption = (animal) => {
    const updatedAnimal = {
      ...animal,
      dateAddedToAdoption: new Date().toISOString().split("T")[0],
    };

    setCapturedAnimals(capturedAnimals.filter((a) => a.id !== animal.id));
    setAdoptionList([...adoptionList, updatedAnimal]);
    setShowDropdown(null);
  };

  const filteredAnimals =
    activeTab === "captured"
      ? capturedAnimals.filter((animal) => {
          if (!animal) return false;

          const matchesSearch =
            searchTerm === "" ||
            animal.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.marking?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesSpecies =
            filters.species === "" || animal.species === filters.species;

          const matchesBreed =
            filters.breed === "" || animal.breed === filters.breed;

          return matchesSearch && matchesSpecies && matchesBreed;
        })
      : observationAnimals.filter((animal) => {
          if (!animal) return false;

          const matchesSearch =
            searchTerm === "" ||
            animal.petName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.breed?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.species?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            animal.marking?.toLowerCase().includes(searchTerm.toLowerCase());

          const matchesObservationStatus =
            filters.observationStatus === "" ||
            animal.observationNotes
              ?.toLowerCase()
              .includes(filters.observationStatus.toLowerCase());

          const matchesSpecies =
            filters.species === "" || animal.species === filters.species;

          const matchesBreed =
            filters.breed === "" || animal.breed === filters.breed;

          return (
            matchesSearch &&
            matchesObservationStatus &&
            matchesSpecies &&
            matchesBreed
          );
        });

  const hasFilters =
    filters.species !== "" ||
    filters.breed !== "" ||
    filters.observationStatus !== "" ||
    searchTerm !== "";

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
              <h1 className="text-2xl font-bold">Pet Registration</h1>
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="bg-[#FA8630] text-white px-4 py-2 rounded-lg flex items-center hover:bg-[#E87928] transition-colors"
              >
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Register Pet
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#E8E8E8] mb-6">
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "captured"
                    ? "text-[#FA8630] border-b-2 border-[#FA8630]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("captured")}
              >
                Pet Registration Request ({capturedAnimals.length})
              </button>
              <button
                className={`px-4 py-2 font-medium ${
                  activeTab === "observation"
                    ? "text-[#FA8630] border-b-2 border-[#FA8630]"
                    : "text-gray-500"
                }`}
                onClick={() => setActiveTab("observation")}
              >
                Registered Pet ({observationAnimals.length})
              </button>
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
                    placeholder="Search by name, breed, species, or marking"
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

                  {/* Breed Filter - Only show when species is selected */}
                  {filters.species && (
                    <div className="relative flex-1 min-w-[140px]">
                      <select
                        name="breed"
                        value={filters.breed}
                        onChange={handleFilterChange}
                        className="appearance-none border border-[#E8E8E8] rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 bg-white w-full pr-8"
                      >
                        <option value="">All Breeds</option>
                        {breedOptions[filters.species]?.map((breed) => (
                          <option key={breed} value={breed}>
                            {breed}
                          </option>
                        ))}
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
                  )}

                 
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

          {/* Table Container - Fixed height with proper scrolling */}
          <div className="flex-1 px-6 pb-8 overflow-hidden mb-15">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              {/* Table wrapper with overflow */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8] table-fixed">
                  <thead className="sticky top-0 z-20 bg-[#FA8630]/10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Pet Name
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Species/Breed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Sex
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Marking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        {activeTab === "captured" ? "Request Date" : "Registration Date"}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {filteredAnimals.length > 0 ? (
                      filteredAnimals.map((animal) => (
                        <tr 
                          key={animal.id}
                          className="hover:bg-[#FA8630]/5 cursor-pointer"
                          onClick={() => handleRowClick(animal)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{animal.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {animal.petName || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="font-medium">{animal.species}</div>
                            <div className="text-gray-500">{animal.breed}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.sex}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {animal.marking}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {activeTab === "captured"
                              ? animal.captureDate
                              : animal.dateObserved}
                          </td>
                          <td
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-end">
                              <div className="relative inline-block text-left">
                                <div>
                                  <button
                                    type="button"
                                    className="inline-flex justify-center w-full rounded-md px-2 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDropdown(
                                        showDropdown === animal.id
                                          ? null
                                          : animal.id
                                      );
                                    }}
                                  >
                                    <EllipsisVerticalIcon className="h-5 w-5 text-[#FA8630]" />
                                  </button>
                                </div>

                                {showDropdown === animal.id && (
                                  <div
                                    className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                                    style={{
                                      position: "fixed",
                                      minWidth: "14rem",
                                    }}
                                  >
                                    <div
                                      className="py-1"
                                      role="menu"
                                      aria-orientation="vertical"
                                    >
                                      {activeTab === "captured" ? (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToObservation(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Accept Registration
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToAdoption(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Reject Registration
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedAnimal(animal);
                                              setIsEditModalOpen(true);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Add Observation
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleSendToCaptured(animal);
                                              setShowDropdown(null);
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                                            role="menuitem"
                                          >
                                            Send to Captured List
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No animals found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <RegisterAnimalModal
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onRegister={handleRegisterAnimal}
        />

        {selectedAnimal && (
          <ObservationProfile
            animal={selectedAnimal}
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            onSave={handleSaveAnimal}
          />
        )}

        {isEditModalOpen && selectedAnimal && (
          <EditObservation
            animal={selectedAnimal}
            onClose={() => setIsEditModalOpen(false)}
            onSave={
              activeTab === "captured"
                ? handleSaveAnimal
                : handleSaveObservation
            }
          />
        )}
      </main>
    </div>
  );
};

export default PetRegistration;
