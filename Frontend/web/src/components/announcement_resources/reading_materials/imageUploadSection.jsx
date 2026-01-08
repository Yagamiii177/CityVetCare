import { Upload, X, ChevronDown } from "lucide-react";
import { formatFileSize, normalizeImageUrl } from "./utils.jsx";

export const ImageUploadSection = ({
  formData,
  setFormData,
  uploadingImages,
  handleImageUpload,
  handleRemoveImage,
  handleSetAsCover,
  handleMoveImage,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Book/Cover Images
      </label>

      {/* Upload Area */}
      <div className="mb-4">
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-medium">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploadingImages}
          />
        </label>
        {uploadingImages && (
          <div className="mt-2 text-sm text-orange-600">
            Uploading images...
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {formData.images.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              Uploaded Images ({formData.images.length})
            </h4>
            <div className="text-xs text-gray-500">
              First image is used as cover
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {formData.images.map((image, index) => (
              <div
                key={image.id}
                className={`relative group rounded-lg overflow-hidden border-2 ${
                  image.isCover ? "border-orange-500" : "border-gray-200"
                }`}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={normalizeImageUrl(image.url)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {image.isCover && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Cover
                    </div>
                  )}
                </div>

                {/* Image Controls */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex flex-col items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSetAsCover(image.id)}
                      className="bg-white text-gray-700 text-xs px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                    >
                      {image.isCover ? "Is Cover" : "Set as Cover"}
                    </button>
                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, "up")}
                          className="bg-white text-gray-700 p-1.5 rounded hover:bg-gray-50"
                          title="Move up"
                        >
                          <ChevronDown className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                      {index < formData.images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, "down")}
                          className="bg-white text-gray-700 p-1.5 rounded hover:bg-gray-50"
                          title="Move down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image.id)}
                        className="bg-red-500 text-white p-1.5 rounded hover:bg-red-600 transition-colors"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2">
                  <div className="text-xs truncate" title={image.name}>
                    {image.name}
                  </div>
                  <div className="text-xs opacity-75">
                    {formatFileSize(image.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

