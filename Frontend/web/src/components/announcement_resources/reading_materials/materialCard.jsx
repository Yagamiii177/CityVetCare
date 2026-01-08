import { Calendar, User, Eye, ExternalLink } from "lucide-react";
import { MaterialActions } from "./MaterialActions";
import { getStatusConfig, getTypeConfig, normalizeImageUrl } from "./utils.jsx";

export const MaterialCard = ({
  material,
  materialTypes,
  statusOptions,
  handleEdit,
  handleArchive,
  handlePublish,
}) => {
  const statusConfig = getStatusConfig(material.status, statusOptions);
  const typeConfig = getTypeConfig(material.type, materialTypes);

  // Parse images if it's a string from the database
  const images =
    typeof material.images === "string"
      ? JSON.parse(material.images || "[]")
      : material.images || [];
  const coverImage = images.find((img) => img.isCover) || images[0];
  const coverImageUrl = normalizeImageUrl(coverImage?.url);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden">
      {/* Cover Image */}
      {coverImageUrl && (
        <div className="h-40 bg-gray-100 overflow-hidden">
          <img
            src={coverImageUrl}
            alt={material.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
            {material.title}
          </h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}
            >
              {statusConfig.icon}
              {statusConfig.label}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.color}`}
            >
              {typeConfig.icon}
              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-gray-600 text-sm line-clamp-2">
            {material.description}
          </p>
        </div>

        {/* Metadata */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-500">
            <User size={12} className="mr-1" />
            <span className="truncate">{material.author}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            <span>{material.dateAdded}</span>
            <span className="mx-1">•</span>
            <Eye size={12} className="mr-1" />
            <span>{material.views.toLocaleString()}</span>
          </div>
        </div>

        {/* Tags */}
        {material.tags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {material.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
              {material.tags.length > 2 && (
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                  +{material.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {material.type === "website" && material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                title="Open URL"
              >
                Visit →
              </a>
            )}
          </div>

          {/* Action Buttons */}
          <MaterialActions
            material={material}
            handleEdit={handleEdit}
            handleArchive={handleArchive}
            handlePublish={handlePublish}
          />
        </div>
      </div>
    </div>
  );
};

