import { Book } from "lucide-react";
import { MaterialCard } from "./MaterialCard";

export const MaterialGrid = ({
  filteredMaterials,
  materialTypes,
  statusOptions,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredMaterials.map((material) => (
        <MaterialCard
          key={material.id}
          material={material}
          materialTypes={materialTypes}
          statusOptions={statusOptions}
          handleEdit={handleEdit}
          handleArchive={handleArchive}
          handlePublish={handlePublish}
        />
      ))}
    </div>
  );
};
