import { useState, useMemo, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/CampaignManagement/Drawer";
import { Book } from "lucide-react";
import {
  CategoryManager,
  FilterPanel,
  MaterialForm,
  MaterialGrid,
  MaterialList,
  ArchiveHistory,
  ControlsBar,
  BulkActions,
  materialTypes,
  statusOptions,
} from "../../components/CampaignManagement/ReadingMaterials";
import { readingMaterialService } from "../../services/readingMaterialService";

const ReadingMaterialAdmin = () => {
  // State for drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // State management
  const [materials, setMaterials] = useState([]);
  const [archiveHistory, setArchiveHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    type: "book",
    category: "",
    author: "",
    description: "",
    content: "",
    url: "",
    status: "draft",
    tags: [],
    images: [],
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [tagInput, setTagInput] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("published");

  // Sidebar categories
  const sidebarCategories = [
    {
      id: "published",
      label: "Published",
      icon: <Book size={18} />,
      count: materials.filter((m) => m.status === "published").length,
    },
    {
      id: "draft",
      label: "Drafts",
      icon: <Book size={18} />,
      count: materials.filter((m) => m.status === "draft").length,
    },
    {
      id: "book",
      label: "Books",
      icon: <Book size={18} />,
      count: materials.filter((m) => m.type === "book").length,
    },
    {
      id: "website",
      label: "Websites",
      icon: <Book size={18} />,
      count: materials.filter((m) => m.type === "website").length,
    },
    {
      id: "digital",
      label: "Digital Content",
      icon: <Book size={18} />,
      count: materials.filter((m) => m.type === "digital").length,
    },
  ];

  // Fetch materials and archive history on component mount
  useEffect(() => {
    fetchMaterials();
    fetchArchiveHistory();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await readingMaterialService.getAll();
      setMaterials(data);
    } catch (err) {
      setError("Failed to load reading materials. Please try again.");
      console.error("Error fetching materials:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveHistory = async () => {
    try {
      const data = await readingMaterialService.getArchiveHistory();
      setArchiveHistory(data);
    } catch (err) {
      console.error("Error fetching archive history:", err);
    }
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          // Upload to backend
          const uploadedImage = await readingMaterialService.uploadImage(file);

          return {
            id: uploadedImage.id || Date.now() + Math.random(),
            url: uploadedImage.url,
            name: file.name,
            size: file.size,
            type: file.type,
            isCover: formData.images.length === 0,
            uploadedAt: new Date().toISOString(),
          };
        } catch (err) {
          console.error("Error uploading image:", err);
          // Fallback to local preview if upload fails
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              resolve({
                id: Date.now() + Math.random(),
                url: reader.result,
                name: file.name,
                size: file.size,
                type: file.type,
                isCover: formData.images.length === 0,
                uploadedAt: new Date().toISOString(),
                isLocal: true, // Mark as local preview
              });
            };
            reader.readAsDataURL(file);
          });
        }
      });

      const newImages = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages],
      }));
    } catch (err) {
      console.error("Error processing images:", err);
      setError("Failed to upload some images");
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove image
  const handleRemoveImage = (imageId) => {
    const updatedImages = formData.images.filter((img) => img.id !== imageId);
    // If we removed the cover image and there are other images, set the first one as cover
    const removedImage = formData.images.find((img) => img.id === imageId);
    if (removedImage?.isCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
    }

    setFormData((prev) => ({
      ...prev,
      images: updatedImages,
    }));
  };

  // Set image as cover
  const handleSetAsCover = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isCover: img.id === imageId,
      })),
    }));
  };

  // Move image position
  const handleMoveImage = (index, direction) => {
    const newImages = [...formData.images];
    if (direction === "up" && index > 0) {
      [newImages[index], newImages[index - 1]] = [
        newImages[index - 1],
        newImages[index],
      ];
    } else if (direction === "down" && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
    }
    setFormData((prev) => ({
      ...prev,
      images: newImages,
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category: "",
      }));
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError(null);
      const materialData = {
        ...formData,
        images: formData.images.map((img) => ({
          id: img.id,
          url: img.url,
          name: img.name,
          size: img.size,
          type: img.type,
          isCover: img.isCover,
        })),
      };

      if (editingId) {
        // Update existing material
        const updatedMaterial = await readingMaterialService.update(
          editingId,
          materialData
        );
        setMaterials(
          materials.map((mat) => (mat.id === editingId ? updatedMaterial : mat))
        );
      } else {
        // Create new material
        const newMaterial = await readingMaterialService.create(materialData);
        setMaterials([...materials, newMaterial]);
      }

      resetForm();
    } catch (err) {
      console.error("Error saving material:", err);
      setError("Failed to save reading material. Please try again.");
    }
  };

  // Edit material
  const handleEdit = (material) => {
    setFormData({
      ...material,
      images: material.images || [],
    });
    setEditingId(material.id);
    setShowForm(true);
  };

  // Archive material
  const handleArchive = async (id) => {
    try {
      setError(null);
      await readingMaterialService.archive(id, "Manual archive");

      // Refresh data
      await fetchMaterials();
      await fetchArchiveHistory();
    } catch (err) {
      console.error("Error archiving material:", err);
      setError("Failed to archive material. Please try again.");
    }
  };

  // Publish material
  const handlePublish = async (id) => {
    try {
      setError(null);
      await readingMaterialService.updateStatus(id, "published");

      // Update local state
      setMaterials(
        materials.map((mat) =>
          mat.id === id ? { ...mat, status: "published" } : mat
        )
      );
    } catch (err) {
      console.error("Error publishing material:", err);
      setError("Failed to publish material. Please try again.");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: "",
      title: "",
      type: "book",
      category: "",
      author: "",
      description: "",
      content: "",
      url: "",
      status: "draft",
      tags: [],
      images: [],
    });
    setEditingId(null);
    setShowForm(false);
    setUploadingImages(false);
  };

  // Filter materials based on active tab and filters
  const filteredMaterials = useMemo(() => {
    let filtered = materials;

    // Filter by active tab
    if (activeTab === "archive-history") {
      return []; // Archive history is shown separately
    } else {
      // Exclude archived materials from main view
      filtered = filtered.filter((material) => material.status !== "archived");
    }

    // Filter by sidebar category
    if (selectedCategory !== "all") {
      if (["published", "draft"].includes(selectedCategory)) {
        filtered = filtered.filter(
          (material) => material.status === selectedCategory
        );
      } else {
        filtered = filtered.filter(
          (material) => material.type === selectedCategory
        );
      }
    }

    // Apply search and other filters
    return filtered.filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesType = filterType === "all" || material.type === filterType;
      const matchesStatus =
        filterStatus === "all" || material.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [
    materials,
    searchTerm,
    filterType,
    filterStatus,
    activeTab,
    selectedCategory,
  ]);

  // Clear all filters
  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setSearchTerm("");
    setSelectedCategory("published");
  };

  // Toggle material selection
  const toggleMaterialSelection = (id) => {
    setSelectedMaterials((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select all materials
  const selectAllMaterials = () => {
    if (selectedMaterials.length === filteredMaterials.length) {
      setSelectedMaterials([]);
    } else {
      setSelectedMaterials(filteredMaterials.map((m) => m.id));
    }
  };

  // Bulk actions
  const handleBulkArchive = async () => {
    try {
      setError(null);
      await readingMaterialService.bulkArchive(
        selectedMaterials,
        "Bulk archive"
      );

      // Refresh data
      await fetchMaterials();
      await fetchArchiveHistory();
      setSelectedMaterials([]);
    } catch (err) {
      console.error("Error bulk archiving materials:", err);
      setError("Failed to archive materials. Please try again.");
    }
  };

  const handleBulkPublish = async () => {
    try {
      setError(null);
      await readingMaterialService.bulkPublish(selectedMaterials);

      // Update local state
      setMaterials(
        materials.map((mat) =>
          selectedMaterials.includes(mat.id)
            ? { ...mat, status: "published" }
            : mat
        )
      );
      setSelectedMaterials([]);
    } catch (err) {
      console.error("Error bulk publishing materials:", err);
      setError("Failed to publish materials. Please try again.");
    }
  };

  // Restore from archive
  const handleRestore = async (materialId) => {
    try {
      setError(null);
      await readingMaterialService.restore(materialId);

      // Refresh data
      await fetchMaterials();
      await fetchArchiveHistory();
    } catch (err) {
      console.error("Error restoring material:", err);
      setError("Failed to restore material. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isDrawerOpen={drawerOpen}
        toggleDrawer={() => setDrawerOpen(!drawerOpen)}
        user={{ name: "City Vet Staff" }}
      />

      <Drawer
        isOpen={drawerOpen}
        setIsDrawerOpen={setDrawerOpen}
        onItemClick={() => setDrawerOpen(false)}
      />

      <main className="pt-0 relative z-0">
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Reading Materials
            </h1>
            <p className="text-gray-600 mt-2">
              Manage books, websites, digital content, and other reading
              materials
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Categories */}
            <CategoryManager
              sidebarCategories={sidebarCategories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              archiveHistory={archiveHistory}
            />

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Controls Bar */}
              <ControlsBar
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showFilterPanel={showFilterPanel}
                setShowFilterPanel={setShowFilterPanel}
                filterType={filterType}
                filterStatus={filterStatus}
                onAddMaterial={() => setShowForm(true)}
              />

              {/* Filter Panel */}
              <FilterPanel
                showFilterPanel={showFilterPanel}
                filterType={filterType}
                setFilterType={setFilterType}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                materialTypes={materialTypes}
                statusOptions={statusOptions}
                clearFilters={clearFilters}
              />

              {/* Bulk Actions (List View) */}
              {viewMode === "list" && (
                <BulkActions
                  selectedMaterials={selectedMaterials}
                  handleBulkPublish={handleBulkPublish}
                  handleBulkArchive={handleBulkArchive}
                  setSelectedMaterials={setSelectedMaterials}
                />
              )}

              {/* Archive History View */}
              {activeTab === "archive-history" ? (
                <ArchiveHistory
                  archiveHistory={archiveHistory}
                  materials={materials}
                  setMaterials={setMaterials}
                  setArchiveHistory={setArchiveHistory}
                  onRestore={handleRestore}
                />
              ) : loading ? (
                <div className="text-center py-16">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  <p className="mt-4 text-gray-600">Loading materials...</p>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-16">
                  <Book className="mx-auto text-gray-300 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No materials found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {searchTerm ||
                    filterType !== "all" ||
                    filterStatus !== "all"
                      ? "Try adjusting your search or filters"
                      : "No reading materials yet. Add your first one!"}
                  </p>
                  {!searchTerm &&
                    filterType === "all" &&
                    filterStatus === "all" && (
                      <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                      >
                        <Book size={20} />
                        Add First Material
                      </button>
                    )}
                </div>
              ) : viewMode === "grid" ? (
                <MaterialGrid
                  filteredMaterials={filteredMaterials}
                  materialTypes={materialTypes}
                  statusOptions={statusOptions}
                  handleEdit={handleEdit}
                  handleArchive={handleArchive}
                  handlePublish={handlePublish}
                />
              ) : (
                <MaterialList
                  filteredMaterials={filteredMaterials}
                  materialTypes={materialTypes}
                  statusOptions={statusOptions}
                  selectedMaterials={selectedMaterials}
                  selectAllMaterials={selectAllMaterials}
                  toggleMaterialSelection={toggleMaterialSelection}
                  handleEdit={handleEdit}
                  handleArchive={handleArchive}
                  handlePublish={handlePublish}
                />
              )}

              {/* Footer Stats */}
              {activeTab !== "archive-history" && (
                <div className="mt-6 text-sm text-gray-500 flex items-center justify-between">
                  <span>
                    Showing {filteredMaterials.length} of {materials.length}{" "}
                    materials
                  </span>
                  {selectedMaterials.length > 0 && (
                    <span className="text-orange-600 font-medium">
                      {selectedMaterials.length} selected
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Form Modal */}
      <MaterialForm
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        showForm={showForm}
        resetForm={resetForm}
        handleSubmit={handleSubmit}
        uploadingImages={uploadingImages}
        tagInput={tagInput}
        setTagInput={setTagInput}
        handleImageUpload={handleImageUpload}
        handleRemoveImage={handleRemoveImage}
        handleSetAsCover={handleSetAsCover}
        handleMoveImage={handleMoveImage}
        handleAddTag={handleAddTag}
        handleRemoveTag={handleRemoveTag}
        handleInputChange={handleInputChange}
      />
    </div>
  );
};

export default ReadingMaterialAdmin;
