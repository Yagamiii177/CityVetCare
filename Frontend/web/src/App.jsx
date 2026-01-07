import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import VaccinationDashboard from "./pages/VaccinationManagement/Dashboard";
import ReportDashboard from "./pages/ReportManagement/Dashboard";
import CampaignDashboard from "./pages/CampaignManagement/Dashboard";
import AnnouncementList from "./pages/CampaignManagement/AnnouncementList";
import ReadingMaterial from "./pages/CampaignManagement/ReadingMaterial";
import ClinicDashboard from "./pages/ClinicRegistration/Dashboard";
import ClinicList from "./pages/ClinicRegistration/ClinicList";
import ClinicMap from "./pages/ClinicRegistration/ClinicMap";
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
import PetRegistration from "./pages/VaccinationManagement/PetRegistration";
import VaccinationRecord from "./pages/VaccinationManagement/VaccinationRecord";


function App() {
  return (
    <Router>
      <Routes>
        {/* MAIN ROUTES */}
        <Route path="/" element={<Login />} />
        <Route path="/landing" element={<Landing />} />

        {/* Vaccination MANAGEMENT ROUTES */}
        <Route path="/vaccination-dashboard" element={<VaccinationDashboard />} />
        <Route path="/pet-registration" element={<PetRegistration />} />
        <Route path="/vaccination-record" element={<VaccinationRecord />} />

        {/* STRAY ANIMAL MANAGEMENT ROUTES */}
        <Route path="/stray-dashboard" element={<StrayDashboard />} />
        <Route path="/captured-animals" element={<CapturedAnimals />} />
        <Route path="/redemption-requests" element={<RedemptionRequest />} />
        <Route path="/adoption-list" element={<AdoptionList />} />
        <Route path="/statistics-logs" element={<StatisticsLogs />} />
        <Route path="/add-stray" element={<AddStray />} />

        {/* REPORT MANAGEMENT ROUTES */}
        <Route path="/report-dashboard" element={<ReportDashboard />} />
        <Route path="/all-incident-report" element={<AllIncidentReport />} />
        <Route path="/pending-verification" element={<PendingVerification />} />
        <Route path="/report-history" element={<ReportHistory />} />
        <Route path="/monitoring-incidents" element={<IncidentMonitoring />} />
        <Route path="/catcher-schedule" element={<CatcherSchedule />} />

        {/*CAMPAIGN MANAGEMENT ROUTES */}
        <Route path="/campaign-dashboard" element={<CampaignDashboard />} />
        <Route path="/announcement" element={<AnnouncementList />} />
        <Route path="/reading-material" element={<ReadingMaterial />} />

        {/* CLINIC MANAGEMENT ROUTES */}
        <Route path="/clinic-dashboard" element={<ClinicDashboard />} />
        <Route path="/clinic-list" element={<ClinicList />} />
        <Route path="/clinic-map" element={<ClinicMap />} />
      </Routes>
    </Router>
  );
}

export default App;
