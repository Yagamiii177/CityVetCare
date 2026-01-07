import { History, Archive, User, Calendar, Bookmark } from "lucide-react";
import { readingMaterialService } from "../../../services/readingMaterialService";

export const ArchiveHistory = ({
  archiveHistory,
  materials,
  setMaterials,
  setArchiveHistory,
  onRestore,
}) => {
  const handleRestore = async (record) => {
    try {
      if (onRestore) {
        // Use parent's restore handler if provided
        await onRestore(record.materialId);
      } else {
        // Fallback to service call
        await readingMaterialService.restore(record.materialId);

        // Update local state
        setMaterials(
          materials.map((mat) =>
            mat.id === record.materialId
              ? { ...mat, status: record.previousStatus }
              : mat
          )
        );
        setArchiveHistory(archiveHistory.filter((r) => r.id !== record.id));
      }
    } catch (err) {
      console.error("Error restoring material:", err);
      alert("Failed to restore material. Please try again.");
    }
  };
  if (archiveHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History size={24} />
                Archive History
              </h2>
              <p className="text-gray-600 mt-1">
                Track all archived materials and restoration history
              </p>
            </div>
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
              0 records
            </span>
          </div>

          <div className="text-center py-12">
            <Archive className="mx-auto text-gray-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No archive history yet
            </h3>
            <p className="text-gray-500">Archived materials will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History size={24} />
              Archive History
            </h2>
            <p className="text-gray-600 mt-1">
              Track all archived materials and restoration history
            </p>
          </div>
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
            {archiveHistory.length} records
          </span>
        </div>

        <div className="space-y-4">
          {archiveHistory.map((record) => (
            <div
              key={record.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-200 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {record.title}
                    </h4>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      ID: {record.materialId}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>Archived by: {record.archivedBy}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Date: {record.archivedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark size={14} />
                      <span>Previous: {record.previousStatus}</span>
                    </div>
                  </div>
                  {record.reason && (
                    <p className="mt-2 text-sm text-gray-700">
                      <span className="font-medium">Reason:</span>{" "}
                      {record.reason}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleRestore(record)}
                  className="ml-4 px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors"
                >
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
