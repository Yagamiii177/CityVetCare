import { FolderOpen, History } from "lucide-react";

export const CategoryManager = ({
  sidebarCategories,
  selectedCategory,
  setSelectedCategory,
  activeTab,
  setActiveTab,
  archiveHistory,
}) => {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderOpen size={20} />
          Categories
        </h3>
        <div className="space-y-2">
          {sidebarCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setSelectedCategory(category.id);
                setActiveTab("all"); // Exit archive history view
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
                selectedCategory === category.id &&
                activeTab !== "archive-history"
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`${
                    selectedCategory === category.id &&
                    activeTab !== "archive-history"
                      ? "text-orange-600"
                      : "text-gray-400"
                  }`}
                >
                  {category.icon}
                </div>
                <span>{category.label}</span>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedCategory === category.id &&
                  activeTab !== "archive-history"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {category.count}
              </span>
            </button>
          ))}
        </div>

        {/* Archive History Button */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => setActiveTab("archive-history")}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${
              activeTab === "archive-history"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`${
                  activeTab === "archive-history"
                    ? "text-purple-600"
                    : "text-gray-400"
                }`}
              >
                <History size={18} />
              </div>
              <span>Archive History</span>
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                activeTab === "archive-history"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {archiveHistory.length}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
