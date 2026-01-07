import { Eye } from "lucide-react";
import { MaterialActions } from "./MaterialActions";
import { getStatusConfig, getTypeConfig, normalizeImageUrl } from "./utils.jsx";

export const MaterialListItem = ({
  material,
  materialTypes,
  statusOptions,
  selectedMaterials,
  toggleMaterialSelection,
  handleEdit,
  handleArchive,
  handlePublish,
}) => {
  const statusConfig = getStatusConfig(material.status, statusOptions);
  const typeConfig = getTypeConfig(material.type, materialTypes);
  const coverImage =
    (material.images || []).find((img) => img.isCover) ||
    (Array.isArray(material.images) ? material.images[0] : undefined);
  const coverImageUrl = normalizeImageUrl(coverImage?.url);

  return (
    <div className="bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-colors">
      <div className="p-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedMaterials.includes(material.id)}
              onChange={() => toggleMaterialSelection(material.id)}
              className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-12 gap-4 flex-1 items-center">
            {/* Title Column */}
            <div className="col-span-5">
              <div className="flex items-center gap-2">
                {coverImageUrl && (
                  <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={coverImageUrl}
                      alt={material.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900 text-sm truncate">
                    {material.title}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">
                    {material.author}
                  </p>
                </div>
              </div>
            </div>

            {/* Type Column */}
            <div className="col-span-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}
              >
                {typeConfig.icon}
                <span className="hidden sm:inline">{typeConfig.label}</span>
              </span>
            </div>

            {/* Status Column */}
            <div className="col-span-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
              >
                {statusConfig.icon}
                <span className="hidden sm:inline">{statusConfig.label}</span>
              </span>
            </div>

            {/* Views Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-1 text-gray-600 text-xs">
                <Eye size={12} />
                <span>{material.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions Column */}
            <div className="col-span-1">
              <MaterialActions
                material={material}
                handleEdit={handleEdit}
                handleArchive={handleArchive}
                handlePublish={handlePublish}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
