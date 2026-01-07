import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PencilSquareIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

const ObservationProfile = ({ animal, onClose, isOpen, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnimal, setEditedAnimal] = useState(animal);

  useEffect(() => {
    setEditedAnimal(animal);
    setIsEditing(false);
  }, [animal]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedAnimal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleObservationChange = (index, field, value) => {
    const updatedObservations = [...editedAnimal.pastObservations];
    updatedObservations[index][field] = value;
    setEditedAnimal((prev) => ({
      ...prev,
      pastObservations: updatedObservations,
    }));
  };

  const handleImageChange = (view, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedAnimal((prev) => ({
          ...prev,
          images: {
            ...prev.images,
            [view]: {
              ...prev.images[view],
              preview: reader.result,
              file,
            },
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave(editedAnimal);
    setIsEditing(false);
  };



  const removeObservation = (index) => {
    setEditedAnimal((prev) => ({
      ...prev,
      pastObservations: prev.pastObservations.filter((_, i) => i !== index),
    }));
  };

  const removeImage = (view) => {
    setEditedAnimal((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [view]: null,
      },
    }));
  };

  // Format date to "Month Day, Year" (e.g., "June 07, 2025")
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "2-digit" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Sort observations by date in descending order (newest first)
  const sortedObservations = [...(editedAnimal.pastObservations || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white p-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedAnimal.name}
                  onChange={handleInputChange}
                  className="border rounded px-2 py-1 text-2xl font-bold"
                />
              ) : (
                `${animal.name}'s Profile`
              )}
            </h2>
            <div className="flex items-center gap-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                >
                  <CheckIcon className="h-5 w-5" />
                  Save
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Animal Details */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Species:</span>{" "}
                    {isEditing ? (
                      <select
                        name="species"
                        value={editedAnimal.species}
                        onChange={handleInputChange}
                        className="ml-2 border rounded px-2 py-1"
                      >
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                      </select>
                    ) : (
                      editedAnimal.species
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Breed:</span>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        name="breed"
                        value={editedAnimal.breed}
                        onChange={handleInputChange}
                        className="ml-2 border rounded px-2 py-1"
                      />
                    ) : (
                      editedAnimal.breed
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Gender:</span>{" "}
                    {isEditing ? (
                      <select
                        name="gender"
                        value={editedAnimal.gender}
                        onChange={handleInputChange}
                        className="ml-2 border rounded px-2 py-1"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    ) : (
                      editedAnimal.gender
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Color:</span>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        name="color"
                        value={editedAnimal.color}
                        onChange={handleInputChange}
                        className="ml-2 border rounded px-2 py-1"
                      />
                    ) : (
                      editedAnimal.color
                    )}
                  </p>
                  <p>
                    <span className="font-medium">Markings:</span>{" "}
                    {isEditing ? (
                      <input
                        type="text"
                        name="marking"
                        value={editedAnimal.marking || ""}
                        onChange={handleInputChange}
                        className="ml-2 border rounded px-2 py-1"
                      />
                    ) : (
                      editedAnimal.marking || "None"
                    )}
                  </p>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Location:</span>{" "}
                      {isEditing ? (
                        <input
                          type="text"
                          name="location"
                          value={editedAnimal.location}
                          onChange={handleInputChange}
                          className="ml-2 border rounded px-2 py-1"
                        />
                      ) : (
                        editedAnimal.location
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Date Registered:</span>{" "}
                      {isEditing ? (
                        <input
                          type="date"
                          name={
                            animal.dateCaptured ? "dateCaptured" : "dateObserved"
                          }
                          value={
                            editedAnimal.dateCaptured || editedAnimal.dateObserved
                          }
                          onChange={handleInputChange}
                          className="ml-2 border rounded px-2 py-1"
                        />
                      ) : (
                        formatDate(
                          editedAnimal.dateCaptured || editedAnimal.dateObserved
                        )
                      )}
                    </p>
                  </div>
                </div>



              </div>

              {/* Images Section - Fixed to prevent overlapping */}
              <div className="col-span-1 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Images</h3>
                <div className="grid grid-cols-2 gap-2">
                  {["front", "back", "left", "right", "top"].map((view) => (
                    <div key={view} className="relative h-32">
                      {editedAnimal.images?.[view]?.preview ? (
                        <>
                          <div className="border rounded-lg overflow-hidden h-full">
                            <img
                              src={editedAnimal.images[view].preview}
                              alt={`${view} view`}
                              className="w-full h-full object-cover"
                            />
                            <p className="text-xs text-center py-1 capitalize absolute bottom-0 left-0 right-0 bg-white/80">
                              {view} view
                            </p>
                          </div>
                          {isEditing && (
                            <button
                              onClick={() => removeImage(view)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </button>
                          )}
                        </>
                      ) : isEditing ? (
                        <div className="border-2 border-dashed rounded-lg h-full flex flex-col items-center justify-center">
                          <label className="text-xs text-center capitalize mb-1">
                            {view} view
                          </label>
                          <label className="cursor-pointer text-blue-500 hover:text-blue-700 text-sm">
                            Upload Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageChange(view, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      ) : (
                        <div className="border rounded-lg h-full flex items-center justify-center bg-gray-50">
                          <p className="text-xs text-gray-500 capitalize">
                            No {view} image
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
              {isEditing ? (
                <textarea
                  name={animal.notes ? "notes" : "observationNotes"}
                  value={
                    editedAnimal.notes || editedAnimal.observationNotes || ""
                  }
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded px-2 py-1"
                />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  {editedAnimal.notes ||
                    editedAnimal.observationNotes ||
                    "No notes available"}
                </div>
              )}
            </div>


          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ObservationProfile;
