import { useState } from "react";
import { Header } from "../../components/Header";
import { Drawer } from "../../components/ReportManagement/Drawer";
import {
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  BellAlertIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MapPinIcon,
  CheckBadgeIcon,
  PlusIcon,
  CalendarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

const AnimalCatcherSchedule = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate] = useState(new Date());
  const [view, setView] = useState("daily"); // 'daily' or 'weekly'

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  // Sample schedule data
  const catcherTeams = [
    {
      id: 1,
      name: "Team Alpha",
      members: ["John Doe", "Maria Garcia"],
      vehicle: "Truck-001",
      status: "active",
    },
    {
      id: 2,
      name: "Team Bravo",
      members: ["Mike Smith", "Sarah Chen"],
      vehicle: "Van-002",
      status: "active",
    },
    {
      id: 3,
      name: "Team Charlie",
      members: ["David Kim", "Lisa Wang"],
      vehicle: "Truck-003",
      status: "standby",
    },
  ];

  const dailySchedule = [
    {
      id: 1,
      teamId: 1,
      time: "08:00 - 10:00",
      area: "Downtown District",
      priority: "high",
      incidents: 3,
      type: "Routine Patrol",
    },
    {
      id: 2,
      teamId: 2,
      time: "09:30 - 12:00",
      area: "North Residential Zone",
      priority: "medium",
      incidents: 1,
      type: "Emergency Response",
    },
    {
      id: 3,
      teamId: 1,
      time: "13:00 - 15:30",
      area: "East Park Area",
      priority: "high",
      incidents: 2,
      type: "Follow-up Inspection",
    },
    {
      id: 4,
      teamId: 3,
      time: "14:00 - 16:00",
      area: "South Market",
      priority: "low",
      incidents: 0,
      type: "Preventive Patrol",
    },
  ];

  const weeklyOverview = [
    {
      day: "Monday",
      teamsDeployed: 2,
      incidentsHandled: 6,
      area: "City Wide",
    },
    {
      day: "Tuesday",
      teamsDeployed: 3,
      incidentsHandled: 8,
      area: "North & East Zones",
    },
    {
      day: "Wednesday",
      teamsDeployed: 2,
      incidentsHandled: 4,
      area: "Downtown & South",
    },
    {
      day: "Thursday",
      teamsDeployed: 3,
      incidentsHandled: 7,
      area: "All Districts",
    },
    {
      day: "Friday",
      teamsDeployed: 2,
      incidentsHandled: 5,
      area: "High Risk Areas",
    },
  ];

  return (
    <div className="min-h-screen bg-[#E8E8E8]">
      <Header
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        user={{ name: "City Veterinarian" }}
      />

      <Drawer
        isOpen={isDrawerOpen}
        onItemClick={() => setIsDrawerOpen(false)}
        setIsDrawerOpen={setIsDrawerOpen}
      />

      <main
        className={`transition-all duration-300 ${
          isDrawerOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="px-6 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Animal Catcher Schedule
            </h1>
            <div className="flex gap-4">
              <button
                onClick={() => setView("daily")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === "daily"
                    ? "bg-[#FA8630] text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Daily View
              </button>
              <button
                onClick={() => setView("weekly")}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  view === "weekly"
                    ? "bg-[#FA8630] text-white"
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Weekly View
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                  <UserGroupIcon className="h-6 w-6 text-[#FA8630]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Active Teams
                  </p>
                  <p className="text-2xl font-bold text-gray-800">3</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3 text-xl flex items-center justify-center">
                  <span className="inline-block">🚚</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Today's Assignments
                  </p>
                  <p className="text-2xl font-bold text-gray-800">4</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                  <MapPinIcon className="h-6 w-6 text-[#FA8630]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Areas Covered
                  </p>
                  <p className="text-2xl font-bold text-gray-800">6</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-[#FA8630]/10 mr-3">
                  <ClockIcon className="h-6 w-6 text-[#FA8630]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Response Time
                  </p>
                  <p className="text-2xl font-bold text-gray-800">45m</p>
                </div>
              </div>
            </div>
          </div>

          {view === "daily" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Schedule */}
              <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Today's Schedule
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <CalendarIcon className="h-4 w-4" />
                    {selectedDate.toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-4">
                  {dailySchedule.map((schedule) => {
                    const team = catcherTeams.find(t => t.id === schedule.teamId);
                    return (
                      <div
                        key={schedule.id}
                        className="p-4 border-l-4 rounded-r-lg border-l-[#FA8630] bg-[#FA8630]/5 hover:bg-[#FA8630]/10 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {team?.name} • {schedule.area}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {schedule.time} • {schedule.type}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              schedule.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : schedule.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {schedule.priority} priority
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Team: {team?.members.join(", ")}</span>
                          <span>{schedule.incidents} incidents</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Team Status */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">
                  Team Status
                </h2>

                <div className="space-y-4">
                  {catcherTeams.map((team) => (
                    <div
                      key={team.id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-800">
                          {team.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            team.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {team.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>Members: {team.members.join(", ")}</p>
                        <p>Vehicle: {team.vehicle}</p>
                      </div>
                      <button className="w-full mt-3 bg-[#FA8630] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#E87928] transition-colors">
                        Assign Task
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Weekly View */
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-6">
                Weekly Overview
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">
                        Day
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">
                        Teams Deployed
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">
                        Incidents Handled
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">
                        Coverage Area
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-600">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyOverview.map((day, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {day.day}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1">
                            <UserGroupIcon className="h-4 w-4 text-[#FA8630]" />
                            {day.teamsDeployed} teams
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-800">
                            {day.incidentsHandled}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {day.area}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              day.incidentsHandled >= 6
                                ? "bg-green-100 text-green-800"
                                : day.incidentsHandled >= 4
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {day.incidentsHandled >= 6
                              ? "High Activity"
                              : day.incidentsHandled >= 4
                              ? "Moderate"
                              : "Low Activity"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-[#FA8630] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#E87928] transition-colors">
                <PlusIcon className="h-4 w-4" />
                New Assignment
              </button>
              <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                <MapPinIcon className="h-4 w-4" />
                Update Team Location
              </button>
              <button className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition-colors">
                <ClipboardDocumentCheckIcon className="h-4 w-4" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimalCatcherSchedule;