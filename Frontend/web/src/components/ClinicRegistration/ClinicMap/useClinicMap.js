import { useState, useEffect, useCallback } from "react";
import { apiService } from "../../../utils/api";

/**
 * Custom hook for clinic map data and filtering logic
 */
export const useClinicMap = () => {
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectionFilter, setInspectionFilter] = useState("all");

  // Alerts
  const [alerts, setAlerts] = useState([]);

  // Generate alerts for monitoring
  const generateAlerts = useCallback((clinicData) => {
    const alertList = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date(
      today.getTime() + 30 * 24 * 60 * 60 * 1000
    );
    const sixtyDaysFromNow = new Date(
      today.getTime() + 60 * 24 * 60 * 60 * 1000
    );

    clinicData.forEach((clinic) => {
      // Check permit expiry
      if (clinic.permitExpiryDate) {
        const expiryDate = new Date(clinic.permitExpiryDate);
        if (expiryDate < today) {
          alertList.push({
            id: `permit-expired-${clinic.id}`,
            type: "danger",
            clinic: clinic.name,
            message: `Permit expired on ${expiryDate.toLocaleDateString()}`,
          });
        } else if (expiryDate < thirtyDaysFromNow) {
          alertList.push({
            id: `permit-expiring-${clinic.id}`,
            type: "warning",
            clinic: clinic.name,
            message: `Permit expiring on ${expiryDate.toLocaleDateString()}`,
          });
        }
      }

      // Check accreditation expiry
      if (clinic.accreditationExpiryDate) {
        const expiryDate = new Date(clinic.accreditationExpiryDate);
        if (expiryDate < today) {
          alertList.push({
            id: `accred-expired-${clinic.id}`,
            type: "danger",
            clinic: clinic.name,
            message: `Accreditation expired on ${expiryDate.toLocaleDateString()}`,
          });
        } else if (expiryDate < sixtyDaysFromNow) {
          alertList.push({
            id: `accred-expiring-${clinic.id}`,
            type: "warning",
            clinic: clinic.name,
            message: `Accreditation expiring on ${expiryDate.toLocaleDateString()}`,
          });
        }
      }

      // Check inspection status
      if (clinic.inspectionStatus === "Needs Follow-up") {
        alertList.push({
          id: `inspection-${clinic.id}`,
          type: "info",
          clinic: clinic.name,
          message: "Inspection requires follow-up",
        });
      }
    });

    setAlerts(alertList);
  }, []);

  // Fetch clinics from API
  const fetchClinics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Prefer dedicated locations endpoint for map markers
      let clinicData = [];
      try {
        const resp = await apiService.clinics.getLocations({
          status: "all",
        });
        clinicData = resp.data || [];
      } catch (e) {
        // Fallback to full list if locations endpoint fails
        const fallback = await apiService.clinics.getAll({ status: "all" });
        const list = fallback.data || [];
        clinicData = list.filter((c) => c.latitude && c.longitude);
      }

      setClinics(clinicData);
      generateAlerts(clinicData);
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("Failed to load clinics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [generateAlerts]);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  // Get unique values for filters
  const barangayOptions = [
    ...new Set(clinics.map((c) => c.barangay).filter(Boolean)),
  ].sort();

  const serviceOptions = [
    ...new Set(clinics.flatMap((c) => c.services || []).filter(Boolean)),
  ].sort();

  // Filter clinics based on all filters
  const filteredClinics = clinics.filter((clinic) => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchFields = [
        clinic.name,
        clinic.address,
        clinic.barangay,
        clinic.veterinarian,
      ]
        .filter(Boolean)
        .map((field) => field.toLowerCase());

      if (!searchFields.some((field) => field.includes(term))) {
        return false;
      }
    }

    // Barangay filter
    if (barangayFilter !== "all" && clinic.barangay !== barangayFilter) {
      return false;
    }

    // Service filter
    if (
      serviceFilter !== "all" &&
      (!clinic.services || !clinic.services.includes(serviceFilter))
    ) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && clinic.status !== statusFilter) {
      return false;
    }

    // Inspection filter
    if (
      inspectionFilter !== "all" &&
      clinic.inspectionStatus !== inspectionFilter
    ) {
      return false;
    }

    return true;
  });

  return {
    clinics: filteredClinics,
    allClinics: clinics,
    selectedClinic,
    setSelectedClinic,
    loading,
    error,
    alerts,
    searchTerm,
    setSearchTerm,
    barangayFilter,
    setBarangayFilter,
    serviceFilter,
    setServiceFilter,
    statusFilter,
    setStatusFilter,
    inspectionFilter,
    setInspectionFilter,
    barangayOptions,
    serviceOptions,
    fetchClinics,
  };
};
