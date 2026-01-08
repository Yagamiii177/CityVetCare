import { X } from "lucide-react";

export const TagsSection = ({
  formData,
  setFormData,
  tagInput,
  setTagInput,
  handleAddTag,
  handleRemoveTag,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleAddTag())
          }
          className="flex-1 border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Add a tag"
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {formData.tags.map((tag, index) => (
          <span
            key={index}
            className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1 font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="text-orange-600 hover:text-orange-800"
            >
              <X size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

