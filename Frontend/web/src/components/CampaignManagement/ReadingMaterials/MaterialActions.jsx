import { Edit, Archive, Eye } from "lucide-react";

export const MaterialActions = ({
  material,
  handleEdit,
  handleArchive,
  handlePublish,
}) => {
  return (
    <div className="flex items-center gap-1">
      {/* Edit Button */}
      <button
        onClick={() => handleEdit(material)}
        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded text-xs font-medium transition-colors"
        title="Edit Material"
      >
        <Edit size={12} />
      </button>

      {/* Archive/Unarchive Button */}
      {material.status === "archived" ? (
        <button
          onClick={() => handlePublish(material.id)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded text-xs font-medium transition-colors"
          title="Unarchive Material"
        >
          <Eye size={12} />
        </button>
      ) : (
        <button
          onClick={() => handleArchive(material.id)}
          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded text-xs font-medium transition-colors"
          title="Archive Material"
        >
          <Archive size={12} />
        </button>
      )}
    </div>
  );
};
