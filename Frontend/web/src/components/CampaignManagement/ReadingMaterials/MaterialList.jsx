import { Book } from "lucide-react";
import { MaterialListItem } from "./MaterialListItem";

export const MaterialList = ({
  filteredMaterials,
  materialTypes,
  statusOptions,
  selectedMaterials,
  selectAllMaterials,
  toggleMaterialSelection,
  handleEdit,
  handleArchive,
  handlePublish,
}) => {
  if (filteredMaterials.length === 0) {
    return (
      <div className="col-span-full text-center py-16">
        <Book className="mx-auto text-gray-300 mb-4" size={64} />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No materials found
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* List Header */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={
                selectedMaterials.length === filteredMaterials.length &&
                filteredMaterials.length > 0
              }
              onChange={selectAllMaterials}
              className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
          </div>
          <div className="grid grid-cols-12 gap-4 flex-1 text-xs font-medium text-gray-600">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Views</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>
      </div>

      {/* List Items */}
      {filteredMaterials.map((material) => (
        <MaterialListItem
          key={material.id}
          material={material}
          materialTypes={materialTypes}
          statusOptions={statusOptions}
          selectedMaterials={selectedMaterials}
          toggleMaterialSelection={toggleMaterialSelection}
          handleEdit={handleEdit}
          handleArchive={handleArchive}
          handlePublish={handlePublish}
        />
      ))}
    </div>
  );
};
