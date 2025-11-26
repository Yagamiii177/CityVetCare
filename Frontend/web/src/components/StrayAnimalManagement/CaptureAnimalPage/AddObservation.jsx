import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { format, parseISO } from "date-fns";

const AddObservation = ({ animal, onClose, onSave }) => {
  const formatDateDisplay = (dateString) => {
    return format(parseISO(dateString), "MMMM dd, yyyy");
  };

  const [newObservation, setNewObservation] = useState({
    date: new Date().toISOString().split("T")[0],
    notes: "",
    status: "Observation",
  });

  const handleNewObservationChange = (e) => {
    const { name, value } = e.target;
    setNewObservation({ ...newObservation, [name]: value });
  };

  const handleAddObservation = () => {
    if (!newObservation.notes) return;

    const updatedAnimal = {
      ...animal,
      observationNotes: newObservation.notes,
      status: newObservation.status,
      dateObserved: newObservation.date,
      pastObservations: [
        ...(animal.pastObservations || []),
        {
          date: newObservation.date,
          notes: newObservation.notes,
          status: newObservation.status,
        },
      ],
    };

    onSave(updatedAnimal);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 pb-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              Add Observation for {animal.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Observation Date
              </label>
              <input
                type="date"
                name="date"
                value={newObservation.date}
                onChange={handleNewObservationChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
              />
              <p className="text-sm text-gray-500">
                {formatDateDisplay(newObservation.date)}
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                value={newObservation.status}
                onChange={handleNewObservationChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
              >
                <option value="Observation">Observation</option>
                <option value="Healthy">Healthy</option>
                <option value="Injured">Injured</option>
                <option value="Sick">Sick</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Observation Notes
            </label>
            <textarea
              name="notes"
              value={newObservation.notes}
              onChange={handleNewObservationChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FA8630] focus:border-[#FA8630] transition-all"
              placeholder="Enter observation notes..."
            />
          </div>

          {animal.pastObservations?.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Past Observations
              </h3>
              <div className="space-y-2">
                {animal.pastObservations
                  .slice()
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((obs, index) => (
                    <div
                      key={index}
                      className="border-l-4 border-[#FA8630] pl-4 py-2 bg-gray-50 rounded"
                    >
                      <p className="font-medium">
                        {formatDateDisplay(obs.date)}
                      </p>
                      <p className="text-gray-700">{obs.notes}</p>
                      <p className="text-sm text-gray-500">
                        Status: {obs.status}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddObservation}
            className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors"
            disabled={!newObservation.notes}
          >
            Add Observation
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddObservation;
