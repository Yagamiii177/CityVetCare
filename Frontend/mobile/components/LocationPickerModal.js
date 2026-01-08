import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";

const LocationPickerModal = ({ visible, onClose, onSelectLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [initialRegion, setInitialRegion] = useState({
    latitude: 14.5995, // Manila, Philippines
    longitude: 120.9842,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Get current location when modal opens
  useEffect(() => {
    if (visible) {
      getCurrentLocation();
    }
  }, [visible]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to use this feature"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setInitialRegion(newRegion);
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    setIsLoadingAddress(true);
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (result && result.length > 0) {
        const location = result[0];

        const normalizePart = (value) => {
          if (!value) return null;
          const normalized = String(value).trim();
          return normalized.length ? normalized : null;
        };

        const uniqueParts = [];
        const pushUnique = (...parts) => {
          parts
            .map(normalizePart)
            .filter(Boolean)
            .forEach((part) => {
              if (!uniqueParts.includes(part)) uniqueParts.push(part);
            });
        };

        // Prefer a fuller address: street number + street, then locality details
        const streetLine = [location.streetNumber, location.street]
          .map(normalizePart)
          .filter(Boolean)
          .join(" ");

        pushUnique(
          streetLine,
          location.district,
          location.city,
          location.subregion,
          location.region,
          location.postalCode,
          location.country
        );

        // Fallback to any other available fields if still empty
        if (!uniqueParts.length) {
          pushUnique(
            location.name,
            location.street,
            location.city,
            location.region,
            location.country
          );
        }

        setAddress(
          uniqueParts.length
            ? uniqueParts.join(", ")
            : `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        );
      } else {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    reverseGeocode(coordinate.latitude, coordinate.longitude);
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert(
        "No Location Selected",
        "Please select a location on the map"
      );
      return;
    }

    onSelectLocation({
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      address: address,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="location" size={24} color="#FFF" />
            <Text style={styles.headerTitle}>Select Location</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Address Display */}
        <View style={styles.addressContainer}>
          <View style={styles.addressContent}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#FA8630"
              style={styles.addressIcon}
            />
            <View style={styles.addressTextContainer}>
              <Text style={styles.addressLabel}>SELECTED LOCATION</Text>
              {isLoadingAddress ? (
                <Text style={styles.addressLoading}>Loading address...</Text>
              ) : (
                <Text style={styles.addressText}>
                  {address || "Tap on map to select location"}
                </Text>
              )}
              {selectedLocation && (
                <Text style={styles.coordinates}>
                  {selectedLocation.latitude.toFixed(6)},{" "}
                  {selectedLocation.longitude.toFixed(6)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
            region={initialRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton
          >
            {selectedLocation && (
              <Marker coordinate={selectedLocation} pinColor="#FA8630" />
            )}
          </MapView>

          {/* Instruction Overlay */}
          <View style={styles.instructionOverlay}>
            <Text style={styles.instructionText}>
              Tap on the map to select a location
            </Text>
          </View>
        </View>

        {/* Footer Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <View style={styles.buttonRow}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.confirmButtonText}>Confirm Location</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FA8630",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50, // Account for status bar
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
  },
  closeButton: {
    padding: 5,
  },
  addressContainer: {
    backgroundColor: "#F5F5F5",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  addressContent: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressIcon: {
    marginTop: 2,
  },
  addressTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  addressLabel: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    lineHeight: 20,
  },
  addressLoading: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  coordinates: {
    fontSize: 11,
    color: "#666",
    marginTop: 6,
  },
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    flex: 1,
  },
  instructionOverlay: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -150 }],
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 300,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#F5F5F5",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CCC",
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#FA8630",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
});

export default LocationPickerModal;
