import { useState, useMemo } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/CampaignManagement/Drawer";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Book,
  Globe,
  FileText,
  BookOpen,
  Newspaper,
  FileImage,
  Eye,
  EyeOff,
  Archive,
  Calendar,
  User,
  Tag,
  Download,
  ExternalLink,
  MoreVertical,
  ChevronDown,
  X,
  Check,
  FileUp,
  BarChart3,
} from "lucide-react";

const ReadingMaterialAdmin = () => {
  // State for drawer
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [activeMenuItem, setActiveMenuItem] = useState("reading-materials");

  // Mock data for initial materials
  const initialMaterials = [
    {
      id: 1,
      title: "React Programming Guide",
      type: "book",
      category: "manual",
      author: "John Doe",
      description:
        "Complete guide to React programming with modern practices and examples.",
      content: "",
      url: "",
      status: "published",
      dateAdded: "2024-01-15",
      views: 1245,
      tags: ["react", "programming", "guide", "javascript", "frontend"],
    },
    {
      id: 2,
      title: "Modern Web Development Blog",
      type: "website",
      category: "article",
      author: "Jane Smith",
      description:
        "Latest trends and best practices in modern web development.",
      content: "",
      url: "https://example.com/blog",
      status: "published",
      dateAdded: "2024-01-10",
      views: 890,
      tags: ["web", "development", "trends"],
    },
    {
      id: 3,
      title: "Digital Art Manual",
      type: "digital",
      category: "manual",
      author: "Art Studio",
      description: "Step-by-step digital art creation techniques and tools.",
      content: "Digital content here...",
      url: "",
      status: "draft",
      dateAdded: "2024-01-05",
      views: 320,
      tags: ["art", "digital", "tutorial", "design"],
    },
    {
      id: 4,
      title: "The Great Adventure",
      type: "creative",
      category: "novel",
      author: "Author Writer",
      description:
        "A thrilling adventure novel set in a fantasy world with complex characters.",
      content: "Novel content here...",
      url: "",
      status: "published",
      dateAdded: "2024-01-03",
      views: 1567,
      tags: ["fiction", "adventure", "novel", "fantasy"],
    },
    {
      id: 5,
      title: "Technical Documentation",
      type: "informational",
      category: "manual",
      author: "Tech Corp",
      description:
        "Comprehensive API documentation with examples and use cases.",
      content: "Technical content...",
      url: "",
      status: "published",
      dateAdded: "2024-01-12",
      views: 540,
      tags: ["technical", "documentation", "api", "backend"],
    },
    {
      id: 6,
      title: "Poetry Collection 2024",
      type: "creative",
      category: "poem",
      author: "Poet Writer",
      description: "Modern poetry collection exploring contemporary themes.",
      content: "Poetry content...",
      url: "",
      status: "archived",
      dateAdded: "2023-12-20",
      views: 210,
      tags: ["poetry", "creative", "literature"],
    },
  ];

  // State management
  const [materials, setMaterials] = useState(initialMaterials);
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
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Material type options
  const materialTypes = [
    {
      value: "book",
      label: "Book",
      icon: <Book size={16} />,
      color: "bg-orange-100 text-orange-800",
    },
    {
      value: "website",
      label: "Website/URL",
      icon: <Globe size={16} />,
      color: "bg-blue-100 text-blue-800",
    },
    {
      value: "digital",
      label: "Digital Content",
      icon: <FileText size={16} />,
      color: "bg-purple-100 text-purple-800",
    },
    {
      value: "informational",
      label: "Informational",
      icon: <Newspaper size={16} />,
      color: "bg-green-100 text-green-800",
    },
    {
      value: "creative",
      label: "Creative Work",
      icon: <BookOpen size={16} />,
      color: "bg-pink-100 text-pink-800",
    },
    {
      value: "traditional",
      label: "Traditional Print",
      icon: <FileImage size={16} />,
      color: "bg-gray-100 text-gray-800",
    },
  ];

  // Category options based on type
  const categoryOptions = {
    book: [
      { value: "manual", label: "Manual" },
      { value: "textbook", label: "Textbook" },
      { value: "reference", label: "Reference" },
      { value: "other", label: "Other" },
    ],
    website: [
      { value: "article", label: "Article" },
      { value: "blog", label: "Blog" },
      { value: "tutorial", label: "Tutorial" },
      { value: "documentation", label: "Documentation" },
    ],
    digital: [
      { value: "ebook", label: "E-Book" },
      { value: "pdf", label: "PDF" },
      { value: "presentation", label: "Presentation" },
      { value: "interactive", label: "Interactive" },
    ],
    informational: [
      { value: "manual", label: "Manual" },
      { value: "article", label: "Article" },
      { value: "report", label: "Report" },
      { value: "whitepaper", label: "Whitepaper" },
      { value: "research", label: "Research" },
    ],
    creative: [
      { value: "novel", label: "Novel" },
      { value: "comic", label: "Comic" },
      { value: "poem", label: "Poem" },
      { value: "shortstory", label: "Short Story" },
      { value: "script", label: "Script" },
    ],
    traditional: [
      { value: "book", label: "Printed Book" },
      { value: "magazine", label: "Magazine" },
      { value: "newspaper", label: "Newspaper" },
      { value: "journal", label: "Journal" },
      { value: "brochure", label: "Brochure" },
    ],
  };

  // Status options with icons and colors
  const statusOptions = [
    {
      value: "published",
      label: "Published",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <Eye size={14} />,
      bgColor: "bg-green-50",
    },
    {
      value: "draft",
      label: "Draft",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <FileUp size={14} />,
      bgColor: "bg-yellow-50",
    },
    {
      value: "archived",
      label: "Archived",
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: <Archive size={14} />,
      bgColor: "bg-gray-50",
    },
  ];

  // Toggle drawer
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
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
  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      setMaterials(
        materials.map((mat) =>
          mat.id === editingId
            ? { ...formData, id: editingId, dateAdded: mat.dateAdded }
            : mat
        )
      );
    } else {
      const newMaterial = {
        ...formData,
        id: Date.now(),
        dateAdded: new Date().toISOString().split("T")[0],
        views: 0,
      };
      setMaterials([...materials, newMaterial]);
    }
    resetForm();
  };

  // Edit material
  const handleEdit = (material) => {
    setFormData(material);
    setEditingId(material.id);
    setShowForm(true);
    setShowActionMenu(null);
  };

  // Delete material
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      setMaterials(materials.filter((mat) => mat.id !== id));
    }
    setShowActionMenu(null);
  };

  // Archive material
  const handleArchive = (id) => {
    setMaterials(
      materials.map((mat) =>
        mat.id === id ? { ...mat, status: "archived" } : mat
      )
    );
    setShowActionMenu(null);
  };

  // Publish material
  const handlePublish = (id) => {
    setMaterials(
      materials.map((mat) =>
        mat.id === id ? { ...mat, status: "published" } : mat
      )
    );
    setShowActionMenu(null);
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
    });
    setEditingId(null);
    setShowForm(false);
  };

  // Filter materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
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
  }, [materials, searchTerm, filterType, filterStatus]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      total: materials.length,
      published: materials.filter((m) => m.status === "published").length,
      drafts: materials.filter((m) => m.status === "draft").length,
      archived: materials.filter((m) => m.status === "archived").length,
      totalViews: materials.reduce((sum, mat) => sum + (mat.views || 0), 0),
    };
  }, [materials]);

  // Get status config
  const getStatusConfig = (status) => {
    return statusOptions.find((s) => s.value === status) || statusOptions[0];
  };

  // Get type config
  const getTypeConfig = (type) => {
    return materialTypes.find((t) => t.value === type) || materialTypes[0];
  };

  // Get category label
  const getCategoryLabel = (type, category) => {
    const categories = categoryOptions[type];
    const catObj = categories?.find((c) => c.value === category);
    return catObj ? catObj.label : category;
  };

  // Handle stats click
  const handleStatClick = (stat) => {
    switch (stat) {
      case "published":
        setFilterStatus("published");
        break;
      case "drafts":
        setFilterStatus("draft");
        break;
      case "archived":
        setFilterStatus("archived");
        break;
      case "totalViews":
        // In a real app, this would open analytics
        alert("Analytics view would open here");
        break;
      default:
        setFilterStatus("all");
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilterType("all");
    setFilterStatus("all");
    setSearchTerm("");
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
  const handleBulkArchive = () => {
    setMaterials(
      materials.map((mat) =>
        selectedMaterials.includes(mat.id)
          ? { ...mat, status: "archived" }
          : mat
      )
    );
    setSelectedMaterials([]);
  };

  const handleBulkPublish = () => {
    setMaterials(
      materials.map((mat) =>
        selectedMaterials.includes(mat.id)
          ? { ...mat, status: "published" }
          : mat
      )
    );
    setSelectedMaterials([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Delete ${selectedMaterials.length} material(s)?`)) {
      setMaterials(
        materials.filter((mat) => !selectedMaterials.includes(mat.id))
      );
      setSelectedMaterials([]);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Drawer Component */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeItem={activeMenuItem}
        onItemClick={setActiveMenuItem}
      />

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col ${
          drawerOpen ? "ml-64" : "ml-0"
        } transition-all duration-300`}
      >
        {/* Header Component */}
        <Header
          title="Reading Material Management"
          onMenuClick={toggleDrawer}
          drawerOpen={drawerOpen}
          userProfile={{
            name: "Admin User",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all"
              onClick={() => handleStatClick("all")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Materials
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.total}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Book className="text-orange-600" size={24} />
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-green-200 hover:shadow-md transition-all"
              onClick={() => handleStatClick("published")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Published</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.published}
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <Eye className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-yellow-200 hover:shadow-md transition-all"
              onClick={() => handleStatClick("drafts")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Drafts</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.drafts}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <FileUp className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-md transition-all"
              onClick={() => handleStatClick("totalViews")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Views
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.totalViews.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <BarChart3 className="text-purple-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Controls Bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2.5 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
                >
                  <Plus size={20} />
                  New Material
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                      viewMode === "grid"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-3 py-1.5 rounded-lg font-medium text-sm ${
                      viewMode === "list"
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    List
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  Filters
                  {(filterType !== "all" || filterStatus !== "all") && (
                    <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                      2
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Filter Panel */}
            {showFilterPanel && (
              <div className="mt-4 p-4 border-t border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Types</option>
                        {materialTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="all">All Status</option>
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Active Filter Chips */}
                {(filterType !== "all" || filterStatus !== "all") && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {filterType !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
                        Type:{" "}
                        {
                          materialTypes.find((t) => t.value === filterType)
                            ?.label
                        }
                        <button
                          onClick={() => setFilterType("all")}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                    {filterStatus !== "all" && (
                      <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full text-sm">
                        Status:{" "}
                        {
                          statusOptions.find((s) => s.value === filterStatus)
                            ?.label
                        }
                        <button
                          onClick={() => setFilterStatus("all")}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Bulk Actions (List View) */}
            {viewMode === "list" && selectedMaterials.length > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-orange-700 font-medium">
                      {selectedMaterials.length} selected
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkPublish}
                        className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Publish
                      </button>
                      <button
                        onClick={handleBulkArchive}
                        className="px-3 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Archive
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMaterials([])}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Materials Display */}
          {filteredMaterials.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <Book className="mx-auto text-gray-300 mb-4" size={64} />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No materials found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
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
                    <Plus size={20} />
                    Add First Material
                  </button>
                )}
            </div>
          ) : viewMode === "grid" ? (
            // Grid View
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.map((material) => {
                const statusConfig = getStatusConfig(material.status);
                const typeConfig = getTypeConfig(material.type);

                return (
                  <div
                    key={material.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="p-5">
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                            {material.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}
                            >
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="mb-4">
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {material.description}
                        </p>
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <User size={14} className="mr-2" />
                          <span className="truncate">{material.author}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-2" />
                          <span>Added {material.dateAdded}</span>
                          <span className="mx-2">•</span>
                          <Eye size={14} className="mr-2" />
                          <span>{material.views.toLocaleString()} views</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          Category:{" "}
                          {getCategoryLabel(material.type, material.category)}
                        </div>
                      </div>

                      {/* Tags (Collapsible) */}
                      {material.tags.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Tag size={14} />
                            <span>Tags</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {material.tags.slice(0, 2).map((tag, index) => (
                              <span
                                key={index}
                                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {material.tags.length > 2 && (
                              <div className="relative group">
                                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs cursor-help">
                                  +{material.tags.length - 2} more
                                </span>
                                <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10">
                                  <div className="bg-gray-800 text-white text-xs rounded py-2 px-3 shadow-lg">
                                    <div className="flex flex-wrap gap-1 max-w-xs">
                                      {material.tags
                                        .slice(2)
                                        .map((tag, index) => (
                                          <span
                                            key={index}
                                            className="inline-block"
                                          >
                                            {tag}
                                          </span>
                                        ))}
                                    </div>
                                    <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          {material.type === "website" && material.url && (
                            <a
                              href={material.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              title="Open URL"
                            >
                              Visit Link →
                            </a>
                          )}
                        </div>

                        {/* Action Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setShowActionMenu(
                                showActionMenu === material.id
                                  ? null
                                  : material.id
                              )
                            }
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          >
                            <MoreVertical size={18} />
                          </button>

                          {showActionMenu === material.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                              <div className="py-1">
                                <button
                                  onClick={() => handleEdit(material)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit size={14} />
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    material.status === "published"
                                      ? handleArchive(material.id)
                                      : handlePublish(material.id)
                                  }
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  {material.status === "published" ? (
                                    <Archive size={14} />
                                  ) : (
                                    <Eye size={14} />
                                  )}
                                  {material.status === "published"
                                    ? "Archive"
                                    : "Publish"}
                                </button>
                                <button
                                  onClick={() => handleDelete(material.id)}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="space-y-3">
              {/* List Header */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                  <div className="grid grid-cols-12 gap-4 flex-1 text-sm font-medium text-gray-600">
                    <div className="col-span-5">Title</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Views</div>
                    <div className="col-span-1">Actions</div>
                  </div>
                </div>
              </div>

              {/* List Items */}
              {filteredMaterials.map((material) => {
                const statusConfig = getStatusConfig(material.status);
                const typeConfig = getTypeConfig(material.type);

                return (
                  <div
                    key={material.id}
                    className="bg-white rounded-lg border border-gray-100 hover:border-orange-200 transition-colors"
                  >
                    <div className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedMaterials.includes(material.id)}
                            onChange={() =>
                              toggleMaterialSelection(material.id)
                            }
                            className="h-4 w-4 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                          />
                        </div>

                        <div className="grid grid-cols-12 gap-4 flex-1 items-center">
                          {/* Title Column */}
                          <div className="col-span-5">
                            <div className="flex flex-col">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {material.title}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">
                                {material.author}
                              </p>
                            </div>
                          </div>

                          {/* Type Column */}
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}
                            >
                              {typeConfig.icon}
                              {typeConfig.label}
                            </span>
                          </div>

                          {/* Status Column */}
                          <div className="col-span-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                            >
                              {statusConfig.icon}
                              {statusConfig.label}
                            </span>
                          </div>

                          {/* Views Column */}
                          <div className="col-span-2">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Eye size={14} />
                              <span>{material.views.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Actions Column */}
                          <div className="col-span-1 relative">
                            <button
                              onClick={() =>
                                setShowActionMenu(
                                  showActionMenu === material.id
                                    ? null
                                    : material.id
                                )
                              }
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {showActionMenu === material.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleEdit(material)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    <Edit size={14} />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      material.status === "published"
                                        ? handleArchive(material.id)
                                        : handlePublish(material.id)
                                    }
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  >
                                    {material.status === "published" ? (
                                      <Archive size={14} />
                                    ) : (
                                      <Eye size={14} />
                                    )}
                                    {material.status === "published"
                                      ? "Archive"
                                      : "Publish"}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(material.id)}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer Stats */}
          <div className="mt-8 text-sm text-gray-500 flex items-center justify-between">
            <span>
              Showing {filteredMaterials.length} of {materials.length} materials
            </span>
            {selectedMaterials.length > 0 && (
              <span className="text-orange-600 font-medium">
                {selectedMaterials.length} selected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingId ? "Edit Material" : "Add New Reading Material"}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Fill in the details below
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter material title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Author/Publisher
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter author or publisher name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          {materialTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          required
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="">Select category</option>
                          {categoryOptions[formData.type]?.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                              {cat.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {formData.type === "website" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Website URL *
                        </label>
                        <input
                          type="url"
                          name="url"
                          value={formData.url}
                          onChange={handleInputChange}
                          required={formData.type === "website"}
                          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter material description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content {formData.type !== "website" && "*"}
                      </label>
                      <textarea
                        name="content"
                        value={formData.content}
                        onChange={handleInputChange}
                        required={formData.type !== "website"}
                        rows="4"
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Enter content or leave blank for URL-based materials"
                      />
                    </div>

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
                            e.key === "Enter" &&
                            (e.preventDefault(), handleAddTag())
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
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm font-medium"
                  >
                    {editingId ? "Update Material" : "Add Material"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Close menu when clicking outside */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  );
};

export default ReadingMaterialAdmin;
