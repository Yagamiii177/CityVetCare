import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import {
  EyeIcon,
  XMarkIcon,
  CalendarDaysIcon,
  UserIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

const ReportHistory = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const toggleDrawer = () => setIsDrawerOpen((s) => !s);

  // SAMPLE DATA — replace with API later
  const historyReports = [
    {
      id: 7,
      reporter: "Elena Ramos",
      type: "Bite Incident",
      address: "Barangay 5, San Pedro",
      date: "2025-10-03",
      completedOn: "2025-10-08",
      status: "Resolved",
      description:
        "Bite incident involving a stray dog. Patrol dispatched and handled. Victim referred for prophylaxis.",
      images: [],
    },
    {
      id: 8,
      reporter: "Carlos Silva",
      type: "Stray Animal",
      address: "Barangay San Juan",
      date: "2025-09-21",
      completedOn: "2025-09-22",
      status: "Captured & Redeemed",
      description:
        "Stray dog captured and claimed by owner after validation. Vaccination updated.",
      images: [],
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "Maria - City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${isDrawerOpen ? "ml-64" : "ml-0"}`}
      >
        <div className="h-screen flex flex-col overflow-hidden">
          {/* Top area */}
          <div className="px-6 py-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Report History</h1>
            </div>
            <p className="text-sm text-gray-600 max-w-2xl">
              Archived and completed incident reports. Click a row to view details.
            </p>
          </div>

          {/* Table container (fixed header + scrollable body) */}
          <div className="flex-1 px-6 pb-8 overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm border border-[#E8E8E8] h-full flex flex-col">
              {/* Table Header (sticky area visually) */}
              <div className="flex-shrink-0 bg-[#FA8630]/10">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Reporter
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Report Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Completed On
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[#FA8630] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                </table>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-auto">
                <table className="min-w-full divide-y divide-[#E8E8E8]">
                  <tbody className="bg-white divide-y divide-[#E8E8E8]">
                    {historyReports.length > 0 ? (
                      historyReports.map((report) => (
                        <tr
                          key={report.id}
                          className="hover:bg-[#FA8630]/5 cursor-pointer"
                          onClick={() => setSelectedReport(report)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-gray-900">
                            #{report.id}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {report.reporter}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.type}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.address}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.date}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {report.completedOn}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                report.status === "Resolved"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </td>

                          <td
                            className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="inline-flex items-center gap-2 text-[#FA8630] hover:text-[#E87928]"
                              title="View details"
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span className="hidden sm:inline text-sm">View</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                          No report history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Modal (matches ObservationProfile style: sticky header, scrollable body) */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Modal Header */}
                <div className="sticky top-0 bg-white p-6 pb-4 border-b flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Incident Report #{selectedReport.id}
                  </h2>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="overflow-y-auto flex-1">
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left column: basic info */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Reporter</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <UserIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.reporter}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Type</h3>
                        <p className="text-gray-700">{selectedReport.type}</p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Status</h3>
                        <p className="text-gray-700">
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              selectedReport.status === "Resolved"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedReport.status}
                          </span>
                        </p>
                      </div>

                      {/* Middle column: location & dates */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Location</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <MapPinIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.address}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Report Date</h3>
                        <p className="text-gray-700 flex items-center gap-2">
                          <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
                          {selectedReport.date}
                        </p>

                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Completed On</h3>
                        <p className="text-gray-700">{selectedReport.completedOn}</p>
                      </div>

                      {/* Right column: description / images */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800">Description</h3>
                        <div className="bg-gray-50 p-4 rounded">{selectedReport.description}</div>

                        {/* Images placeholder — if images exist show thumbnails */}
                        <h3 className="text-lg font-semibold text-gray-800 mt-4">Images</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedReport.images && selectedReport.images.length > 0 ? (
                            selectedReport.images.map((src, i) => (
                              <div key={i} className="h-20 border rounded overflow-hidden">
                                <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                              </div>
                            ))
                          ) : (
                            <div className="col-span-3 text-sm text-gray-500">No images available</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Optional: timeline, notes, officer comments */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Notes / Resolution</h3>
                      <div className="bg-gray-50 p-4 rounded text-gray-700">
                        Patrol dispatched and incident resolved. Documentation filed and victim advised.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white p-4 border-t flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-[#FA8630] text-white rounded-lg hover:bg-[#E87928] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ReportHistory;
