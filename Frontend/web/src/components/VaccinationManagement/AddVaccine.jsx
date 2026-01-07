import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const AddVaccineModal = ({ isOpen, onClose, onRegister }) => {
    const initialFormData = {
        petId: "",
        petName: "",
        vaccine: "",
        dateAdministered: new Date().toISOString().split("T")[0],
        nextVaccination: "",
        veterinarian: "",
        notes: "",
    };

    const [formData, setFormData] = useState(initialFormData);
    const [registeredPets, setRegisteredPets] = useState([]);

    const vaccineOptions = [
        "Canine Distemper Virus (CDV)",
        "Canine Adenovirus (CAV-1 and CAV-2)",
        "Canine Parvovirus (CPV)",
        "Canine Parainfluenza Virus (CPiV)",
        "Canine Influenza Virus (CIV)",
        "Feline Viral Rhinotracheitis (FVR/FHV-1)",
        "Feline Calicivirus (FCV)",
        "Feline Panleukopenia (FPV)",
        "Feline Leukemia Virus (FeLV)",
        "Feline Immunodeficiency Virus (FIV)"
    ];

    useEffect(() => {
        // Predefined list of pets
        const pets = [
            {
                id: 1,
                name: "Fluffy",
                species: "Cat",
                breed: "Maine Coon",
                gender: "Female",
                color: "Orange and White",
                status: "Healthy"
            },
            {
                id: 2,
                name: "Spike",
                species: "Dog",
                breed: "Pit Bull",
                gender: "Male",
                color: "Brown",
                status: "Under Observation"
            },
            {
                id: 3,
                name: "Snowball",
                species: "Cat",
                breed: "Domestic Longhair",
                gender: "Female",
                color: "White",
                status: "Healthy"
            },
            {
                id: 4,
                name: "Thor",
                species: "Dog",
                breed: "Great Dane",
                gender: "Male",
                color: "Fawn",
                status: "Healthy"
            },
            {
                id: 5,
                name: "Princess",
                species: "Cat",
                breed: "Ragdoll",
                gender: "Female",
                color: "Seal Point",
                status: "Healthy"
            }
        ];
        setRegisteredPets(pets);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "petId") {
            const selectedPet = registeredPets.find(pet => pet.id === parseInt(value));
            setFormData({
                ...formData,
                petId: value,
                petName: selectedPet ? selectedPet.name : ""
            });
        } else if (name === "dateAdministered") {
            // Calculate next vaccination date (1 year from administered date)
            const nextDate = new Date(value);
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            setFormData({
                ...formData,
                [name]: value,
                nextVaccination: nextDate.toISOString().split("T")[0]
            });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleClearForm = () => {
        setFormData({
            ...initialFormData,
            dateAdministered: new Date().toISOString().split("T")[0],
        });
    };

    const handleSubmit = () => {
        onRegister(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-6 pb-4 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Record Vaccine
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <form className="p-6 space-y-8">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Pet Name <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="petId"
                                    value={formData.petId}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
                                    required
                                >
                                    <option value="">Select a pet</option>
                                    {registeredPets.map((pet) => (
                                        <option key={pet.id} value={pet.id}>
                                            {pet.name} ({pet.species} - {pet.breed})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Vaccine <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="vaccine"
                                    value={formData.vaccine}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
                                    required
                                >
                                    <option value="">Select a vaccine</option>
                                    {vaccineOptions.map((vaccine) => (
                                        <option key={vaccine} value={vaccine}>
                                            {vaccine}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Veterinarian <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="veterinarian"
                                    value={formData.veterinarian}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Date Administered <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="dateAdministered"
                                    value={formData.dateAdministered}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Next Vaccination
                                </label>
                                <input
                                    type="date"
                                    name="nextVaccination"
                                    value={formData.nextVaccination}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50"
                                    readOnly
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
                                placeholder="Any additional notes about the vaccination..."
                            />
                        </div>
                    </div>

                    <div className="sticky bottom-0 bg-white pt-6 pb-4 border-t">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleClearForm}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex-1 sm:flex-none"
                                >
                                    Clear Form
                                </button>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium flex-1 sm:flex-none"
                                >
                                    Cancel
                                </button>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="px-4 py-2 text-sm bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors font-medium shadow-sm flex-1 sm:flex-none"
                                >
                                    Save Record
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddVaccineModal;
