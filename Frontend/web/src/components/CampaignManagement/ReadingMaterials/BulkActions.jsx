import { X } from "lucide-react";

export const BulkActions = ({
  selectedMaterials,
  handleBulkPublish,
  handleBulkArchive,
  setSelectedMaterials,
}) => {
  if (selectedMaterials.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-orange-700 font-medium">
            {selectedMaterials.length} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkPublish}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Publish
            </button>
            <button
              onClick={handleBulkArchive}
              className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
            >
              Archive
            </button>
          </div>
        </div>
        <button
          onClick={() => setSelectedMaterials([])}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};
