import { useState, useEffect } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/CampaignManagement/Drawer";
import NewAnnouncement from "../../components/CampaignManagement/AnnouncementList/NewAnnouncement";
import ViewAnnouncement from "../../components/CampaignManagement/AnnouncementList/ViewAnnouncement";
import EditAnnouncement from "../../components/CampaignManagement/AnnouncementList/EditAnnouncement";
import ArchiveAnnouncement from "../../components/CampaignManagement/AnnouncementList/ArchiveAnnouncement";
import {
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  TagIcon,
  MegaphoneIcon,
  ArchiveBoxIcon,
  PhotoIcon,
  CalendarDaysIcon,
  ArchiveBoxArrowDownIcon,
  PencilIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// API Service Functions (replace with actual API calls)
const announcementAPI = {
  fetchAnnouncements: async () => {
    // Replace with actual API call
    return [
      {
        id: 1,
        title: "Vaccination Guidelines Update for 2025",
        category: "health",
        categoryName: "Health Advisory",
        author: "Dr. Maria Santos",
        publishDate: "2025-11-15",
        status: "Published",
        priority: "High",
        views: 245,
        description: "Updated vaccination guidelines for all domestic pets.",
        attachments: [
          { id: 1, name: "guidelines.pdf", size: 2048, type: "pdf" },
          { id: 2, name: "vaccine_schedule.jpg", size: 1024, type: "image" },
        ],
        lastUpdated: "2025-11-15T10:30:00Z",
        isArchived: false,
      },
      {
        id: 2,
        title: "Old Policy from 2024",
        category: "policy",
        categoryName: "Policy Update",
        author: "City Administration",
        publishDate: "2024-03-10",
        status: "Archived",
        priority: "Medium",
        views: 120,
        description: "Previous policy that has been superseded.",
        attachments: [],
        lastUpdated: "2024-03-10T14:20:00Z",
        isArchived: true,
      },
      // ... other announcements
    ];
  },

  createAnnouncement: async (data) => {
    // Replace with actual API call
    console.log("Creating announcement:", data);
    return { success: true, data };
  },

  updateAnnouncement: async (id, data) => {
    // Replace with actual API call
    console.log(`Updating announcement ${id}:`, data);
    return { success: true, data };
  },

  archiveAnnouncement: async (id) => {
    // Replace with actual API call
    console.log(`Archiving announcement ${id}`);
    return { success: true };
  },

  restoreAnnouncement: async (id) => {
    // Replace with actual API call
    console.log(`Restoring announcement ${id}`);
    return { success: true };
  },
};

const AnnouncementManagement = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [archivingAnnouncement, setArchivingAnnouncement] = useState(null);
  const [isNewAnnouncementOpen, setIsNewAnnouncementOpen] = useState(false);

  // Data states
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  // Fetch announcements on component mount
  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await announcementAPI.fetchAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      setError("Failed to load announcements");
      console.error("Error fetching announcements:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Categories for sidebar (could also be fetched from backend)
  const categories = [
    { id: "all", name: "All Announcements", icon: MegaphoneIcon },
    { id: "health", name: "Health Advisory", icon: ExclamationTriangleIcon },
    { id: "policy", name: "Policy Update", icon: DocumentTextIcon },
    { id: "events", name: "Events", icon: CalendarDaysIcon },
    { id: "general", name: "General Info", icon: TagIcon },
    { id: "draft", name: "Drafts", icon: ClockIcon },
    { id: "archive", name: "Archived", icon: ArchiveBoxIcon },
  ];

  // Calculate counts dynamically
  const categoryCounts = {
    all: announcements.length,
    health: announcements.filter(
      (a) => a.category === "health" && !a.isArchived
    ).length,
    policy: announcements.filter(
      (a) => a.category === "policy" && !a.isArchived
    ).length,
    events: announcements.filter(
      (a) => a.category === "events" && !a.isArchived
    ).length,
    general: announcements.filter(
      (a) => a.category === "general" && !a.isArchived
    ).length,
    draft: announcements.filter((a) => a.status === "Draft" && !a.isArchived)
      .length,
    archive: announcements.filter(
      (a) => a.isArchived || a.status === "Archived"
    ).length,
  };

  const statusCounts = {
    all: announcements.filter((a) => !a.isArchived).length,
    Published: announcements.filter(
      (a) => a.status === "Published" && !a.isArchived
    ).length,
    Scheduled: announcements.filter(
      (a) => a.status === "Scheduled" && !a.isArchived
    ).length,
    Draft: announcements.filter((a) => a.status === "Draft" && !a.isArchived)
      .length,
    Archived: announcements.filter(
      (a) => a.isArchived || a.status === "Archived"
    ).length,
  };

  // Filter and sort logic
  const filteredAnnouncements = announcements
    .filter((announcement) => {
      const matchesSearch =
        announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        announcement.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        announcement.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || announcement.status === statusFilter;

      const matchesCategory = (() => {
        if (activeCategory === "all") {
          return !announcement.isArchived; // Show non-archived for "all"
        } else if (activeCategory === "archive") {
          return announcement.isArchived || announcement.status === "Archived";
        } else {
          return (
            announcement.category === activeCategory && !announcement.isArchived
          );
        }
      })();

      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "date":
          aValue = new Date(a.publishDate || a.createdAt);
          bValue = new Date(b.publishDate || b.createdAt);
          break;
        case "priority":
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case "views":
          aValue = a.views || 0;
          bValue = b.views || 0;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      return sortOrder === "desc" ? bValue - aValue : aValue - bValue;
    });

  const getPriorityBadge = (priority) => {
    const styles = {
      High: "bg-red-50 text-red-700 border border-red-200",
      Medium: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      Low: "bg-green-50 text-green-700 border border-green-200",
    };
    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          styles[priority] || styles.Medium
        }`}
      >
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status, isArchived) => {
    const styles = {
      Published: "bg-green-50 text-green-700 border border-green-200",
      Scheduled: "bg-blue-50 text-blue-700 border border-blue-200",
      Draft: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      Archived: "bg-gray-50 text-gray-700 border border-gray-200",
    };

    const displayStatus = isArchived ? "Archived" : status;

    return (
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium ${
          styles[displayStatus] || styles.Draft
        }`}
      >
        {displayStatus}
      </span>
    );
  };

  const handleCreateAnnouncement = async (newAnnouncement) => {
    try {
      const response = await announcementAPI.createAnnouncement(
        newAnnouncement
      );
      if (response.success) {
        // Update local state
        setAnnouncements((prev) => [response.data, ...prev]);
        setIsNewAnnouncementOpen(false);
      }
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Failed to create announcement");
    }
  };

  const handleSaveEdit = async (updatedAnnouncement) => {
    try {
      const response = await announcementAPI.updateAnnouncement(
        updatedAnnouncement.id,
        updatedAnnouncement
      );
      if (response.success) {
        // Update local state
        setAnnouncements((prev) =>
          prev.map((a) => (a.id === updatedAnnouncement.id ? response.data : a))
        );
        setEditingAnnouncement(null);
      }
    } catch (err) {
      console.error("Error updating announcement:", err);
      alert("Failed to update announcement");
    }
  };

  const handleArchiveAnnouncement = async (announcementId) => {
    try {
      const response = await announcementAPI.archiveAnnouncement(
        announcementId
      );
      if (response.success) {
        // Update local state - mark as archived
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcementId
              ? { ...a, isArchived: true, status: "Archived" }
              : a
          )
        );
        setArchivingAnnouncement(null);
      }
    } catch (err) {
      console.error("Error archiving announcement:", err);
      alert("Failed to archive announcement");
    }
  };

  const handleRestoreAnnouncement = async (announcementId) => {
    try {
      const response = await announcementAPI.restoreAnnouncement(
        announcementId
      );
      if (response.success) {
        // Update local state - restore from archive
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcementId
              ? { ...a, isArchived: false, status: "Draft" } // Or whatever the original status was
              : a
          )
        );
      }
    } catch (err) {
      console.error("Error restoring announcement:", err);
      alert("Failed to restore announcement");
    }
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setEditingAnnouncement(null);
    setArchivingAnnouncement(null);
  };

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement);
    setSelectedAnnouncement(null);
    setArchivingAnnouncement(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={() => setIsDrawerOpen(!isDrawerOpen)}
        user={{ name: "City Vet Staff" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-800">
                  Announcement Management
                </h1>
                <p className="text-sm text-gray-600">
                  Create and manage public announcements
                </p>
              </div>
              <button
                onClick={() => setIsNewAnnouncementOpen(true)}
                className="flex items-center gap-2 text-sm bg-[#FA8630] text-white px-4 py-2 rounded-lg hover:bg-[#E87928] transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                New Announcement
              </button>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Sidebar Categories */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-medium text-gray-700 mb-3">
                  Categories
                </h2>
                <div className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setActiveCategory(category.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-colors ${
                          activeCategory === category.id
                            ? "bg-[#FA8630]/10 text-[#FA8630]"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{category.name}</span>
                        </div>
                        <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                          {categoryCounts[category.id] || 0}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <h2 className="text-sm font-medium text-gray-700 mb-3">
                  Overview
                </h2>
                <div className="space-y-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{status}</span>
                      <span className="text-sm font-medium text-gray-800">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {/* Search and Filters */}
              <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="flex-1 max-w-md relative">
                    {" "}
                    {/* Changed to max-w-md */}
                    <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search announcements..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm border w-full rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-2.5"
                      >
                        <XMarkIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FunnelIcon className="h-4 w-4" />
                      Filters
                    </button>
                  </div>
                </div>

                {showFilters && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#FA8630]"
                      >
                        <option value="all">All Status</option>
                        <option value="Published">Published</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="Draft">Draft</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#FA8630]"
                      >
                        <option value="date">Publish Date</option>
                        <option value="createdAt">Created Date</option>
                        <option value="views">Views</option>
                        <option value="priority">Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#FA8630]"
                      >
                        <option value="desc">Newest First</option>
                        <option value="asc">Oldest First</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Announcements List */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-sm font-medium text-gray-700">
                      {activeCategory === "archive"
                        ? "Archived Announcements"
                        : "Announcements"}{" "}
                      ({filteredAnnouncements.length})
                    </h2>
                    <span className="text-xs text-gray-500">
                      Showing {filteredAnnouncements.length} of{" "}
                      {announcements.length}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {isLoading ? (
                    <div className="p-8 text-center">
                      <div className="h-8 w-8 border-2 border-[#FA8630] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading announcements...</p>
                    </div>
                  ) : error ? (
                    <div className="p-8 text-center">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">{error}</p>
                      <button
                        onClick={fetchAnnouncements}
                        className="text-sm text-[#FA8630] hover:text-[#E87928] mt-1"
                      >
                        Retry
                      </button>
                    </div>
                  ) : filteredAnnouncements.length > 0 ? (
                    filteredAnnouncements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          announcement.isArchived ? "bg-gray-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`p-2 rounded-lg ${
                                announcement.isArchived
                                  ? "bg-gray-100"
                                  : "bg-[#FA8630]/10"
                              }`}
                            >
                              {announcement.isArchived ? (
                                <ArchiveBoxIcon className="h-5 w-5 text-gray-500" />
                              ) : (
                                <MegaphoneIcon className="h-5 w-5 text-[#FA8630]" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3
                                  className={`text-sm font-medium mb-1 ${
                                    announcement.isArchived
                                      ? "text-gray-500"
                                      : "text-gray-800"
                                  }`}
                                >
                                  {announcement.title}
                                  {announcement.isArchived && (
                                    <span className="ml-2 text-xs text-gray-400">
                                      (Archived)
                                    </span>
                                  )}
                                </h3>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-xs text-gray-500">
                                    {announcement.categoryName}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    •
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    By {announcement.author}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getPriorityBadge(announcement.priority)}
                                {getStatusBadge(
                                  announcement.status,
                                  announcement.isArchived
                                )}
                              </div>
                            </div>

                            <p
                              className={`text-sm mb-3 line-clamp-2 ${
                                announcement.isArchived
                                  ? "text-gray-400"
                                  : "text-gray-600"
                              }`}
                            >
                              {announcement.description}
                            </p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <CalendarDaysIcon className="h-3 w-3" />
                                  {announcement.publishDate ||
                                    announcement.createdAt}
                                </span>
                                <span className="flex items-center gap-1">
                                  <EyeIcon className="h-3 w-3" />
                                  {announcement.views || 0} views
                                </span>
                                {announcement.attachments?.length > 0 && (
                                  <span className="flex items-center gap-1">
                                    <PhotoIcon className="h-3 w-3" />
                                    {announcement.attachments.length} files
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">
                                  {announcement.lastUpdated
                                    ? new Date(
                                        announcement.lastUpdated
                                      ).toLocaleDateString()
                                    : "Recently"}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      handleViewAnnouncement(announcement)
                                    }
                                    className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                    title="View Details"
                                  >
                                    <EyeIcon className="h-3.5 w-3.5" />
                                    <span>View</span>
                                  </button>

                                  {!announcement.isArchived ? (
                                    <>
                                      <button
                                        onClick={() =>
                                          handleEditAnnouncement(announcement)
                                        }
                                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                        title="Edit Announcement"
                                      >
                                        <PencilIcon className="h-3.5 w-3.5" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={() =>
                                          setArchivingAnnouncement(announcement)
                                        }
                                        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                        title="Archive Announcement"
                                      >
                                        <ArchiveBoxArrowDownIcon className="h-3.5 w-3.5" />
                                        <span>Archive</span>
                                      </button>
                                    </>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        handleRestoreAnnouncement(
                                          announcement.id
                                        )
                                      }
                                      className="flex items-center gap-1 px-2 py-1.5 text-xs text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                      title="Restore Announcement"
                                    >
                                      <ArchiveBoxIcon className="h-3.5 w-3.5" />
                                      <span>Restore</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <DocumentTextIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p className="text-gray-500">No announcements found</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="text-sm text-[#FA8630] hover:text-[#E87928] mt-1"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <NewAnnouncement
        isOpen={isNewAnnouncementOpen}
        onClose={() => setIsNewAnnouncementOpen(false)}
        onCreate={handleCreateAnnouncement}
      />

      {selectedAnnouncement && (
        <ViewAnnouncement
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}

      {editingAnnouncement && (
        <EditAnnouncement
          announcement={editingAnnouncement}
          onClose={() => setEditingAnnouncement(null)}
          onSave={handleSaveEdit}
        />
      )}

      {archivingAnnouncement && (
        <ArchiveAnnouncement
          announcement={archivingAnnouncement}
          onClose={() => setArchivingAnnouncement(null)}
          onConfirm={handleArchiveAnnouncement}
        />
      )}
    </div>
  );
};

export default AnnouncementManagement;
