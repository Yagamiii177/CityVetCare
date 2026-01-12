import React, { useState, useRef, useEffect } from "react";
import BackButton from "../../components/BackButton";
import BottomNavigation from "../../components/BottomNavigation";
import ScreenHeader from "../../components/ScreenHeader";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  TextInput,
  Modal,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { API_ENDPOINTS } from "../../config/api";

// Default map center (Naga City, Camarines Sur)
const DEFAULT_COORDS = {
  latitude: 13.6218,
  longitude: 123.1948,
  latitudeDelta: 0.2,
  longitudeDelta: 0.2,
};

// Clinic status colors matching admin side
const CLINIC_STATUS_COLORS = {
  Active: "#10B981",
  Pending: "#F59E0B",
  Inactive: "#6B7280",
  Suspended: "#EF4444",
  "Temporarily Closed": "#F59E0B",
};

// Get marker color based on clinic status
const getMarkerColor = (status) => {
  return CLINIC_STATUS_COLORS[status] || "#10B981";
};

export default function MapNearbyClinics() {
  const [location, setLocation] = useState(null);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showVetClinics, setShowVetClinics] = useState(true); // Changed to true by default
  const [userAddress, setUserAddress] = useState("");
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef(null);

  // Fetch clinics from backend
  const fetchClinics = async () => {
    try {
      setError(null);
      const response = await fetch(
        API_ENDPOINTS.clinics.getLocations + "?status=all"
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const transformedClinics = data.map((clinic) => ({
          id: clinic.id,
          name: clinic.name || "Unnamed Clinic",
          latitude: parseFloat(clinic.latitude),
          longitude: parseFloat(clinic.longitude),
          status: clinic.status || "Active",
          barangay: clinic.barangay || "",
          address: clinic.address || "",
          phone: clinic.phone || "",
          veterinarian: clinic.veterinarian || "Not assigned",
          services: Array.isArray(clinic.services) ? clinic.services : [],
          workingHours: clinic.workingHours || null,
        }));
        // Filter out suspended clinics and clinics without coordinates
        setClinics(
          transformedClinics.filter(
            (c) => c.latitude && c.longitude && c.status !== "Suspended"
          )
        );
      }
    } catch (err) {
      console.error("Error fetching clinics:", err);
      setError("Failed to load clinics. Please check your connection.");
      Alert.alert("Error", "Failed to load clinics. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show your location."
        );
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (address.length > 0) {
        const { street, city, region, postalCode } = address[0];
        setUserAddress(`${street}, ${city}, ${region} ${postalCode}`);
      }

      setShowLocationInfo(true);
    } catch (error) {
      console.error("Location error:", error);
    }
  };

  // Load clinics on mount
  useEffect(() => {
    fetchClinics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchClinics();
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleFindClinics = () => {
    animateButton();
    setShowVetClinics(!showVetClinics);
  };

  const handleMarkerPress = (clinic) => {
    setSelectedClinic(clinic);
    setModalVisible(true);

    // Animate to clinic location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: clinic.latitude,
          longitude: clinic.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000
      );
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedClinic(null);
  };

  const toggleLocationInfo = () => {
    if (!location) {
      getCurrentLocation();
    } else {
      setShowLocationInfo(!showLocationInfo);
    }
  };

  const filteredClinics = clinics.filter((clinic) => {
    const search = searchQuery.toLowerCase();
    return (
      clinic.name.toLowerCase().includes(search) ||
      clinic.barangay?.toLowerCase().includes(search) ||
      clinic.address?.toLowerCase().includes(search) ||
      clinic.veterinarian?.toLowerCase().includes(search)
    );
  });

  const formatWorkingHours = (workingHours) => {
    if (!workingHours) return "Not available";
    if (typeof workingHours === "string") return workingHours;
    if (typeof workingHours === "object") {
      // Format as readable list with proper spacing and capitalization
      return Object.entries(workingHours)
        .map(([day, hours]) => {
          // Capitalize first letter of day
          const capitalizedDay =
            day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
          // Convert 24-hour time to 12-hour format
          const formattedHours = hours.replace(
            /(\d{1,2}):(\d{2})/g,
            (match, h, m) => {
              const hour = parseInt(h);
              const period = hour >= 12 ? "PM" : "AM";
              const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              return `${hour12}:${m} ${period}`;
            }
          );
          return `${capitalizedDay}: ${formattedHours}`;
        })
        .join("\n");
    }
    return "Not available";
  };

  if (loading) {
    return (
      <View style={{ flex: 1 }}>
        <ScreenHeader title="Nearby Clinics" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FD7E14" />
          <Text style={styles.loadingText}>Loading clinics...</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Nearby Clinics" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinics by name, location, or veterinarian..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Ionicons
            name="search"
            size={20}
            color="#888"
            style={styles.searchIcon}
          />
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchClinics}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={DEFAULT_COORDS}
          showsUserLocation={true}
        >
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title="Your Location"
              pinColor="blue"
            />
          )}

          {showVetClinics &&
            filteredClinics.map((clinic) => (
              <Marker
                key={`clinic-${clinic.id}`}
                coordinate={{
                  latitude: clinic.latitude,
                  longitude: clinic.longitude,
                }}
                title={clinic.name}
                description={`${clinic.status} - ${
                  clinic.barangay || "No location"
                }`}
                pinColor={getMarkerColor(clinic.status)}
                onPress={() => handleMarkerPress(clinic)}
              />
            ))}
        </MapView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedClinic && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalTitle}>{selectedClinic.name}</Text>

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: getMarkerColor(selectedClinic.status),
                      },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {selectedClinic.status}
                    </Text>
                  </View>

                  {/* Veterinarian */}
                  {selectedClinic.veterinarian && (
                    <View style={styles.detailRow}>
                      <Ionicons name="medical" size={20} color="#FD7E14" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Veterinarian</Text>
                        <Text style={styles.detailText}>
                          {selectedClinic.veterinarian}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Address */}
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color="#FD7E14" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailText}>
                        {selectedClinic.address || "Not provided"}
                        {selectedClinic.barangay
                          ? `\n${selectedClinic.barangay}`
                          : ""}
                      </Text>
                    </View>
                  </View>

                  {/* Contact */}
                  {selectedClinic.phone && (
                    <View style={styles.detailRow}>
                      <Ionicons name="call" size={20} color="#FD7E14" />
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Contact</Text>
                        <Text style={styles.detailText}>
                          {selectedClinic.phone}
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Working Hours */}
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color="#FD7E14" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Working Hours</Text>
                      <Text style={styles.detailText}>
                        {formatWorkingHours(selectedClinic.workingHours)}
                      </Text>
                    </View>
                  </View>

                  {/* Services */}
                  {selectedClinic.services &&
                    selectedClinic.services.length > 0 && (
                      <View style={styles.detailRow}>
                        <Ionicons name="medkit" size={20} color="#FD7E14" />
                        <View style={styles.detailTextContainer}>
                          <Text style={styles.detailLabel}>Services</Text>
                          <View style={styles.servicesContainer}>
                            {selectedClinic.services.map((service, index) => (
                              <View key={index} style={styles.serviceChip}>
                                <Text style={styles.serviceText}>
                                  {service}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      </View>
                    )}

                  {/* Coordinates */}
                  <View style={styles.detailRow}>
                    <Ionicons name="navigate" size={20} color="#FD7E14" />
                    <View style={styles.detailTextContainer}>
                      <Text style={styles.detailLabel}>Coordinates</Text>
                      <Text style={styles.detailText}>
                        {selectedClinic.latitude.toFixed(6)},{" "}
                        {selectedClinic.longitude.toFixed(6)}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Clinic Count Badge */}
        <View style={styles.clinicCountBadge}>
          <MaterialIcons name="local-hospital" size={20} color="#FD7E14" />
          <Text style={styles.clinicCountText}>
            {filteredClinics.length}{" "}
            {filteredClinics.length === 1 ? "Clinic" : "Clinics"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.topRightButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              showVetClinics && styles.actionButtonActive,
            ]}
            onPress={handleFindClinics}
            activeOpacity={0.8}
          >
            <MaterialIcons
              name="local-hospital"
              size={20}
              color={showVetClinics ? "white" : "#FD7E14"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleRefresh}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={20} color="#FD7E14" />
          </TouchableOpacity>

          {/* Location Button */}
          <TouchableOpacity
            style={[
              styles.locationButton,
              location && styles.locationButtonActive,
            ]}
            onPress={toggleLocationInfo}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location"
              size={20}
              color={location ? "white" : "#FD7E14"}
            />
          </TouchableOpacity>
        </View>

        {showLocationInfo && (
          <View style={styles.locationInfoBox}>
            <Text style={styles.locationInfoTitle}>Your Current Location</Text>
            {location && (
              <Text style={styles.locationInfoText}>
                Latitude: {location.coords.latitude.toFixed(6)}
                {"\n"}
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>
            )}
            {userAddress ? (
              <Text style={styles.locationInfoText}>{userAddress}</Text>
            ) : (
              <Text style={styles.locationInfoText}>Loading address...</Text>
            )}
          </View>
        )}
      </View>
      <BottomNavigation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorBanner: {
    position: "absolute",
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "#fee",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
    elevation: 3,
  },
  errorText: {
    color: "#c00",
    flex: 1,
    fontSize: 14,
  },
  retryText: {
    color: "#FD7E14",
    fontWeight: "bold",
    fontSize: 14,
  },
  clinicCountBadge: {
    position: "absolute",
    top: 75,
    right: 20,
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  clinicCountText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
    paddingRight: 10,
  },
  searchIcon: {
    marginLeft: 8,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  topRightButtons: {
    position: "absolute",
    bottom: 90,
    right: 20,
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  actionButton: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: "#FD7E14",
  },
  actionButtonActive: {
    backgroundColor: "#388E3C",
    borderColor: "white",
  },
  actionButtonText: {
    color: "#FD7E14",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  incidentButtonActive: {
    backgroundColor: "#D32F2F",
  },
  locationButton: {
    backgroundColor: "white",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 2,
    borderColor: "#FD7E14",
  },
  locationButtonActive: {
    backgroundColor: "#FD7E14",
    borderColor: "white",
  },
  locationButtonText: {
    color: "#FD7E14",
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 6,
  },
  locationInfoBox: {
    position: "absolute",
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  locationInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 8,
  },
  locationInfoText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
    textAlign: "center",
  },
  statusBadge: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 3,
    fontWeight: "600",
  },
  detailText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
  },
  servicesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  serviceChip: {
    backgroundColor: "#FFF4E6",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 6,
  },
  serviceText: {
    color: "#FD7E14",
    fontSize: 13,
    fontWeight: "500",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#FD7E14",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
