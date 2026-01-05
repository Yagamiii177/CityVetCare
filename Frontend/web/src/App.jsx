import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import MonitoringMap from "./pages/Map/MonitoringMap";
import VaccinationDashboard from "./pages/VaccinationManagement/Dashboard";
import ReportDashboard from "./pages/ReportManagement/Dashboard";
import CampaignDashboard from "./pages/CampaignManagement/Dashboard";
import StrayDashboard from "./pages/StrayAnimalManagement/Dashboard";
import AddStray from "./pages/StrayAnimalManagement/AddStray";
import AdoptionList from "./pages/StrayAnimalManagement/AdoptionList";
import CapturedAnimals from "./pages/StrayAnimalManagement/CaptureAnimals";
import RedemptionRequest from "./pages/StrayAnimalManagement/RedemptionRequest";
import StatisticsLogs from "./pages/StrayAnimalManagement/StatisticsLogs";
import AllIncidentReport from "./pages/ReportManagement/AllIncidentReport";
import PendingVerification from "./pages/ReportManagement/PendingVerification";
import ReportHistory from "./pages/ReportManagement/ReportHistory";   
import IncidentMonitoring from "./pages/ReportManagement/MonitoringIncidents";
import CatcherSchedule from "./pages/ReportManagement/CatcherSchedule";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* MAIN ROUTES */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* NEW DASHBOARD & MAP ROUTES */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/map" element={<ProtectedRoute><MonitoringMap /></ProtectedRoute>} />

          {/* Vaccination MANAGEMENT ROUTES */}
          <Route
            path="/vaccination-dashboard"
            element={<ProtectedRoute><VaccinationDashboard /></ProtectedRoute>}
          />

          {/* STRAY ANIMAL MANAGEMENT ROUTES */}
          <Route path="/stray-dashboard" element={<ProtectedRoute><StrayDashboard /></ProtectedRoute>} />
          <Route path="/captured-animals" element={<ProtectedRoute><CapturedAnimals /></ProtectedRoute>} />
          <Route path="/redemption-requests" element={<ProtectedRoute><RedemptionRequest /></ProtectedRoute>} />
          <Route path="/adoption-list" element={<ProtectedRoute><AdoptionList /></ProtectedRoute>} />
          <Route path="/statistics-logs" element={<ProtectedRoute><StatisticsLogs /></ProtectedRoute>} />
          <Route path="/add-stray" element={<ProtectedRoute><AddStray /></ProtectedRoute>} />

          {/* REPORT MANAGEMENT ROUTES */}
          <Route path="/report-dashboard" element={<ProtectedRoute><ReportDashboard /></ProtectedRoute>} />
          <Route path="/all-incident-report" element={<ProtectedRoute><AllIncidentReport /></ProtectedRoute>} />
          <Route path="/pending-verification" element={<ProtectedRoute><PendingVerification /></ProtectedRoute>} />
          <Route path="/report-history" element={<ProtectedRoute><ReportHistory /></ProtectedRoute>} />
          <Route path="/monitoring-incidents" element={<ProtectedRoute><IncidentMonitoring /></ProtectedRoute>} />
          <Route path="/catcher-schedule" element={<ProtectedRoute><CatcherSchedule /></ProtectedRoute>} />

          {/*CAMPAIGN MANAGEMENT ROUTES */}
          <Route path="/campaign-dashboard" element={<ProtectedRoute><CampaignDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
