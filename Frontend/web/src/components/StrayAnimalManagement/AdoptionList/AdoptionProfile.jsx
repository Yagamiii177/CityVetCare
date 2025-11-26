import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import AdopterProfile from "./AdopterProfile";

const AdoptionProfile = ({ animal, onClose }) => {
  const [selectedAdopter, setSelectedAdopter] = useState(null);
  const [showAdopterModal, setShowAdopterModal] = useState(false);
  const [adopters, setAdopters] = useState(() => {
    // Different adopters for different animals
    const animalAdopters = {
      // Dog adopters
      1: [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          phone: "(123) 456-7890",
          status: "Pending Review",
          applicationDate: "2023-05-15",
          details: {
            age: 32,
            address: "123 Main St, Anytown, USA",
            residenceType: "House",
            ownershipStatus: "Owned",
            householdSize: 3,
            hasChildren: true,
            petExperience: true,
            currentPets: 1,
            adoptionReason: "Looking for a companion for my current dog",
          },
        },
        {
          id: 2,
          name: "Sarah Johnson",
          email: "sarah@example.com",
          phone: "(234) 567-8901",
          status: "Approved",
          applicationDate: "2023-05-18",
          details: {
            age: 28,
            address: "456 Oak Ave, Somewhere, USA",
            residenceType: "Apartment",
            ownershipStatus: "Rented",
            householdSize: 2,
            hasChildren: false,
            petExperience: true,
            currentPets: 0,
            adoptionReason: "I've always wanted a dog and now have the time",
          },
        },
      ],
      // Cat adopters
      2: [
        {
          id: 3,
          name: "Emily Chen",
          email: "emily@example.com",
          phone: "(345) 678-9012",
          status: "Pending Review",
          applicationDate: "2023-05-20",
          details: {
            age: 25,
            address: "789 Pine Rd, Nowhere, USA",
            residenceType: "Condominium",
            ownershipStatus: "Owned",
            householdSize: 1,
            hasChildren: false,
            petExperience: false,
            currentPets: 0,
            adoptionReason: "Want a companion for my small apartment",
          },
        },
      ],
      // Default adopters for other animals
      default: [
        {
          id: 4,
          name: "Michael Brown",
          email: "michael@example.com",
          phone: "(456) 789-0123",
          status: "Rejected",
          applicationDate: "2023-05-10",
          details: {
            age: 40,
            address: "321 Elm St, Anywhere, USA",
            residenceType: "Farm",
            ownershipStatus: "Owned",
            householdSize: 5,
            hasChildren: true,
            petExperience: true,
            currentPets: 3,
            adoptionReason: "Looking to add to our family of animals",
          },
        },
        {
          id: 5,
          name: "Lisa Wong",
          email: "lisa@example.com",
          phone: "(567) 890-1234",
          status: "Pending Review",
          applicationDate: "2023-05-22",
          details: {
            age: 35,
            address: "654 Maple Dr, Everywhere, USA",
            residenceType: "House",
            ownershipStatus: "Owned",
            householdSize: 4,
            hasChildren: true,
            petExperience: true,
            currentPets: 2,
            adoptionReason: "Our kids want to learn responsibility with a pet",
          },
        },
      ],
    };
    return animalAdopters[animal.id] || animalAdopters.default;
  });

  const handleAdopterClick = (adopter) => {
    setSelectedAdopter(adopter);
    setShowAdopterModal(true);
  };

  const handleStatusChange = (adopterId, statusData) => {
    setAdopters((prevAdopters) =>
      prevAdopters.map((adopter) =>
        adopter.id === adopterId
          ? {
              ...adopter,
              status: statusData.status,
              details: {
                ...adopter.details,
                ...(statusData.rejectionReason && {
                  rejectionReason: statusData.rejectionReason,
                }),
                ...(statusData.nextSteps && {
                  nextSteps: statusData.nextSteps,
                }),
                notes: statusData.notes || adopter.details.notes,
              },
            }
          : adopter
      )
    );
    setShowAdopterModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85">
      <div className="flex items-center justify-center min-h-screen p-4">
        {/* Modal container */}
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {animal.name}'s Profile
              </h3>
              <span
                className={`mt-1 px-3 py-1 rounded-full text-sm ${
                  animal.status === "Available"
                    ? "bg-green-100 text-green-800"
                    : animal.status === "Pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {animal.status}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animal Image and Basic Info */}
            <div className="space-y-6">
              <div className="rounded-lg overflow-hidden">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className="w-full h-64 object-cover"
                />
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Basic Information
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  {[
                    { label: "Species", value: animal.species },
                    { label: "Breed", value: animal.breed },
                    { label: "Gender", value: animal.gender },
                    { label: "Age", value: animal.age },
                    { label: "Color", value: animal.color },
                    { label: "Date Added", value: animal.dateAddedToAdoption },
                  ].map((item, index) => (
                    <div key={index}>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-gray-900">Notes</h4>
                <p className="mt-2 text-sm text-gray-700">{animal.notes}</p>
              </div>
            </div>

            {/* Simplified Adopters List */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Adoption Applications ({adopters.length})
              </h4>

              {adopters.length > 0 ? (
                <div className="space-y-2">
                  {adopters.map((adopter) => (
                    <div
                      key={adopter.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleAdopterClick(adopter)}
                    >
                      <div className="font-medium text-gray-900">
                        {adopter.name}
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            adopter.status === "Approved"
                              ? "bg-green-100 text-green-800"
                              : adopter.status === "Rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {adopter.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No adoption applications yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer with action buttons */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end space-x-3">
            {animal.status === "Available" && (
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#FA8630] text-sm font-medium text-white hover:bg-[#E87928] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA8630]"
                onClick={() => {
                  alert(`Application started for ${animal.name}`);
                }}
              >
                Start Adoption Application
              </button>
            )}
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FA8630]"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Adopter Profile Modal - This should be outside the main modal container */}
      {showAdopterModal && selectedAdopter && (
        <div className="fixed inset-0 z-50">
          <AdopterProfile
            adopter={selectedAdopter}
            animal={animal}
            onClose={() => setShowAdopterModal(false)}
            onStatusChange={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
};

export default AdoptionProfile;
