import React, { useState, useRef } from "react";
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
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// Coordinates for Naga City, Philippines (approximate)
const NAGA_CITY_COORDS = {
  latitude: 13.6248,
  longitude: 123.2035,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Sample veterinary clinics data with additional details
const VET_CLINICS = [
  {
    id: 1,
    name: "Naga City Veterinary Clinic",
    coords: { latitude: 13.6255, longitude: 123.203 },
    hours: "8:00 AM - 5:00 PM",
    location: "City Hall Compound, Naga City",
    contact: "(054) 123-4567",
  },
  {
    id: 2,
    name: "PetCare Animal Hospital",
    coords: { latitude: 13.6238, longitude: 123.2045 },
    hours: "9:00 AM - 6:00 PM",
    location: "Magsaysay Avenue, Naga City",
    contact: "(054) 234-5678",
  },
  {
    id: 3,
    name: "Paws & Claws Veterinary Center",
    coords: { latitude: 13.6242, longitude: 123.2028 },
    hours: "24/7 Emergency Service",
    location: "Penafrancia Avenue, Naga City",
    contact: "(054) 345-6789",
  },
  {
    id: 4,
    name: "Animal Wellness Clinic",
    coords: { latitude: 13.626, longitude: 123.204 },
    hours: "7:00 AM - 7:00 PM",
    location: "Dinaga Street, Naga City",
    contact: "(054) 456-7890",
  },
];

// Sample incident reports data
const INCIDENT_REPORTS = [
  {
    id: 1,
    title: "Rabies Case",
    coords: { latitude: 13.624, longitude: 123.202 },
  },
  {
    id: 2,
    title: "Stray Dog Attack",
    coords: { latitude: 13.623, longitude: 123.204 },
  },
  {
    id: 3,
    title: "Animal Neglect",
    coords: { latitude: 13.625, longitude: 123.203 },
  },
];

export default function MapNearbyClinics() {
  const [location, setLocation] = useState(null);
  const [showVetClinics, setShowVetClinics] = useState(false);
  const [showIncidents, setShowIncidents] = useState(false);
  const [userAddress, setUserAddress] = useState("");
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const buttonScale = useRef(new Animated.Value(1)).current;
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
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
      // Failed to get location
    }
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

  const handleShowIncidents = () => {
    animateButton();
    setShowIncidents(!showIncidents);
  };

  const handleMarkerPress = (clinic) => {
    setSelectedClinic(clinic);
    setModalVisible(true);
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

  const filteredClinics = VET_CLINICS.filter((clinic) =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title="Maps" />
      <View style={styles.container}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search clinics..."
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

        <MapView
          style={styles.map}
          initialRegion={NAGA_CITY_COORDS}
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
                coordinate={clinic.coords}
                title={clinic.name}
                description="Tap for details"
                pinColor="green"
                onPress={() => handleMarkerPress(clinic)}
              />
            ))}

          {showIncidents &&
            INCIDENT_REPORTS.map((incident) => (
              <Marker
                key={`incident-${incident.id}`}
                coordinate={incident.coords}
                title={incident.title}
                description="Incident Report"
                pinColor="red"
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
                <>
                  <Text style={styles.modalTitle}>{selectedClinic.name}</Text>

                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={20} color="#FD7E14" />
                    <Text style={styles.detailText}>
                      Hours: {selectedClinic.hours}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={20} color="#FD7E14" />
                    <Text style={styles.detailText}>
                      Address: {selectedClinic.location}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons name="call" size={20} color="#FD7E14" />
                    <Text style={styles.detailText}>
                      Contact: {selectedClinic.contact}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={closeModal}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Top Right Buttons */}
        <View style={styles.topRightButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              showVetClinics && styles.actionButtonActive,
            ]}
            onPress={handleFindClinics}
            activeOpacity={0.8}
          >
            <MaterialIcons name="pets" size={24} color="white" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              showIncidents && styles.incidentButtonActive,
            ]}
            onPress={handleShowIncidents}
            activeOpacity={0.8}
          >
            <Ionicons name="warning" size={24} color="white" />
          </TouchableOpacity>
        </View>

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
            size={24}
            color={location ? "white" : "#FD7E14"}
          />
        </TouchableOpacity>

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
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
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
    fontSize: 16,
    color: "#333",
    paddingVertical: 5,
  },
  searchIcon: {
    marginLeft: 10,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  topRightButtons: {
    position: "absolute",
    top: 80,
    right: 20,
    flexDirection: "column",
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#FD7E14",
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
  },
  actionButtonActive: {
    backgroundColor: "#388E3C",
  },
  incidentButtonActive: {
    backgroundColor: "#D32F2F",
  },
  locationButton: {
    position: "absolute",
    bottom: 90,
    right: 20,
    backgroundColor: "white",
    width: 56,
    height: 56,
    borderRadius: 28,
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
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
    textAlign: "center",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
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
