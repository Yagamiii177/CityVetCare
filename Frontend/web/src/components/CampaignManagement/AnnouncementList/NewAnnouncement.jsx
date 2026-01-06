import { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  TagIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

const NewAnnouncement = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    title: "",
    category: "general",
    priority: "medium",
    author: "",
    content: "",
    publishDate: "",
    publishTime: "",
    status: "draft",
    attachments: [],
    audience: "public",
  });

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPublishOption, setSelectedPublishOption] = useState("draft");
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const categories = [
    {
      id: "health",
      name: "Health Advisory",
      icon: ExclamationTriangleIcon,
      color: "text-red-500",
    },
    {
      id: "policy",
      name: "Policy Update",
      icon: DocumentTextIcon,
      color: "text-blue-500",
    },
    {
      id: "events",
      name: "Events",
      icon: CalendarDaysIcon,
      color: "text-green-500",
    },
    {
      id: "general",
      name: "General Information",
      icon: TagIcon,
      color: "text-gray-500",
    },
  ];

  const priorities = [
    { id: "low", name: "Low", color: "bg-green-100 text-green-700" },
    { id: "medium", name: "Medium", color: "bg-yellow-100 text-yellow-700" },
    { id: "high", name: "High", color: "bg-red-100 text-red-700" },
  ];

  const publishOptions = [
    {
      id: "draft",
      name: "Save as Draft",
      icon: ClockIcon,
      description: "Save for later editing",
    },
    {
      id: "schedule",
      name: "Schedule for Later",
      icon: CalendarDaysIcon,
      description: "Set date and time for publication",
    },
    {
      id: "publish",
      name: "Publish Now",
      icon: PaperAirplaneIcon,
      description: "Make announcement visible immediately",
    },
  ];

  const showNotification = (message, type = "error") => {
    setNotification({ show: true, message, type });
  };

  // Auto-hide notification after 3 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handlePrioritySelect = (priorityId) => {
    setFormData((prev) => ({
      ...prev,
      priority: priorityId,
    }));
  };

  const handlePublishOptionSelect = (optionId) => {
    setSelectedPublishOption(optionId);
    setFormData((prev) => ({
      ...prev,
      status: optionId,
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }));
  };

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validate required fields
    if (!formData.title.trim()) {
      showNotification("Please enter a title");
      return;
    }

    if (!formData.author.trim()) {
      showNotification("Please enter author name");
      return;
    }

    if (!formData.content.trim()) {
      showNotification("Please enter announcement content");
      return;
    }

    // If scheduling, validate date/time
    if (selectedPublishOption === "schedule") {
      if (!formData.publishDate) {
        showNotification("Please select a publish date");
        return;
      }
      if (!formData.publishTime) {
        showNotification("Please select a publish time");
        return;
      }

      // Validate future date
      const selectedDateTime = new Date(
        `${formData.publishDate}T${formData.publishTime}`
      );
      if (selectedDateTime <= new Date()) {
        showNotification("Please select a future date and time for scheduling");
        return;
      }
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      const newAnnouncement = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString(),
        author: formData.author,
        views: 0,
        // Format dates for display
        publishDate:
          selectedPublishOption === "schedule"
            ? formData.publishDate
            : new Date().toISOString().split("T")[0],
        publishTime:
          selectedPublishOption === "schedule"
            ? formData.publishTime
            : new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
        status:
          selectedPublishOption === "draft"
            ? "Draft"
            : selectedPublishOption === "schedule"
            ? "Scheduled"
            : "Published",
        statusType: selectedPublishOption,
      };

      onCreate(newAnnouncement);
      setIsSubmitting(false);

      // Show success notification
      showNotification(
        selectedPublishOption === "draft"
          ? "Announcement saved as draft"
          : selectedPublishOption === "schedule"
          ? "Announcement scheduled successfully"
          : "Announcement published successfully",
        "success"
      );

      // Auto close after showing success message
      setTimeout(() => {
        onClose();

        // Reset form
        setFormData({
          title: "",
          category: "general",
          priority: "medium",
          author: "",
          content: "",
          publishDate: "",
          publishTime: "",
          status: "draft",
          attachments: [],
          audience: "public",
        });
        setSelectedPublishOption("draft");
        setStep(1);
      }, 1500);
    }, 1000);
  };

  const nextStep = () => {
    // Validate before proceeding
    if (step === 1) {
      if (!formData.title.trim()) {
        showNotification("Please enter a title");
        return;
      }
      if (!formData.author.trim()) {
        showNotification("Please enter author name");
        return;
      }
    } else if (step === 2) {
      if (!formData.content.trim()) {
        showNotification("Please enter announcement content");
        return;
      }
    }

    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Minimalist Top Notification */}
      {notification.show && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-2 animate-slide-down">
          <div
            className={`w-full max-w-lg rounded-lg px-6 py-4 shadow-lg ${
              notification.type === "error"
                ? "bg-red-50 border border-red-200 text-red-700"
                : "bg-green-50 border border-green-200 text-green-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 h-5 w-5 ${
                  notification.type === "error"
                    ? "text-red-500"
                    : "text-green-500"
                }`}
              >
                {notification.type === "error" ? (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                ) : (
                  <CheckCircleIcon className="h-5 w-5" />
                )}
              </div>
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Create New Announcement
              </h2>
              <p className="text-sm text-gray-500">Step {step} of 3</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${
                      step >= stepNumber
                        ? "bg-[#FA8630] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`h-1 w-20 mx-2 ${
                        step > stepNumber ? "bg-[#FA8630]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Basic Info</span>
              <span>Content</span>
              <span>Publish</span>
            </div>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="p-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a clear, descriptive title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Author *
                  </label>
                  <div className="relative">
                    <UserIcon className="h-5 w-5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Enter author name or department"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategorySelect(cat.id)}
                          className={`p-3 border rounded-lg flex items-center gap-2 transition-colors ${
                            formData.category === cat.id
                              ? "border-[#FA8630] bg-[#FA8630]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${cat.color}`} />
                          <span className="text-sm">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <div className="flex gap-2">
                    {priorities.map((priority) => (
                      <button
                        key={priority.id}
                        type="button"
                        onClick={() => handlePrioritySelect(priority.id)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          formData.priority === priority.id
                            ? `${priority.color} border-2 border-current`
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {priority.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Announcement Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Write your announcement here... You can include important details, instructions, or updates."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent resize-none"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/5000 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Optional)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      id="file-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">
                        Click to upload files or drag and drop
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Images, PDFs, or documents (Max 10MB each)
                      </p>
                    </label>
                  </div>

                  {/* File List */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                            <span className="text-sm truncate max-w-xs">
                              {file.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Publish Settings */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you like to proceed? *
                  </label>
                  <div className="space-y-2">
                    {publishOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => handlePublishOptionSelect(option.id)}
                          className={`w-full p-4 border rounded-lg flex items-start gap-3 transition-all ${
                            selectedPublishOption === option.id
                              ? "border-[#FA8630] bg-[#FA8630]/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div
                            className={`p-2 rounded-full ${
                              selectedPublishOption === option.id
                                ? "bg-[#FA8630]/20"
                                : "bg-gray-100"
                            }`}
                          >
                            <Icon
                              className={`h-5 w-5 ${
                                selectedPublishOption === option.id
                                  ? "text-[#FA8630]"
                                  : "text-gray-400"
                              }`}
                            />
                          </div>
                          <div className="text-left flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-800">
                                {option.name}
                              </p>
                              {selectedPublishOption === option.id && (
                                <div className="h-3 w-3 rounded-full bg-[#FA8630]"></div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {option.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule Date/Time */}
                {selectedPublishOption === "schedule" && (
                  <div className="border border-blue-100 bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-3">
                      Schedule Publication
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Publish Date *
                        </label>
                        <input
                          type="date"
                          name="publishDate"
                          value={formData.publishDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Publish Time *
                        </label>
                        <input
                          type="time"
                          name="publishTime"
                          value={formData.publishTime}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    {formData.publishDate && formData.publishTime && (
                      <p className="text-xs text-gray-600 mt-2">
                        Scheduled for:{" "}
                        {new Date(
                          `${formData.publishDate}T${formData.publishTime}`
                        ).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    name="audience"
                    value={formData.audience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FA8630] focus:border-transparent"
                  >
                    <option value="public">General Public</option>
                    <option value="clinic">Veterinary Clinics</option>
                    <option value="staff">Internal Staff</option>
                    <option value="partner">Partner Organizations</option>
                  </select>
                </div>

                {/* Preview Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Preview Summary
                  </h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="font-medium">Title:</span>
                      <span>{formData.title || "No title entered"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Author:</span>
                      <span>{formData.author || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>
                        {
                          categories.find((c) => c.id === formData.category)
                            ?.name
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Priority:</span>
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          formData.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : formData.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {formData.priority.charAt(0).toUpperCase() +
                          formData.priority.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Action:</span>
                      <span>
                        {
                          publishOptions.find(
                            (o) => o.id === selectedPublishOption
                          )?.name
                        }
                      </span>
                    </div>
                    {selectedPublishOption === "schedule" &&
                      formData.publishDate && (
                        <div className="flex justify-between">
                          <span className="font-medium">Scheduled for:</span>
                          <span>
                            {formData.publishDate} {formData.publishTime}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
              <div>
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ← Back
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                {step < 3 ? (
                  <>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="px-4 py-2 text-sm bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors flex items-center gap-2"
                    >
                      Continue
                      <span>→</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={prevStep}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      ← Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4" />
                          {selectedPublishOption === "draft"
                            ? "Save as Draft"
                            : selectedPublishOption === "schedule"
                            ? "Schedule Announcement"
                            : "Publish Now"}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Add this CSS for the slide-down animation */}
      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default NewAnnouncement;
